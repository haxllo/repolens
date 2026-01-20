import os
import logging
from typing import Dict, Any, List
from tree_sitter import Language, Parser
import tree_sitter_javascript as tsjs
import tree_sitter_typescript as tsts
import tree_sitter_python as tspy

logger = logging.getLogger(__name__)

class ASTParser:
    """Parse Abstract Syntax Trees for supported languages"""
    
    def __init__(self):
        # Initialize tree-sitter languages (updated API for v0.23+)
        self.js_language = Language(tsjs.language())
        self.ts_language = Language(tsts.language_typescript())
        self.py_language = Language(tspy.language())
        
        self.parsers = {
            'javascript': self._create_parser(self.js_language),
            'typescript': self._create_parser(self.ts_language),
            'python': self._create_parser(self.py_language),
        }
        
    def _create_parser(self, language: Language) -> Parser:
        """Create a parser for a given language"""
        parser = Parser(language)
        return parser
        
    async def parse_repository(
        self, 
        repo_path: str, 
        languages: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Parse repository files and extract AST information
        
        Returns:
            AST analysis results including function counts, imports, exports
        """
        logger.info('Parsing repository AST')
        
        results = {
            'files': [],
            'summary': {
                'totalFunctions': 0,
                'totalClasses': 0,
                'totalImports': 0,
                'totalExports': 0,
            },
            'entryPoints': [],
        }
        
        # Parse files for each detected language
        for lang in languages.get('languages', {}).keys():
            if lang in self.parsers:
                lang_results = await self._parse_language_files(repo_path, lang)
                results['files'].extend(lang_results)
                
        # Update summary
        for file_data in results['files']:
            results['summary']['totalFunctions'] += file_data.get('functions', 0)
            results['summary']['totalClasses'] += file_data.get('classes', 0)
            results['summary']['totalImports'] += file_data.get('imports', 0)
            results['summary']['totalExports'] += file_data.get('exports', 0)
            
        # Detect entry points
        results['entryPoints'] = await self._detect_entry_points(results['files'])
        
        return results
        
    async def _parse_language_files(
        self, 
        repo_path: str, 
        language: str
    ) -> List[Dict[str, Any]]:
        """Parse all files of a specific language"""
        results = []
        parser = self.parsers[language]
        
        extensions = {
            'javascript': ['.js', '.jsx', '.mjs'],
            'typescript': ['.ts', '.tsx'],
            'python': ['.py'],
        }
        
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', 'dist']]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions.get(language, [])):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    try:
                        file_data = await self._parse_file(file_path, relative_path, parser, language)
                        results.append(file_data)
                    except Exception as e:
                        logger.warning(f'Failed to parse {relative_path}: {str(e)}')
                        
        return results
        
    async def _parse_file(
        self, 
        file_path: str, 
        relative_path: str,
        parser: Parser,
        language: str
    ) -> Dict[str, Any]:
        """Parse a single file"""
        with open(file_path, 'rb') as f:
            source_code = f.read()
            
        tree = parser.parse(source_code)
        root_node = tree.root_node
        
        # Extract basic metrics
        functions = self._count_nodes(root_node, ['function_declaration', 'function_definition', 'arrow_function'])
        classes = self._count_nodes(root_node, ['class_declaration', 'class_definition'])
        imports = self._count_nodes(root_node, ['import_statement', 'import_from_statement'])
        exports = self._count_nodes(root_node, ['export_statement'])
        
        return {
            'path': relative_path,
            'language': language,
            'functions': functions,
            'classes': classes,
            'imports': imports,
            'exports': exports,
            'lines': source_code.count(b'\n') + 1,
        }
        
    def _count_nodes(self, node, types: List[str]) -> int:
        """Count nodes of specific types in AST"""
        count = 0
        
        if node.type in types:
            count += 1
            
        for child in node.children:
            count += self._count_nodes(child, types)
            
        return count
        
    async def _detect_entry_points(self, files: List[Dict[str, Any]]) -> List[str]:
        """Detect likely entry point files"""
        entry_points = []
        
        # Common entry point patterns
        patterns = [
            'index.js', 'index.ts', 'main.py', 'app.py', 
            'server.js', 'server.ts', 'index.tsx', 'main.ts'
        ]
        
        for file_data in files:
            path = file_data['path']
            filename = os.path.basename(path)
            
            if filename in patterns:
                entry_points.append(path)
                
        return entry_points
