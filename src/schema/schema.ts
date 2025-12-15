import { z } from 'zod';

import { ALIGNMENT_CODES } from '../data/alignments';
import { CLASS_NAMES } from '../data/classes';
import { RACE_NAMES } from '../data/races';
import { LevelsArraySchema } from '../types/level';

export const VERSION = 1;

export const ScoresSchema = z.object({
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
});

export const SkillRanksSchema = z.record(z.string(), z.number().min(0).max(99)); // Allow decimals for 0.5 ranks

export const SaveBonusesSchema = z.record(z.string(), z.number().int().min(0).max(99));

// Derive alignment codes from data layer
export const AlignmentCodeSchema = z.enum(ALIGNMENT_CODES);

export type AlignmentCode = z.infer<typeof AlignmentCodeSchema>;

// Derive race names from data layer
export const RaceNameSchema = z.enum(RACE_NAMES);

export type RaceName = z.infer<typeof RaceNameSchema>;

// Derive class names from data layer
export const ClassNameSchema = z.enum(CLASS_NAMES);

export type ClassName = z.infer<typeof ClassNameSchema>;

export const CombatStatsSchema = z.object({
  currentHP: z.number().int().min(0).optional(),
  maxHP: z.number().int().min(0).optional(),
  armorBonus: z.number().int().optional(),
  shieldBonus: z.number().int().optional(),
  miscACBonus: z.number().int().optional(),
  spellResistance: z.number().int().min(0).optional(),
  initiativeBonus: z.number().int().optional(),
  baseAttackBonus: z.number().int().optional(),
});

export type CombatStats = z.infer<typeof CombatStatsSchema>;

export const CharacterSchema = z.object({
  version: z.literal(1),
  name: z.string().min(0),
  scores: ScoresSchema,
  race: RaceNameSchema.optional(),
  class: ClassNameSchema.optional(), // Deprecated - use levels[0].class instead
  levels: LevelsArraySchema.optional().default([]),
  alignment: AlignmentCodeSchema.optional(),
  feats: z.array(z.string()).optional().default([]), // Deprecated - use levels[].feats instead
  skillRanks: SkillRanksSchema.optional().default({}), // Deprecated - use levels[].skillRanks instead
  saveBonuses: SaveBonusesSchema.optional().default({}),
  combatStats: CombatStatsSchema.optional().default({}),
  notes: z.string().optional(),
});

export type Character = z.infer<typeof CharacterSchema>;
