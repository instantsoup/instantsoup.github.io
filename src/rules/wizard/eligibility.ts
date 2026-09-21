/**
 * Spell eligibility rules for wizard spellbooks and preparation.
 * All functions are pure and reference-free from React/DOM.
 */

import type { SpellbookSource } from '../../types/spellbook';
import type { EligibilityResult, Level, RulesSpell, WizardContext } from '../types';
import { effectiveWizardLevels, wizardClassLevels } from './levels';
import { isFreeSource, maxLearnableSpellLevel, minWizardLevelForSpell } from './spellbook';

/** Whether a spell belongs to a forbidden school */
export function isSpellForbidden(spell: RulesSpell, forbiddenSchools: string[]): boolean {
  return forbiddenSchools.includes(spell.school);
}

export interface LearnOptions {
  /** How the spell would be added. Free and researched spells must be of a castable level. */
  source?: SpellbookSource;
  /** Free spells left in the budget; only consulted for free sources. */
  freeRemaining?: number;
  /**
   * Allow a copied or found spell above the wizard's castable level. Ignored for
   * free and researched spells, which the rules restrict to levels the wizard can cast.
   */
  allowAboveLevelCap?: boolean;
}

/** Build the rules context for a wizard as they stood at `charLevel` (1-based, inclusive). */
export function buildWizardContext(
  levels: Level[],
  charLevel: number,
  opts: {
    intMod: number;
    specialty: string | undefined;
    forbiddenSchools: string[];
    spellbookNames: Set<string>;
  },
): WizardContext {
  const upTo = levels.slice(0, Math.max(0, charLevel));
  return {
    wizardClassLevels: wizardClassLevels(upTo),
    effectiveWizardLevels: effectiveWizardLevels(upTo),
    wizardSpecialty: opts.specialty,
    wizardForbiddenSchools: opts.forbiddenSchools,
    intMod: opts.intMod,
    spellbookNames: opts.spellbookNames,
  };
}

/** Whether a wizard can add a spell to their spellbook, and if not, why. */
export function canAddToSpellbook(
  spell: RulesSpell,
  ctx: WizardContext,
  opts: LearnOptions = {},
): EligibilityResult {
  const spellLevel = spell.levels['Sor/Wiz'];

  if (spellLevel === undefined) {
    return { eligible: false, reason: 'Not a wizard spell' };
  }
  if (isSpellForbidden(spell, ctx.wizardForbiddenSchools)) {
    return { eligible: false, reason: `${spell.school} is a forbidden school` };
  }
  if (spellLevel === 0 && ctx.wizardClassLevels > 0) {
    return { eligible: false, reason: 'Every 0-level spell is already in a wizard’s spellbook' };
  }
  if (ctx.spellbookNames.has(spell.name.toLowerCase())) {
    return { eligible: false, reason: 'Already in spellbook' };
  }
  // Only copied or found spells may be learned above the castable level (and only on request).
  const mayExceedCap =
    opts.allowAboveLevelCap === true && (opts.source === 'purchased' || opts.source === 'found');
  const cap = maxLearnableSpellLevel(ctx.effectiveWizardLevels);
  if (!mayExceedCap && spellLevel > cap) {
    return {
      eligible: false,
      reason: `Requires caster level ${minWizardLevelForSpell(spellLevel)} (current effective level ${ctx.effectiveWizardLevels})`,
    };
  }
  if (opts.source !== undefined && isFreeSource(opts.source) && (opts.freeRemaining ?? 0) <= 0) {
    return { eligible: false, reason: 'No free spells left — copy or research it instead' };
  }

  return { eligible: true };
}

/**
 * Filter a list of spells to only those a wizard can add to their spellbook.
 * `showAllLevels` bypasses the caster-level cap (for "Load entire list" UI).
 */
export function getLearnableSpells(
  allSpells: RulesSpell[],
  ctx: WizardContext,
  opts: {
    showAllLevels?: boolean;
    search?: string;
    levelFilter?: string;
    schoolFilter?: string;
  } = {},
): RulesSpell[] {
  const cap = opts.showAllLevels ? 9 : maxLearnableSpellLevel(ctx.effectiveWizardLevels);
  const q = opts.search?.toLowerCase() ?? '';

  return allSpells.filter((spell) => {
    const spellLevel = spell.levels['Sor/Wiz'];
    if (spellLevel === undefined) return false;
    if (isSpellForbidden(spell, ctx.wizardForbiddenSchools)) return false;
    if (spellLevel === 0 && ctx.wizardClassLevels > 0) return false; // all cantrips are in the book
    if (spellLevel > cap) return false;
    if (opts.levelFilter && String(spellLevel) !== opts.levelFilter) return false;
    if (opts.schoolFilter && spell.school !== opts.schoolFilter) return false;
    if (q && !spell.name.toLowerCase().includes(q)) return false;
    if (ctx.spellbookNames.has(spell.name.toLowerCase())) return false;
    return true;
  });
}

/**
 * Filter spellbook entries for preparation at a given spell level,
 * excluding forbidden schools.
 */
export function getPreparableSpells(
  spellbookEntries: Array<{ spellName: string; school: string }>,
  forbiddenSchools: string[],
): Array<{ spellName: string; school: string }> {
  return spellbookEntries.filter((entry) => !forbiddenSchools.includes(entry.school));
}
