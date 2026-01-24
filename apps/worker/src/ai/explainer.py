import os
import json
import logging
from typing import Dict, Any, List
import google.generativeai as genai

logger = logging.getLogger(__name__)

class AIExplainer:
    """Generate AI-powered Wiki documentation using various AI providers"""
    
    def __init__(self):
        gemini_key = os.getenv('GEMINI_API_KEY')
        openrouter_key = os.getenv('OPENROUTER_API_KEY')
        
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.provider = 'gemini'
            # Using 1.5 Flash for speed and excellent structured output
            self.model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction="""You are an expert software architect and technical writer. 
                Your task is to transform raw static analysis data into a high-quality technical Wiki.
                Focus on clarity, architectural patterns, and actionable insights.
                Always return valid JSON following the requested schema."""
            )
            self.enabled = True
            logger.info('Using Gemini AI for Wiki generation')
        elif openrouter_key:
            self.provider = 'openrouter'
            self.api_key = openrouter_key
            self.model_name = os.getenv('OPENROUTER_MODEL', 'mistralai/devstral-2512:free')
            self.enabled = True
            logger.info(f'Using OpenRouter with model: {self.model_name}')
        else:
            logger.warning('No AI API key found, Wiki generation disabled')
            self.provider = None
            self.enabled = False
            
    async def explain(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate structured Wiki chapters for analysis results
        """
        if not self.enabled:
            return self._generate_fallback_wiki(analysis_data)
        
        try:
            logger.info('Generating AI Wiki Chapters')
            
            if self.provider == 'gemini':
                return await self._explain_with_gemini(analysis_data)
            elif self.provider == 'openrouter':
                return await self._explain_with_openrouter(analysis_data)
            else:
                return self._generate_fallback_wiki(analysis_data)
                
        except Exception as e:
            logger.error(f'Wiki generation failed: {str(e)}')
            return self._generate_fallback_wiki(analysis_data)
    
    async def _explain_with_gemini(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Wiki using Gemini API with structured JSON output"""
        prompt = self._build_wiki_prompt(analysis_data)
        
        response = self.model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        try:
            wiki_content = json.loads(response.text)
            return {
                **wiki_content,
                'provider': 'gemini',
                'model': 'gemini-1.5-flash',
                'confidence': 'high'
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse Gemini JSON response")
            return self._generate_fallback_wiki(analysis_data)

    async def _explain_with_openrouter(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Wiki using OpenRouter API"""
        import aiohttp
        
        prompt = self._build_wiki_prompt(analysis_data)
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': self.model_name,
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a technical documentation expert. Return only valid JSON.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'response_format': { 'type': 'json_object' }
                }
            ) as response:
                if response.status != 200:
                    raise Exception(f'OpenRouter error: {response.status}')
                
                result = await response.json()
                content = result['choices'][0]['message']['content']
                wiki_content = json.loads(content)
                
                return {
                    **wiki_content,
                    'provider': 'openrouter',
                    'model': self.model_name,
                    'confidence': 'high'
                }
            
    def _build_wiki_prompt(self, data: Dict[str, Any]) -> str:
        """Build a sophisticated prompt for Wiki generation"""
        languages = data.get('languages', {})
        risk = data.get('risk_scores', {})
        deps = data.get('dependencies', {})
        readme = data.get('readme_analysis', {})
        complexity = data.get('complexity', {})
        dead_code = data.get('dead_code', {})
        
        # Prepare context for the AI
        context = {
            "tech_stack": {
                "primary": languages.get('primary'),
                "frameworks": languages.get('frameworks', []),
                "dependency_count": deps.get('statistics', {}).get('total', 0)
            },
            "health_metrics": {
                "risk_score": risk.get('overall'),
                "maintainability": risk.get('maintainability'),
                "has_dead_code": dead_code.get('has_dead_code', False),
                "circular_deps_count": len(data.get('circular_dependencies', {}).get('cycles', []))
            },
            "complexity": {
                "avg_complexity": complexity.get('statistics', {}).get('averageComplexity'),
                "hotspots": [f["path"] for f in complexity.get('fileSummaries', [])[:3]]
            }
        }

        prompt = f"""Generate a comprehensive Technical Wiki for this repository based on the analysis context below.

CONTEXT:
{json.dumps(context, indent=2)}

OUTPUT SCHEMA:
{{
  "summary": "One sentence "elevator pitch" of the project",
  "chapters": [
    {{
      "title": "System Overview",
      "content": "Markdown detailing the project's purpose and core capabilities."
    }},
    {{
      "title": "Architecture & Components",
      "content": "Markdown describing how the code is organized, major patterns (MVC, Hexagonal, etc.), and key building blocks."
    }},
    {{
      "title": "Data Flow & Integrations",
      "content": "Markdown explaining how data moves through the system and how it interacts with external dependencies."
    }},
    {{
      "title": "Development Health & Maintenance",
      "content": "Markdown assessing code quality, technical debt (dead code, complexity), and suggestions for improvement."
    }}
  ]
}}

INSTRUCTIONS:
- Use professional Markdown for chapter content (headings, lists, code blocks).
- Be descriptive and analytical.
- Infer purpose from the tech stack and file structure context.
- DO NOT mention the analysis data points directly (e.g., don't say "The risk score is 20"), instead describe the health of the project qualitatively based on those scores.
"""
        return prompt
        
    def _generate_fallback_wiki(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate basic Wiki structure when AI fails"""
        primary = data.get('languages', {}).get('primary', 'unknown')
        
        return {
            'summary': f"A {primary} project analysis.",
            'chapters': [
                {
                    "title": "System Overview",
                    "content": f"This repository primarily uses {primary}."
                }
            ],
            'provider': 'fallback',
            'confidence': 'low'
        }
