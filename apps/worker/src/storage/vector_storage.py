import os
import logging
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from pinecone import Pinecone

logger = logging.getLogger(__name__)

class VectorStorage:
    """
    Handles semantic code indexing using Pinecone and Gemini Embeddings.
    Provides the memory layer for RAG-based architectural chat.
    """
    
    def __init__(self):
        # Pinecone Config
        self.pinecone_key = os.getenv('PINECONE_API_KEY')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'repolens-rag')
        
        # Gemini Config (Latest text-embedding-004 produces 768 dimensions)
        gemini_key = os.getenv('GEMINI_API_KEY')
        
        if gemini_key and self.pinecone_key:
            genai.configure(api_key=gemini_key)
            self.embedding_model = 'models/text-embedding-004'
            
            try:
                self.pc = Pinecone(api_key=self.pinecone_key)
                self.index = self.pc.Index(self.index_name)
                self.enabled = True
                logger.info(f"VectorStore active: Connected to Pinecone index '{self.index_name}'")
            except Exception as e:
                logger.error(f"Failed to connect to Pinecone: {str(e)}")
                self.enabled = False
        else:
            logger.warning("PINECONE_API_KEY or GEMINI_API_KEY missing. Vector storage disabled.")
            self.enabled = False

    async def generate_embeddings(self, text_chunks: List[str]) -> List[List[float]]:
        """Generate 768-dimensional embeddings using Google's text-embedding-004"""
        if not self.enabled:
            return []
            
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text_chunks,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {str(e)}")
            return []

    async def upsert_vectors(self, vectors: List[Dict[str, Any]], namespace: str) -> bool:
        """
        Upsert vectors to Pinecone. 
        Uses repository ID as the namespace for strict data isolation.
        """
        if not self.enabled or not self.index:
            return False

        try:
            # Pinecone expects: {"id": "...", "values": [...], "metadata": {...}}
            # We process in batches of 100 for safety
            for i in range(0, len(vectors), 100):
                batch = vectors[i:i + 100]
                self.index.upsert(vectors=batch, namespace=namespace)
            
            logger.info(f"Successfully indexed {len(vectors)} chunks in namespace: {namespace}")
            return True
        except Exception as e:
            logger.error(f"Pinecone upsert failed: {str(e)}")
            return False

    async def query_vectors(self, query_text: str, namespace: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Semantic search within a specific repository's namespace"""
        if not self.enabled or not self.index:
            return []

        try:
            # Generate query embedding
            embedding_result = genai.embed_content(
                model=self.embedding_model,
                content=query_text,
                task_type="retrieval_query"
            )
            query_vector = embedding_result['embedding']

            # Query Pinecone
            results = self.index.query(
                namespace=namespace,
                vector=query_vector,
                top_k=top_k,
                include_metadata=True
            )
            
            return [
                {
                    "id": match['id'],
                    "score": match['score'],
                    "metadata": match['metadata']
                }
                for match in results['matches']
            ]
                    
        except Exception as e:
            logger.error(f"Vector query failed: {str(e)}")
            return []

    async def delete_namespace(self, namespace: str):
        """Cleanup namespace (useful for re-scanning)"""
        if not self.enabled or not self.index:
            return
        try:
            self.index.delete(delete_all=True, namespace=namespace)
            logger.info(f"Cleared vector namespace: {namespace}")
        except Exception:
            pass