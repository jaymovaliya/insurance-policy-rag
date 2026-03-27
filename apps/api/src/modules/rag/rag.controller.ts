import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from './rag.service';
import type { QueryRequest } from '@repo/types';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  async evaluateQuery(@Body() request: QueryRequest) {
    return this.ragService.evaluateQuery(request);
  }
}
