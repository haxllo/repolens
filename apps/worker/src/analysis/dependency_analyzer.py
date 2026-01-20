import os
import json
import logging
from typing import Dict, Any, List
from pathlib import Path

logger = logging.getLogger(__name__)

class DependencyAnalyzer:
    """Analyze dependencies and create dependency graphs"""
    
    async def analyze(
        self, 
        repo_path: str, 
        languages: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze dependencies in the repository
        
        Returns:
            Dependency information including package lists and graph data
        """
        logger.info('Analyzing dependencies')
        
        dependencies = {
            'packages': [],
            'graph': {
                'nodes': [],
                'edges': [],
            },
            'statistics': {
                'total': 0,
                'direct': 0,
                'dev': 0,
            },
        }
        
        # Analyze npm/yarn dependencies
        if 'javascript' in languages.get('languages', {}) or \
           'typescript' in languages.get('languages', {}):
            npm_deps = await self._analyze_npm_dependencies(repo_path)
            dependencies['packages'].extend(npm_deps)
            
        # Analyze Python dependencies
        if 'python' in languages.get('languages', {}):
            py_deps = await self._analyze_python_dependencies(repo_path)
            dependencies['packages'].extend(py_deps)
            
        # Build dependency graph
        dependencies['graph'] = await self._build_dependency_graph(dependencies['packages'])
        
        # Calculate statistics
        dependencies['statistics']['total'] = len(dependencies['packages'])
        dependencies['statistics']['direct'] = len([d for d in dependencies['packages'] if not d.get('isDev')])
        dependencies['statistics']['dev'] = len([d for d in dependencies['packages'] if d.get('isDev')])
        
        return dependencies
        
    async def _analyze_npm_dependencies(self, repo_path: str) -> List[Dict[str, Any]]:
        """Analyze npm/yarn dependencies from package.json"""
        package_json = os.path.join(repo_path, 'package.json')
        dependencies = []
        
        if not os.path.exists(package_json):
            return dependencies
            
        try:
            with open(package_json) as f:
                data = json.load(f)
                
            # Production dependencies
            for name, version in data.get('dependencies', {}).items():
                dependencies.append({
                    'name': name,
                    'version': version,
                    'type': 'npm',
                    'isDev': False,
                })
                
            # Dev dependencies
            for name, version in data.get('devDependencies', {}).items():
                dependencies.append({
                    'name': name,
                    'version': version,
                    'type': 'npm',
                    'isDev': True,
                })
                
        except Exception as e:
            logger.warning(f'Failed to parse package.json: {str(e)}')
            
        return dependencies
        
    async def _analyze_python_dependencies(self, repo_path: str) -> List[Dict[str, Any]]:
        """Analyze Python dependencies from requirements.txt"""
        requirements = os.path.join(repo_path, 'requirements.txt')
        dependencies = []
        
        if not os.path.exists(requirements):
            return dependencies
            
        try:
            with open(requirements) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Parse package==version or package>=version
                        parts = line.replace('>=', '==').replace('~=', '==').split('==')
                        name = parts[0].strip()
                        version = parts[1].strip() if len(parts) > 1 else 'unknown'
                        
                        dependencies.append({
                            'name': name,
                            'version': version,
                            'type': 'pip',
                            'isDev': False,
                        })
        except Exception as e:
            logger.warning(f'Failed to parse requirements.txt: {str(e)}')
            
        return dependencies
        
    async def _build_dependency_graph(self, packages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Build a simple dependency graph for visualization"""
        nodes = []
        edges = []
        
        # Create nodes for each package
        for i, package in enumerate(packages):
            nodes.append({
                'id': f"pkg_{i}",
                'label': package['name'],
                'type': package['type'],
                'isDev': package.get('isDev', False),
            })
            
        # For now, create a simple star graph (all packages depend on root)
        # TODO: Implement actual dependency resolution
        for i in range(len(nodes)):
            if i > 0:  # Skip root
                edges.append({
                    'source': 'root',
                    'target': nodes[i]['id'],
                })
                
        return {
            'nodes': [{'id': 'root', 'label': 'Project', 'type': 'root'}] + nodes,
            'edges': edges,
        }
