import os
import tempfile
import shutil
import logging
from pathlib import Path
from git import Repo
from typing import Optional

logger = logging.getLogger(__name__)

class RepoCloner:
    """Handles secure repository cloning and sandboxing"""
    
    def __init__(self):
        self.sandbox_dir = os.getenv('SANDBOX_DIR', '/tmp/repolens-sandboxes')
        Path(self.sandbox_dir).mkdir(parents=True, exist_ok=True)
        
    async def clone_repo(
        self, 
        repo_url: str, 
        branch: str = 'main',
        scan_id: Optional[str] = None,
        github_token: Optional[str] = None
    ) -> str:
        """
        Clone a repository into a sandboxed directory
        
        Args:
            repo_url: Repository URL
            branch: Branch to clone
            scan_id: Unique scan identifier for directory naming
            github_token: Optional GitHub token for private repos
            
        Returns:
            Path to cloned repository
        """
        # Create unique sandbox directory
        sandbox_name = scan_id or tempfile.mkdtemp(dir=self.sandbox_dir).split('/')[-1]
        repo_path = os.path.join(self.sandbox_dir, sandbox_name)
        
        # Clean up existing directory if it exists (from previous failed attempts)
        if os.path.exists(repo_path):
            logger.warning(f'Directory {repo_path} already exists, cleaning up...')
            shutil.rmtree(repo_path, ignore_errors=True)
        
        try:
            logger.info(f'Cloning {repo_url} (branch: {branch}) to {repo_path}')
            
            # If GitHub token provided, use authenticated URL
            clone_url = repo_url
            if github_token and 'github.com' in repo_url:
                # Convert to authenticated URL format
                clone_url = repo_url.replace(
                    'https://github.com/',
                    f'https://x-access-token:{github_token}@github.com/'
                )
            
            # Clone with depth 1 for speed and space efficiency
            Repo.clone_from(
                clone_url,
                repo_path,
                branch=branch,
                depth=1,
                single_branch=True,
                no_checkout=False
            )
            
            # Verify clone succeeded
            if not os.path.exists(repo_path):
                raise Exception(f'Clone failed: {repo_path} does not exist')
                
            logger.info(f'Successfully cloned to {repo_path}')
            return repo_path
            
        except Exception as e:
            logger.error(f'Failed to clone repository: {str(e)}')
            # Cleanup on failure
            if os.path.exists(repo_path):
                shutil.rmtree(repo_path, ignore_errors=True)
            raise
            
    async def cleanup(self, repo_path: str):
        """Remove cloned repository"""
        try:
            if os.path.exists(repo_path):
                logger.info(f'Cleaning up {repo_path}')
                shutil.rmtree(repo_path, ignore_errors=True)
        except Exception as e:
            logger.error(f'Failed to cleanup {repo_path}: {str(e)}')
