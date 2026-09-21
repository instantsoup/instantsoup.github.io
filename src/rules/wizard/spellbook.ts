/**
 * Wizard spellbook mechanics — free spell budget, learnable level cap,
 * acquisition costs (gold + time), and the derived contents of the book.
 * No React.  No DOM.
 */

import type { SpellbookEntry, SpellbookSource } from '../../types/spellbook';
import type { RulesSpell } from '../types';

// ── Free spells ─────────────────────────────────────────────────────────────

/**
 * Free spells granted by reaching a given Wizard CLASS level.
 * Level 1: 3 starting 1st-level spells + 1 per point of INT bonus.
 * Every later level: 2 spells of any level the wizard can cast.
 * (All 0-level spells are in a wizard's book automatically — see getSpellbookItems.)
 */
export function freeSpellsAtWizardLevel(wizardClassLevel: number, intMod: number): number {
  if (wizardClassLevel <= 0) return 0;
  return wizardClassLevel === 1 ? 3 + Math.max(0, intMod) : 2;
}

/**
 * Total free spell budget for a wizard's spellbook.
 * This is a Wizard CLASS FEATURE — count raw Wizard levels, not effective caster level.
 */
export function freeSpellbookSlots(wizardClassLevels: number, intMod: number): number {
  if (wizardClassLevels === 0) return 0;
  return 3 + Math.max(0, intMod) + Math.max(0, wizardClassLevels - 1) * 2;
}

/** Whether a spell source consumes the free (level-up) budget. */
export function isFreeSource(source: SpellbookSource): boolean {
  return source === 'starting' || source === 'free-levelup';
}

/**
 * The free-spell source that applies when learning at a given wizard class level
 * (the level-1 batch is the "starting" spellbook).
 */
export function freeSourceForWizardLevel(wizardClassLevel: number): SpellbookSource {
  return wizardClassLevel <= 1 ? 'starting' : 'free-levelup';
}

// ── Level requirements ──────────────────────────────────────────────────────

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

/** Lowest wizard caster level at which a spell of this level can be cast (1st → 1, 2nd → 3, …). */
export function minWizardLevelForSpell(spellLevel: number): number {
  return Math.max(1, spellLevel * 2 - 1);
}

// ── Costs ───────────────────────────────────────────────────────────────────

/** Hours spent studying a foreign spell before it can be copied. */
export const COPY_STUDY_HOURS = 8;
/** Hours spent scribing an understood spell into the book (regardless of spell level). */
export const COPY_SCRIBE_HOURS = 24;
/** Rare inks/materials per page. A spell takes one page per spell level; 0-level takes one. */
export const GP_PER_PAGE = 100;
/** Typical fee for borrowing another living wizard's spellbook, per spell level. */
export const BORROW_FEE_PER_LEVEL = 50;
/** Independent research: gold per spell level (minimum one level's worth). */
export const RESEARCH_GP_PER_LEVEL = 1000;
/** Independent research: days per spell level (minimum one level's worth). */
export const RESEARCH_DAYS_PER_LEVEL = 7;

/** Base Spellcraft DC to understand a spell being copied (15 + spell level). */
export function copySpellcraftDC(spellLevel: number): number {
  return 15 + spellLevel;
}

/** Spellcraft DC to decipher unfamiliar arcane writing (20 + spell level) — Read Magic skips it. */
export function decipherSpellcraftDC(spellLevel: number): number {
  return 20 + spellLevel;
}

/** Specialists get +2 on the copy check for spells of their own school. */
export function specialistCopyBonus(school: string, specialty: string | undefined): number {
  return specialty !== undefined && school === specialty ? 2 : 0;
}

/**
 * GP cost to copy a spell into the spellbook (100 gp per page; one page per spell
 * level, minimum one page). Copying from a living wizard's book adds a borrowing fee.
 */
export function copySpellCost(spellLevel: number, borrowed = false): number {
  const materials = GP_PER_PAGE * Math.max(1, spellLevel);
  return materials + (borrowed ? BORROW_FEE_PER_LEVEL * spellLevel : 0);
}

/** Hours to copy a spell: study it, then scribe it. Independent of spell level. */
export function copySpellHours(): number {
  return COPY_STUDY_HOURS + COPY_SCRIBE_HOURS;
}

/** GP cost to research a new spell (1,000 gp/spell level, min 1,000 gp). */
export function researchSpellCost(spellLevel: number): number {
  return RESEARCH_GP_PER_LEVEL * Math.max(1, spellLevel);
}

