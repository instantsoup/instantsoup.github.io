import { type Flaw } from '../types/flaw';
import rawFlaws from './flaws.json' assert { type: 'json' };

export const flaws: Flaw[] = rawFlaws as Flaw[];

export function findFlaw(name: string): Flaw | undefined {
  const needle = name.trim().toLowerCase();
  return flaws.find((f) => f.name.toLowerCase() === needle);
}
