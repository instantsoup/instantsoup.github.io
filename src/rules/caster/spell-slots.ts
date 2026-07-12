import { findClassProgression } from '../../data/class-progressions';
import type { Level, Scores } from '../types';
import { buildEffectiveLevels } from './effective-levels';

/**
 * Bonus spell slots granted by a high casting stat (PHB Table 1-1).
 * Cantrips (spell level 0) never receive bonus slots.
 * For spell levels 1+: bonus = floor((mod - spellLevel) / 4) + 1, when mod ≥ spellLevel.
 */
export function bonusSlotsForMod(mod: number, spellLevel: number): number {
  if (spellLevel === 0 || mod < spellLevel) return 0;
  return Math.floor((mod - spellLevel) / 4) + 1;
}

/**
 * Calculate maximum spell slots per day for a character.
 *
 * Returns a record keyed by spell level string ('0'..'9') with the total
 * slots (base + ability bonus + domain bonus for Clerics) across all
 * casting classes, folding prestige-class advancement into the base class.
 *
 * Only accessible spell levels (base ≥ 0) are included.
 */
export function calculateSpellSlots(levels: Level[], scores: Scores): Record<string, number> {
  const effectiveCounts = buildEffectiveLevels(levels);
  const totals: Record<string, number> = {};

  for (const [className, count] of effectiveCounts) {
    const prog = findClassProgression(className);
    if (!prog?.spellSlotsPerDay || !prog.spellcastingAbility) continue;

    const rowSlots = prog.spellSlotsPerDay[Math.min(count, 20) - 1];
    const abilityScore = scores[prog.spellcastingAbility as keyof Scores] ?? 10;
    const abMod = Math.floor((abilityScore - 10) / 2);

    for (let sl = 0; sl <= 9; sl++) {
      const base = rowSlots[sl];
      if (base === -1) continue;
      const bonus = bonusSlotsForMod(abMod, sl);
      const domainBonus = prog.hasDomains && sl >= 1 ? 1 : 0;
      const key = String(sl);
      totals[key] = (totals[key] ?? 0) + base + bonus + domainBonus;
    }
  }

  return totals;
}

/**
 * Spell slots with specialist wizard bonus (+1 per accessible spell level).
 * Pass `specialty = undefined` to get unmodified slots.
 */
export function calculateEffectiveSlots(
  levels: Level[],
  scores: Scores,
  specialty: string | undefined,
): Record<string, number> {
  const base = calculateSpellSlots(levels, scores);
  if (!specialty) return base;
  return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v + 1]));
}
