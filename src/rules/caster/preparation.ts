/**
 * Daily spell preparation rules — how many slots a level offers, which spells are
 * candidates (a wizard's spellbook, or a divine caster's class list), and whether a
 * given spell may take another slot.  No React.  No DOM.
 */

import type { EligibilityResult, RulesSpell } from '../types';
import type { SpellbookItem } from '../wizard/spellbook';

/** A spell that could be prepared in a slot of some level. */
export interface PrepCandidate {
  name: string;
  school: string;
  description?: string;
}

/**
 * Slots available at one spell level: a manual override (Build → Spell Slots) wins,
 * otherwise the value calculated from class, level and ability score.
 */
export function slotMax(
  spellLevel: string,
  manual: Record<string, number> | undefined,
  calculated: Record<string, number>,
): number {
  return manual?.[spellLevel] ?? calculated[spellLevel] ?? 0;
}

/** Slots per spell level ('0'..'9') after applying any manual override. */
export function resolveSlotMaximums(
  manual: Record<string, number> | undefined,
  calculated: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const lvl of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) {
    result[lvl] = slotMax(lvl, manual, calculated);
  }
  return result;
}

/** Prepared-spell candidates for a class that picks from its whole list (Cleric, Druid, …). */
export function classListCandidates(
  allSpells: RulesSpell[],
  spellListKey: string,
): Record<string, PrepCandidate[]> {
  const byLevel: Record<string, PrepCandidate[]> = {};
  for (const spell of allSpells) {
    const lvl = spell.levels[spellListKey];
    if (lvl === undefined) continue;
    (byLevel[String(lvl)] ??= []).push({
      name: spell.name,
      school: spell.school,
      description: spell.description ?? undefined,
    });
  }
  for (const list of Object.values(byLevel)) list.sort((a, b) => a.name.localeCompare(b.name));
  return byLevel;
}

/** Prepared-spell candidates for a wizard: the spellbook, minus forbidden schools. */
export function spellbookCandidates(items: SpellbookItem[]): Record<string, PrepCandidate[]> {
  const byLevel: Record<string, PrepCandidate[]> = {};
  for (const item of items) {
    if (item.forbidden) continue;
    (byLevel[String(item.level)] ??= []).push({
      name: item.name,
      school: item.school,
      description: item.description ?? undefined,
    });
  }
  return byLevel;
}

export interface PrepareContext {
  /** Slots at this spell level (including the specialist bonus slot, if any). */
  max: number;
  /** Schools of the spells already prepared at this level. */
  preparedSchools: string[];
  /** Wizard specialty school, if any. */
  specialty?: string;
  forbiddenSchools: string[];
}

/**
 * Whether one more spell of `school` may be prepared at this level.
 * A specialist's bonus slot per level must hold a specialty-school spell, so other
 * schools can never fill the last slot.
 */
export function canPrepareSpell(school: string, ctx: PrepareContext): EligibilityResult {
  if (ctx.forbiddenSchools.includes(school)) {
    return { eligible: false, reason: `${school} is a forbidden school` };
  }
  if (ctx.preparedSchools.length >= ctx.max) {
    return { eligible: false, reason: 'No slots left at this level' };
  }
  if (ctx.specialty !== undefined && school !== ctx.specialty) {
    const others = ctx.preparedSchools.filter((s) => s !== ctx.specialty).length;
    if (others >= ctx.max - 1) {
      return {
        eligible: false,
        reason: `The last slot is reserved for a ${ctx.specialty} spell`,
      };
    }
  }
  return { eligible: true };
}
