export interface VectorDB {
    upsert(docs: any[]): Promise<void>;
    search(query: number[], topK: number): Promise<any[]>;
}