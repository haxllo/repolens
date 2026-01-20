import os
import logging
from typing import Dict, Any
from datetime import datetime
from ..intake.repo_cloner import RepoCloner
from ..detection.language_detector import LanguageDetector
from ..parsers.ast_parser import ASTParser
from .dependency_analyzer import DependencyAnalyzer
from .risk_scorer import RiskScorer
from .circular_deps import analyze_circular_dependencies
from .dead_code import analyze_dead_code_from_files
from .call_graph import build_call_graph
from .readme_scorer import analyze_readme
from .complexity import analyze_complexity
from ..ai.explainer import AIExplainer

logger = logging.getLogger(__name__)

class AnalysisOrchestrator:
    """Orchestrates the complete repository analysis pipeline"""
    
    def __init__(self):
        self.repo_cloner = RepoCloner()
        self.language_detector = LanguageDetector()
        self.ast_parser = ASTParser()
        self.dependency_analyzer = DependencyAnalyzer()
        self.risk_scorer = RiskScorer()
        self.ai_explainer = AIExplainer()
        
    async def analyze_repository(
        self, 
        repo_url: str, 
        branch: str = 'main',
        scan_id: str = None,
        github_token: str = None
    ) -> Dict[str, Any]:
        """
        Run complete analysis pipeline on a repository
        
        Args:
            repo_url: GitHub repository URL
            branch: Git branch to analyze
            scan_id: Unique scan identifier
            github_token: Optional GitHub token for private repos
            
        Returns:
            Complete analysis results
        """
        logger.info(f'Starting analysis for {repo_url}')
        start_time = datetime.utcnow()
        
        try:
            # Step 1: Clone repository
            logger.info('Step 1: Cloning repository')
            repo_path = await self.repo_cloner.clone_repo(
                repo_url, 
                branch, 
                scan_id, 
                github_token=github_token
            )
            
            # Step 2: Detect languages and frameworks
            logger.info('Step 2: Detecting languages and frameworks')
            languages = await self.language_detector.detect(repo_path)
            
            # Step 3: Parse AST for supported languages
            logger.info('Step 3: Parsing AST')
            ast_data = await self.ast_parser.parse_repository(repo_path, languages)
            
            # Step 4: Analyze dependencies
            logger.info('Step 4: Analyzing dependencies')
            dependencies = await self.dependency_analyzer.analyze(repo_path, languages)
            
            # Step 5: Calculate risk scores
            logger.info('Step 5: Calculating risk scores')
            risk_scores = await self.risk_scorer.score(repo_path, ast_data, dependencies)
            
            # Step 6: Phase 2 - Circular dependency detection
            logger.info('Step 6: Detecting circular dependencies')
            circular_deps = analyze_circular_dependencies(dependencies)
            
            # Step 7: Phase 2 - Dead code analysis
            logger.info('Step 7: Analyzing dead code')
            dead_code = analyze_dead_code_from_files(
                repo_path=repo_path,
                files=ast_data.get('files', [])
            )
            
            # Step 8: Phase 2 - Call graph generation
            logger.info('Step 8: Building call graph')
            call_graph = build_call_graph(ast_data)
            
            # Step 9: Phase 2 - README quality analysis
            logger.info('Step 9: Analyzing README quality')
            readme_path = os.path.join(repo_path, 'README.md')
            readme_analysis = analyze_readme(readme_path)
            
            # Step 10: Phase 2 - Complexity metrics
            logger.info('Step 10: Analyzing code complexity')
            complexity_metrics = analyze_complexity(
                files=ast_data.get('files', []),
                repo_path=repo_path
            )
            
            # Step 11: Generate AI explanations (enhanced with Phase 2 data)
            logger.info('Step 11: Generating AI explanations')
            explanations = await self.ai_explainer.explain({
                'languages': languages,
                'ast_summary': ast_data.get('summary'),
                'dependencies': dependencies,
                'risk_scores': risk_scores,
                'circular_dependencies': circular_deps,
                'dead_code': dead_code,
                'readme_analysis': readme_analysis,
                'complexity': complexity_metrics,
            })
            
            # Cleanup
            await self.repo_cloner.cleanup(repo_path)
            
            end_time = datetime.utcnow()
            processing_time = (end_time - start_time).total_seconds()
            
            return {
                'scanId': scan_id,
                'repoUrl': repo_url,
                'branch': branch,
                'languages': languages,
                'ast': ast_data,
                'dependencies': dependencies,
                'riskScores': risk_scores,
                'circularDependencies': circular_deps,
                'deadCode': dead_code,
                'callGraph': call_graph,
                'readmeAnalysis': readme_analysis,
                'complexityMetrics': complexity_metrics,
                'explanations': explanations,
                'analyzedAt': end_time.isoformat(),
                'processingTime': int(processing_time),
            }
            
        except Exception as e:
            logger.error(f'Analysis failed: {str(e)}')
            # Cleanup on error
            if 'repo_path' in locals():
                await self.repo_cloner.cleanup(repo_path)
            raise
