// src/types/race.ts
import { z } from 'zod';

/**
 * Schema for D&D 3.5e race data
 */
export const RaceSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export type Race = z.infer<typeof RaceSchema>;
export const RacesFileSchema = z.array(RaceSchema);
