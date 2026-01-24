import os
import logging
import aiohttp
import google.generativeai as genai
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class VectorStorage:
    """Handles semantic code indexing using Cloudflare Vectorize and Gemini Embeddings"""
    
    def __init__(self):
        self.account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID')
        self.api_token = os.getenv('CLOUDFLARE_API_TOKEN')
        self.index_name = os.getenv('VECTORIZE_INDEX_NAME', 'repolens-index')
        
        # Initialize Gemini for embeddings
        gemini_key = os.getenv('GEMINI_API_KEY')
        if gemini_key:
            genai.configure(api_key=gemini_key)
            self.embedding_model = 'models/embedding-001'
            self.enabled = True
        else:
            logger.warning("Gemini API key missing. Vector storage disabled.")
            self.enabled = False
            
        if not self.account_id or not self.api_token:
            logger.warning("Cloudflare credentials missing. Vector storage disabled.")
            self.enabled = False

    async def generate_embeddings(self, text_chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of text chunks using Gemini"""
        if not self.enabled:
            return []
            
        try:
            # Gemini batch embedding
            result = genai.embed_content(
                model=self.embedding_model,
                content=text_chunks,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {str(e)}")
            return []

    async def upsert_vectors(self, vectors: List[Dict[str, Any]]) -> bool:
        """
        Upsert vectors to Cloudflare Vectorize via REST API
        vectors: List of { id, values, metadata }
        """
        if not self.enabled:
            return False

        url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/vectorize/indexes/{self.index_name}/insert"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Cloudflare Vectorize expects NDJSON (newline delimited JSON) for inserts
                # or a standard JSON array depending on the endpoint version. 
                # Using standard JSON array format for the v4 API.
                
                async with session.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {self.api_token}",
                        "Content-Type": "application/json"
                    },
                    json=vectors
                ) as response:
                    if response.status != 200:
                        text = await response.text()
                        logger.error(f"Vectorize upsert failed ({response.status}): {text}")
                        return False
                    
                    return True
        except Exception as e:
            logger.error(f"Vector storage error: {str(e)}")
            return False

    async def query_vectors(self, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Query the vector index semantically"""
        if not self.enabled:
            return []

        try:
            # Generate query embedding
            embedding_result = genai.embed_content(
                model=self.embedding_model,
                content=query_text,
                task_type="retrieval_query"
            )
            query_vector = embedding_result['embedding']

            url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/vectorize/indexes/{self.index_name}/query"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {self.api_token}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "vector": query_vector,
                        "topK": top_k,
                        "returnMetadata": True
                    }
                ) as response:
                    if response.status != 200:
                        return []
                    
                    data = await response.json()
                    return data.get('result', {}).get('matches', [])
                    
        except Exception as e:
            logger.error(f"Vector query failed: {str(e)}")
            return []
