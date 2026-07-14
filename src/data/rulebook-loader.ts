/// <reference types="vite/client" />
/**
 * Loads all extracted rulebook JSON files from src/data/rulebooks/
 * and merges their content into the app's data layer.
 *
 * Each JSON file is produced by scripts/ingest-rulebook.mts and validated
 * here against the same RulebookFileSchema the script itself validates
 * against before writing - a malformed file is skipped (logged, not thrown)
 * rather than blindly merged into the app's data.
 */

import type { ClassProgression } from '../types/class-progression';
import { type RulebookFile, RulebookFileSchema } from '../types/rulebook';
import type { Spell } from '../types/spell';

// Vite glob import — picks up all .json files in the rulebooks directory at build time.
// When the directory is empty this returns {}.
const rulebookModules = import.meta.glob('./rulebooks/*.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

/**
 * Validates each raw module's default export against RulebookFileSchema.
 * A malformed file is logged and skipped, never blindly merged into the
 * app's data. Exported (pure, no Vite glob dependency) for unit testing.
 */
export function parseRulebookModules(
  modules: Record<string, { default: unknown }>,
): RulebookFile[] {
  return Object.entries(modules).flatMap(([path, mod]) => {
    const result = RulebookFileSchema.safeParse(mod.default);
    if (!result.success) {
      console.error(`Skipping malformed rulebook file "${path}":`, result.error.issues);
      return [];
    }
    return [result.data];
  });
}

// ── Load and validate all rulebooks ────────────────────────────────────────

export const loadedRulebooks: RulebookFile[] = parseRulebookModules(rulebookModules);

// ── Merged collections (supplement data, tagged with source abbreviation) ─────

export const rulebookSpells: Array<Spell & { sourceAbbr: string }> = loadedRulebooks.flatMap(
  (book) => book.spells.map((spell) => ({ ...spell, sourceAbbr: book.abbreviation })),
);

export const rulebookClasses: Array<ClassProgression & { sourceAbbr: string }> =
  loadedRulebooks.flatMap((book) =>
    book.classes.map((cls) => ({ ...cls, sourceAbbr: book.abbreviation })),
  );

/**
 * Find a spell by name across both SRD and all loaded rulebooks.
 * Returns the first match; SRD spells are checked first by callers who
 * import findSpell from data/spells.ts (which calls this for fallback).
 */
export function findRulebookSpell(name: string): (Spell & { sourceAbbr: string }) | undefined {
  const needle = name.trim().toLowerCase();
  return rulebookSpells.find((s) => s.name.toLowerCase() === needle);
}

/**
 * Returns all loaded rulebook names and abbreviations — useful for UI attribution.
 */
export function getLoadedRulebookSummary(): {
  name: string;
  abbreviation: string;
  counts: Record<string, number>;
}[] {
  return loadedRulebooks.map((book) => ({
    name: book.name,
    abbreviation: book.abbreviation,
    counts: {
      spells: book.spells.length,
      classes: book.classes.length,
      feats: book.feats.length,
      races: book.races.length,
      items: book.items.length,
    },
  }));
}
