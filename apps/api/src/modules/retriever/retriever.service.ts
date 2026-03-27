import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@repo/db';
import { PgVectorService } from '@repo/vector-db';
import { ChunkData } from '@repo/types';

@Injectable()
export class RetrieverService {
  private readonly logger = new Logger(RetrieverService.name);
  private vectorService: PgVectorService;

  constructor(private readonly prisma: PrismaService) {
    this.vectorService = new PgVectorService(this.prisma);
  }

  async retrieve(
    queryEmbedding: number[],
    policyId: string,
    topK: number = 5,
  ): Promise<(ChunkData & { similarity: number })[]> {
    this.logger.log(`Retrieving top ${topK} matches for policy ${policyId}`);
    return this.vectorService.similaritySearch(queryEmbedding, policyId, topK);
  }
}
