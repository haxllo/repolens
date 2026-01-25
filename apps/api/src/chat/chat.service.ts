import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private pc: Pinecone | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private indexName: string;

  constructor(private configService: ConfigService) {
    const pineconeKey = this.configService.get<string>('PINECONE_API_KEY');
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.indexName = this.configService.get<string>('PINECONE_INDEX_NAME', 'repolens-v2');

    if (pineconeKey) {
      this.pc = new Pinecone({ apiKey: pineconeKey });
    }
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
  }

  async ask(repoId: string, question: string) {
    if (!this.pc || !this.gemini) {
      return { answer: "AI services are not fully configured.", sources: [] };
    }

    try {
      // TODO: Transition to local BGE-small embeddings for 384-dim consistency with worker
      // 1. Generate Query Embedding (Currently using Gemini 768-dim)
      const embeddingModel = this.gemini.getGenerativeModel({ model: "embedding-001" });
      const embeddingResult = await embeddingModel.embedContent(question);
      const queryVector = embeddingResult.embedding.values;

      // 2. Query Pinecone
      const index = this.pc.index(this.indexName);
      const queryResponse = await index.namespace(repoId).query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      });

      // 3. Construct Context
      const matches = queryResponse.matches || [];
      const context = matches
        .map((m: any) => `File: ${m.metadata.file_path}\nSnippet:\n${m.metadata.content_snippet}`)
        .join("\n\n---\n\n");

      if (!context) {
        return { answer: "I couldn't find any relevant code in the repository to answer your question.", sources: [] };
      }

      // 4. Generate Answer
      const generativeModel = this.gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        You are an expert Software Architect analyzing a codebase.
        
        USER QUESTION: "${question}"
        
        RELEVANT CODE CONTEXT:
        ${context}
        
        INSTRUCTIONS:
        - Answer the question based ONLY on the provided context.
        - If the context doesn't have the answer, say so.
        - Cite specific files and functions.
        - Be concise and technical.
      `;

      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      
      return {
        answer: response.text(),
        sources: matches.map((m: any) => ({
          path: m.metadata.file_path,
          score: m.score
        }))
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Chat failed: ${errorMessage}`);
      throw new Error("Failed to process your question.");
    }
  }
}
