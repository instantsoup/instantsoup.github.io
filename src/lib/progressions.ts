// src/lib/progressions.ts
import { findClassProgression } from '../data/class-progressions';
import type { BABProgression, SaveProgression } from '../types/class-progression';
import type { Level } from '../types/level';

/**
 * Breakdown of how a value is calculated
 */
export interface CalculationBreakdown {
  total: number;
  components: Array<{
    label: string;
    value: number;
  }>;
}

/**
 * Calculate BAB for a specific number of levels in a class
 */
export function calculateBABForClass(levels: number, progression: BABProgression): number {
  if (levels === 0) return 0;

  switch (progression) {
    case 'high':
      return levels; // +1 per level
    case 'medium':
      return Math.floor((levels * 3) / 4); // +3/4 per level
    case 'low':
      return Math.floor(levels / 2); // +1/2 per level
  }
}

/**
 * Calculate save bonus for a specific number of levels in a class
 */
export function calculateSaveForClass(levels: number, progression: SaveProgression): number {
  if (levels === 0) return 0;

  switch (progression) {
    case 'good':
      return 2 + Math.floor(levels / 2); // +2 base + 1/2 level
    case 'poor':
      return Math.floor(levels / 3); // +1/3 level
  }
}

/**
 * Calculate total BAB from all character levels
 */
export function calculateTotalBAB(levels: Level[]): CalculationBreakdown {
  const classCounts = new Map<string, number>();

  // Count levels per class
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) || 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let total = 0;

  // Calculate BAB for each class
  for (const [className, count] of classCounts.entries()) {
    const progression = findClassProgression(className);
    if (progression) {
      const bab = calculateBABForClass(count, progression.babProgression);
      components.push({
        label: `${className} (${count} level${count !== 1 ? 's' : ''})`,
        value: bab,
      });
      total += bab;
    }
  }

  return { total, components };
}

/**
 * Calculate total save bonus from all character levels for a specific save
 */
export function calculateTotalSave(
  levels: Level[],
  saveType: 'fortitude' | 'reflex' | 'will',
): CalculationBreakdown {
  const classCounts = new Map<string, number>();

  // Count levels per class
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) || 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let total = 0;

  // Calculate save for each class
  for (const [className, count] of classCounts.entries()) {
    const progression = findClassProgression(className);
    if (progression) {
      let saveProgression: SaveProgression;
      switch (saveType) {
        case 'fortitude':
          saveProgression = progression.fortitudeProgression;
          break;
        case 'reflex':
          saveProgression = progression.reflexProgression;
          break;
        case 'will':
          saveProgression = progression.willProgression;
          break;
      }

      const save = calculateSaveForClass(count, saveProgression);
      components.push({
        label: `${className} (${count} level${count !== 1 ? 's' : ''})`,
        value: save,
      });
      total += save;
    }
  }

  return { total, components };
}

/**
 * Calculate max HP from all character levels (assuming max HP per level)
 */
export function calculateMaxHP(levels: Level[], conModifier: number): CalculationBreakdown {
  const classCounts = new Map<string, number>();

  // Count levels per class
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) || 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let hpFromHitDice = 0;

  // Calculate HP from hit dice for each class
  for (const [className, count] of classCounts.entries()) {
    const progression = findClassProgression(className);
    if (progression) {
      const hp = count * progression.hitDie;
      components.push({
        label: `${className} (${count}d${progression.hitDie})`,
        value: hp,
      });
      hpFromHitDice += hp;
    }
  }

  // Add CON modifier per level
  const totalLevels = levels.length;
  const conBonus = totalLevels * conModifier;
  if (conBonus !== 0) {
    components.push({
      label: `CON modifier (${totalLevels} × ${conModifier >= 0 ? '+' : ''}${conModifier})`,
      value: conBonus,
    });
  }

  const total = hpFromHitDice + conBonus;

  return { total, components };
}
