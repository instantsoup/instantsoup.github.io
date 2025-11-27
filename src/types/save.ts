// src/types/save.ts
import { z } from 'zod';

import { AbilityKey } from './skill';

/**
 * Schema for D&D 3.5e saving throw data
 */
export const SaveSchema = z
  .object({
    name: z.string().min(1),
    ability: AbilityKey,
    description: z.string().optional(),
  })
  .strict();

export type Save = z.infer<typeof SaveSchema>;
export const SavesFileSchema = z.array(SaveSchema);
