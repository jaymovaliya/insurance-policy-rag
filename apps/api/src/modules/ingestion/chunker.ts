import { env } from '@repo/config';

export interface ChunkOptions {
  size?: number;
  overlap?: number;
}

/**
 * Splits extracted PDF text into chunks roughly matching the token sizes.
 * Token count is roughly approximated as word_count * 1.3 for simplicity, or 
 * using char_count / 4. 
 * We try not to break sentences by using punctuation splitting.
 */
export function chunkText(text: string, options?: ChunkOptions): string[] {
  const maxSize = options?.size ?? env.CHUNK_SIZE_TOKENS ?? 600;
  const overlapSize = options?.overlap ?? env.CHUNK_OVERLAP_TOKENS ?? 100;
  const maxChars = maxSize * 4; // Approx 4 chars per token
  const overlapChars = overlapSize * 4;

  // Clean the text: remove excessive newlines and spaces
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  // Split strictly by sentence boundaries
  const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];
  
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Calculate overlap: grab the end of the current chunk
      // Try to find a sentence boundary within the overlap limit
      const cutoffIdx = Math.max(0, currentChunk.length - overlapChars);
      const overlapText = currentChunk.substring(cutoffIdx);
      const overlapStart = overlapText.indexOf('. ');
      
      if (overlapStart !== -1 && overlapStart < overlapText.length - 2) {
        currentChunk = overlapText.substring(overlapStart + 2) + sentence;
      } else {
        currentChunk = overlapText + sentence;
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
