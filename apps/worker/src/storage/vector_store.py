import os
import logging
from typing import List, Dict, Any, Optional
from pinecone import Pinecone

logger = logging.getLogger(__name__)

class VectorStore:
    """
    Handles storage and retrieval of code embeddings in Pinecone.
    Provides the memory layer for RAG-based architectural chat.
    """
    
    def __init__(self):
        api_key = os.getenv('PINECONE_API_KEY')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'repolens-rag')
        
        if not api_key:
            logger.warning("PINECONE_API_KEY not found. Vector operations disabled.")
            self.pc = None
            self.index = None
            return

        try:
            self.pc = Pinecone(api_key=api_key)
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Connected to Pinecone index: {self.index_name}")
        except Exception as e:
            logger.error(f"Failed to connect to Pinecone: {str(e)}")
            self.pc = None
            self.index = None

    async def upsert_file_embeddings(self, repo_id: str, file_data: List[Dict[str, Any]]):
        """
        Pushes embeddings to Pinecone using repo_id as the namespace.
        file_data should contain: id, values (embedding), and metadata.
        """
        if not self.index:
            return

        try:
            # Pinecone expects list of (id, values, metadata)
            vectors = []
            for item in file_data:
                vectors.append({
                    "id": item['id'],
                    "values": item['values'],
                    "metadata": item['metadata']
                })

            # Upsert in batches of 100 for stability
            for i in range(0, len(vectors), 100):
                batch = vectors[i:i + 100]
                self.index.upsert(vectors=batch, namespace=repo_id)
            
            logger.info(f"Successfully upserted {len(vectors)} vectors to namespace {repo_id}")
        except Exception as e:
            logger.error(f"Pinecone upsert failed: {str(e)}")

    async def query_relevant_code(self, repo_id: str, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Searches for the most relevant code snippets in a specific repository.
        """
        if not self.index:
            return []

        try:
            results = self.index.query(
                namespace=repo_id,
                vector=query_vector,
                top_k=top_k,
                include_metadata=True
            )
            return [
                {
                    "file_path": match['metadata'].get('file_path'),
                    "content": match['metadata'].get('content_snippet'),
                    "score": match['score']
                }
                for match in results['matches']
            ]
        except Exception as e:
            logger.error(f"Pinecone query failed: {str(e)}")
            return []

    async def delete_repository_index(self, repo_id: str):
        """
        Cleans up vectors for a repository (useful for re-scans).
        """
        if not self.index:
            return
        
        try:
            self.index.delete(delete_all=True, namespace=repo_id)
            logger.info(f"Deleted vectors for namespace: {repo_id}")
        except Exception as e:
            logger.error(f"Pinecone deletion failed: {str(e)}")
