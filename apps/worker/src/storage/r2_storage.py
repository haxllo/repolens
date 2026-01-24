import os
import logging
from typing import Optional
import aiobotocore.session
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class R2Storage:
    """Handles object storage using Cloudflare R2 (S3-compatible)"""
    
    def __init__(self):
        self.endpoint_url = os.getenv('R2_ENDPOINT_URL')
        self.access_key_id = os.getenv('R2_ACCESS_KEY_ID')
        self.secret_access_key = os.getenv('R2_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('R2_BUCKET_NAME', 'repolens-analysis')
        
        self.enabled = all([self.endpoint_url, self.access_key_id, self.secret_access_key])
        
        if not self.enabled:
            logger.warning("Cloudflare R2 storage is not fully configured. Artifact persistence disabled.")

    async def upload_json(self, key: str, data: str) -> bool:
        """Upload string/json content to R2"""
        if not self.enabled:
            return False
            
        session = aiobotocore.session.get_session()
        try:
            async with session.create_client(
                's3',
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key
            ) as client:
                await client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=data,
                    ContentType='application/json'
                )
                logger.info(f"Successfully uploaded artifact to R2: {key}")
                return True
        except Exception as e:
            logger.error(f"Failed to upload to R2: {str(e)}")
            return False

    def get_public_url(self, key: str) -> Optional[str]:
        """Return the public URL for an artifact if a custom domain is configured"""
        custom_domain = os.getenv('R2_CUSTOM_DOMAIN')
        if custom_domain:
            return f"https://{custom_domain}/{key}"
        return None
