// src/types/rulebook.ts
//
// Shared schema for rulebook JSON files produced by scripts/ingest-rulebook.mts
// and consumed by src/data/rulebook-loader.ts. Importing this same module from
// both the ingest script and the app is what keeps the two in sync: previously
// the script maintained its own copy of these shapes and drifted from the
// app's real types (see docs/plans/rules-engine-migration-plan.md, Phase 5).
import { z } from 'zod';

// Explicit .ts extensions: this module is imported directly by Node (via
// scripts/ingest-rulebook.mts) as well as bundled by Vite, and Node's ESM
// resolver (unlike Vite's) requires a full relative specifier.
import { ClassProgressionSchema } from './class-progression.ts';
import { SpellSchema } from './spell.ts';

/**
 * Chunk-level spell extraction shape used only during ingestion. The model
 * doesn't know the book's source abbreviation (the script injects that
 * afterward from --abbr), so `page` is a bare nullable number here instead
 * of the full `{ abbr, page }` object the app's SpellSchema requires.
 *
 * SpellSchema's descriptive-text fields (components, castingTime, range,
 * duration, savingThrow, spellResistance, description) are required,
 * non-empty-optional strings there, but extraction from real rulebook text
 * sometimes misses one - default those to '' here rather than dropping the
 * whole spell for one missing field.
 */
export const IngestedSpellSchema = SpellSchema.omit({ source: true }).extend({
  page: z.number().int().positive().nullable().optional().default(null),
  components: z.string().optional().default(''),
  castingTime: z.string().optional().default(''),
  range: z.string().optional().default(''),
  duration: z.string().optional().default(''),
  savingThrow: z.string().optional().default(''),
  spellResistance: z.string().optional().default(''),
  description: z.string().optional().default(''),
});
export type IngestedSpell = z.infer<typeof IngestedSpellSchema>;

export const RulebookFeatSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional().default(''),
  prerequisites: z.string().optional().default(''),
  benefit: z.string().optional().default(''),
  special: z.string().optional().default(''),
});
export type RulebookFeat = z.infer<typeof RulebookFeatSchema>;

export const RulebookRaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  abilityMods: z.record(z.string(), z.number()).optional().default({}),
  size: z.string().optional().default(''),
  speed: z.number().optional(),
  racialTraits: z.array(z.string()).optional().default([]),
});
export type RulebookRace = z.infer<typeof RulebookRaceSchema>;

export const RulebookItemSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional().default(''),
  cost: z.string().optional().default(''),
  weight: z.number().optional(),
  description: z.string().optional().default(''),
  properties: z.string().optional().default(''),
});
export type RulebookItem = z.infer<typeof RulebookItemSchema>;

/**
 * Shape of a single ingest chunk's extraction result, before the script
 * assembles the final book-level output (adds name/abbreviation/slug/
 * pageCount/extractedAt, and turns each spell's bare `page` into a full
 * `source` object).
 */
export const ChunkResultSchema = z.object({
  spells: z.array(IngestedSpellSchema).default([]),
  classes: z.array(ClassProgressionSchema).default([]),
  feats: z.array(RulebookFeatSchema).default([]),
  races: z.array(RulebookRaceSchema).default([]),
  items: z.array(RulebookItemSchema).default([]),
});
export type ChunkResult = z.infer<typeof ChunkResultSchema>;

/**
 * Full shape of a rulebook JSON file in src/data/rulebooks/*.json.
 * Spells must fully conform to the app's real Spell type (SpellSchema) -
 * the app's UI is the contract, not the ingestion script's convenience.
 * Classes conform to the rules engine's ClassProgressionSchema, which
 * already exposes every data-driven rule-extension field a new class needs
 * (advancesSpellcastingOf, hasDomains, spellListKey) - no rules-code changes
 * are needed to add a new class through ingestion.
 */
export const RulebookFileSchema = z.object({
  name: z.string().min(1),
  abbreviation: z.string().min(1),
  slug: z.string().min(1),
  pageCount: z.number().int().positive().optional(),
  extractedAt: z.string().optional(),
  spells: z.array(SpellSchema).default([]),
  classes: z.array(ClassProgressionSchema).default([]),
  feats: z.array(RulebookFeatSchema).default([]),
  races: z.array(RulebookRaceSchema).default([]),
  items: z.array(RulebookItemSchema).default([]),
  /**
   * 1-based indices of text chunks the ingest script couldn't extract after
   * retrying (unparseable model output, or still too large after a
   * max_tokens split-and-retry). Absent/empty means full coverage. Purely
   * informational for the operator - the app doesn't read this field.
   */
  discardedChunks: z.array(z.number().int().positive()).optional().default([]),
});
export type RulebookFile = z.infer<typeof RulebookFileSchema>;
