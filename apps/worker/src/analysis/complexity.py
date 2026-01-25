"""
Complexity Metrics Calculator

Calculates cyclomatic and cognitive complexity for code analysis.
"""

import re
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ComplexityResult:
    """Result for a single function/method."""
    name: str
    file_path: str
    line_number: int
    cyclomatic: int
    cognitive: int
    
    def to_dict(self) -> Dict:
        return {
            'name': self.name,
            'filePath': self.file_path,
            'lineNumber': self.line_number,
            'cyclomatic': self.cyclomatic,
            'cognitive': self.cognitive,
        }


class ComplexityCalculator:
    """Calculate code complexity metrics."""
    
    # Patterns that increase cyclomatic complexity
    CYCLOMATIC_PATTERNS = {
        'javascript': [
            r'\bif\b', r'\belse\s+if\b', r'\bfor\b', r'\bwhile\b', r'\bdo\b',
            r'\bcase\b', r'\bcatch\b', r'\b\?\b', r'\&\&', r'\|\|',
            r'\?\?',  # nullish coalescing
        ],
        'typescript': [
            r'\bif\b', r'\belse\s+if\b', r'\bfor\b', r'\bwhile\b', r'\bdo\b',
            r'\bcase\b', r'\bcatch\b', r'\b\?\b', r'\&\&', r'\|\|',
            r'\?\?',
        ],
        'python': [
            r'\bif\b', r'\belif\b', r'\bfor\b', r'\bwhile\b',
            r'\bexcept\b', r'\band\b', r'\bor\b',
            r'\bif\b.*\belse\b',  # ternary
        ],
    }
    
    # Patterns that increase cognitive complexity (with nesting multiplier)
    COGNITIVE_PATTERNS = {
        'javascript': [
            (r'\bif\b', 1), (r'\belse\s+if\b', 1), (r'\belse\b', 1),
            (r'\bfor\b', 1), (r'\bwhile\b', 1), (r'\bdo\b', 1),
            (r'\bswitch\b', 1), (r'\bcatch\b', 1), (r'\btry\b', 0),
            (r'\&\&', 1), (r'\|\|', 1),
            (r'=>\s*\{', 1),  # arrow function with block
        ],
        'typescript': [
            (r'\bif\b', 1), (r'\belse\s+if\b', 1), (r'\belse\b', 1),
            (r'\bfor\b', 1), (r'\bwhile\b', 1), (r'\bdo\b', 1),
            (r'\bswitch\b', 1), (r'\bcatch\b', 1), (r'\btry\b', 0),
            (r'\&\&', 1), (r'\|\|', 1),
            (r'=>\s*\{', 1),
        ],
        'python': [
            (r'\bif\b', 1), (r'\belif\b', 1), (r'\belse\b', 1),
            (r'\bfor\b', 1), (r'\bwhile\b', 1),
            (r'\btry\b', 0), (r'\bexcept\b', 1),
            (r'\band\b', 1), (r'\bor\b', 1),
            (r'\blambda\b', 1),
        ],
    }
    
    def __init__(self):
        pass
    
    def calculate_cyclomatic(self, code: str, language: str) -> int:
        """
        Calculate cyclomatic complexity.
        
        Cyclomatic complexity = E - N + 2P
        Simplified: 1 + number of decision points
        """
        patterns = self.CYCLOMATIC_PATTERNS.get(language, self.CYCLOMATIC_PATTERNS['javascript'])
        complexity = 1  # Base complexity
        
        for pattern in patterns:
            matches = re.findall(pattern, code)
            complexity += len(matches)
        
        return complexity
    
    def calculate_cognitive(self, code: str, language: str) -> int:
        """
        Calculate cognitive complexity.
        
        Cognitive complexity considers nesting depth and breaks from linear flow.
        """
        patterns = self.COGNITIVE_PATTERNS.get(language, self.COGNITIVE_PATTERNS['javascript'])
        complexity = 0
        
        # Track nesting level
        lines = code.split('\n')
        nesting_level = 0
        
        for line in lines:
            stripped = line.strip()
            
            # Update nesting based on braces/indentation
            open_braces = line.count('{') - line.count('}')
            if language == 'python':
                # Python uses indentation
                indent = len(line) - len(line.lstrip())
                nesting_level = indent // 4
            else:
                nesting_level = max(0, nesting_level + open_braces)
            
            # Check for complexity-increasing patterns
            for pattern, base_increment in patterns:
                if re.search(pattern, stripped):
                    # Add base increment plus nesting penalty
                    complexity += base_increment + (nesting_level if base_increment > 0 else 0)
        
        return complexity
    
    def analyze_file(self, content: str, file_path: str, language: str) -> List[ComplexityResult]:
        """Analyze a single file and return complexity for each function."""
        results = []
        
        if language in ('javascript', 'typescript'):
            results = self._analyze_js_ts_file(content, file_path, language)
        elif language == 'python':
            results = self._analyze_python_file(content, file_path, language)
        
        return results
    
    def _analyze_js_ts_file(self, content: str, file_path: str, language: str) -> List[ComplexityResult]:
        """Analyze JavaScript/TypeScript file."""
        results = []
        
        # Find functions: function name(), const name = () =>, async function name()
        patterns = [
            r'(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{',
            r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{',
            r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{',
            r'(\w+)\s*\([^)]*\)\s*\{',  # method in class
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, content):
                func_name = match.group(1)
                start_pos = match.start()
                line_number = content[:start_pos].count('\n') + 1
                
                # Extract function body (find matching braces)
                func_body = self._extract_block(content[match.end()-1:])
                if func_body:
                    cyclomatic = self.calculate_cyclomatic(func_body, language)
                    cognitive = self.calculate_cognitive(func_body, language)
                    
                    results.append(ComplexityResult(
                        name=func_name,
                        file_path=file_path,
                        line_number=line_number,
                        cyclomatic=cyclomatic,
                        cognitive=cognitive,
                    ))
        
        return results
    
    def _analyze_python_file(self, content: str, file_path: str, language: str) -> List[ComplexityResult]:
        """Analyze Python file."""
        results = []
        
        # Find functions: def name() and async def name()
        pattern = r'^(?:async\s+)?def\s+(\w+)\s*\([^)]*\)\s*(?:->\s*[^:]+)?:'
        
        lines = content.split('\n')
        i = 0
        while i < len(lines):
            match = re.match(pattern, lines[i].strip())
            if match:
                func_name = match.group(1)
                line_number = i + 1
                
                # Extract function body (based on indentation)
                func_body_lines = [lines[i]]
                base_indent = len(lines[i]) - len(lines[i].lstrip())
                i += 1
                
                while i < len(lines):
                    line = lines[i]
                    if line.strip() == '':
                        func_body_lines.append(line)
                        i += 1
                        continue
                    
                    current_indent = len(line) - len(line.lstrip())
                    if current_indent > base_indent:
                        func_body_lines.append(line)
                        i += 1
                    else:
                        break
                
                func_body = '\n'.join(func_body_lines)
                cyclomatic = self.calculate_cyclomatic(func_body, language)
                cognitive = self.calculate_cognitive(func_body, language)
                
                results.append(ComplexityResult(
                    name=func_name,
                    file_path=file_path,
                    line_number=line_number,
                    cyclomatic=cyclomatic,
                    cognitive=cognitive,
                ))
            else:
                i += 1
        
        return results
    
    def _extract_block(self, code: str) -> Optional[str]:
        """Extract a brace-delimited block from code."""
        if not code or code[0] != '{':
            return None
        
        depth = 0
        for i, char in enumerate(code):
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    return code[:i+1]
        
        return code  # Return what we have if unbalanced


def analyze_complexity(files: List[Dict[str, Any]], repo_path: str) -> Dict:
    """
    Analyze complexity for all files in a repository.
    
    Args:
        files: List of file info dicts with 'path' and 'language' keys
        repo_path: Root path of the repository
        
    Returns:
        Complexity analysis results
    """
    import os
    
    calculator = ComplexityCalculator()
    all_results = []
    file_summaries = []
    
    for file_info in files:
        file_path = os.path.join(repo_path, file_info['path'])
        language = file_info.get('language', 'javascript')
        
        if language not in ('javascript', 'typescript', 'python'):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            results = calculator.analyze_file(content, file_info['path'], language)
            all_results.extend(results)
            
            if results:
                avg_cyclomatic = sum(r.cyclomatic for r in results) / len(results)
                avg_cognitive = sum(r.cognitive for r in results) / len(results)
                max_cyclomatic = max(r.cyclomatic for r in results)
                max_cognitive = max(r.cognitive for r in results)
                
                file_summaries.append({
                    'path': file_info['path'],
                    'functionCount': len(results),
                    'avgCyclomatic': round(avg_cyclomatic, 1),
                    'avgCognitive': round(avg_cognitive, 1),
                    'maxCyclomatic': max_cyclomatic,
                    'maxCognitive': max_cognitive,
                })
        except Exception as e:
            logger.warning(f"Failed to analyze complexity for {file_info['path']}: {e}")
    
    # Find high complexity functions (thresholds: cyclomatic > 10, cognitive > 15)
    high_complexity = [
        r.to_dict() for r in all_results
        if r.cyclomatic > 10 or r.cognitive > 15
    ]
    
    # Calculate overall statistics
    total_functions = len(all_results)
    if total_functions > 0:
        avg_cyclomatic = sum(r.cyclomatic for r in all_results) / total_functions
        avg_cognitive = sum(r.cognitive for r in all_results) / total_functions
        max_cyclomatic = max(r.cyclomatic for r in all_results)
        max_cognitive = max(r.cognitive for r in all_results)
    else:
        avg_cyclomatic = avg_cognitive = max_cyclomatic = max_cognitive = 0
    
    # Create a map for frontend hotspots
    file_risks_map = {
        s['path']: min(100, s['maxCyclomatic'] * 5) # Scale to 0-100
        for s in file_summaries
    }
    
    return {
        'statistics': {
            'totalFunctions': total_functions,
            'avgCyclomatic': round(avg_cyclomatic, 1),
            'avgCognitive': round(avg_cognitive, 1),
            'maxCyclomatic': max_cyclomatic,
            'maxCognitive': max_cognitive,
            'highComplexityCount': len(high_complexity),
        },
        'highComplexityFunctions': high_complexity[:20],  # Top 20
        'fileSummaries': sorted(file_summaries, key=lambda x: -x['maxCyclomatic'])[:20],
        'fileRisks': file_risks_map,
        'riskScore': _calculate_complexity_risk(avg_cyclomatic, avg_cognitive, len(high_complexity), total_functions),
    }


def _calculate_complexity_risk(avg_cyclomatic: float, avg_cognitive: float, high_count: int, total: int) -> int:
    """Calculate risk score based on complexity metrics."""
    if total == 0:
        return 0
    
    score = 0
    
    # Average cyclomatic complexity scoring
    if avg_cyclomatic > 20:
        score += 40
    elif avg_cyclomatic > 10:
        score += 25
    elif avg_cyclomatic > 5:
        score += 10
    
    # Average cognitive complexity scoring
    if avg_cognitive > 30:
        score += 40
    elif avg_cognitive > 15:
        score += 25
    elif avg_cognitive > 8:
        score += 10
    
    # High complexity function ratio
    ratio = high_count / total if total > 0 else 0
    if ratio > 0.3:
        score += 20
    elif ratio > 0.1:
        score += 10
    
    return min(score, 100)
