// Policy Types
export enum PolicyStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PolicyMetadata {
  id: string;
  fileName: string;
  fileUrl: string;
  status: PolicyStatus;
  pageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Chunking Types
export interface ChunkData {
  id?: string;
  policyId: string;
  content: string;
  section?: string;
  page?: number;
  chunkIndex: number;
  tokenCount: number;
}

// RAG Types
export interface QueryRequest {
  question: string;
  policyId: string;
}

export interface SourceReference {
  page?: number;
  section?: string;
  content: string;
  similarity: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceReference[];
}

// Upload Types
export interface UploadResponse {
  id: string;
  fileName: string;
  status: PolicyStatus;
  message: string;
}
