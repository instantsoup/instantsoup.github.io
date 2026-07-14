import { findClassProgression } from '../../data/class-progressions';
import type { Level } from '../types';

/**
 * Builds a map of effective class levels for all spellcasting classes.
 *
 * Prestige classes with `advancesSpellcastingOf` contribute their levels to
 * the named base class (e.g. Tainted Scholar → Wizard), so a Wizard 5 /
 * Tainted Scholar 3 character has an effective wizard caster level of 8.
 *
 * The prestige class itself does NOT get an entry in the map — only the base
 * casting class it advances does.
 */
export function buildEffectiveLevels(levels: Level[]): Map<string, number> {
  const raw = new Map<string, number>();
  for (const level of levels) {
    raw.set(level.class, (raw.get(level.class) ?? 0) + 1);
  }
  const effective = new Map<string, number>(raw);
  for (const [cls, count] of raw) {
    const prog = findClassProgression(cls);
    if (prog?.advancesSpellcastingOf) {
      const target = prog.advancesSpellcastingOf;
      effective.set(target, (effective.get(target) ?? 0) + count);
    }
  }
  return effective;
}

/**
 * Returns the effective caster level for a specific class name,
 * accounting for prestige class advancement.
 * Returns 0 if the character has no levels that advance that class.
 */
export function effectiveCasterLevel(levels: Level[], forClass: string): number {
  return buildEffectiveLevels(levels).get(forClass) ?? 0;
}

/**
 * The name of the class that `prestigeClass` advances spellcasting for,
 * or null if it doesn't advance any class.
 */
export function advancesSpellcastingOf(prestigeClass: string): string | null {
  return findClassProgression(prestigeClass)?.advancesSpellcastingOf ?? null;
}
