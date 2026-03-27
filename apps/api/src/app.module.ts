import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@repo/db';
import { PolicyModule } from './modules/policy/policy.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { RagModule } from './modules/rag/rag.module';
import { LlmModule } from './modules/llm/llm.module';
import { RetrieverModule } from './modules/retriever/retriever.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    PolicyModule,
    IngestionModule,
    RagModule,
    LlmModule,
    RetrieverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
