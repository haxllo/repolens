import os
import json
import logging
import yaml
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class SystemAnalyzer:
    """
    Analyzes the 'Operational OS' of the repository.
    Extracts build systems, CI/CD pipelines, infrastructure configuration,
    and the actual logic inside operational scripts.
    """
    
    async def analyze(self, repo_path: str) -> Dict[str, Any]:
        """Run a full system analysis with content extraction."""
        logger.info('Analyzing system configuration and script logic')
        
        scripts_metadata = await self._analyze_scripts(repo_path)
        
        return {
            'scripts': scripts_metadata,
            'script_contents': await self._extract_script_logic(repo_path, scripts_metadata),
            'ci_workflows': await self._analyze_github_workflows(repo_path),
            'infrastructure': await self._analyze_infrastructure(repo_path),
            'governance': await self._analyze_governance(repo_path)
        }

    async def _analyze_scripts(self, repo_path: str) -> Dict[str, str]:
        """Extracts build, test, and operational script definitions."""
        scripts = {}
        
        # Node.js
        pkg_json = os.path.join(repo_path, 'package.json')
        if os.path.exists(pkg_json):
            try:
                with open(pkg_json, 'r') as f:
                    data = json.load(f)
                    scripts.update(data.get('scripts', {}))
            except Exception:
                pass

        # Python (Makefile)
        makefile = os.path.join(repo_path, 'Makefile')
        if os.path.exists(makefile):
            try:
                with open(makefile, 'r') as f:
                    for line in f:
                        if ':' in line and not line.startswith('.') and not line.startswith('    '):
                            target = line.split(':')[0].strip()
                            scripts[f"make {target}"] = "Makefile target"
            except Exception:
                pass
                
        return scripts

    async def _extract_script_logic(self, repo_path: str, scripts: Dict[str, str]) -> Dict[str, str]:
        """Reads the first 100 lines of identified script files to understand their logic."""
        contents = {}
        high_value_dirs = ['scripts', 'tools', 'ci', 'devops', '.github/scripts']
        extensions = ('.js', '.ts', '.py', '.sh', '.bash', '.pl')

        # 1. Search for script files in common directories
        for s_dir in high_value_dirs:
            full_dir = os.path.join(repo_path, s_dir)
            if os.path.exists(full_dir) and os.path.isdir(full_dir):
                for f in os.listdir(full_dir):
                    if f.endswith(extensions):
                        f_path = os.path.join(full_dir, f)
                        rel_path = os.path.relpath(f_path, repo_path)
                        contents[rel_path] = self._read_file_safe(f_path)

        # 2. If node scripts point to specific files, try to read them
        for name, cmd in scripts.items():
            if any(marker in cmd for marker in ['node ', 'ts-node ', 'python ', 'bash ', 'sh ']):
                # Basic extraction of path-like strings in the command
                parts = cmd.split()
                for p in parts:
                    if p.endswith(extensions) and ('/' in p or '\\' in p):
                        f_path = os.path.join(repo_path, p)
                        if os.path.exists(f_path):
                            rel_path = os.path.relpath(f_path, repo_path)
                            contents[rel_path] = self._read_file_safe(f_path)

        return contents

    def _read_file_safe(self, path: str, line_limit: int = 100) -> str:
        """Reads a file with a line limit and safety checks."""
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = []
                for i, line in enumerate(f):
                    if i >= line_limit: break
                    lines.append(line)
                return "".join(lines)
        except Exception:
            return "[Error reading script content]"

    async def _analyze_github_workflows(self, repo_path: str) -> List[Dict[str, Any]]:
        """Parses GitHub Actions to understand CI/CD."""
        workflows = []
        workflow_dir = os.path.join(repo_path, '.github', 'workflows')
        
        if os.path.exists(workflow_dir):
            for f in os.listdir(workflow_dir):
                if f.endswith(('.yml', '.yaml')):
                    try:
                        with open(os.path.join(workflow_dir, f), 'r') as yf:
                            data = yaml.safe_load(yf)
                            workflows.append({
                                'name': data.get('name', f),
                                'file': f,
                                'events': list(data.get('on', {}).keys()) if isinstance(data.get('on'), dict) else data.get('on'),
                                'jobs': list(data.get('jobs', {}).keys())
                            })
                    except Exception:
                        pass
        return workflows

    async def _analyze_infrastructure(self, repo_path: str) -> List[str]:
        """Identifies infrastructure tools."""
        infra = []
        if os.path.exists(os.path.join(repo_path, 'Dockerfile')): infra.append('Docker')
        if os.path.exists(os.path.join(repo_path, 'docker-compose.yml')): infra.append('Docker Compose')
        if os.path.exists(os.path.join(repo_path, 'terraform')): infra.append('Terraform')
        if os.path.exists(os.path.join(repo_path, 'vercel.json')): infra.append('Vercel')
        return infra

    async def _analyze_governance(self, repo_path: str) -> List[str]:
        """Identifies code quality and governance tools."""
        tools = []
        if os.path.exists(os.path.join(repo_path, '.eslintrc.js')) or os.path.exists(os.path.join(repo_path, '.eslintrc.json')):
            tools.append('ESLint')
        if os.path.exists(os.path.join(repo_path, '.prettierrc')):
            tools.append('Prettier')
        if os.path.exists(os.path.join(repo_path, 'tsconfig.json')):
            tools.append('TypeScript')
        if os.path.exists(os.path.join(repo_path, 'pyproject.toml')):
            tools.append('Black/Ruff (implied)')
        return tools