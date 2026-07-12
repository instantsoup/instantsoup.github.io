import { findClassProgression } from '../../data/class-progressions';
import type { BABProgression } from '../../types/class-progression';
import type { Level } from '../types';

export interface CalculationBreakdown {
  total: number;
  components: Array<{ label: string; value: number }>;
}

/** BAB contribution for a single class at a given number of levels */
export function babForClass(levels: number, progression: BABProgression): number {
  switch (progression) {
    case 'high':
      return levels; // +1/level
    case 'medium':
      return Math.floor((levels * 3) / 4); // +3/4/level
    case 'low':
      return Math.floor(levels / 2); // +1/2/level
  }
}

/** Total BAB from all character levels with per-class breakdown */
export function calculateTotalBAB(levels: Level[]): CalculationBreakdown {
  const classCounts = new Map<string, number>();
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) ?? 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let total = 0;

  for (const [className, count] of classCounts) {
    const prog = findClassProgression(className);
    if (!prog) continue;
    const bab = babForClass(count, prog.babProgression);
    components.push({
      label: `${className} (${count} level${count !== 1 ? 's' : ''})`,
      value: bab,
    });
    total += bab;
  }

  return { total, components };
}

/**
 * Iterative attack bonuses.
 * A +11 BAB character attacks at +11/+6/+1 with their total attack bonus passed in.
 */
export function getIterativeAttacks(totalAttack: number, bab: number): number[] {
  const attacks = [totalAttack];
  if (bab >= 6) attacks.push(totalAttack - 5);
  if (bab >= 11) attacks.push(totalAttack - 10);
  if (bab >= 16) attacks.push(totalAttack - 15);
  return attacks;
}

/** Format iterative attacks as "+11/+6/+1" */
export function formatAttacks(attacks: number[]): string {
  return attacks.map((n) => (n >= 0 ? `+${n}` : `${n}`)).join('/');
}
