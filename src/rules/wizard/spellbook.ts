/**
 * Wizard spellbook mechanics — free slot budget, learnable level cap,
 * and acquisition costs.  No React.  No DOM.
 */

/**
 * Free spell slot budget for a wizard's spellbook.
 * Level 1: 3 + INT modifier starting 1st-level spells.
 * Each additional level: 2 free spells.
 * This is a Wizard CLASS FEATURE — count raw Wizard levels, not effective caster level.
 */
export function freeSpellbookSlots(wizardClassLevels: number, intMod: number): number {
  if (wizardClassLevels === 0) return 0;
  return 3 + Math.max(0, intMod) + Math.max(0, wizardClassLevels - 1) * 2;
}

/**
 * Maximum spell level a wizard of this EFFECTIVE caster level can add to their spellbook.
 * Formula: ceil(effectiveWizardLevel / 2), capped at 9.
 */
export function maxLearnableSpellLevel(effectiveWizardLevel: number): number {
  if (effectiveWizardLevel === 0) return 0;
  return Math.min(Math.ceil(effectiveWizardLevel / 2), 9);
}

/**
 * Maximum spell level a wizard can cast (same formula as learnable, but
 * named separately to make intent clear at call sites).
 */
export function maxCastableSpellLevel(effectiveWizardLevel: number): number {
  return maxLearnableSpellLevel(effectiveWizardLevel);
}

/**
 * GP cost to copy a spell into the spellbook (100 gp/spell level, min 100 gp).
 */
export function copySpellCost(spellLevel: number): number {
  return 100 * Math.max(1, spellLevel);
}

/**
 * GP cost to research a new spell (1,000 gp/spell level, min 1,000 gp).
 */
export function researchSpellCost(spellLevel: number): number {
  return 1000 * Math.max(1, spellLevel);
}
