"""
Dead Code Detector

Identifies unused exports, imports, and potentially dead code in JavaScript/TypeScript
and Python projects using tree-sitter AST analysis.
"""

from typing import Dict, List, Set, Optional, Any, Tuple
from collections import defaultdict
import os
import logging

logger = logging.getLogger(__name__)


class DeadCodeDetector:
    """Detects unused exports and imports in a codebase using AST analysis."""
    
    def __init__(
        self,
        exports: Dict[str, List[str]],  # file -> exported symbols
        imports: Dict[str, Dict[str, str]],  # file -> {symbol: source_file}
        symbol_usages: Optional[Dict[str, Set[str]]] = None,  # file -> used symbols
    ):
        """
        Initialize detector.
        
        Args:
            exports: Map of files to their exported symbols
            imports: Map of files to their imports (symbol -> source)
            symbol_usages: Map of files to symbols used in that file
        """
        self.exports = exports
        self.imports = imports
        self.symbol_usages = symbol_usages or {}
        
    def find_unused_exports(self) -> Dict[str, List[str]]:
        """
        Find exported symbols that are never imported.
        
        Returns:
            Dict mapping files to their unused exported symbols
        """
        # Build set of all imported symbols per file
        imported_symbols = defaultdict(set)
        for file, file_imports in self.imports.items():
            for symbol, source in file_imports.items():
                imported_symbols[source].add(symbol)
        
        # Find unused exports
        unused = {}
        for file, exported in self.exports.items():
            unused_in_file = [
                symbol for symbol in exported
                if symbol not in imported_symbols.get(file, set())
                # Also check if it's a default export or namespace import
                and 'default' not in imported_symbols.get(file, set())
                and '*' not in imported_symbols.get(file, set())
            ]
            if unused_in_file:
                unused[file] = unused_in_file
        
        return unused
    
    def find_unused_imports(self) -> Dict[str, List[str]]:
        """
        Find imported symbols that are never used in the file.
        Uses symbol_usages to determine which imported symbols are actually referenced.
        
        Returns:
            Dict mapping files to potentially unused imports
        """
        unused = {}
        
        for file, file_imports in self.imports.items():
            used_in_file = self.symbol_usages.get(file, set())
            unused_in_file = []
            
            for symbol, source in file_imports.items():
                # Check if the imported symbol is used anywhere in the file
                if symbol not in used_in_file:
                    # Also check for namespace usage (import * as X)
                    # and common patterns like React.useState
                    symbol_used = False
                    for used_symbol in used_in_file:
                        if used_symbol.startswith(f"{symbol}.") or used_symbol == symbol:
                            symbol_used = True
                            break
                    
                    if not symbol_used:
                        unused_in_file.append({
                            'symbol': symbol,
                            'source': source
                        })
            
            if unused_in_file:
                unused[file] = unused_in_file
        
        return unused
    
    def get_analysis(self) -> Dict:
        """
        Get comprehensive dead code analysis.
        
        Returns:
            Analysis results with unused code information
        """
        unused_exports = self.find_unused_exports()
        unused_imports = self.find_unused_imports()
        
        total_unused_exports = sum(len(symbols) for symbols in unused_exports.values())
        total_exports = sum(len(symbols) for symbols in self.exports.values())
        total_unused_imports = sum(len(imports) for imports in unused_imports.values())
        total_imports = sum(len(imports) for imports in self.imports.values())
        
        return {
            'has_dead_code': total_unused_exports > 0 or total_unused_imports > 0,
            'unused_exports': unused_exports,
            'unused_imports': unused_imports,
            'statistics': {
                'total_exports': total_exports,
                'total_unused_exports': total_unused_exports,
                'unused_export_percentage': (
                    round(total_unused_exports / total_exports * 100, 1) 
                    if total_exports > 0 else 0
                ),
                'total_imports': total_imports,
                'total_unused_imports': total_unused_imports,
                'unused_import_percentage': (
                    round(total_unused_imports / total_imports * 100, 1)
                    if total_imports > 0 else 0
                ),
                'affected_files': len(unused_exports) + len(unused_imports)
            },
            'risk_score': self._calculate_risk_score(
                total_unused_exports + total_unused_imports,
                total_exports + total_imports
            )
        }
    
    def _calculate_risk_score(self, unused: int, total: int) -> int:
        """Calculate risk score based on dead code percentage."""
        if total == 0:
            return 0
        
        percentage = (unused / total) * 100
        
        if percentage > 50:
            return 80
        elif percentage > 30:
            return 60
        elif percentage > 10:
            return 40
        elif percentage > 0:
            return 20
        else:
            return 0


