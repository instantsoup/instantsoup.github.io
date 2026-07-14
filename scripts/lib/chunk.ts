/// <reference types="node" />
/**
 * Pure text-chunking helpers for scripts/ingest-rulebook.mts.
 */

/**
 * Splits `text` into chunks of at most `chunkChars` characters, with the
 * last `overlapChars` characters of each chunk repeated at the start of the
 * next one. Without overlap, an entry (e.g. a spell) whose text straddles a
 * chunk boundary is split across two chunks and the model sees neither half
 * whole, silently dropping that entry. With overlap, the entry appears
 * complete in at least one chunk; the ingest script's name-based dedupe step
 * absorbs the resulting duplicate extraction.
 */
export function chunkText(text: string, chunkChars: number, overlapChars: number): string[] {
  if (chunkChars <= 0) throw new Error('chunkChars must be positive');
  if (overlapChars < 0 || overlapChars >= chunkChars) {
    throw new Error('overlapChars must be >= 0 and < chunkChars');
  }
  if (text.length === 0) return [];

  const stride = chunkChars - overlapChars;
  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += stride) {
    chunks.push(text.slice(start, start + chunkChars));
    if (start + chunkChars >= text.length) break;
  }
  return chunks;
}

/**
 * Splits a single chunk into two halves around its midpoint, for
 * re-requesting a chunk that hit the model's max_tokens output limit.
 * `overlapChars` extends both halves symmetrically across the midpoint (half
 * of `overlapChars` on each side) so an entry straddling the split still
 * appears whole in at least one half - the same reasoning as chunkText's
 * overlap, applied to the split point instead of the original chunk
 * boundaries.
 */
export function splitChunkInHalf(chunk: string, overlapChars = 0): [string, string] {
  const mid = Math.floor(chunk.length / 2);
  const halfOverlap = Math.floor(overlapChars / 2);
  const firstEnd = Math.min(chunk.length, mid + halfOverlap);
  const secondStart = Math.max(0, mid - halfOverlap);
  return [chunk.slice(0, firstEnd), chunk.slice(secondStart)];
}
