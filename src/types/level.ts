// src/types/level.ts
import { z } from 'zod';

import { CLASS_NAMES } from '../data/classes';

/**
 * Schema for a single character level with class selection, feats, and skills
 */
export const LevelSchema = z
  .object({
    level: z.number().int().min(1).max(20),
    class: z.enum(CLASS_NAMES),
    feats: z.array(z.string()).optional().default([]),
    skillRanks: z.record(z.string(), z.number().min(0).max(99)).optional().default({}), // Allow decimals for 0.5 ranks
    unspentSkillPoints: z.number().int().min(0).optional().default(0),
  })
  .strict();

export type Level = z.infer<typeof LevelSchema>;

/**
 * Schema for an array of character levels
 * Ensures levels are sequential starting from 1
 */
export const LevelsArraySchema = z.array(LevelSchema).refine(
  (levels) => {
    // Must be sequential: [1, 2, 3, ...] with no gaps
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].level !== i + 1) return false;
    }
    return true;
  },
  { message: 'Levels must be sequential starting from 1' },
);