class ASTSymbolExtractor:
    """Extract exports, imports, and symbol usages from parsed AST files."""
    
    def __init__(self, parser=None):
        """
        Initialize the symbol extractor.
        
        Args:
            parser: Optional tree-sitter parser instance
        """
        self.parser = parser
        
    def extract_from_files(
        self, 
        repo_path: str, 
        files: List[Dict[str, Any]]
    ) -> Tuple[Dict[str, List[str]], Dict[str, Dict[str, str]], Dict[str, Set[str]]]:
        """
        Extract exports, imports, and symbol usages from a list of parsed files.
        
        Args:
            repo_path: Root path of the repository
            files: List of file info dicts with 'path' and 'language' keys
            
        Returns:
            Tuple of (exports, imports, symbol_usages) dicts
        """
        exports = {}
        imports = {}
        symbol_usages = {}
        
        for file_info in files:
            file_path = os.path.join(repo_path, file_info['path'])
            rel_path = file_info['path']
            language = file_info.get('language', 'javascript')
            
            try:
                if not os.path.exists(file_path):
                    continue
                    
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                file_exports, file_imports, file_usages = self._extract_from_content(
                    content, rel_path, language
                )
                
                if file_exports:
                    exports[rel_path] = file_exports
                if file_imports:
                    imports[rel_path] = file_imports
                if file_usages:
                    symbol_usages[rel_path] = file_usages
                    
            except Exception as e:
                logger.warning(f"Failed to extract symbols from {rel_path}: {e}")
                
        return exports, imports, symbol_usages
    
    def _extract_from_content(
        self, 
        content: str, 
        file_path: str, 
        language: str
    ) -> Tuple[List[str], Dict[str, str], Set[str]]:
        """
        Extract symbols from file content using regex patterns.
        
        This is a fast heuristic approach that works without needing
        the tree-sitter parser instance.
        """
        if language in ('javascript', 'typescript'):
            return self._extract_js_ts_symbols(content, file_path)
        elif language == 'python':
            return self._extract_python_symbols(content, file_path)
        else:
            return [], {}, set()
    
    def _extract_js_ts_symbols(
        self, 
        content: str, 
        file_path: str
    ) -> Tuple[List[str], Dict[str, str], Set[str]]:
        """Extract symbols from JavaScript/TypeScript content."""
        import re
        
        exports = []
        imports = {}
        usages = set()
        
        # Extract exports
        # export const/let/var/function/class Name
        export_patterns = [
            r'export\s+(?:const|let|var|function|class)\s+(\w+)',
            r'export\s+default\s+(?:function|class)?\s*(\w+)?',
            r'export\s+\{\s*([^}]+)\s*\}',
            r'module\.exports\s*=\s*(\w+)',
            r'module\.exports\.(\w+)\s*=',
        ]
        
        for pattern in export_patterns:
            for match in re.finditer(pattern, content):
                if match.group(1):
                    # Handle multiple exports in braces
                    if '{' in pattern:
                        symbols = match.group(1).split(',')
                        for sym in symbols:
                            sym = sym.strip().split(' as ')[0].strip()
                            if sym and sym not in exports:
                                exports.append(sym)
                    else:
                        sym = match.group(1).strip()
                        if sym and sym not in exports:
                            exports.append(sym)
        
        # Extract imports
        # import { a, b } from 'module'
        # import Name from 'module'
        # import * as Name from 'module'
        import_patterns = [
            (r'import\s+\{\s*([^}]+)\s*\}\s+from\s+[\'"]([^\'"]+)[\'"]', 'named'),
            (r'import\s+(\w+)\s+from\s+[\'"]([^\'"]+)[\'"]', 'default'),
            (r'import\s+\*\s+as\s+(\w+)\s+from\s+[\'"]([^\'"]+)[\'"]', 'namespace'),
            (r'const\s+\{\s*([^}]+)\s*\}\s*=\s*require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', 'named'),
            (r'const\s+(\w+)\s*=\s*require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', 'default'),
        ]
        
        for pattern, import_type in import_patterns:
            for match in re.finditer(pattern, content):
                source = match.group(2)
                if import_type == 'named':
                    symbols = match.group(1).split(',')
                    for sym in symbols:
                        # Handle 'as' aliases
                        parts = sym.strip().split(' as ')
                        imported_name = parts[-1].strip() if len(parts) > 1 else parts[0].strip()
                        if imported_name:
                            imports[imported_name] = source
                else:
                    sym = match.group(1).strip()
                    if sym:
                        imports[sym] = source
        
        # Extract identifier usages (simplified - looks for all identifiers)
        # This finds all word characters that look like variable/function names
        identifier_pattern = r'\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b'
        for match in re.finditer(identifier_pattern, content):
            ident = match.group(1)
            # Filter out common keywords
            keywords = {'const', 'let', 'var', 'function', 'class', 'import', 'export', 
                       'from', 'if', 'else', 'for', 'while', 'return', 'true', 'false',
                       'null', 'undefined', 'this', 'new', 'async', 'await', 'try', 
                       'catch', 'throw', 'typeof', 'instanceof', 'default'}
            if ident not in keywords:
                usages.add(ident)
        
        return exports, imports, usages
    
    def _extract_python_symbols(
        self, 
        content: str, 
        file_path: str
    ) -> Tuple[List[str], Dict[str, str], Set[str]]:
        """Extract symbols from Python content."""
        import re
        
        exports = []
        imports = {}
        usages = set()
        
        # In Python, exports are typically defined in __all__ or are public symbols
        all_match = re.search(r'__all__\s*=\s*\[([^\]]+)\]', content)
        if all_match:
            symbols = all_match.group(1).split(',')
            for sym in symbols:
                sym = sym.strip().strip('"\'')
                if sym:
                    exports.append(sym)
        else:
            # Consider top-level functions and classes as exports
            for match in re.finditer(r'^(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)', content, re.MULTILINE):
                name = match.group(1)
                if not name.startswith('_'):  # Skip private
                    exports.append(name)
        
        # Extract imports
        # from module import a, b
        # import module
        import_patterns = [
            (r'from\s+(\S+)\s+import\s+([^#\n]+)', 'from'),
            (r'^import\s+(\S+)(?:\s+as\s+(\w+))?', 'import'),
        ]
        
        for pattern, import_type in import_patterns:
            for match in re.finditer(pattern, content, re.MULTILINE):
                if import_type == 'from':
                    module = match.group(1)
                    symbols_str = match.group(2)
                    # Handle multiple symbols
                    symbols = symbols_str.split(',')
                    for sym in symbols:
                        parts = sym.strip().split(' as ')
                        imported_name = parts[-1].strip() if len(parts) > 1 else parts[0].strip()
                        if imported_name and imported_name != '*':
                            imports[imported_name] = module
                else:
                    module = match.group(1).split('.')[0]  # Get base module
                    alias = match.group(2) if match.group(2) else module
                    imports[alias] = module
        
        # Extract identifier usages
        identifier_pattern = r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b'
        for match in re.finditer(identifier_pattern, content):
            ident = match.group(1)
            keywords = {'def', 'class', 'import', 'from', 'if', 'else', 'elif', 'for', 
                       'while', 'return', 'True', 'False', 'None', 'and', 'or', 'not',
                       'in', 'is', 'as', 'with', 'try', 'except', 'finally', 'raise',
                       'pass', 'break', 'continue', 'lambda', 'yield', 'global', 'nonlocal'}
            if ident not in keywords:
                usages.add(ident)
        
        return exports, imports, usages