/** Hours to research a spell independently (a week per spell level, min one week). */
export function researchSpellHours(spellLevel: number): number {
  return RESEARCH_DAYS_PER_LEVEL * 24 * Math.max(1, spellLevel);
}

export interface AcquisitionCost {
  gold: number;
  hours: number;
}

/** Gold and time it takes to add one spell of `spellLevel` by the given route. */
export function acquisitionCost(
  source: SpellbookSource,
  spellLevel: number,
  opts: { borrowed?: boolean } = {},
): AcquisitionCost {
  switch (source) {
    case 'purchased':
      return { gold: copySpellCost(spellLevel, opts.borrowed), hours: copySpellHours() };
    case 'researched':
      return { gold: researchSpellCost(spellLevel), hours: researchSpellHours(spellLevel) };
    default:
      return { gold: 0, hours: 0 };
  }
}

export interface SpellbookSummary {
  freeTotal: number;
  freeUsed: number;
  /** Negative when more free spells were claimed than the budget allows. */
  freeRemaining: number;
  counts: Record<SpellbookSource, number>;
  totalGold: number;
  totalHours: number;
}

/**
 * Roll up what a spellbook has cost so far.
 * `spellLevelOf` resolves a spell's Sor/Wiz level; unknown spells (undefined) cost nothing.
 */
export function summarizeSpellbook(
  entries: SpellbookEntry[],
  spellLevelOf: (spellName: string) => number | undefined,
  freeTotal: number,
): SpellbookSummary {
  const counts: Record<SpellbookSource, number> = {
    starting: 0,
    'free-levelup': 0,
    purchased: 0,
    researched: 0,
    found: 0,
  };
  let totalGold = 0;
  let totalHours = 0;
  for (const entry of entries) {
    counts[entry.source] += 1;
    const level = spellLevelOf(entry.spellName);
    if (level === undefined) continue;
    const cost = acquisitionCost(entry.source, level, { borrowed: entry.borrowed });
    totalGold += cost.gold;
    totalHours += cost.hours;
  }
  const freeUsed = counts.starting + counts['free-levelup'];
  return {
    freeTotal,
    freeUsed,
    freeRemaining: freeTotal - freeUsed,
    counts,
    totalGold,
    totalHours,
  };
}

// ── Contents ────────────────────────────────────────────────────────────────

/** One spell in a wizard's book, whether written by hand or included automatically. */
export interface SpellbookItem {
  name: string;
  school: string;
  /** Sor/Wiz spell level */
  level: number;
  description?: string | null;
  /** The stored entry, or undefined for the automatic starting cantrips. */
  entry?: SpellbookEntry;
  /** True when the spell's school is currently forbidden (kept visible, but not preparable). */
  forbidden: boolean;
}

/**
 * Everything in the wizard's spellbook, sorted by level, school, name.
 *
 * A wizard's book always holds every 0-level wizard spell outside their forbidden
 * schools, at no cost — those are derived here rather than stored, so changing
 * forbidden schools updates them. `includeCantrips` should be true for characters
 * with Wizard class levels.
 */
export function getSpellbookItems(
  entries: SpellbookEntry[],
  allSpells: RulesSpell[],
  forbiddenSchools: string[],
  includeCantrips: boolean,
): SpellbookItem[] {
  const byName = new Map<string, RulesSpell>();
  for (const spell of allSpells) {
    const key = spell.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, spell);
  }

  const items: SpellbookItem[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const spell = byName.get(entry.spellName.toLowerCase());
    const level = spell?.levels['Sor/Wiz'];
    if (!spell || level === undefined) continue;
    seen.add(spell.name.toLowerCase());
    items.push({
      name: spell.name,
      school: spell.school,
      level,
      description: spell.description,
      entry,
      forbidden: forbiddenSchools.includes(spell.school),
    });
  }

  if (includeCantrips) {
    for (const spell of allSpells) {
      if (spell.levels['Sor/Wiz'] !== 0) continue;
      if (forbiddenSchools.includes(spell.school)) continue;
      const key = spell.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        name: spell.name,
        school: spell.school,
        level: 0,
        description: spell.description,
        forbidden: false,
      });
    }
  }

  return items.sort(
    (a, b) => a.level - b.level || a.school.localeCompare(b.school) || a.name.localeCompare(b.name),
  );
}
