// src/types/class.ts
import { z } from 'zod';

/**
 * Schema for D&D 3.5e class data
 */
export const ClassSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export type Class = z.infer<typeof ClassSchema>;
export const ClassesFileSchema = z.array(ClassSchema);
