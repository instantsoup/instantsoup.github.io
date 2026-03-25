import { z } from 'zod';

import { ALIGNMENT_CODES } from '../data/alignments';
import { CLASS_NAMES } from '../data/classes';
import { RACE_NAMES } from '../data/races';
import { LevelsArraySchema } from '../types/level';

export const VERSION = 2;

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
  currentHP: z.number().int().optional(),
  maxHP: z.number().int().min(0).optional(),
  tempHP: z.number().int().min(0).optional(),
  armorBonus: z.number().int().optional(),
  shieldBonus: z.number().int().optional(),
  miscACBonus: z.number().int().optional(),
  spellResistance: z.number().int().min(0).optional(),
  initiativeBonus: z.number().int().optional(),
  baseAttackBonus: z.number().int().optional(),
  spellSlotsMax: z.record(z.string(), z.number().int().min(0)).optional().default({}),
  spellSlotsUsed: z.record(z.string(), z.number().int().min(0)).optional().default({}),
});

export type CombatStats = z.infer<typeof CombatStatsSchema>;

export const TaintSchema = z.object({
  depravity: z.number().int().min(0).max(9).optional().default(0),
  corruption: z.number().int().min(0).max(9).optional().default(0),
});

export type Taint = z.infer<typeof TaintSchema>;

export const CustomResourceSchema = z.object({
  name: z.string().min(1),
  max: z.number().int().min(0),
  used: z.number().int().min(0),
});

export type CustomResource = z.infer<typeof CustomResourceSchema>;

export const CharacterSchema = z.object({
  version: z.literal(2),
  name: z.string().min(0),
  scores: ScoresSchema,
  race: RaceNameSchema.optional(),
  levels: LevelsArraySchema.optional().default([]),
  alignment: AlignmentCodeSchema.optional(),
  saveBonuses: SaveBonusesSchema.optional().default({}),
  combatStats: CombatStatsSchema.optional().default({}),
  flaws: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  taint: TaintSchema.optional(),
  customResources: z.array(CustomResourceSchema).optional().default([]),
  notes: z.string().optional(),
});

export type Character = z.infer<typeof CharacterSchema>;
