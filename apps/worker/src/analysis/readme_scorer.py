"""
README Quality Scorer

Analyzes README.md files for completeness, clarity, and best practices.
Provides actionable improvement suggestions.
"""

import re
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ReadmeScorer:
    """Analyzes README quality and provides improvement suggestions."""
    
    # Essential sections that should be present
    ESSENTIAL_SECTIONS = {
        'title': {'pattern': r'^#\s+.+', 'weight': 10},
        'description': {'pattern': r'(?i)(description|about|overview)', 'weight': 15},
        'installation': {'pattern': r'(?i)(install|getting started|setup)', 'weight': 20},
        'usage': {'pattern': r'(?i)(usage|example|quick start)', 'weight': 20},
        'contributing': {'pattern': r'(?i)(contribut)', 'weight': 10},
        'license': {'pattern': r'(?i)(license)', 'weight': 10},
    }
    
    # Nice-to-have sections
    OPTIONAL_SECTIONS = {
        'badges': {'pattern': r'!\[.*\]\(.*\)', 'weight': 5},
        'table_of_contents': {'pattern': r'(?i)(table of contents|toc)', 'weight': 5},
        'api': {'pattern': r'(?i)(api|documentation)', 'weight': 5},
        'tests': {'pattern': r'(?i)(test|testing)', 'weight': 5},
        'changelog': {'pattern': r'(?i)(changelog|releases)', 'weight': 3},
        'faq': {'pattern': r'(?i)(faq|questions)', 'weight': 3},
    }
    
    def __init__(self, readme_content: str):
        """Initialize with README content."""
        self.content = readme_content
        self.lines = readme_content.split('\n')
        
    def check_section(self, pattern: str) -> bool:
        """Check if a section pattern exists in README."""
        return bool(re.search(pattern, self.content, re.MULTILINE))
    
    def check_code_examples(self) -> int:
        """Count number of code blocks."""
        return len(re.findall(r'```[\s\S]*?```', self.content))
    
    def check_links(self) -> Dict:
        """Analyze links in README."""
        markdown_links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', self.content)
        
        return {
            'total_links': len(markdown_links),
            'has_links': len(markdown_links) > 0,
            'external_links': sum(1 for _, url in markdown_links if url.startswith('http'))
        }
    
    def calculate_score(self) -> Dict:
        """
        Calculate overall README quality score.
        
        Returns:
            Dict with score and breakdown
        """
        score = 0
        max_score = 0
        breakdown = {}
        
        # Check essential sections
        for section, config in self.ESSENTIAL_SECTIONS.items():
            max_score += config['weight']
            has_section = self.check_section(config['pattern'])
            if has_section:
                score += config['weight']
            breakdown[section] = {
                'present': has_section,
                'weight': config['weight'],
                'type': 'essential'
            }
        
        # Check optional sections
        for section, config in self.OPTIONAL_SECTIONS.items():
            max_score += config['weight']
            has_section = self.check_section(config['pattern'])
            if has_section:
                score += config['weight']
            breakdown[section] = {
                'present': has_section,
                'weight': config['weight'],
                'type': 'optional'
            }
        
        # Bonus points
        code_examples = self.check_code_examples()
        if code_examples > 0:
            bonus = min(10, code_examples * 2)
            score += bonus
            max_score += 10
            breakdown['code_examples'] = {
                'count': code_examples,
                'bonus': bonus
            }
        
        links = self.check_links()
        if links['has_links']:
            score += 5
        max_score += 5
        breakdown['links'] = links
        
        # Calculate percentage
        percentage = (score / max_score * 100) if max_score > 0 else 0
        
        return {
            'score': round(percentage, 1),
            'raw_score': score,
            'max_score': max_score,
            'breakdown': breakdown,
            'grade': self._get_grade(percentage)
        }
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade."""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def get_suggestions(self) -> List[Dict]:
        """
        Generate actionable improvement suggestions.
        
        Returns:
            List of suggestions with priority
        """
        suggestions = []
        score_result = self.calculate_score()
        breakdown = score_result['breakdown']
        
        # Check missing essential sections
        for section, data in breakdown.items():
            if data.get('type') == 'essential' and not data['present']:
                suggestions.append({
                    'priority': 'high',
                    'section': section,
                    'message': f'Add a {section.replace("_", " ").title()} section',
                    'impact': data['weight']
                })
        
        # Check missing optional sections
        for section, data in breakdown.items():
            if data.get('type') == 'optional' and not data['present']:
                suggestions.append({
                    'priority': 'medium',
                    'section': section,
                    'message': f'Consider adding a {section.replace("_", " ").title()} section',
                    'impact': data['weight']
                })
        
        # Additional checks
        if score_result['breakdown'].get('code_examples', {}).get('count', 0) == 0:
            suggestions.append({
                'priority': 'high',
                'section': 'code_examples',
                'message': 'Add code examples to demonstrate usage',
                'impact': 10
            })
        
        if not breakdown.get('links', {}).get('has_links', False):
            suggestions.append({
                'priority': 'medium',
                'section': 'links',
                'message': 'Add relevant links (docs, issues, etc.)',
                'impact': 5
            })
        
        # Sort by priority and impact
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        suggestions.sort(key=lambda x: (priority_order[x['priority']], -x['impact']))
        
        return suggestions
    
    def get_full_analysis(self) -> Dict:
        """Get complete README analysis."""
        score_result = self.calculate_score()
        suggestions = self.get_suggestions()
        
        return {
            'quality_score': score_result['score'],
            'grade': score_result['grade'],
            'score_breakdown': score_result,
            'suggestions': suggestions,
            'statistics': {
                'total_lines': len(self.lines),
                'total_characters': len(self.content),
                'code_blocks': self.check_code_examples(),
                'links': self.check_links()
            }
        }


def analyze_readme(readme_path: str) -> Dict:
    """
    Analyze README file quality.
    
    Args:
        readme_path: Path to README.md file
        
    Returns:
        Analysis results with score and suggestions
    """
    try:
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        scorer = ReadmeScorer(content)
        return scorer.get_full_analysis()
    
    except FileNotFoundError:
        return {
            'quality_score': 0,
            'grade': 'F',
            'error': 'README.md not found',
            'suggestions': [{
                'priority': 'critical',
                'section': 'readme',
                'message': 'Create a README.md file for your project',
                'impact': 100
            }]
        }
    except Exception as e:
        logger.error(f"Error analyzing README: {e}")
        return {
            'quality_score': 0,
            'error': str(e)
        }
