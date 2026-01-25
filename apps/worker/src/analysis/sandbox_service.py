import docker
import logging
import tempfile
import os
import base64
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SandboxService:
    """
    NATIVE_EXECUTION_PROTOCOL
    Spawns isolated ephemeral containers using the host Docker engine.
    Optimized for AWS EC2 environments with mounted docker.sock.
    """
    
    def __init__(self):
        try:
            self.client = docker.from_env()
            self.enabled = True
            logger.info("SANDBOX_SYSTEM: Local Docker Engine Detected. Native Execution Active.")
        except Exception as e:
            logger.warning(f"SANDBOX_SYSTEM: Docker Engine Unavailable. Fallback Required: {e}")
            self.enabled = False

    async def execute_code(self, language: str, code: str, context: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Execute code in a hardened container.
        """
        if not self.enabled:
            return {"error": "EXECUTION_HALTED: Sandbox logic disabled."}

        image = self._get_image_for_lang(language)
        if not image:
            return {"error": f"PROTOCOL_ERROR: Unsupported language variant: {language}"}

        with tempfile.TemporaryDirectory() as temp_dir:
            # Prepare file
            ext = 'py' if language == 'python' else 'js'
            filename = f'main.{ext}'
            cmd = ['python', filename] if language == 'python' else ['node', filename]
            
            with open(os.path.join(temp_dir, filename), 'w') as f:
                f.write(code)

            try:
                # Execute with strict resource governance
                container = self.client.containers.run(
                    image,
                    command=cmd,
                    working_dir="/app",
                    volumes={temp_dir: {'bind': '/app', 'mode': 'ro'}}, # Read-only mount
                    mem_limit="128m",      # Minimal RAM
                    nano_cpus=500000000,   # 0.5 CPU
                    network_mode="none",   # No network
                    pids_limit=20,         # Prevent fork bombs
                    remove=True,           # Auto-cleanup
                    stdout=True,
                    stderr=True,
                    timeout=5              # 5s hard kill
                )
                
                return {
                    "stdout": container.decode('utf-8'),
                    "stderr": "",
                    "exit_code": 0,
                    "status": "SUCCESS"
                }
                
            except docker.errors.ContainerError as e:
                return {
                    "stdout": e.stdout.decode('utf-8') if e.stdout else "",
                    "stderr": e.stderr.decode('utf-8') if e.stderr else str(e),
                    "exit_code": e.exit_status,
                    "status": "RUNTIME_ERROR"
                }
            except Exception as e:
                logger.error(f"SANDBOX_CRITICAL: {str(e)}")
                return {"error": "SYSTEM_FAULT: Execution environment collapsed.", "details": str(e)}

    def _get_image_for_lang(self, language: str) -> Optional[str]:
        if language == 'python':
            return 'python:3.11-slim'
        elif language in ['javascript', 'typescript']:
            return 'node:18-alpine'
        return None