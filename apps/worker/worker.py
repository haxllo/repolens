import asyncio
import logging
import os
from typing import Any, Dict
import redis.asyncio as redis
import aiohttp
from dotenv import load_dotenv
from src.analysis.orchestrator import AnalysisOrchestrator

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Worker:
    def __init__(self):
        self.redis_client = None
        self.orchestrator = AnalysisOrchestrator()
        self.api_url = os.getenv('API_URL', 'http://localhost:3001')
        
    async def connect(self):
        """Connect to Redis"""
        self.redis_client = await redis.from_url(
            os.getenv('REDIS_URL', 'redis://localhost:6379'),
            encoding='utf-8',
            decode_responses=True
        )
        logger.info('Connected to Redis')
    
    async def update_scan_status(self, scan_id: str, status: str, results: Dict = None, error: str = None):
        """Update scan status in API"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {'status': status}
                if results:
                    payload['results'] = results
                if error:
                    payload['error'] = error
                    
                async with session.put(
                    f'{self.api_url}/api/scan/{scan_id}/status',
                    json=payload
                ) as response:
                    if response.status == 200:
                        logger.info(f'Updated scan {scan_id} status to {status}')
                    else:
                        logger.error(f'Failed to update scan {scan_id} status: {response.status}')
        except Exception as e:
            logger.error(f'Error updating scan status: {str(e)}')
        
    async def process_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single analysis job"""
        scan_id = job_data.get('scanId')
        repo_url = job_data.get('repoUrl')
        branch = job_data.get('branch', 'main')
        
        logger.info(f'Processing job {scan_id} for repo {repo_url}')
        
        try:
            # Update status to PROCESSING
            await self.update_scan_status(scan_id, 'PROCESSING')
            
            # Run analysis
            results = await self.orchestrator.analyze_repository(
                repo_url=repo_url,
                branch=branch,
                scan_id=scan_id
            )
            
            # Update status to COMPLETED with results
            await self.update_scan_status(scan_id, 'COMPLETED', results=results)
            
            logger.info(f'Job {scan_id} completed successfully')
            return results
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f'Job {scan_id} failed: {error_msg}')
            
            # Update status to FAILED
            await self.update_scan_status(scan_id, 'FAILED', error=error_msg)
            raise
            
    async def process_active_jobs(self):
        """Process jobs that are already in active queue"""
        import json
        active_queue = 'bull:repo-analysis:active'
        
        # Get all active job IDs
        job_ids = await self.redis_client.lrange(active_queue, 0, -1)
        logger.info(f'Found {len(job_ids)} active jobs to process')
        
        for job_id_bytes in job_ids:
            job_id = job_id_bytes.decode('utf-8') if isinstance(job_id_bytes, bytes) else job_id_bytes
            try:
                # Get job data from hash
                job_hash = f'bull:repo-analysis:{job_id}'
                job_data_raw = await self.redis_client.hget(job_hash, 'data')
                
                if job_data_raw:
                    job_data = json.loads(job_data_raw)
                    logger.info(f'Processing job {job_id}: {job_data}')
                    
                    # Process the job
                    job_result = await self.process_job(job_data)
                    
                    # Mark job as completed
                    completed_time = str(int(asyncio.get_event_loop().time() * 1000))
                    await self.redis_client.hset(
                        job_hash,
                        mapping={
                            'returnvalue': json.dumps(job_result),
                            'finishedOn': completed_time
                        }
                    )
                    
                    # Move from active to completed
                    await self.redis_client.lrem(active_queue, 1, job_id)
                    await self.redis_client.sadd('bull:repo-analysis:completed', job_id)
                    logger.info(f'Job {job_id} completed successfully')
                    
            except Exception as e:
                logger.error(f'Error processing job {job_id}: {str(e)}')
                import traceback
                traceback.print_exc()
    
    async def listen_for_jobs(self):
        """Listen for new jobs from BullMQ queue"""
        wait_queue = 'bull:repo-analysis:wait'
        active_queue = 'bull:repo-analysis:active'
        
        logger.info(f'Listening for jobs on {wait_queue}')
        
        while True:
            try:
                # First, process any existing active jobs
                await self.process_active_jobs()
                
                # Then wait for new jobs
                result = await self.redis_client.brpoplpush(
                    wait_queue, 
                    active_queue, 
                    timeout=5
                )
                
                if result:
                    import json
                    job_id = result.decode('utf-8') if isinstance(result, bytes) else result
                    
                    # Get job data from hash
                    job_hash = f'bull:repo-analysis:{job_id}'
                    job_data_raw = await self.redis_client.hget(job_hash, 'data')
                    
                    if job_data_raw:
                        job_data = json.loads(job_data_raw)
                        logger.info(f'Processing new job {job_id}: {job_data}')
                        
                        # Process the job
                        job_result = await self.process_job(job_data)
                        
                        # Mark job as completed
                        completed_time = str(int(asyncio.get_event_loop().time() * 1000))
                        await self.redis_client.hset(
                            job_hash,
                            mapping={
                                'returnvalue': json.dumps(job_result),
                                'finishedOn': completed_time
                            }
                        )
                        
                        # Move from active to completed
                        await self.redis_client.lrem(active_queue, 1, job_id)
                        await self.redis_client.sadd('bull:repo-analysis:completed', job_id)
                        logger.info(f'Job {job_id} completed successfully')
                else:
                    # No new jobs, wait a bit
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f'Error in job listener: {str(e)}')
                import traceback
                traceback.print_exc()
                await asyncio.sleep(1)
                
    async def run(self):
        """Run the worker"""
        await self.connect()
        await self.listen_for_jobs()

async def main():
    worker = Worker()
    await worker.run()

if __name__ == '__main__':
    asyncio.run(main())
