import { z } from 'zod';

import ABBR from '../data/sourcebook-abbrevs.json' with { type: 'json' };

const SourceAbbrev = z.enum(ABBR as [string, ...string[]]);

export const ArmorRefSchema = z.object({
  name: z.string().min(1),
  /** "light" | "medium" | "heavy" for armor; "shield" for shields; "extra" for misc protective gear */
  category: z.enum(['light', 'medium', 'heavy', 'shield', 'extra']),
  /** Total bonus to AC granted (armor bonus for armor, shield bonus for shields) */
  acBonus: z.number().int(),
  /** Maximum Dex bonus allowed; null = no limit */
  maxDexBonus: z.number().int().nullable(),
  /** Armor check penalty (stored as positive magnitude, e.g. 3 = −3) */
  armorCheckPenalty: z.number().int().min(0),
  /** Arcane spell failure chance in percent */
  arcaneSpellFailure: z.number().int().min(0).max(100),
  /** Movement speed when base speed is 30 ft; undefined = no reduction */
  speed30: z.number().int().optional(),
  /** Movement speed when base speed is 20 ft; undefined = no reduction */
  speed20: z.number().int().optional(),
  weightLb: z.number().optional(),
  costGp: z.number().optional(),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().nullable(),
  }),
});

export type ArmorRef = z.infer<typeof ArmorRefSchema>;
