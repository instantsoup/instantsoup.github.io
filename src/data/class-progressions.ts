// src/data/class-progressions.ts
import { type ClassProgression, ClassProgressionsFileSchema } from '../types/class-progression';
import rawProgressions from './class-progressions.json' assert { type: 'json' };

const parsed = ClassProgressionsFileSchema.parse(rawProgressions);
export const classProgressions: ClassProgression[] = parsed;

export function findClassProgression(className: string): ClassProgression | undefined {
  const needle = className.trim().toLowerCase();
  return classProgressions.find((cp) => cp.name.toLowerCase() === needle);
}
