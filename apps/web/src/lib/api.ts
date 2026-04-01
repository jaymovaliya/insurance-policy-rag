import { PolicyMetadata, QueryRequest, QueryResponse, UploadResponse } from '@repo/types';

// The Backend API runs on port 3001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  /**
   * Upload an insurance policy PDF to the ingestion pipeline.
   */
  async uploadPolicy(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/ingestion/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to upload policy');
    }

    return response.json();
  },

  /**
   * Fetch all uploaded policies (both pending, processing, and completed).
   */
  async getPolicies(): Promise<PolicyMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/policy`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch policies');
    }

    return response.json();
  },

  /**
   * Fetch a single policy by ID.
   */
  async getPolicy(id: string): Promise<PolicyMetadata & { _count: { chunks: number } }> {
    const response = await fetch(`${API_BASE_URL}/policy/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch policy');
    }

    return response.json();
  },

  /**
   * Delete a policy by ID.
   */
  async deletePolicy(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/policy/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete policy');
    }

    return response.json();
  },

  /**
   * Query a policy using Semantic RAG.
   */
  async queryRag(request: QueryRequest): Promise<QueryResponse> {
    const response = await fetch(`${API_BASE_URL}/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to query RAG pipeline');
    }

    return response.json();
  }
};
