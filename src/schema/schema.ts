import { z } from 'zod';

export const VERSION = 1;

export const ScoresSchema = z.object({
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
});

export const CharacterSchemaV1 = z.object({
  version: z.literal(1),
  name: z.string().min(0),
  scores: ScoresSchema,
  notes: z.string().optional(),
});

export type CharacterV1 = z.infer<typeof CharacterSchemaV1>;

export function migrateToLatest(input: unknown): CharacterV1 {
  const parsed = CharacterSchemaV1.safeParse(input);
  if (parsed.success) return parsed.data;
  throw new Error('Invalid character file: schema mismatch or unsupported version.');
}
