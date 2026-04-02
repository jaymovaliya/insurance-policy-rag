import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PolicyService } from '../policy/policy.service';
import { PrismaService } from '@repo/db';
import { EmbeddingService } from '@repo/embeddings';
import { PgVectorService } from '@repo/vector-db';
import { PolicyStatus } from '@repo/types';
import { chunkText } from './chunker';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  // Manual instantiation for now to avoid dealing with external package providers in Nest DI
  private embeddingService = new EmbeddingService();
  private vectorService: PgVectorService;

  constructor(
    private readonly policyService: PolicyService,
    private readonly prisma: PrismaService,
  ) {
    this.vectorService = new PgVectorService(this.prisma);
  }

  async processUpload(file: Express.Multer.File) {
    // 1. Create a pending policy record
    const policy = await this.policyService.createPendingPolicy(
      file.originalname,
      `/uploads/${file.filename || 'memory-file'}`
    );

    // Process asynchronously so we don't block the HTTP request
    this.extractAndProcess(policy.id, file.buffer).catch((error) => {
      this.logger.error(`Failed to process policy ${policy.id}`, error.stack);
      this.policyService.updatePolicyStatus(policy.id, PolicyStatus.FAILED).catch(console.error);
    });

    return {
      id: policy.id,
      fileName: policy.fileName,
      status: policy.status,
      message: 'Policy uploaded and processing started.',
    };
  }

  private async extractAndProcess(policyId: string, pdfBuffer: Buffer) {
    try {
      this.logger.log(`Starting extraction for policy ${policyId}`);
      await this.policyService.updatePolicyStatus(policyId, PolicyStatus.PROCESSING);

      // 2. Extract text using pdf-parse v2 class API
      const parser = new PDFParse({ data: pdfBuffer, verbosity: 0 });
      const textResult = await parser.getText();
      const pages = textResult.pages.map(p => ({ page: p.num, text: p.text }));
      const pageCount = textResult.total ?? 0;

      // Update page count early
      await this.policyService.updatePolicyStatus(policyId, PolicyStatus.PROCESSING, pageCount);

      // 3. Chunk text
      this.logger.log(`Chunking text for policy ${policyId}`);
      const chunks = chunkText(pages);

      if (chunks.length === 0) {
        throw new Error('No text chunks extracted from PDF');
      }

      // 4. Generate embeddings
      this.logger.log(`Generating embeddings for ${chunks.length} chunks...`);

      const BATCH_SIZE = 10;
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        const batchContents = batchChunks.map(c => c.content);

        // Parallel generate for the batch contents
        const embeddings = await this.embeddingService.generateEmbedding(batchContents);

        // 5. Store chunks and vector embeddings
        for (let j = 0; j < batchChunks.length; j++) {
          const chunk = batchChunks[j];
          const embeddingVector = embeddings[j];

          if (!embeddingVector) continue;

          const chunkIndex = i + j;
          const tokenCount = Math.ceil(chunk.content.length / 4);

          // Save chunk metadata to DB with page number
          const createdChunk = await this.prisma.chunk.create({
            data: {
              policyId,
              content: chunk.content,
              page: chunk.page,
              chunkIndex,
              tokenCount,
            }
          });

          // Upsert vector into that row
          await this.vectorService.upsertEmbedding(createdChunk.id, embeddingVector);
        }

        this.logger.debug(`Processed batch ${i / BATCH_SIZE + 1} for policy ${policyId}`);
      }

      // 6. Mark completed
      this.logger.log(`Completed processing policy ${policyId}`);
      await this.policyService.updatePolicyStatus(policyId, PolicyStatus.COMPLETED, pageCount);

    } catch (error) {
      this.logger.error(`Error processing policy ${policyId}`, error);
      await this.policyService.updatePolicyStatus(policyId, PolicyStatus.FAILED);
      throw new InternalServerErrorException('Failed to process document');
    }
  }
}
