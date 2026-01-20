"""
Call Graph Generator

Builds call graphs for JavaScript/TypeScript codebases to understand
function call relationships and execution flow.
"""

from typing import Dict, List, Set, Optional, Tuple
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class CallGraphBuilder:
    """Builds and analyzes function call graphs."""
    
    def __init__(self):
        """Initialize call graph builder."""
        self.graph: Dict[str, Set[str]] = defaultdict(set)
        self.function_locations: Dict[str, str] = {}
        self.entry_points: Set[str] = set()
        
    def add_call(self, caller: str, callee: str, file_path: str = None):
        """
        Add a function call relationship.
        
        Args:
            caller: Function making the call
            callee: Function being called
            file_path: Optional file path for location tracking
        """
        self.graph[caller].add(callee)
        
        if file_path:
            if caller not in self.function_locations:
                self.function_locations[caller] = file_path
            if callee not in self.function_locations:
                self.function_locations[callee] = file_path
    
    def mark_entry_point(self, function: str):
        """Mark a function as an entry point (exported, main, etc.)."""
        self.entry_points.add(function)
    
    def find_unreachable_functions(self) -> Set[str]:
        """
        Find functions that are never called from entry points.
        
        Returns:
            Set of unreachable function names
        """
        reachable = set()
        
        def dfs(func: str):
            if func in reachable:
                return
            reachable.add(func)
            for called in self.graph.get(func, set()):
                dfs(called)
        
        # Start DFS from all entry points
        for entry in self.entry_points:
            dfs(entry)
        
        # Functions defined but not reachable
        all_functions = set(self.graph.keys()) | set(
            func for calls in self.graph.values() for func in calls
        )
        
        return all_functions - reachable
    
    def calculate_complexity_metrics(self) -> Dict[str, Dict]:
        """
        Calculate complexity metrics for each function.
        
        Returns:
            Dict mapping functions to their metrics
        """
        metrics = {}
        
        for func in self.graph.keys():
            metrics[func] = {
                'calls_made': len(self.graph[func]),
                'fan_out': len(self.graph[func]),
                'depth': self._calculate_depth(func),
                'location': self.function_locations.get(func)
            }
        
        return metrics
    
    def _calculate_depth(self, func: str, visited: Set[str] = None) -> int:
        """Calculate maximum call depth from this function."""
        if visited is None:
            visited = set()
        
        if func in visited:
            return 0
        
        visited.add(func)
        
        if not self.graph.get(func):
            return 0
        
        max_depth = 0
        for called in self.graph[func]:
            depth = self._calculate_depth(called, visited.copy())
            max_depth = max(max_depth, depth)
        
        return max_depth + 1
    
    def get_analysis(self) -> Dict:
        """
        Get comprehensive call graph analysis.
        
        Returns:
            Analysis results with call patterns and metrics
        """
        unreachable = self.find_unreachable_functions()
        metrics = self.calculate_complexity_metrics()
        
        # Find most complex functions
        sorted_funcs = sorted(
            metrics.items(),
            key=lambda x: (x[1]['fan_out'], x[1]['depth']),
            reverse=True
        )
        
        return {
            'total_functions': len(metrics),
            'entry_points': list(self.entry_points),
            'unreachable_functions': list(unreachable),
            'complexity_metrics': metrics,
            'most_complex': [
                {
                    'function': func,
                    **data
                }
                for func, data in sorted_funcs[:10]
            ],
            'statistics': {
                'average_fan_out': (
                    sum(m['fan_out'] for m in metrics.values()) / len(metrics)
                    if metrics else 0
                ),
                'max_depth': max((m['depth'] for m in metrics.values()), default=0),
                'unreachable_count': len(unreachable)
            }
        }


def build_call_graph(ast_data) -> Dict:
    """
    Build call graph from AST data.
    
    Args:
        ast_data: Parsed AST data (list or dict)
        
    Returns:
        Call graph analysis
    """
    try:
        builder = CallGraphBuilder()
        
        # Handle both list and dict formats
        files_data = {}
        if isinstance(ast_data, dict):
            files_data = ast_data
        elif isinstance(ast_data, list):
            # Convert list format to dict
            for item in ast_data:
                if isinstance(item, dict) and 'path' in item:
                    files_data[item['path']] = item
        
        # Process each file
        for file_path, file_ast in files_data.items():
            # file_ast could be a list or dict, handle both
            if isinstance(file_ast, list):
                # If it's a list, skip it for now
                continue
                
            # Extract function definitions and mark exports as entry points
            for func_def in file_ast.get('functions', []):
                func_name = func_def.get('name')
                if func_def.get('is_exported'):
                    builder.mark_entry_point(func_name)
                
                # Add calls made by this function
                for call in func_def.get('calls', []):
                    builder.add_call(func_name, call, file_path)
        
        return builder.get_analysis()
    
    except Exception as e:
        logger.error(f"Error building call graph: {e}")
        import traceback
        traceback.print_exc()
        return {
            'total_functions': 0,
            'error': str(e)
        }
