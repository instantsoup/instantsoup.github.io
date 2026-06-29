/**
 * Loads all extracted rulebook JSON files from src/data/rulebooks/
 * and merges their content into the app's data layer.
 *
 * Each JSON file is produced by scripts/ingest-rulebook.mjs.
 * The app keeps SRD data separate from supplement data for attribution.
 */

import type { Spell } from '../types/spell';

// Vite glob import — picks up all .json files in the rulebooks directory at build time.
// When the directory is empty this returns {}.
const rulebookModules = import.meta.glob('./rulebooks/*.json', {
  eager: true,
}) as Record<string, { default: RulebookFile }>;

export interface RulebookFile {
  name: string;
  abbreviation: string;
  slug: string;
  pageCount?: number;
  extractedAt?: string;
  spells?: Partial<Spell>[];
  classes?: RulebookClass[];
  feats?: RulebookFeat[];
  races?: RulebookRace[];
  items?: RulebookItem[];
}

export interface RulebookClass {
  name: string;
  description?: string;
  hitDie?: number;
  babProgression?: string;
  fortitudeProgression?: string;
  reflexProgression?: string;
  willProgression?: string;
  skillPointsPerLevel?: number;
  spellcastingAbility?: string | null;
  castingType?: string | null;
  advancesClass?: string | null;
  classSkills?: string[];
  spellSlotsPerDay?: number[][] | null;
}

export interface RulebookFeat {
  name: string;
  type?: string;
  prerequisites?: string;
  benefit?: string;
  special?: string;
  source?: string;
}

export interface RulebookRace {
  name: string;
  description?: string;
  abilityMods?: Record<string, number>;
  size?: string;
  speed?: number;
  racialTraits?: string[];
  source?: string;
}

export interface RulebookItem {
  name: string;
  type?: string;
  cost?: string;
  weight?: number;
  description?: string;
  properties?: string;
  source?: string;
}

// ── Load all rulebooks ────────────────────────────────────────────────────────

export const loadedRulebooks: RulebookFile[] = Object.values(rulebookModules).map(
  (mod) => mod.default,
);

// ── Merged collections (supplement data, tagged with source abbreviation) ─────

export const rulebookSpells: Array<Partial<Spell> & { sourceAbbr: string }> =
  loadedRulebooks.flatMap((book) =>
    (book.spells ?? []).map((spell) => ({ ...spell, sourceAbbr: book.abbreviation })),
  );

export const rulebookClasses: Array<RulebookClass & { sourceAbbr: string }> =
  loadedRulebooks.flatMap((book) =>
    (book.classes ?? []).map((cls) => ({ ...cls, sourceAbbr: book.abbreviation })),
  );

export const rulebookFeats: Array<RulebookFeat & { sourceAbbr: string }> =
  loadedRulebooks.flatMap((book) =>
    (book.feats ?? []).map((feat) => ({ ...feat, source: book.abbreviation, sourceAbbr: book.abbreviation })),
  );

export const rulebookRaces: Array<RulebookRace & { sourceAbbr: string }> =
  loadedRulebooks.flatMap((book) =>
    (book.races ?? []).map((race) => ({ ...race, source: book.abbreviation, sourceAbbr: book.abbreviation })),
  );

export const rulebookItems: Array<RulebookItem & { sourceAbbr: string }> =
  loadedRulebooks.flatMap((book) =>
    (book.items ?? []).map((item) => ({ ...item, source: book.abbreviation, sourceAbbr: book.abbreviation })),
  );

/**
 * Find a spell by name across both SRD and all loaded rulebooks.
 * Returns the first match; SRD spells are checked first by callers who
 * import findSpell from data/spells.ts (which calls this for fallback).
 */
export function findRulebookSpell(
  name: string,
): (Partial<Spell> & { sourceAbbr: string }) | undefined {
  const needle = name.trim().toLowerCase();
  return rulebookSpells.find((s) => s.name?.toLowerCase() === needle);
}

/**
 * Returns all loaded rulebook names and abbreviations — useful for UI attribution.
 */
export function getLoadedRulebookSummary(): { name: string; abbreviation: string; counts: Record<string, number> }[] {
  return loadedRulebooks.map((book) => ({
    name: book.name,
    abbreviation: book.abbreviation,
    counts: {
      spells: book.spells?.length ?? 0,
      classes: book.classes?.length ?? 0,
      feats: book.feats?.length ?? 0,
      races: book.races?.length ?? 0,
      items: book.items?.length ?? 0,
    },
  }));
}
