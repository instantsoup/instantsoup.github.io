import { findClassProgression } from '../../data/class-progressions';
import type { Level } from '../types';

/**
 * Raw Wizard class levels only.
 * Used for the free-spell-slot budget, which is a Wizard class feature
 * NOT granted by prestige class advancement.
 */
export function wizardClassLevels(levels: Level[]): number {
  return levels.filter((l) => l.class === 'Wizard').length;
}

/**
 * Effective wizard caster level: Wizard class levels + levels in any class
 * whose `advancesSpellcastingOf` is "Wizard" (e.g. Tainted Scholar).
 */
export function effectiveWizardLevels(levels: Level[]): number {
  return levels.reduce((total, l) => {
    if (l.class === 'Wizard') return total + 1;
    const prog = findClassProgression(l.class);
    return prog?.advancesSpellcastingOf === 'Wizard' ? total + 1 : total;
  }, 0);
}

/**
 * Returns true if the character uses wizard spellcasting mechanics
 * (has Wizard levels OR levels in a class that advances Wizard casting).
 */
export function isWizardCharacter(levels: Level[]): boolean {
  return effectiveWizardLevels(levels) > 0;
}
