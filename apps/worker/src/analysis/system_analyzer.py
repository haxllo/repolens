import os
import json
import logging
import yaml
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class SystemAnalyzer:
    """
    Analyzes the 'Operational OS' of the repository.
    Extracts build systems, CI/CD pipelines, and infrastructure configuration.
    """
    
    async def analyze(self, repo_path: str) -> Dict[str, Any]:
        """Run a full system analysis."""
        logger.info('Analyzing system configuration and workflows')
        
        return {
            'scripts': await self._analyze_scripts(repo_path),
            'ci_workflows': await self._analyze_github_workflows(repo_path),
            'infrastructure': await self._analyze_infrastructure(repo_path),
            'governance': await self._analyze_governance(repo_path)
        }

    async def _analyze_scripts(self, repo_path: str) -> Dict[str, str]:
        """Extracts build, test, and operational scripts."""
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
                        if ':' in line and not line.startswith('.') and not line.startswith('	'):
                            target = line.split(':')[0].strip()
                            scripts[f"make {target}"] = "Makefile target"
            except Exception:
                pass
                
        return scripts

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
        if os.path.exists(os.path.join(repo_path, 'k8s')): infra.append('Kubernetes')
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
