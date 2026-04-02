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
export interface PageText {
  page: number;
  text: string;
}

export interface ChunkResult {
  content: string;
  page: number;
}

/**
 * Splits extracted PDF text into chunks roughly matching the token sizes,
 * while preserving page attribution.
 */
export function chunkText(pages: PageText[], options?: ChunkOptions): ChunkResult[] {
  const maxSize = options?.size ?? env.CHUNK_SIZE_TOKENS ?? 600;
  const overlapSize = options?.overlap ?? env.CHUNK_OVERLAP_TOKENS ?? 100;
  const maxChars = maxSize * 4;
  const overlapChars = overlapSize * 4;

  const chunks: ChunkResult[] = [];
  let currentChunk = '';
  let currentChunkPage = pages[0]?.page || 1;

  for (const page of pages) {
    // Clean the page text
    const cleanedText = page.text.replace(/\s+/g, ' ').trim();
    if (!cleanedText) continue;

    // Split by sentence boundaries
    const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChars && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          page: currentChunkPage,
        });

        // Calculate overlap
        const cutoffIdx = Math.max(0, currentChunk.length - overlapChars);
        const overlapText = currentChunk.substring(cutoffIdx);
        const overlapStart = overlapText.indexOf('. ');

        if (overlapStart !== -1 && overlapStart < overlapText.length - 2) {
          currentChunk = overlapText.substring(overlapStart + 2) + sentence;
        } else {
          currentChunk = overlapText + sentence;
        }
        
        // When we start a new chunk, we use the current page as its reference
        // (even if part of it came from the previous page via overlap)
        currentChunkPage = page.page;
      } else {
        if (currentChunk.length === 0) {
          currentChunkPage = page.page;
        }
        currentChunk += sentence;
      }
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      page: currentChunkPage,
    });
  }

  return chunks;
}
