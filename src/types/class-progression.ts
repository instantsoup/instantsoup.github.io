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
});

export type ClassProgression = z.infer<typeof ClassProgressionSchema>;

export const ClassProgressionsFileSchema = z.array(ClassProgressionSchema);