def analyze_dead_code(
    exports: Dict[str, List[str]],
    imports: Dict[str, Dict[str, str]],
    symbol_usages: Optional[Dict[str, Set[str]]] = None
) -> Dict:
    """
    Analyze codebase for dead code (unused exports/imports).
    
    Args:
        exports: Map of files to exported symbols
        imports: Map of files to imported symbols with sources
        symbol_usages: Optional map of files to used symbols
        
    Returns:
        Analysis results with dead code information
    """
    try:
        detector = DeadCodeDetector(exports, imports, symbol_usages)
        return detector.get_analysis()
    except Exception as e:
        logger.error(f"Error detecting dead code: {e}")
        return {
            'has_dead_code': False,
            'unused_exports': {},
            'unused_imports': {},
            'error': str(e)
        }


def analyze_dead_code_from_files(repo_path: str, files: List[Dict[str, Any]]) -> Dict:
    """
    Analyze dead code directly from file list.
    
    Args:
        repo_path: Root path of the repository
        files: List of file info dicts from AST parser
        
    Returns:
        Dead code analysis results
    """
    try:
        extractor = ASTSymbolExtractor()
        exports, imports, usages = extractor.extract_from_files(repo_path, files)
        return analyze_dead_code(exports, imports, usages)
    except Exception as e:
        logger.error(f"Error analyzing dead code from files: {e}")
        return {
            'has_dead_code': False,
            'unused_exports': {},
            'unused_imports': {},
            'error': str(e)
        }
