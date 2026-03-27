import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { RetrieverService } from '../retriever/retriever.service';
import { EmbeddingService } from '@repo/embeddings';
import { LlmService } from '@repo/llm';
import { RAG_SYSTEM_PROMPT, buildRagUserPrompt } from '@repo/prompts';
import { QueryRequest, QueryResponse } from '@repo/types';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private embeddingService = new EmbeddingService();
  private llmService = new LlmService();

  constructor(private readonly retrieverService: RetrieverService) {}

  async evaluateQuery(request: QueryRequest): Promise<QueryResponse> {
    const { question, policyId } = request;

    if (!question || !policyId) {
      throw new BadRequestException('Question and policyId are required');
    }

    this.logger.log(`Processing RAG query for policy ${policyId}`);

    // 1. Generate embedding for the question
    const questionEmbedding = await this.embeddingService.generateSingleEmbedding(
      question,
    );

    // 2. Retrieve top matching chunks from pgvector
    const relevantChunks = await this.retrieverService.retrieve(
      questionEmbedding,
      policyId,
    );

    // 3. Format context using shared prompt package
    const promptParams = relevantChunks.map(chunk => ({
      content: chunk.content,
      page: chunk.page,
      section: chunk.section,
    }));
    
    // Using simple builder function from `prompts` package
    const userPrompt = buildRagUserPrompt(promptParams, question);

    // 4. Generate Answer via LLM
    const answer = await this.llmService.chat(RAG_SYSTEM_PROMPT, userPrompt);

    // 5. Structure the returning object
    return {
      answer,
      sources: relevantChunks.map(chunk => ({
        content: chunk.content,
        similarity: chunk.similarity,
        page: chunk.page,
        section: chunk.section,
      })),
    };
  }
}
