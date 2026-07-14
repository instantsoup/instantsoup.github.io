import { describe, expect, it } from 'vitest';

import { chunkText, splitChunkInHalf } from './chunk';

describe('chunkText', () => {
  it('returns a single chunk for text shorter than chunkChars', () => {
    const result = chunkText('hello world', 100, 10);
    expect(result).toEqual(['hello world']);
  });

  it('returns an empty array for empty text', () => {
    expect(chunkText('', 100, 10)).toEqual([]);
  });

  it('splits text into non-overlapping chunks when overlapChars is 0', () => {
    const text = 'a'.repeat(25);
    const result = chunkText(text, 10, 0);
    expect(result).toEqual(['a'.repeat(10), 'a'.repeat(10), 'a'.repeat(5)]);
  });

  it('repeats the last overlapChars characters at the start of the next chunk', () => {
    const text = '0123456789ABCDEFGHIJ'; // 20 chars
    const result = chunkText(text, 10, 4);
    // stride = 6: chunks start at 0, 6, 12, 18
    expect(result[0]).toBe('0123456789');
    expect(result[1]).toBe('6789ABCDEF'); // last 4 of chunk 0 ("6789") repeated at its start
    expect(result[1].slice(0, 4)).toBe(result[0].slice(-4));
  });

  it('an entry straddling a boundary appears whole in at least one chunk', () => {
    // "TARGET" (6 chars) sits at index 5-10 of this 16-char string.
    const text = 'AAAAATARGETBBBBB';

    // No overlap, chunkChars=8: hard boundary at index 8 splits "TARGET" in two.
    const withoutOverlap = chunkText(text, 8, 0);
    expect(withoutOverlap.some((c) => c.includes('TARGET'))).toBe(false);

    // With overlap, the chunk starting at index 4 covers indices 4-11, containing "TARGET" whole.
    const withOverlap = chunkText(text, 8, 4);
    expect(withOverlap.some((c) => c.includes('TARGET'))).toBe(true);
  });

  it('covers the entire input with no gaps', () => {
    const text = 'x'.repeat(37);
    const chunks = chunkText(text, 10, 3);
    const stride = 10 - 3;
    for (let i = 0; i < chunks.length - 1; i++) {
      expect(chunks[i]).toHaveLength(10);
    }
    // Reassembling with the known stride should reproduce the original text.
    let reassembled = chunks[0];
    for (let i = 1; i < chunks.length; i++) {
      reassembled += chunks[i].slice(chunks[i].length - Math.min(stride, chunks[i].length));
    }
    expect(reassembled.length).toBeGreaterThanOrEqual(text.length);
  });

  it('throws for non-positive chunkChars', () => {
    expect(() => chunkText('abc', 0, 0)).toThrow();
    expect(() => chunkText('abc', -5, 0)).toThrow();
  });

  it('throws when overlapChars >= chunkChars', () => {
    expect(() => chunkText('abc', 10, 10)).toThrow();
    expect(() => chunkText('abc', 10, 15)).toThrow();
  });
});

describe('splitChunkInHalf', () => {
  it('splits an even-length chunk into two equal halves', () => {
    const [a, b] = splitChunkInHalf('12345678');
    expect(a).toBe('1234');
    expect(b).toBe('5678');
  });

  it('splits an odd-length chunk with the extra character in the second half', () => {
    const [a, b] = splitChunkInHalf('12345');
    expect(a).toBe('12');
    expect(b).toBe('345');
  });

  it('the two halves concatenate back to the original when overlapChars is 0 (default)', () => {
    const original = 'the quick brown fox jumps over the lazy dog';
    const [a, b] = splitChunkInHalf(original);
    expect(a + b).toBe(original);
  });

  it('overlaps symmetrically around the midpoint when overlapChars is given', () => {
    // "TARGET" (6 chars) sits right across the midpoint of this 16-char string.
    const text = 'AAAAATARGETBBBBB'; // length 16, midpoint at 8
    const [a, b] = splitChunkInHalf(text, 6);
    // midpoint 8, halfOverlap 3 -> first ends at 11, second starts at 5
    expect(a).toBe(text.slice(0, 11));
    expect(b).toBe(text.slice(5));
    expect(a.includes('TARGET') || b.includes('TARGET')).toBe(true);
  });

  it('does not throw when overlapChars exceeds the chunk length', () => {
    expect(() => splitChunkInHalf('short', 10_000)).not.toThrow();
    const [a, b] = splitChunkInHalf('short', 10_000);
    expect(a).toBe('short');
    expect(b).toBe('short');
  });
});
