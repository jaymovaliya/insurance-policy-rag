import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [PolicyModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
