import { findClassProgression } from '../../data/class-progressions';
import type { Level, Scores } from '../types';
import { buildEffectiveLevels } from './effective-levels';

export interface CasterEntry {
  className: string;
  casterLevel: number;
  castingAbility: string;
  castingMod: number;
  castingType: 'prepared' | 'spontaneous';
}

/**
 * Returns all casting classes the character has levels in, with their
 * effective caster level, casting ability, and modifier.
 * Prestige-class levels are folded into the base class they advance.
 */
export function getCasterSummary(levels: Level[], scores: Scores): CasterEntry[] {
  const effectiveCounts = buildEffectiveLevels(levels);
  const result: CasterEntry[] = [];

  for (const [className, count] of effectiveCounts) {
    const prog = findClassProgression(className);
    if (!prog?.castingType || !prog.spellcastingAbility) continue;

    const abilityScore = scores[prog.spellcastingAbility as keyof Scores] ?? 10;
    const castingMod = Math.floor((abilityScore - 10) / 2);

    result.push({
      className,
      casterLevel: count,
      castingAbility: prog.spellcastingAbility,
      castingMod,
      castingType: prog.castingType,
    });
  }

  return result;
}

/** Returns true if the character has at least one casting class */
export function isCaster(levels: Level[]): boolean {
  return levels.some((l) => {
    const prog = findClassProgression(l.class);
    return prog?.castingType != null || prog?.advancesSpellcastingOf != null;
  });
}

/** Primary casting ability key for the character's dominant casting class, or null */
export function getPrimarySpellcastingAbility(levels: Level[]): string | null {
  const classCounts = new Map<string, number>();
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) ?? 0) + 1);
  }
  let best: { ability: string; count: number } | null = null;
  for (const [className, count] of classCounts) {
    const prog = findClassProgression(className);
    if (prog?.spellcastingAbility) {
      if (!best || count > best.count) {
        best = { ability: prog.spellcastingAbility, count };
      }
    }
  }
  return best?.ability ?? null;
}

/** Spell save DC: 10 + spell level + casting stat modifier */
export function spellDC(spellLevel: number, castingAbilityMod: number): number {
  return 10 + spellLevel + castingAbilityMod;
}
