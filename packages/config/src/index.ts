import { z } from 'zod';
import { config } from 'dotenv';
import path from 'path';

// Load .env relative to the app execution directory if available
config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required").default("placeholder_for_build"),
  
  // App Config
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // RAG Constants (can be overridden via ENV if needed)
  CHUNK_SIZE_TOKENS: z.coerce.number().default(600),
  CHUNK_OVERLAP_TOKENS: z.coerce.number().default(100),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(1536),
  CHAT_MODEL: z.string().default("gpt-4o-mini"),
  RETRIEVAL_TOP_K: z.coerce.number().default(5),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
