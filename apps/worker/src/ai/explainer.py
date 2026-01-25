import os
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

class AIExplainer:
    """
    Generate industrial-grade architectural manuals using a Multi-Stage Synthesis Pipeline.
    Stage 1: Structural Mapping (Tables & Logic Flows)
    Stage 2: Strategic Narrative (Roadmaps & Evolution)
    """
    
    def __init__(self):
        gemini_key = os.getenv('GEMINI_API_KEY')
        openrouter_key = os.getenv('OPENROUTER_API_KEY')
        
        if gemini_key:
            self.provider = 'gemini'
            self.client = genai.Client(api_key=gemini_key)
            # Use Gemini 2.5 series if available, otherwise 2.0
            self.model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash') 
            self.fallback_model = 'gemini-2.5-flash-lite'
            self.enabled = True
            logger.info(f'ArchiveCore Active: Using Gemini Native with {self.model_name}')
        elif openrouter_key:
            self.provider = 'openrouter'
            self.api_key = openrouter_key
            # OpenRouter standard model names for Gemini 2.5
            self.model_name = os.getenv('OPENROUTER_MODEL', 'google/gemini-2.5-flash')
            self.fallback_model = 'google/gemini-2.5-flash-lite'
            self.enabled = True
            logger.info(f'ArchiveCore Active: Using OpenRouter with {self.model_name}')
        else:
            logger.warning('No AI API key found, Multi-stage synthesis disabled')
            self.provider = None
            self.enabled = False

    async def explain(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrates the synthesis pipeline"""
        if not self.enabled:
            return self._generate_fallback_wiki(analysis_data)
        
        try:
            logger.info('Commencing Multi-Stage Synthesis')
            
            if self.provider == 'gemini':
                return await self._explain_with_gemini(analysis_data)
            elif self.provider == 'openrouter':
                return await self._explain_with_openrouter(analysis_data)
            else:
                return self._generate_fallback_wiki(analysis_data)
                
        except Exception as e:
            logger.error(f'Synthesis failed: {str(e)}')
            return self._generate_fallback_wiki(analysis_data)
    
    async def _explain_with_gemini(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Wiki using the new Google GenAI SDK with structured JSON output and 429 recovery"""
        
        prompt = self._build_archive_prompt(analysis_data)
        system_instruction = self._get_system_instruction()

        try:
            # Using the primary workhorse model
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                )
            )
            
            wiki_content = json.loads(response.text)
            
            return {
                **wiki_content,
                'provider': 'repolens-hybrid',
                'model': self.model_name,
                'confidence': 'high'
            }

        except Exception as e:
            err_msg = str(e).lower()
            # If we hit a rate limit (429), try the more efficient Lite model immediately
            if "429" in err_msg or "quota" in err_msg:
                logger.warning(f"AI_CORE: Primary model {self.model_name} rate limited. Falling back to {self.fallback_model}")
                try:
                    response = self.client.models.generate_content(
                        model=self.fallback_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            response_mime_type="application/json",
                        )
                    )
                    wiki_content = json.loads(response.text)
                    return {
                        **wiki_content,
                        'provider': 'repolens-hybrid-fallback',
                        'model': self.fallback_model,
                        'confidence': 'medium'
                    }
                except Exception:
                    return self._generate_quota_standby_wiki(analysis_data)
            
            logger.error(f"Gemini generation error: {e}")
            raise e

    async def _explain_with_openrouter(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Wiki using OpenRouter API with 429 recovery"""
        import aiohttp
        
        prompt = self._build_archive_prompt(analysis_data)
        system_instruction = self._get_system_instruction()
        
        async def call_openrouter(model):
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {self.api_key}',
                        'Content-Type': 'application/json',
                        'X-Title': 'RepoLens'
                    },
                    json={
                        'model': model,
                        'messages': [
                            {'role': 'system', 'content': system_instruction},
                            {'role': 'user', 'content': prompt}
                        ],
                        'response_format': { 'type': 'json_object' }
                    }
                ) as response:
                    if response.status == 429:
                        return None, "rate_limit"
                    if response.status != 200:
                        err_text = await response.text()
                        raise Exception(f'OpenRouter error {response.status}: {err_text}')
                    
                    result = await response.json()
                    return json.loads(result['choices'][0]['message']['content']), None

        try:
            content, error = await call_openrouter(self.model_name)
            if error == "rate_limit":
                logger.warning(f"OpenRouter: Primary model {self.model_name} rate limited. Trying {self.fallback_model}")
                content, error = await call_openrouter(self.fallback_model)
                if error:
                    return self._generate_quota_standby_wiki(analysis_data)
                return {**content, 'provider': 'openrouter-fallback', 'model': self.fallback_model}
            
            return {**content, 'provider': 'openrouter', 'model': self.model_name}
        except Exception as e:
            logger.error(f"OpenRouter processing failed: {e}")
            raise e

    def _get_system_instruction(self) -> str:
        return """You are a Principal Systems Architect. 
Your mission is to transform raw diagnostic metadata into a high-density "Architectural Operating System" manual.
STYLE PROTOCOL:
- Use Markdown tables for all technical specifications.
- Use Mermaid.js (graph TD) for all logic flows.
- Tone: Authoritative, precise, industrial.
- Zero fluff. Maximum technical density."""

    def _build_archive_prompt(self, data: Dict[str, Any]) -> str:
        """Builds the high-density diagnostic context with safe data extraction"""
        
        # Helper for safe slicing
        def safe_slice(obj, limit):
            if isinstance(obj, (list, str)):
                return obj[:limit]
            return obj

        # Extract truth with defensive defaults
        circular_data = data.get('circular_dependencies', {})
        if not isinstance(circular_data, dict): circular_data = {}
        circular_list = circular_data.get('cycles', [])
        
        dead_data = data.get('dead_code', {})
        if not isinstance(dead_data, dict): dead_data = {}
        
        call_data = data.get('call_graph', {})
        if not isinstance(call_data, dict): call_data = {}
        
        comp_data = data.get('complexity', {})
        if not isinstance(comp_data, dict): comp_data = {}
        
        sys_data = data.get('system', {})
        if not isinstance(sys_data, dict): sys_data = {}
        
        # Context Mapping
        context = {
            "tech_protocol": {
                "primary": data.get('languages', {}).get('primary'),
                "stack": data.get('languages', {}).get('frameworks', []),
                "patterns": data.get('ast_summary', {}).get('patterns', {})
            },
            "diagnostic_truth": {
                "hotspots": [f["path"] for f in safe_slice(comp_data.get('fileSummaries', []), 8)],
                "circular_paths": safe_slice(circular_list, 10),
                "unused_ratio": dead_data.get('statistics', {}).get('unusedRatio', 0),
                "call_flow_edges": safe_slice(list(call_data.get('edges', [])), 20)
            },
            "operational_os": {
                "scripts": sys_data.get('scripts', {}),
                "infra_tools": sys_data.get('infrastructure', []),
                "ci_workflows": [w['name'] for w in sys_data.get('ci_workflows', []) if isinstance(w, dict) and 'name' in w]
            }
        }

        return f"""GENERATE ARCHITECTURAL ARCHIVE.
DIAGNOSTIC CONTEXT:
{json.dumps(context, indent=2)}

OUTPUT SCHEMA:
{{
  "summary": "authoritative system purpose",
  "chapters": [
    {{
      "title": "DOMAIN_MAP // RESPONSIBILITY_MATRIX",
      "content": "Mandatory Markdown Table mapping domains to core responsibilities."
    }},
    {{
      "title": "LOGIC_FLOW // COMPONENT_INTERACTION",
      "content": "Mandatory Mermaid Diagram (graph TD) showing call_flow_edges. Analyze the communication protocol."
    }},
    {{
      "title": "TECHNICAL_DEBT // RISK_VECTORS",
      "content": "Analyze circular_paths and hotspots. Use a table to list hotspots with their complexity."
    }},
    {{
      "title": "OPERATIONAL_RUNTIME // CI_CD_SPECS",
      "content": "Detail the build/deployment lifecycle based on scripts and ci_workflows."
    }},
    {{
      "title": "EVOLUTION_PATH // SELF_HEALING_ROADMAP",
      "content": "3-step strategy to eliminate dead code and decompose hotspots."
    }}
  ]
}}"""

    def _generate_fallback_wiki(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'summary': "System analysis in fallback mode.",
            'chapters': [{"title": "Overview", "content": "Analysis completed with local metadata only."}]
        }

    def _generate_quota_standby_wiki(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'summary': "AI Synthesis Standby.",
            'chapters': [{"title": "Resource Limit", "content": "AI synthesis paused due to quota limits. Local diagnostic data preserved."}]
        }