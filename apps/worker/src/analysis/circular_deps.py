"""
Circular Dependency Detector

Detects circular import/dependency chains in JavaScript/TypeScript and Python codebases.
"""

from typing import Dict, List, Set, Optional, Tuple
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class CircularDependencyDetector:
    """Detects circular dependencies in module dependency graphs."""
    
    def __init__(self, dependency_graph: Dict[str, List[str]]):
        """
        Initialize detector with dependency graph.
        
        Args:
            dependency_graph: Dict mapping file paths to their imported dependencies
        """
        self.graph = dependency_graph
        self.cycles: List[List[str]] = []
        
    def detect_cycles(self) -> List[List[str]]:
        """
        Find all circular dependency chains using DFS.
        
        Returns:
            List of cycles, where each cycle is a list of file paths
        """
        visited = set()
        rec_stack = set()
        path = []
        
        for node in self.graph:
            if node not in visited:
                self._dfs_detect(node, visited, rec_stack, path)
        
        return self.cycles
    
    def _dfs_detect(
        self, 
        node: str, 
        visited: Set[str], 
        rec_stack: Set[str], 
        path: List[str]
    ) -> bool:
        """
        DFS helper to detect cycles.
        
        Returns:
            True if cycle detected from this node
        """
        visited.add(node)
        rec_stack.add(node)
        path.append(node)
        
        for neighbor in self.graph.get(node, []):
            if neighbor not in visited:
                if self._dfs_detect(neighbor, visited, rec_stack, path):
                    return True
            elif neighbor in rec_stack:
                # Found a cycle - extract it from path
                cycle_start = path.index(neighbor)
                cycle = path[cycle_start:] + [neighbor]
                self.cycles.append(cycle)
                return True
        
        path.pop()
        rec_stack.remove(node)
        return False
    
    def get_analysis(self) -> Dict:
        """
        Get comprehensive circular dependency analysis.
        
        Returns:
            Dict with cycle information and severity
        """
        cycles = self.detect_cycles()
        
        return {
            'has_circular_dependencies': len(cycles) > 0,
            'total_cycles': len(cycles),
            'cycles': [
                {
                    'chain': cycle,
                    'length': len(cycle) - 1,  # Exclude duplicate start/end node
                    'severity': self._calculate_severity(cycle)
                }
                for cycle in cycles
            ],
            'affected_files': list(set([file for cycle in cycles for file in cycle])),
            'risk_score': self._calculate_risk_score(cycles)
        }
    
    def _calculate_severity(self, cycle: List[str]) -> str:
        """Calculate severity based on cycle length."""
        length = len(cycle) - 1
        if length == 2:
            return 'high'  # Direct circular dependency
        elif length <= 4:
            return 'medium'
        else:
            return 'low'  # Long chains are easier to break
    
    def _calculate_risk_score(self, cycles: List[List[str]]) -> int:
        """
        Calculate overall risk score (0-100).
        
        Direct cycles (A -> B -> A) are worse than long chains.
        """
        if not cycles:
            return 0
        
        total_score = 0
        for cycle in cycles:
            length = len(cycle) - 1
            if length == 2:
                total_score += 50  # Direct circular dependency
            elif length <= 4:
                total_score += 30
            else:
                total_score += 10
        
        return min(100, total_score)


def analyze_circular_dependencies(dependency_data: Dict) -> Dict:
    """
    Analyze codebase for circular dependencies.
    
    Args:
        dependency_data: Either a dependency graph dict or full dependency analysis data
        
    Returns:
        Analysis results with detected cycles
    """
    try:
        # Check if it's the new format with nodes/edges
        if isinstance(dependency_data, dict):
            graph = dependency_data.get('graph', dependency_data)
            
            # If graph has nodes/edges structure, we need file-level imports
            if isinstance(graph, dict) and 'nodes' in graph:
                logger.info("Dependency graph format not yet supported for circular dependency detection")
                return {
                    'has_circular_dependencies': False,
                    'total_cycles': 0,
                    'cycles': [],
                    'note': 'File-level dependency tracking not yet implemented'
                }
        
        # It's a direct file -> [files] mapping
        detector = CircularDependencyDetector(dependency_data)
        return detector.get_analysis()
    except Exception as e:
        logger.error(f"Error detecting circular dependencies: {e}")
        import traceback
        traceback.print_exc()
        return {
            'has_circular_dependencies': False,
            'total_cycles': 0,
            'cycles': [],
            'error': str(e)
        }
