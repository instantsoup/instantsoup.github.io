import { z } from 'zod';

import { ALIGNMENT_CODES } from '../data/alignments';
import { RACE_NAMES } from '../data/races';

export const VERSION = 1;

export const ScoresSchema = z.object({
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
});

export const SkillRanksSchema = z.record(z.string(), z.number().int().min(0).max(99));

export const SaveBonusesSchema = z.record(z.string(), z.number().int().min(0).max(99));

// Derive alignment codes from data layer
export const AlignmentCodeSchema = z.enum(ALIGNMENT_CODES);

export type AlignmentCode = z.infer<typeof AlignmentCodeSchema>;

// Derive race names from data layer
export const RaceNameSchema = z.enum(RACE_NAMES);

export type RaceName = z.infer<typeof RaceNameSchema>;

export const CharacterSchemaV1 = z.object({
  version: z.literal(1),
  name: z.string().min(0),
  scores: ScoresSchema,
  race: RaceNameSchema.optional(),
  alignment: AlignmentCodeSchema.optional(),
  skillRanks: SkillRanksSchema.optional().default({}),
  saveBonuses: SaveBonusesSchema.optional().default({}),
  notes: z.string().optional(),
});

export type CharacterV1 = z.infer<typeof CharacterSchemaV1>;

export function migrateToLatest(input: unknown): CharacterV1 {
  const parsed = CharacterSchemaV1.safeParse(input);
  if (parsed.success) return parsed.data;
  throw new Error('Invalid character file: schema mismatch or unsupported version.');
}
