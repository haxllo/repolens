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
            # Using confirmed available 2.0 Flash model from logs
            self.model_name = 'gemini-2.0-flash'
            self._init_gemini()
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

    def _init_gemini(self):
        """Initialize or re-initialize the Gemini model"""
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction="""You are an expert software architect and technical writer. 
            Your task is to transform raw static analysis data into a high-quality technical Wiki.
            Focus on clarity, architectural patterns, and actionable insights.
            Always return valid JSON following the requested schema."""
        )
            
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
            if self.provider == 'gemini':
                try:
                    logger.info("Listing available Gemini models for debugging:")
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods:
                            logger.info(f"Available model: {m.name}")
                except:
                    pass
            return self._generate_fallback_wiki(analysis_data)
    
    async def _explain_with_gemini(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Wiki using Gemini API with structured JSON output and fallback"""
        
        # Phase 1: High-Level Architecture (The Standard Prompt)
        prompt = self._build_wiki_prompt(analysis_data)
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            wiki_content = json.loads(response.text)
            
            # Phase 2: Deep Dive (Map-Reduce Strategy)
            # If we have file structure data, try to generate richer chapter content
            if 'ast_files' in analysis_data:
                enriched_chapters = await self._enrich_chapters_with_clusters(wiki_content.get('chapters', []), analysis_data)
                if enriched_chapters:
                    wiki_content['chapters'] = enriched_chapters

        except Exception as e:
            if self.model_name != 'gemini-flash-latest':
                logger.warning(f"Primary model {self.model_name} failed, trying gemini-flash-latest fallback. Error: {str(e)}")
                self.model_name = 'gemini-flash-latest'
                self._init_gemini()
                return await self._explain_with_gemini(analysis_data)
            raise e
        
        return {
            **wiki_content,
            'provider': 'gemini',
            'model': self.model_name,
            'confidence': 'high'
        }

    async def _enrich_chapters_with_clusters(self, chapters: List[Dict], data: Dict[str, Any]) -> List[Dict]:
        """
        Enhance generic chapters with specific details by analyzing directory clusters.
        This mimics the 'React Wiki' depth by looking at specific folder roles.
        """
        files = data.get('ast_files', [])
        if not files:
            return chapters

        # 1. Cluster files by top-level directory
        clusters = {}
        for f in files:
            top_dir = f['path'].split('/')[0]
            if top_dir not in clusters:
                clusters[top_dir] = []
            clusters[top_dir].append(f['path'])
        
        # Filter significant clusters (ignore tiny ones)
        significant_clusters = {k: v for k, v in clusters.items() if len(v) > 2}
        
        # 2. Ask Gemini to analyze these specific clusters
        cluster_prompt = f"""
        Analyze these directory clusters and their file contents. 
        For each directory, infer its specific architectural responsibility.
        
        CLUSTERS:
        {json.dumps({k: v[:5] for k,v in significant_clusters.items()}, indent=2)}
        
        Task: Provide a 2-sentence technical summary for each directory.
        Output JSON: {{ "directory_summaries": {{ "path": "summary" }} }}
        """
        
        try:
            cluster_res = self.model.generate_content(
                cluster_prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            insights = json.loads(cluster_res.text).get('directory_summaries', {})
            
            # 3. Inject these insights into the chapters
            # We append a "Key Modules" section to the Architecture chapter
            for chapter in chapters:
                if "Architecture" in chapter['title'] or "Module" in chapter['title']:
                    insight_text = "\n\n### Component Breakdown\n"
                    for dir_name, summary in insights.items():
                        insight_text += f"- **{dir_name}/**: {summary}\n"
                    chapter['content'] += insight_text
                    
            return chapters
            
        except Exception as e:
            logger.warning(f"Cluster enrichment failed: {e}")
            return chapters

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
        """Build a sophisticated "CodeWiki" style prompt for deep repository understanding"""
        languages = data.get('languages', {})
        risk = data.get('risk_scores', {})
        deps = data.get('dependencies', {})
        complexity = data.get('complexity', {})
        ast_files = data.get('ast_files', [])
        system = data.get('system', {})
        
        # Build a simplified file tree for context (top 2 levels + entry points)
        file_tree = {}
        for f in ast_files:
            parts = f['path'].split('/')
            curr = file_tree
            for part in parts[:2]:  # Only first two levels to save tokens
                if part not in curr:
                    curr[part] = {}
                curr = curr[part]

        ast_summary = data.get('ast_summary', {})
        patterns = ast_summary.get('patterns', {})

        context = {
            "tech_stack": {
                "primary": languages.get('primary'),
                "frameworks": languages.get('frameworks', []),
                "patterns": patterns, # NEW: Detected libs like Zustand, Radix, etc.
                "dependencies": deps.get('statistics', {}).get('total', 0)
            },
            "system": {
                "build_scripts": list(system.get('scripts', {}).keys())[:15],
                "ci_workflows": [w['name'] for w in system.get('ci_workflows', [])],
                "infrastructure": system.get('infrastructure', []),
                "governance": system.get('governance', [])
            },
            "structure": {
                "file_tree_snippet": file_tree,
                "entry_points": data.get('entry_points', []),
                "total_files": len(ast_files)
            },
            "health": {
                "risk": risk.get('overall'),
                "complexity_hotspots": [f["path"] for f in complexity.get('fileSummaries', [])[:5]]
            }
        }

        prompt = f"""As a Principal Software Architect, generate a "Master Knowledge Base" for this repository. 
The goal is to provide a "Deep Insight Report" that surpasses standard documentation. Think like the creator of the code.

CONTEXT:
{json.dumps(context, indent=2)}

OUTPUT SCHEMA:
{{
  "summary": "Professional architectural purpose. Identify the core 'Mental Model' of the system.",
  "onboarding_flow": {{
    "welcome_message": "Friendly greeting summarizing the technical ambition.",
    "guided_paths": [
      {{ "title": "e.g., Request Lifecycle", "description": "How data flows from A to B", "chapter_index": 0 }}
    ],
    "first_steps": [
      {{ "file": "path/to/file", "reason": "Strategic importance" }}
    ]
  }},
  "chapters": [
    {{
      "title": "Architectural Foundation & Ecosystem",
      "content": "Analyze the choice of libraries ({', '.join(patterns.get('state_management', []))}, {', '.join(patterns.get('ui_libraries', []))}). Explain how they form the backbone of the project."
    }},
    {{
      "title": "Module Strategy & Separation of Concerns",
      "content": "Explain the relationship between major directories. How does the logic in folder A support folder B? (e.g. 'The Registry uses the CLI for automation')."
    }},
    {{
      "title": "Development Lifecycle & Operations",
      "content": "Deep dive into scripts and CI. Explain NOT JUST what they are, but HOW they automate the developer experience."
    }},
    {{
      "title": "Data Flow & State Propagation",
      "content": "If patterns like Redux or Context are used, explain how global state is managed across the tree."
    }},
    {{
      "title": "Technical Evolution & Optimization",
      "content": "Identify the 'North Star' for refactoring. Where is the project growing, and what are the structural bottlenecks?"
    }}
  ],
  "module_map": [
     {{ "path": "string", "role": "Specific functional responsibility" }}
  ]
}}

INSTRUCTIONS:
- Tone: Analytical, authoritative, and visionary.
- Depth: Do not just list files. Explain 'The Why'. 
- Connect the dots: Explain how the Build Scripts relate to the Deployment Infrastructure.
- Mention specific detected patterns: {json.dumps(patterns)}
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