import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { RetrieverModule } from '../retriever/retriever.module';
import { PrismaModule } from '@repo/db';

@Module({
  imports: [RetrieverModule, PrismaModule],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
