import { PrismaService } from '@repo/db';
import { ChunkData } from '@repo/types';

export class PgVectorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upserts the embedding vector into the chunks table for a specific chunk ID.
   * This updates the row that Prisma already created with the chunk metadata.
   */
  async upsertEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    const formattedVector = `[${embedding.join(',')}]`;
    
    // Using raw SQL to update the embedding since Prisma doesn't natively support vector types well yet
    await this.prisma.$executeRawUnsafe(
      `UPDATE "chunks" SET "embedding" = $1::vector WHERE "id" = $2`,
      formattedVector,
      chunkId
    );
  }

  /**
   * Searches for chunks related to a specific policy using cosine similarity (<=>).
   */
  async similaritySearch(
    queryEmbedding: number[],
    policyId: string,
    topK: number = 5
  ): Promise<(ChunkData & { similarity: number })[]> {
    const formattedVector = `[${queryEmbedding.join(',')}]`;

    // 1 - (embedding <=> query) converts the distance operator to a similarity score natively
    // We filter strictly by policyId as per the requirements
    const results = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        "id", "policyId", "content", "section", "page", "chunkIndex", "tokenCount",
        1 - ("embedding" <=> $1::vector) AS "similarity"
      FROM "chunks"
      WHERE "policyId" = $2
      ORDER BY "embedding" <=> $1::vector
      LIMIT $3
      `,
      formattedVector,
      policyId,
      topK
    );

    // Map Prisma returned raw rows back to strictly typed objects
    return results.map(row => ({
      id: row.id,
      policyId: row.policyId,
      content: row.content,
      section: row.section,
      page: row.page,
      chunkIndex: row.chunkIndex,
      tokenCount: row.tokenCount,
      similarity: Number(row.similarity),
    }));
  }
}
