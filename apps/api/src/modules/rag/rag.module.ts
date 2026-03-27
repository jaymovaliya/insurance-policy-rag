import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { RetrieverModule } from '../retriever/retriever.module';

@Module({
  imports: [RetrieverModule],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
