import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class RiskScorer:
    """Calculate risk and maintainability scores for repositories"""
    
    # Risk scoring rules
    RULES = {
        'high_complexity': {
            'threshold': 50,  # Average functions per file
            'weight': 0.3,
            'description': 'High average complexity per file'
        },
        'low_test_coverage': {
            'threshold': 20,  # Percentage of test files
            'weight': 0.25,
            'description': 'Low test coverage'
        },
        'many_dependencies': {
            'threshold': 50,  # Number of dependencies
            'weight': 0.2,
            'description': 'Large number of dependencies'
        },
        'large_files': {
            'threshold': 500,  # Lines per file
            'weight': 0.15,
            'description': 'Very large files'
        },
        'no_documentation': {
            'threshold': 0,  # README quality
            'weight': 0.1,
            'description': 'Insufficient documentation'
        },
    }
    
    async def score(
        self,
        repo_path: str,
        ast_data: Dict[str, Any],
        dependencies: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate risk scores for the repository
        
        Returns:
            Dictionary with risk scores and detailed breakdown
        """
        logger.info('Calculating risk scores')
        
        scores = {
            'overall': 0,
            'complexity': 0,
            'maintainability': 0,
            'security': 0,
            'breakdown': {},
        }
        
        # Calculate individual risk factors
        file_count = len(ast_data.get('files', []))
        total_functions = ast_data.get('summary', {}).get('totalFunctions', 0)
        total_lines = sum(f.get('lines', 0) for f in ast_data.get('files', []))
        dep_count = dependencies.get('statistics', {}).get('total', 0)
        
        # Complexity risk
        avg_functions_per_file = total_functions / max(file_count, 1)
        complexity_risk = min(100, (avg_functions_per_file / self.RULES['high_complexity']['threshold']) * 100)
        scores['complexity'] = round(complexity_risk, 2)
        scores['breakdown']['high_complexity'] = {
            'score': scores['complexity'],
            'value': round(avg_functions_per_file, 2),
            'threshold': self.RULES['high_complexity']['threshold'],
            'description': self.RULES['high_complexity']['description'],
        }
        
        # Test coverage risk (simplified)
        test_files = len([f for f in ast_data.get('files', []) if 'test' in f.get('path', '').lower()])
        test_coverage = (test_files / max(file_count, 1)) * 100
        coverage_risk = 100 - test_coverage
        scores['breakdown']['low_test_coverage'] = {
            'score': round(coverage_risk, 2),
            'value': round(test_coverage, 2),
            'threshold': self.RULES['low_test_coverage']['threshold'],
            'description': self.RULES['low_test_coverage']['description'],
        }
        
        # Dependency risk
        dependency_risk = min(100, (dep_count / self.RULES['many_dependencies']['threshold']) * 100)
        scores['breakdown']['many_dependencies'] = {
            'score': round(dependency_risk, 2),
            'value': dep_count,
            'threshold': self.RULES['many_dependencies']['threshold'],
            'description': self.RULES['many_dependencies']['description'],
        }
        
        # File size risk
        avg_lines_per_file = total_lines / max(file_count, 1)
        file_size_risk = min(100, (avg_lines_per_file / self.RULES['large_files']['threshold']) * 100)
        scores['breakdown']['large_files'] = {
            'score': round(file_size_risk, 2),
            'value': round(avg_lines_per_file, 2),
            'threshold': self.RULES['large_files']['threshold'],
            'description': self.RULES['large_files']['description'],
        }
        
        # Calculate weighted overall score
        overall = 0
        overall += complexity_risk * self.RULES['high_complexity']['weight']
        overall += coverage_risk * self.RULES['low_test_coverage']['weight']
        overall += dependency_risk * self.RULES['many_dependencies']['weight']
        overall += file_size_risk * self.RULES['large_files']['weight']
        
        scores['overall'] = round(overall, 2)
        scores['maintainability'] = round(100 - overall, 2)
        scores['security'] = 75  # TODO: Implement security analysis
        
        # Risk level
        if scores['overall'] < 30:
            scores['level'] = 'low'
        elif scores['overall'] < 60:
            scores['level'] = 'medium'
        else:
            scores['level'] = 'high'
            
        return scores
