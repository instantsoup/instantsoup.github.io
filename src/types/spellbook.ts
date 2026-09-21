import { z } from 'zod';

/**
 * How a spell got into the wizard's spellbook.
 *  - starting / free-levelup: the two free spells per wizard level (3 + Int mod at level 1)
 *  - purchased: copied from a scroll or another spellbook (label "Copied" in the UI)
 *  - researched: independent research
 *  - found: arrived already written in the book (gifted, looted book) — no cost tracked
 */
export const SPELLBOOK_SOURCES = [
  'starting',
  'free-levelup',
  'purchased',
  'researched',
  'found',
] as const;

export const SpellbookSourceSchema = z.enum(SPELLBOOK_SOURCES);

export type SpellbookSource = z.infer<typeof SpellbookSourceSchema>;

export const SpellbookEntrySchema = z.object({
  spellName: z.string(),
  /** How this spell was acquired. */
  source: SpellbookSourceSchema,
  /** Gold paid to copy or research at the time it was added. 0 for free spells. */
  goldPaid: z.number().int().min(0).default(0),
  /** Character level when the entry was added. */
  addedAtCharLevel: z.number().int().min(1).max(20).default(1),
  /** Copied from another living wizard's spellbook (adds the borrowing fee). */
  borrowed: z.boolean().optional().default(false),
});

export type SpellbookEntry = z.infer<typeof SpellbookEntrySchema>;
