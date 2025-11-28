// src/data/feats.ts
import { type Feat } from '../types/feat';
import rawFeats from './feats.json' assert { type: 'json' };

// Deduplicate feats by name (keeping first occurrence)
// Many feats are reprinted across multiple sourcebooks
const featMap = new Map<string, Feat>();
for (const feat of rawFeats as Feat[]) {
  if (!featMap.has(feat.name)) {
    featMap.set(feat.name, feat);
  }
}

// Export deduplicated feats
export const feats: Feat[] = Array.from(featMap.values());

// Extract valid feat names for quick lookup
export const FEAT_NAMES = feats.map((f) => f.name) as [string, ...string[]];

export function findFeat(name: string): Feat | undefined {
  const needle = name.trim().toLowerCase();
  return feats.find((f) => f.name.toLowerCase() === needle);
}
