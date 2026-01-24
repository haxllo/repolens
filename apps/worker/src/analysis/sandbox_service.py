import logging
import os
import aiohttp
import base64
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SandboxService:
    """
    Executes code snippets using a Judge0 instance (Self-hosted or Cloud).
    Removes the need for local Docker socket mounting.
    """
    
    def __init__(self):
        # Default to a placeholder; user must provide valid URL in production
        self.api_url = os.getenv('JUDGE0_API_URL', 'https://judge0-ce.p.rapidapi.com')
        self.api_key = os.getenv('JUDGE0_API_KEY') # Optional if self-hosted
        self.enabled = True
        
        # Language IDs for Judge0
        # Ref: https://ce.judge0.com/#statuses-and-languages-language-get
        self.lang_ids = {
            'python': 71,   # Python 3.8.1 (or similar)
            'javascript': 63, # Node.js 12.14.0
            'typescript': 74  # TypeScript 3.7.4
        }
        
        logger.info(f"SandboxService initialized using Judge0 at {self.api_url}")

    async def execute_code(self, language: str, code: str, context: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Run code via Judge0.
        
        Args:
            language: 'python' or 'javascript'
            code: The source code to run
            context: (Not fully supported in basic Judge0, implies single file for now)
            
        Returns:
            { "stdout": str, "stderr": str, "exit_code": int, "duration": float }
        """
        if not self.enabled:
            return {"error": "Sandbox disabled"}

        lang_id = self.lang_ids.get(language)
        if not lang_id:
            return {"error": f"Unsupported language: {language}"}

        # Judge0 expects base64 encoded source code
        source_code_b64 = base64.b64encode(code.encode('utf-8')).decode('utf-8')
        
        payload = {
            "language_id": lang_id,
            "source_code": source_code_b64,
            "base64_encoded": True
        }

        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["X-RapidAPI-Key"] = self.api_key
            headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com"

        try:
            async with aiohttp.ClientSession() as session:
                # 1. Submit Submission
                async with session.post(
                    f"{self.api_url}/submissions?base64_encoded=true&wait=true", 
                    json=payload, 
                    headers=headers
                ) as response:
                    if response.status != 201 and response.status != 200:
                        text = await response.text()
                        logger.error(f"Judge0 submission failed: {text}")
                        return {"error": f"Execution submission failed: {response.status}"}
                    
                    result = await response.json()
                    
                    # If 'wait=true' was used, the result is in the response
                    # Otherwise we might need to poll (simplified for now with wait=true)
                    
                    stdout = result.get('stdout') or ""
                    stderr = result.get('stderr') or ""
                    compile_output = result.get('compile_output') or ""
                    
                    # Decode if returned in base64 (it should be if we sent base64_encoded=true)
                    try:
                        if stdout: stdout = base64.b64decode(stdout).decode('utf-8', errors='ignore')
                        if stderr: stderr = base64.b64decode(stderr).decode('utf-8', errors='ignore')
                        if compile_output: compile_output = base64.b64decode(compile_output).decode('utf-8', errors='ignore')
                    except Exception as e:
                        logger.warning(f"Failed to decode output: {e}")

                    # Combine compile errors into stderr
                    full_stderr = (compile_output + "\n" + stderr).strip()

                    return {
                        "stdout": stdout,
                        "stderr": full_stderr,
                        "exit_code": 0 if not full_stderr else 1, # Judge0 status logic is more complex, simplifying
                        "status": result.get('status', {}).get('description')
                    }

        except Exception as e:
            logger.error(f"Judge0 execution error: {str(e)}")
            return {"error": str(e)}
