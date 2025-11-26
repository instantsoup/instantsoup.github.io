// src/types/alignment.ts
import { z } from 'zod';

/**
 * Schema for D&D 3.5e alignment data
 */
export const AlignmentSchema = z
  .object({
    code: z.string().min(1).max(2),
    label: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export type Alignment = z.infer<typeof AlignmentSchema>;
export const AlignmentsFileSchema = z.array(AlignmentSchema);
