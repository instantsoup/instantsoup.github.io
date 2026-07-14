/**
 * Spell eligibility rules for wizard spellbooks and preparation.
 * All functions are pure and reference-free from React/DOM.
 */

import type { EligibilityResult, RulesSpell, WizardContext } from '../types';
import { maxLearnableSpellLevel } from './spellbook';

/** Whether a spell belongs to a forbidden school */
export function isSpellForbidden(spell: RulesSpell, forbiddenSchools: string[]): boolean {
  return forbiddenSchools.includes(spell.school);
}

/** Whether a wizard can add a spell to their spellbook */
export function canAddToSpellbook(spell: RulesSpell, ctx: WizardContext): EligibilityResult {
  const spellLevel = spell.levels['Sor/Wiz'];

  if (spellLevel === undefined) {
    return { eligible: false, reason: 'Not a wizard spell' };
  }
  if (isSpellForbidden(spell, ctx.wizardForbiddenSchools)) {
    return { eligible: false, reason: `${spell.school} is a forbidden school` };
  }
  const cap = maxLearnableSpellLevel(ctx.effectiveWizardLevels);
  if (spellLevel > cap) {
    return {
      eligible: false,
      reason: `Requires caster level ${spellLevel * 2} (current effective level ${ctx.effectiveWizardLevels})`,
    };
  }
  if (ctx.spellbookNames.has(spell.name.toLowerCase())) {
    return { eligible: false, reason: 'Already in spellbook' };
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
