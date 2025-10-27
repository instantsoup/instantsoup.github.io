// src/schema.ts
import { z } from 'zod'

export const VERSION = 1

export const ScoresSchema = z.object({
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
})

export const CharacterSchemaV1 = z.object({
  version: z.literal(1),
  name: z.string().min(0),
  scores: ScoresSchema,
  notes: z.string().optional(), // future-friendly optional field
  // You can add optional future fields here without breaking imports.
})

export type CharacterV1 = z.infer<typeof CharacterSchemaV1>

// Simple migration hook for future versions
export function migrateToLatest(input: unknown): CharacterV1 {
  // If it's already v1 and valid, return it
  const parsed = CharacterSchemaV1.safeParse(input)
  if (parsed.success) return parsed.data

  // If you later introduce v2, detect and down/up-migrate here
  // e.g., if ((input as any)?.version === 0) { ... }

  // Last resort: throw a user-friendly error
  throw new Error("Invalid character file: schema mismatch or unsupported version.")
}
