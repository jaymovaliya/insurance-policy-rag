import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PolicyService } from '../policy/policy.service';
import { PrismaService } from '@repo/db';
import { EmbeddingService } from '@repo/embeddings';
import { PgVectorService } from '@repo/vector-db';
import { PolicyStatus } from '@repo/types';
import { chunkText } from './chunker';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

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

      // 2. Extract text natively
      const parsedData = await pdfParse(pdfBuffer);
      const text = parsedData.text;
      const pageCount = parsedData.numpages;

      // Update page count early
      await this.policyService.updatePolicyStatus(policyId, PolicyStatus.PROCESSING, pageCount);

      // 3. Chunk text
      this.logger.log(`Chunking text for policy ${policyId}`);
      const chunks = chunkText(text);

      if (chunks.length === 0) {
        throw new Error('No text chunks extracted from PDF');
      }

      // 4. Generate embeddings (hitting OpenAI limit can occur if processing huge arrays sequentially, batching recommended)
      // Since it's a test task, we process sequentially or in tiny batches to be safe without rate limits
      this.logger.log(`Generating embeddings for ${chunks.length} chunks...`);
      
      const BATCH_SIZE = 10;
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        
        // Parallel generate for the batch
        const embeddings = await this.embeddingService.generateEmbedding(batchChunks);
        
        // 5. Store chunks and vector embeddings synchronously inside the batch
        for (let j = 0; j < batchChunks.length; j++) {
          const chunkContent = batchChunks[j];
          const embeddingVector = embeddings[j];
          
          if(!embeddingVector) continue; // safety check
          
          const chunkIndex = i + j;
          const tokenCount = Math.ceil(chunkContent.length / 4);

          // Save chunk metadata to DB
          const createdChunk = await this.prisma.chunk.create({
            data: {
              policyId,
              content: chunkContent,
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
