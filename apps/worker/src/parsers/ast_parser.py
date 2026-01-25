import os
import logging
import re
import json
import subprocess
import asyncio
from typing import Dict, Any, List, Set, Optional
from tree_sitter import Language, Parser
import tree_sitter_javascript as tsjs
import tree_sitter_typescript as tsts
import tree_sitter_python as tspy

logger = logging.getLogger(__name__)

class ASTParser:
    """Parse Abstract Syntax Trees and identify Architectural Patterns"""
    
    def __init__(self):
        self.js_language = Language(tsjs.language())
        self.ts_language = Language(tsts.language_typescript())
        self.py_language = Language(tspy.language())
        
        self.parsers = {
            'javascript': self._create_parser(self.js_language),
            'typescript': self._create_parser(self.ts_language),
            'python': self._create_parser(self.py_language),
        }

        # Path to Rust oxidizer binary
        self.oxidizer_path = os.getenv('OXIDIZER_PATH', os.path.join(os.getcwd(), 'apps/oxidizer/target/release/oxidizer'))
        if os.name == 'nt': self.oxidizer_path += '.exe'

        # Pattern definitions for "CodeWiki" standard detection
        self.patterns = {
            'state_management': {
                'Redux': [r'redux', r'@reduxjs/toolkit'],
                'Zustand': [r'zustand'],
                'Jotai': [r'jotai'],
                'MobX': [r'mobx'],
                'React Context': [r'createContext']
            },
            'ui_libraries': {
                'Radix UI': [r'@radix-ui/'],
                'Shadcn UI': [r'@/components/ui'],
                'Material UI': [r'@mui/'],
                'Tailwind CSS': [r'tailwind'],
                'Framer Motion': [r'framer-motion']
            },
            'backend_frameworks': {
                'FastAPI': [r'fastapi'],
                'Django': [r'django'],
                'NestJS': [r'@nestjs/'],
                'Express': [r'express']
            },
            'testing': {
                'Jest': [r'jest', r'@jest/'],
                'Vitest': [r'vitest'],
                'Pytest': [r'pytest']
            }
        }
        
    def _create_parser(self, language: Language) -> Parser:
        parser = Parser(language)
        return parser
        
    async def parse_repository(self, repo_path: str, languages: Dict[str, Any]) -> Dict[str, Any]:
        logger.info('Parsing repository AST with Pattern Recognition')
        
        # 1. Try Oxidized Analysis (Rust) for JS/TS
        oxidized_results = await self._run_oxidizer(repo_path)
        
        results = {
            'files': [],
            'summary': {
                'totalFunctions': 0,
                'totalClasses': 0,
                'totalImports': 0,
                'patterns': {} # High-level architectural patterns found
            },
            'entryPoints': [],
            'dependencies': [], # Internal module dependency graph (converted to list)
            'oxidized_metadata': {
                'cycles': [],
                'total_files': 0,
                'active': False
            }
        }
        
        detected_patterns = {cat: set() for cat in self.patterns.keys()}
        
        # Use oxidized results as base for JS/TS if available
        processed_files = set()
        if oxidized_results:
            results['oxidized_metadata']['active'] = True
            results['oxidized_metadata']['cycles'] = oxidized_results.get('cycles', [])
            results['oxidized_metadata']['total_files'] = oxidized_results.get('total_files', 0)
            
            for f in oxidized_results.get('files', []):
                if not f.get('error'):
                    f['language'] = 'typescript' if f['path'].endswith(('.ts', '.tsx')) else 'javascript'
                    f['imports_count'] = len(f.get('imports', []))
                    # Still need to run pattern matching on these files
                    f['patterns'] = self._recognize_patterns_in_text(os.path.join(repo_path, f['path']), detected_patterns)
                    results['files'].append(f)
                    processed_files.add(f['path'])

        # 2. Parse remaining files (Python, or JS/TS fallback)
        for lang in languages.get('languages', {}).keys():
            if lang in self.parsers:
                lang_results = await self._parse_language_files(repo_path, lang, detected_patterns, processed_files)
                results['files'].extend(lang_results)
                
        # Aggregate summary
        for file_data in results['files']:
            results['summary']['totalFunctions'] += file_data.get('functions', 0)
            results['summary']['totalClasses'] += file_data.get('classes', 0)
            results['summary']['totalImports'] += file_data.get('imports_count', 0)
            
        # Convert sets to lists for JSON
        results['summary']['patterns'] = {k: list(v) for k, v in detected_patterns.items()}
        results['entryPoints'] = await self._detect_entry_points(results['files'])
        
        return results

    async def _run_oxidizer(self, repo_path: str) -> Optional[Dict[str, Any]]:
        """Invokes the Rust oxidizer binary for high-speed parsing."""
        if not os.path.exists(self.oxidizer_path):
            logger.warning(f"Oxidizer binary not found at {self.oxidizer_path}. Falling back to tree-sitter.")
            return None
            
        try:
            logger.info(f"Invoking Oxidizer on {repo_path}")
            process = await asyncio.create_subprocess_exec(
                self.oxidizer_path, "--path", repo_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return json.loads(stdout.decode())
            else:
                logger.error(f"Oxidizer failed: {stderr.decode()}")
                return None
        except Exception as e:
            logger.error(f"Failed to run oxidizer: {e}")
            return None

    def _recognize_patterns_in_text(self, file_path: str, global_patterns: Dict[str, Set]) -> List[str]:
        """Runs regex pattern recognition on file content for architectural insights."""
        file_patterns = []
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                source_text = f.read()
                for category, mappings in self.patterns.items():
                    for name, regexes in mappings.items():
                        if any(re.search(r, source_text) for r in regexes):
                            global_patterns[category].add(name)
                            file_patterns.append(name)
        except Exception:
            pass
        return file_patterns
        
    async def _parse_language_files(self, repo_path: str, language: str, global_patterns: Dict[str, Set], skip_files: Set[str]) -> List[Dict[str, Any]]:
        results = []
        parser = self.parsers[language]
        extensions = {'javascript': ['.js', '.jsx', '.mjs'], 'typescript': ['.ts', '.tsx'], 'python': ['.py']}
        
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', 'dist', '.next']]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions.get(language, [])):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    if relative_path in skip_files:
                        continue
                        
                    try:
                        file_data = await self._parse_file(file_path, relative_path, parser, language, global_patterns)
                        results.append(file_data)
                    except Exception as e:
                        logger.warning(f'Failed to parse {relative_path}: {str(e)}')
                        
        return results
        
    async def _parse_file(self, file_path: str, relative_path: str, parser: Parser, language: str, global_patterns: Dict[str, Set]) -> Dict[str, Any]:
        with open(file_path, 'rb') as f:
            source_code = f.read()
            source_text = source_code.decode('utf-8', errors='ignore')
            
        tree = parser.parse(source_code)
        root_node = tree.root_node
        
        # 1. Pattern Matching (The CodeWiki Secret)
        file_patterns = []
        for category, mappings in self.patterns.items():
            for name, regexes in mappings.items():
                if any(re.search(r, source_text) for r in regexes):
                    global_patterns[category].add(name)
                    file_patterns.append(name)

        # 2. Extract Metrics
        functions = self._count_nodes(root_node, ['function_declaration', 'function_definition', 'arrow_function'])
        classes = self._count_nodes(root_node, ['class_declaration', 'class_definition'])
        
        # 3. Import Analysis (Identify dependencies)
        imports = self._extract_imports(root_node, language)
        
        return {
            'path': relative_path,
            'language': language,
            'functions': functions,
            'classes': classes,
            'imports_count': len(imports),
            'imports': imports[:10], # Only keep first 10 for context
            'patterns': file_patterns,
            'lines': source_text.count('\n') + 1,
        }
        
    def _extract_imports(self, root_node, language: str) -> List[str]:
        imports = []
        # Simplified query-based import extraction
        if language in ['javascript', 'typescript']:
            # Look for import_statement and call_expression (require)
            pass 
        return imports

    def _count_nodes(self, node, types: List[str]) -> int:
        count = 0
        if node.type in types: count += 1
        for child in node.children:
            count += self._count_nodes(child, types)
        return count
        
    async def _detect_entry_points(self, files: List[Dict[str, Any]]) -> List[str]:
        patterns = ['index.js', 'index.ts', 'main.py', 'app.py', 'server.js', 'server.ts', 'index.tsx', 'main.ts']
        return [f['path'] for f in files if os.path.basename(f['path']) in patterns]