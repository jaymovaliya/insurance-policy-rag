import OpenAI from 'openai';
import { env } from '@repo/config';

export class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates embeddings for a single text or an array of texts.
   */
  async generateEmbedding(input: string | string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: env.EMBEDDING_MODEL,
      input: input,
      dimensions: env.EMBEDDING_DIMENSIONS,
    });

    // Sort by index to maintain correct order if batch processed
    const sortedEmbeddings = response.data.sort((a, b) => a.index - b.index);
    return sortedEmbeddings.map((item) => item.embedding);
  }

  /**
   * Helper for a single string
   */
  async generateSingleEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbedding(text);
    return embeddings[0];
  }
}
