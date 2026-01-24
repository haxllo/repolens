import docker
import logging
import tempfile
import os
import tarfile
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SandboxService:
    """
    Securely executes code snippets in isolated Docker containers.
    Used for verifying AI-generated examples and running unit tests.
    """
    
    def __init__(self):
        try:
            self.client = docker.from_env()
            self.enabled = True
        except Exception as e:
            logger.warning(f"Docker not available, Sandbox disabled: {e}")
            self.enabled = False

    def execute_code(self, language: str, code: str, context: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Run code in a container.
        
        Args:
            language: 'python' or 'javascript'
            code: The source code to run
            context: Optional dictionary of {filename: content} to verify multi-file logic
            
        Returns:
            { "stdout": str, "stderr": str, "exit_code": int, "duration": float }
        """
        if not self.enabled:
            return {"error": "Sandbox disabled"}

        image = self._get_image_for_lang(language)
        if not image:
            return {"error": f"Unsupported language: {language}"}

        # Create a temporary directory for the execution context
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write main file
            ext = 'py' if language == 'python' else 'js'
            cmd = ['python', 'main.py'] if language == 'python' else ['node', 'main.js']
            
            with open(os.path.join(temp_dir, f'main.{ext}'), 'w') as f:
                f.write(code)
                
            # Write context files (e.g., imported modules)
            if context:
                for fname, content in context.items():
                    with open(os.path.join(temp_dir, fname), 'w') as f:
                        f.write(content)

            try:
                # Run container
                container = self.client.containers.run(
                    image,
                    command=cmd,
                    working_dir="/app",
                    volumes={temp_dir: {'bind': '/app', 'mode': 'rw'}},
                    mem_limit="256m",
                    network_mode="none",  # No internet access
                    pids_limit=50,       # Prevent fork bombs
                    cpu_period=100000,
                    cpu_quota=50000,     # 50% of 1 CPU
                    remove=True,
                    stdout=True,
                    stderr=True
                )
                
                return {
                    "stdout": container.decode('utf-8'),
                    "stderr": "",
                    "exit_code": 0
                }
                
            except docker.errors.ContainerError as e:
                return {
                    "stdout": e.stdout.decode('utf-8') if e.stdout else "",
                    "stderr": e.stderr.decode('utf-8') if e.stderr else str(e),
                    "exit_code": e.exit_status
                }
            except Exception as e:
                return {"error": str(e)}

    def _get_image_for_lang(self, language: str) -> Optional[str]:
        if language == 'python':
            return 'python:3.11-slim'
        elif language == 'javascript' or language == 'typescript':
            return 'node:18-alpine'
        return None
