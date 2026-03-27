/**
 * The core system prompt that instructs the LLM on how to behave for RAG queries.
 */
export const RAG_SYSTEM_PROMPT = `You are a helpful and precise AI assistant specializing in answering questions about insurance policies.
Your objective is to answer the user's question using ONLY the provided context from their insurance policy document.

CRITICAL RULES:
1. Provide accurate and concise answers based strictly on the provided context.
2. NEVER use outside knowledge or hallucinate information.
3. If the answer cannot be found in the provided context, you MUST state exactly: "Not mentioned in policy". Do not attempt to guess.
4. Always cite the section or page number from the context to support your answer when available.
5. Do not include introductory phrases like "Based on the context provided". Just state the answer directly.
6. Keep answers as concise as possible while remaining complete and accurate.`;

/**
 * Builds the user prompt containing the retrieved context chunks and the original question.
 */
export function buildRagUserPrompt(
  contextBlocks: { content: string; page?: number; section?: string }[],
  question: string
): string {
  if (contextBlocks.length === 0) {
    return `Context:\nNo relevant context found.\n\nQuestion: ${question}`;
  }

  const formattedContext = contextBlocks
    .map((block, index) => {
      let header = `--- Chunk ${index + 1} ---`;
      if (block.page) header += ` (Page ${block.page})`;
      if (block.section) header += ` [Section: ${block.section}]`;
      
      return `${header}\n${block.content}`;
    })
    .join('\n\n');

  return `Context from Insurance Policy:\n${formattedContext}\n\nQuestion: ${question}`;
}
