import os
import logging
from typing import Dict, Any
import google.generativeai as genai

logger = logging.getLogger(__name__)

class AIExplainer:
    """Generate AI-powered explanations using various AI providers"""
    
    def __init__(self):
        # Check for OpenRouter API key first (recommended)
        openrouter_key = os.getenv('OPENROUTER_API_KEY')
        gemini_key = os.getenv('GEMINI_API_KEY')
        
        if openrouter_key:
            self.provider = 'openrouter'
            self.api_key = openrouter_key
            self.model = os.getenv('OPENROUTER_MODEL', 'mistralai/devstral-2512:free')
            self.enabled = True
            logger.info(f'Using OpenRouter with model: {self.model}')
        elif gemini_key:
            genai.configure(api_key=gemini_key)
            self.provider = 'gemini'
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            self.enabled = True
            logger.info('Using Gemini AI')
        else:
            logger.warning('No AI API key found, AI explanations disabled')
            self.provider = None
            self.enabled = False
            
    async def explain(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate natural language explanations for analysis results
        
        Args:
            analysis_data: Deterministic analysis results
            
        Returns:
            AI-generated explanations and insights
        """
        if not self.enabled:
            return self._generate_fallback_explanations(analysis_data)
        
        try:
            logger.info('Generating AI explanations')
            
            if self.provider == 'openrouter':
                return await self._explain_with_openrouter(analysis_data)
            elif self.provider == 'gemini':
                return await self._explain_with_gemini(analysis_data)
            else:
                return self._generate_fallback_explanations(analysis_data)
                
        except Exception as e:
            logger.error(f'AI explanation failed: {str(e)}')
            return self._generate_fallback_explanations(analysis_data)
    
    async def _explain_with_openrouter(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate explanations using OpenRouter API"""
        import aiohttp
        
        prompt = self._build_prompt(analysis_data)
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': self.model,
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a code analysis expert. Provide concise, actionable insights about repository quality, risks, and improvements.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 500,
                    'temperature': 0.7,
                }
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f'{response.status} {error_text}')
                
                result = await response.json()
                content = result['choices'][0]['message']['content']
                
                return {
                    'summary': content,
                    'provider': 'openrouter',
                    'model': self.model,
                    'confidence': 'high'
                }
    
    async def _explain_with_gemini(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate explanations using Gemini API"""
        prompt = self._build_prompt(analysis_data)
        response = self.model.generate_content(prompt)
        
        return {
            'summary': response.text,
            'provider': 'gemini',
            'confidence': 'high'
        }
            
    def _build_prompt(self, data: Dict[str, Any]) -> str:
        """Build prompt for AI model"""
        languages = data.get('languages', {})
        frameworks = languages.get('frameworks', [])
        primary_lang = languages.get('primary', 'unknown')
        risk_scores = data.get('risk_scores', {})
        dependencies = data.get('dependencies', {})
        readme_analysis = data.get('readme_analysis', {})
        
        prompt = f"""You are a code analysis expert. Based on the following DETERMINISTIC analysis data, provide a concise, structured explanation of this repository.

ANALYSIS DATA:
- Primary Language: {primary_lang}
- Frameworks: {', '.join(frameworks) if frameworks else 'None detected'}
- Total Files: {data.get('ast_summary', {}).get('totalFunctions', 0)}
- Dependencies: {dependencies.get('statistics', {}).get('total', 0)} packages
- Risk Score: {risk_scores.get('overall', 0)}/100 ({risk_scores.get('level', 'unknown')} risk)
- Maintainability: {risk_scores.get('maintainability', 0)}/100
- README Quality: {readme_analysis.get('grade', 'N/A')} ({readme_analysis.get('quality_score', 0)}/100)

IMPORTANT: 
- Only explain what the data shows
- Do not speculate or hallucinate
- Be concise (3-4 sentences)
- Focus on actionable insights

Provide a summary in this format:
1. What this repository likely is
2. Key technical characteristics
3. Main quality/risk concerns (if any)
4. Top recommendation for improvement
"""
        
        return prompt
        
    def _generate_fallback_explanations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate basic explanations without AI"""
        languages = data.get('languages', {})
        primary = languages.get('primary', 'unknown')
        risk = data.get('risk_scores', {}).get('level', 'medium')
        
        summary = f"This is a {primary} project. Risk level: {risk}."
        
        return {
            'summary': summary,
            'provider': 'fallback',
            'confidence': 'low'
        }
