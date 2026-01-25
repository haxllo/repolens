import os
import logging
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class VectorStorage:
    """
    Handles semantic code indexing using Pinecone and Local Hugging Face Embeddings.
    Provides the memory layer for RAG-based architectural chat.
    Uses 'BAAI/bge-small-en-v1.5' for zero-cost local embedding generation.
    """
    
    def __init__(self):
        # Pinecone Config
        self.pinecone_key = os.getenv('PINECONE_API_KEY')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'repolens-rag')
        
        if self.pinecone_key:
            try:
                # Initialize Local Transformer
                logger.info("Initializing local Hugging Face transformer: BAAI/bge-small-en-v1.5")
                self.model = SentenceTransformer('BAAI/bge-small-en-v1.5')
                
                # Initialize Pinecone
                self.pc = Pinecone(api_key=self.pinecone_key)
                self.index = self.pc.Index(self.index_name)
                self.enabled = True
                logger.info(f"VectorStore active: Connected to Pinecone index '{self.index_name}'")
            except Exception as e:
                logger.error(f"Failed to initialize VectorStorage: {str(e)}")
                self.enabled = False
        else:
            logger.warning("PINECONE_API_KEY missing. Vector storage disabled.")
            self.enabled = False

    async def generate_embeddings(self, text_chunks: List[str]) -> List[List[float]]:
        """Generate 384-dimensional embeddings locally using BGE-small-en-v1.5"""
        if not self.enabled:
            return []
            
        try:
            # Running local inference
            embeddings = self.model.encode(text_chunks, normalize_embeddings=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Failed to generate local embeddings: {str(e)}")
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
            for i in range(0, len(vectors), 100):
                batch = vectors[i:i + 100]
                self.index.upsert(vectors=batch, namespace=namespace)
            
            logger.info(f"Successfully indexed {len(vectors)} chunks in namespace: {namespace}")
            return True
        except Exception as e:
            logger.error(f"Pinecone upsert failed: {str(e)}")
            return False

    async def query_vectors(self, query_text: str, namespace: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Semantic search using local query embedding"""
        if not self.enabled or not self.index:
            return []

        try:
            # Generate local query embedding
            query_vector = self.model.encode([query_text], normalize_embeddings=True)[0].tolist()

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