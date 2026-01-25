import os
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class AIExplainer:
    """Generate AI-powered Wiki documentation using the modern Google GenAI SDK"""
    
    def __init__(self):
        gemini_key = os.getenv('GEMINI_API_KEY')
        openrouter_key = os.getenv('OPENROUTER_API_KEY')
        
        if gemini_key:
            self.provider = 'gemini'
            self.client = genai.Client(api_key=gemini_key)
            self.model_name = 'gemini-2.0-flash'
            self.enabled = True
            logger.info(f'Using Gemini AI with model: {self.model_name}')
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
        """Generate Wiki using the new Google GenAI SDK with structured JSON output"""
        
        prompt = self._build_wiki_prompt(analysis_data)
        system_instruction = """You are a Principal Systems Architect and Technical Lead. 
Your goal is to produce an industrial-grade "Architectural Operating System" manual for software repositories.
Your writing style is authoritative, precise, and high-density—mimicking the documentation of complex systems like Kubernetes or Linux.
Focus on internal mechanics, data flow protocols, and structural integrity.
Avoid generic "developer-friendly" fluff. Provide raw architectural insight."""

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                )
            )
            
            # Using .text property for the generated response
            wiki_content = json.loads(response.text)
            
            return {
                **wiki_content,
                'provider': 'gemini',
                'model': self.model_name,
                'confidence': 'high'
            }

        except Exception as e:
            err_msg = str(e).lower()
            if "429" in err_msg or "quota" in err_msg:
                logger.warning("AI_CORE: Quota exceeded. Informing user.")
                return self._generate_quota_standby_wiki(analysis_data)
            
            logger.error(f"Gemini generation error: {e}")
            raise e

    def _generate_quota_standby_wiki(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Explicitly notify user about quota exhaustion."""
        return {
            'summary': "The AI synthesis quota has been reached.",
            'chapters': [
                {
                    "title": "Protocol: Resource Limit",
                    "content": "Deep architectural analysis is currently unavailable because the system's AI quota (Free Tier) has been exhausted. Your repository has been mapped and technical metadata has been extracted, but natural language explanations are disabled until the quota resets. Please try again in 60 seconds or upgrade your AI API key."
                }
            ],
            'onboarding_flow': {
                'welcome_message': "System indexed. AI Quota Reached.",
                'guided_paths': [],
                'first_steps': []
            },
            'provider': 'limiter',
            'confidence': 'none'
        }

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
                            'content': 'You are a systems architecture expert. Return only valid JSON.'
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
        """Build an advanced prompt for high-fidelity architectural knowledge base generation."""
        languages = data.get('languages', {})
        complexity = data.get('complexity', {})
        system = data.get('system', {})
        deps = data.get('dependencies', {})
        
        # Deep Diagnostics
        circular_deps = data.get('circular_dependencies', [])
        dead_code = data.get('dead_code', {})
        call_graph = data.get('call_graph', {})
        
        context = {
            "tech_protocol": {
                "primary": languages.get('primary'),
                "stack": languages.get('frameworks', []),
                "patterns_detected": data.get('ast_summary', {}).get('patterns', {}),
                "dependency_stats": deps.get('statistics', {})
            },
            "structural_integrity": {
                "risk": data.get('risk_scores', {}).get('overall'),
                "circular_loops": circular_deps[:10],
                "dead_code_ratio": dead_code.get('statistics', {}).get('unusedRatio'),
                "complexity_metrics": complexity.get('statistics', {}),
                "hotspots": [f["path"] for f in complexity.get('fileSummaries', [])[:8]]
            },
            "logic_flow": {
                "entry_points": data.get('entry_points', []),
                "call_edges_snippet": list(call_graph.get('edges', []))[:20],
                "most_complex_functions": call_graph.get('most_complex', [])[:5]
            },
            "operational_os": {
                "build_logic": system.get('scripts', {}),
                "script_samples": {k: v[:600] for k, v in system.get('script_contents', {}).items()},
                "ci_pipelines": system.get('ci_workflows', []),
                "infrastructure": system.get('infrastructure', [])
            }
        }

        prompt = f"""ACT AS A PRINCIPAL ARCHITECT. Generate a "Master Architectural Archive" for this repository.
The documentation must be broken into functional domains with deep technical density.

CONTEXT:
{json.dumps(context, indent=2)}

OUTPUT SCHEMA:
{{
  "summary": "authoritative purpose of the system and its primary mental model",
  "onboarding_flow": {{
    "welcome_message": "Strategic summary of technical ambition.",
    "guided_paths": [{{ "title": "Protocol: Name", "description": "precise logic path", "chapter_index": 0 }}],
    "first_steps": [{{ "file": "path", "reason": "architectural importance" }}]
  }},
  "chapters": [
    {{
      "title": "SYSTEM_OVERVIEW // FUNCTIONAL_DOMAINS",
      "content": "Identify the key functional areas. USE A MARKDOWN TABLE here mapping 'Domain' to 'Responsibility' and 'Core Path'. Reference the detected tech stack."
    }},
    {{
      "title": "LOGIC_PROPAGATION // CALL_GRAPH_ANALYSIS",
      "content": "Analyze how information travels. USE A MERMAID GRAPH (graph TD) based on 'call_edges_snippet'. Explain the role of the most complex functions."
    }},
    {{
      "title": "STRUCTURAL_DEBT // RISK_DIAGNOSTICS",
      "content": "Deep dive into circular dependencies and hotspots. IF CIRCULAR DEPS EXIST, USE A MERMAID GRAPH to show the loop. Use a table to list hotspots with their complexity scores."
    }},
    {{
      "title": "OPERATIONAL_INFRASTRUCTURE // CI_CD_PROTOCOL",
      "content": "Analyze the build systems and scripts. Explain the 'Operational OS' of the repo. Detail exactly what the scripts in 'script_samples' are accomplishing."
    }},
    {{
      "title": "TECHNICAL_NORTH_STAR // OPTIMIZATION_STRATEGY",
      "content": "Provide a roadmap for refactoring. Target the dead code and complexity bottlenecks identified. Propose a pharsed architectural evolution."
    }}
  ],
  "module_map": [{{ "path": "string", "role": "Specific functional responsibility" }}]
}}

INSTRUCTIONS:
1. TONE: Authoritative, visionary, technical. No emojis.
2. VISUALS: Use ```mermaid code blocks for graphs.
3. DATA: Use Markdown tables for any lists of metadata or metrics.
4. DEPTH: Explain 'The Why' behind the folder structure and library choices.
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
