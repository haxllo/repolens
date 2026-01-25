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
        high_value_dirs = ['.', 'scripts', 'tools', 'ci', 'devops', '.github/scripts', 'bin']
        extensions = ('.js', '.ts', '.py', '.sh', '.bash', '.pl', '.ps1')

        # 1. Search for script files in common directories
        for s_dir in high_value_dirs:
            full_dir = os.path.join(repo_path, s_dir)
            if os.path.exists(full_dir) and os.path.isdir(full_dir):
                try:
                    for f in os.listdir(full_dir):
                        if f.endswith(extensions) and f not in ['package.json', 'package-lock.json']:
                            f_path = os.path.join(full_dir, f)
                            if os.path.isfile(f_path):
                                rel_path = os.path.relpath(f_path, repo_path)
                                # Avoid adding too many files if in root
                                if s_dir == '.' and f.startswith('.'): continue
                                contents[rel_path] = self._read_file_safe(f_path)
                except Exception:
                    pass

        # 2. If scripts point to specific files, try to read them
        for name, cmd in scripts.items():
            if not isinstance(cmd, str): continue
            if any(marker in cmd for marker in ['node ', 'ts-node ', 'python ', 'bash ', 'sh ', './']):
                # Basic extraction of path-like strings in the command
                parts = cmd.split()
                for p in parts:
                    if p.endswith(extensions) and (p.startswith('./') or '/' in p or '\\' in p):
                        clean_p = p.lstrip('./')
                        f_path = os.path.join(repo_path, clean_p)
                        if os.path.exists(f_path) and os.path.isfile(f_path):
                            rel_path = os.path.relpath(f_path, repo_path)
                            if rel_path not in contents:
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

    async def _analyze_infrastructure(self, repo_path: str) -> List[Dict[str, Any]]:
        """Identifies and extracts infrastructure details."""
        infra = []
        
        # Dockerfile
        dockerfile_path = os.path.join(repo_path, 'Dockerfile')
        if os.path.exists(dockerfile_path):
            details = {'tool': 'Docker', 'file': 'Dockerfile'}
            try:
                with open(dockerfile_path, 'r') as f:
                    for line in f:
                        if line.startswith('FROM'):
                            details['base_image'] = line.split('FROM')[1].strip()
                        if line.startswith('EXPOSE'):
                            details['port'] = line.split('EXPOSE')[1].strip()
            except Exception:
                pass
            infra.append(details)
            
        # Docker Compose
        compose_path = os.path.join(repo_path, 'docker-compose.yml')
        if not os.path.exists(compose_path):
            compose_path = os.path.join(repo_path, 'docker-compose.yaml')
            
        if os.path.exists(compose_path):
            details = {'tool': 'Docker Compose', 'file': os.path.basename(compose_path)}
            try:
                with open(compose_path, 'r') as f:
                    data = yaml.safe_load(f)
                    if data and 'services' in data:
                        details['services'] = list(data['services'].keys())
                        ports = []
                        for s_name, s_cfg in data['services'].items():
                            if 'ports' in s_cfg:
                                ports.extend(s_cfg['ports'])
                        if ports:
                            details['ports'] = ports
            except Exception:
                pass
            infra.append(details)
            
        if os.path.exists(os.path.join(repo_path, 'terraform')): infra.append({'tool': 'Terraform'})
        if os.path.exists(os.path.join(repo_path, 'vercel.json')): infra.append({'tool': 'Vercel'})
        
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