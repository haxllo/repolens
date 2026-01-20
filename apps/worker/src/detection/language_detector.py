import os
import json
from pathlib import Path
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class LanguageDetector:
    """Detects programming languages and frameworks in a repository"""
    
    LANGUAGE_EXTENSIONS = {
        'javascript': ['.js', '.jsx', '.mjs'],
        'typescript': ['.ts', '.tsx'],
        'python': ['.py'],
        'java': ['.java'],
        'go': ['.go'],
        'rust': ['.rs'],
        'ruby': ['.rb'],
    }
    
    FRAMEWORK_MARKERS = {
        'react': ['package.json'],
        'next.js': ['next.config.js', 'next.config.mjs'],
        'vue': ['package.json'],
        'angular': ['angular.json'],
        'django': ['manage.py', 'settings.py'],
        'flask': ['app.py', 'application.py'],
        'fastapi': ['main.py'],
        'express': ['package.json'],
    }
    
    async def detect(self, repo_path: str) -> Dict[str, any]:
        """
        Detect languages and frameworks in repository
        
        Returns:
            Dictionary with languages, frameworks, and file counts
        """
        logger.info(f'Detecting languages in {repo_path}')
        
        languages = {}
        frameworks = []
        
        # Walk through repository
        for root, dirs, files in os.walk(repo_path):
            # Skip hidden directories and common ignore patterns
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', 'vendor', 'dist', 'build']]
            
            for file in files:
                ext = Path(file).suffix.lower()
                
                # Count language files
                for lang, extensions in self.LANGUAGE_EXTENSIONS.items():
                    if ext in extensions:
                        languages[lang] = languages.get(lang, 0) + 1
                        
        # Detect frameworks
        frameworks = await self._detect_frameworks(repo_path)
        
        # Determine primary language
        primary_language = max(languages, key=languages.get) if languages else 'unknown'
        
        return {
            'primary': primary_language,
            'languages': languages,
            'frameworks': frameworks,
            'totalFiles': sum(languages.values()),
        }
        
    async def _detect_frameworks(self, repo_path: str) -> List[str]:
        """Detect frameworks based on marker files"""
        detected = []
        
        # Check for Next.js
        if os.path.exists(os.path.join(repo_path, 'next.config.js')) or \
           os.path.exists(os.path.join(repo_path, 'next.config.mjs')):
            detected.append('next.js')
            
        # Check package.json for frameworks
        package_json = os.path.join(repo_path, 'package.json')
        if os.path.exists(package_json):
            try:
                with open(package_json) as f:
                    data = json.load(f)
                    deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
                    
                    if 'react' in deps:
                        detected.append('react')
                    if 'vue' in deps:
                        detected.append('vue')
                    if 'express' in deps:
                        detected.append('express')
            except:
                pass
                
        # Check for Python frameworks
        if os.path.exists(os.path.join(repo_path, 'manage.py')):
            detected.append('django')
        
        requirements_txt = os.path.join(repo_path, 'requirements.txt')
        if os.path.exists(requirements_txt):
            try:
                with open(requirements_txt) as f:
                    content = f.read().lower()
                    if 'flask' in content:
                        detected.append('flask')
                    if 'fastapi' in content:
                        detected.append('fastapi')
            except:
                pass
                
        return detected
