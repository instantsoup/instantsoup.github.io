// src/data/feats.ts
import { type Feat } from '../types/feat';
import rawFeats from './feats.json' assert { type: 'json' };

// Parse and validate feats data (validation done at build time)
export const feats: Feat[] = rawFeats as Feat[];

// Extract valid feat names for quick lookup
export const FEAT_NAMES = feats.map((f) => f.name) as [string, ...string[]];

export function findFeat(name: string): Feat | undefined {
  const needle = name.trim().toLowerCase();
  return feats.find((f) => f.name.toLowerCase() === needle);
}
