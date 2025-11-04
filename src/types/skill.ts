// src/types/skill.ts
import { z } from 'zod';

import sourceAbbrevs from '../data/sourcebook-abbrevs.json' assert { type: 'json' };

// Reuse canonical source abbreviations (PHB, DMG, etc.)
const SourceAbbrev = z.enum(sourceAbbrevs as [string, ...string[]]);

export const AbilityKey = z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']);

const SourceRef = z.object({
  abbr: SourceAbbrev,
  page: z.number().int().positive().optional(),
});

/**
 * Minimal, book-accurate core shape.
 * Keep long text fields optional for incremental enrichment.
 */
export const SkillSchema = z
  .object({
    name: z.string().min(1),
    ability: AbilityKey, // which ability mod applies
    trainedOnly: z.boolean().default(false),
    armorCheckPenalty: z.boolean().default(false),

    // Optional reference/UX fields (can be filled over time)
    description: z.string().optional(),
    check: z.string().optional(),
    action: z.string().optional(),
    tryAgain: z.string().optional(),
    special: z.string().optional(),
    restriction: z.string().optional(),
    untrained: z.string().optional(),
    tools: z.string().optional(),
    keywords: z.array(z.string()).optional(),

    // Optional source reference (PHB page, etc.)
    source: SourceRef.optional(),

    // Optional synergy notes (lightweight, freeform for now)
    synergy: z
      .array(
        z.object({
          from: z.string().min(1), // e.g., "5 ranks in Tumble"
          bonus: z.number(), // e.g., +2
          note: z.string().optional(),
        }),
      )
      .optional(),
  })
  .strict();

export type Skill = z.infer<typeof SkillSchema>;
export const SkillsFileSchema = z.array(SkillSchema);
