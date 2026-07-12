// src/types/class-progression.ts
import { z } from 'zod';

/**
 * BAB Progression types in D&D 3.5e
 * - high: +1 per level (Fighter, Barbarian, Paladin, Ranger)
 * - medium: +3/4 per level (Bard, Cleric, Druid, Monk, Rogue)
 * - low: +1/2 per level (Sorcerer, Wizard)
 */
export const BABProgressionSchema = z.enum(['high', 'medium', 'low']);
export type BABProgression = z.infer<typeof BABProgressionSchema>;

/**
 * Save Progression types in D&D 3.5e
 * - good: +2 base + 1/2 level
 * - poor: +0 base + 1/3 level
 */
export const SaveProgressionSchema = z.enum(['good', 'poor']);
export type SaveProgression = z.infer<typeof SaveProgressionSchema>;

/**
 * Schema for class progression data
 */
export const ClassProgressionSchema = z.object({
  name: z.string().min(1),
  hitDie: z.number().int().min(1).max(20),
  babProgression: BABProgressionSchema,
  fortitudeProgression: SaveProgressionSchema,
  reflexProgression: SaveProgressionSchema,
  willProgression: SaveProgressionSchema,
  skillPointsPerLevel: z.number().int().min(1).max(10),
  spellcastingAbility: z
    .enum(['str', 'dex', 'con', 'int', 'wis', 'cha'])
    .nullable()
    .optional()
    .default(null),
  castingType: z.enum(['prepared', 'spontaneous']).nullable().optional().default(null),
  /**
   * 20×10 matrix of base spells per day.
   * Outer index = class level - 1 (0..19).
   * Inner index = spell level (0..9).
   * -1 = inaccessible at this class level; 0 = accessible, 0 base slots (bonus slots may apply).
   */
  spellSlotsPerDay: z
    .array(z.array(z.number().int().min(-1)))
    .length(20)
    .nullable()
    .optional()
    .default(null),
  /** Key used to look up spells in spell data levels record (e.g., 'Clr', 'Sor/Wiz'). */
  spellListKey: z.string().nullable().optional().default(null),
  /** Whether this class gets an extra domain spell slot per accessible spell level 1-9 (Cleric). */
  hasDomains: z.boolean().optional().default(false),
  /**
   * Name of the spellcasting class this class advances (e.g. "Wizard" for Tainted Scholar).
   * Each level in this class counts as a level in the named class for spell slots and caster level.
   */
  advancesSpellcastingOf: z.string().nullable().optional().default(null),
});

export type ClassProgression = z.infer<typeof ClassProgressionSchema>;

export const ClassProgressionsFileSchema = z.array(ClassProgressionSchema);
