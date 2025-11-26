// src/data/alignments.ts
import { type Alignment, AlignmentsFileSchema } from '../types/alignment';
import rawAlignments from './alignments.json' assert { type: 'json' };

const parsed = AlignmentsFileSchema.parse(rawAlignments);
export const alignments: Alignment[] = parsed;

// Extract valid alignment codes for validation
export const ALIGNMENT_CODES = alignments.map((a) => a.code) as [string, ...string[]];

export function findAlignment(code: string): Alignment | undefined {
  const needle = code.trim().toUpperCase();
  return alignments.find((a) => a.code === needle);
}
