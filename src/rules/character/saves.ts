import { findClassProgression } from '../../data/class-progressions';
import type { SaveProgression } from '../../types/class-progression';
import type { Level } from '../types';
import type { CalculationBreakdown } from './bab';

/** Save contribution for a single class at a given number of levels */
export function saveForClass(levels: number, progression: SaveProgression): number {
  switch (progression) {
    case 'good':
      return 2 + Math.floor(levels / 2); // +2 base, +1/2 level
    case 'poor':
      return Math.floor(levels / 3); // +1/3 level
  }
}

/** Total save bonus across all classes with per-class breakdown */
export function calculateTotalSave(
  levels: Level[],
  saveType: 'fortitude' | 'reflex' | 'will',
): CalculationBreakdown {
  const classCounts = new Map<string, number>();
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) ?? 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let total = 0;

  for (const [className, count] of classCounts) {
    const prog = findClassProgression(className);
    if (!prog) continue;
    const progression =
      saveType === 'fortitude'
        ? prog.fortitudeProgression
        : saveType === 'reflex'
          ? prog.reflexProgression
          : prog.willProgression;
    const save = saveForClass(count, progression);
    components.push({
      label: `${className} (${count} level${count !== 1 ? 's' : ''})`,
      value: save,
    });
    total += save;
  }

  return { total, components };
}
