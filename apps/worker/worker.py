import asyncio
import logging
import os
import json
from typing import Any, Dict
import redis.asyncio as redis
import aiohttp
from dotenv import load_dotenv
from src.analysis.orchestrator import AnalysisOrchestrator
from src.analysis.sandbox_service import SandboxService

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
        self.sandbox = SandboxService()
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
                    if response.status != 200:
                        logger.error(f'Failed to update scan {scan_id} status: {response.status}')
        except Exception as e:
            logger.error(f'Error updating scan status: {str(e)}')
        
    async def process_analysis_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a repository analysis job"""
        scan_id = job_data.get('scanId')
        repo_url = job_data.get('repoUrl')
        branch = job_data.get('branch', 'main')
        
        logger.info(f'Processing Analysis Job {scan_id} for {repo_url}')
        
        try:
            await self.update_scan_status(scan_id, 'PROCESSING')
            results = await self.orchestrator.analyze_repository(repo_url, branch, scan_id)
            await self.update_scan_status(scan_id, 'COMPLETED', results=results)
            return results
        except Exception as e:
            await self.update_scan_status(scan_id, 'FAILED', error=str(e))
            raise

    async def process_execution_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a code execution job"""
        logger.info(f'Processing Execution Job')
        language = job_data.get('language')
        code = job_data.get('code')
        context = job_data.get('context', {})
        
        return self.sandbox.execute_code(language, code, context)

    async def _handle_job_lifecycle(self, queue_name: str, job_id: str, processor_func):
        """Generic job lifecycle handler (fetch, process, complete)"""
        active_queue = f'{queue_name}:active'
        job_hash = f'{queue_name.replace(":active", "").replace(":wait", "")}:{job_id}'
        
        try:
            job_data_raw = await self.redis_client.hget(job_hash, 'data')
            if not job_data_raw:
                return

            job_data = json.loads(job_data_raw)
            logger.info(f'Start Job {job_id} [{queue_name}]')

            # Process
            result = await processor_func(job_data)
            
            # Complete
            completed_time = str(int(asyncio.get_event_loop().time() * 1000))
            await self.redis_client.hset(
                job_hash,
                mapping={
                    'returnvalue': json.dumps(result),
                    'finishedOn': completed_time
                }
            )
            
            # Cleanup queues
            await self.redis_client.lrem(active_queue, 1, job_id)
            completed_set = queue_name.replace("wait", "completed").replace("active", "completed") # rough heuristic
            # Better: bull:queue:completed
            base_queue = queue_name.split(':')[1] # repo-analysis
            await self.redis_client.sadd(f'bull:{base_queue}:completed', job_id)
            
        except Exception as e:
            logger.error(f'Job {job_id} failed: {e}')
            failed_reason = str(e)
            await self.redis_client.hset(job_hash, mapping={'failedReason': failed_reason})
            # Move to failed set (simplified for now)

    async def listen_to_queue(self, queue_name: str, processor_func):
        """Dedicated listener for a specific queue"""
        wait_queue = f'bull:{queue_name}:wait'
        active_queue = f'bull:{queue_name}:active'
        
        logger.info(f'Listening on {wait_queue}...')
        
        while True:
            try:
                # 1. Process stranded active jobs (simplified recovery)
                # In prod, we'd want careful robust recovery
                
                # 2. Block for new jobs
                result = await self.redis_client.brpoplpush(wait_queue, active_queue, timeout=5)
                
                if result:
                    job_id = result
                    asyncio.create_task(
                        self._handle_job_lifecycle(f'bull:{queue_name}', job_id, processor_func)
                    )
                else:
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f'Queue error {queue_name}: {e}')
                await asyncio.sleep(5)

    async def run(self):
        await self.connect()
        # Run listeners concurrently
        await asyncio.gather(
            self.listen_to_queue('repo-analysis', self.process_analysis_job),
            self.listen_to_queue('code-execution', self.process_execution_job)
        )

if __name__ == '__main__':
    worker = Worker()
    asyncio.run(worker.run())