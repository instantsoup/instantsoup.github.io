/**
 * Pure diffing helpers for scripts/merge-rulebook-classes.mts.
 */
import type { ClassProgression } from '../../src/types/class-progression.ts';

export function findExistingClass(
  existing: ClassProgression[],
  name: string,
): ClassProgression | undefined {
  const needle = name.trim().toLowerCase();
  return existing.find((c) => c.name.toLowerCase() === needle);
}

/** Field-by-field diff between two class progressions, as printable "field: old -> new" lines. */
export function diffClassProgression(oldC: ClassProgression, newC: ClassProgression): string[] {
  const changes: string[] = [];
  const keys = new Set<keyof ClassProgression>([
    ...(Object.keys(oldC) as Array<keyof ClassProgression>),
    ...(Object.keys(newC) as Array<keyof ClassProgression>),
  ]);
  for (const key of keys) {
    const oldVal = JSON.stringify(oldC[key]);
    const newVal = JSON.stringify(newC[key]);
    if (oldVal !== newVal) {
      changes.push(`${String(key)}: ${oldVal} -> ${newVal}`);
    }
  }
  return changes;
}

export interface ClassMergeReview {
  additions: ClassProgression[];
  updates: Array<{ name: string; changes: string[]; proposed: ClassProgression }>;
  unchanged: string[];
}

/** Classifies each incoming class as a new addition, a changed update, or unchanged. */
export function reviewClassMerge(
  existing: ClassProgression[],
  incoming: ClassProgression[],
): ClassMergeReview {
  const review: ClassMergeReview = { additions: [], updates: [], unchanged: [] };
  for (const cls of incoming) {
    const match = findExistingClass(existing, cls.name);
    if (!match) {
      review.additions.push(cls);
      continue;
    }
    const changes = diffClassProgression(match, cls);
    if (changes.length === 0) {
      review.unchanged.push(cls.name);
    } else {
      review.updates.push({ name: cls.name, changes, proposed: cls });
    }
  }
  return review;
}
