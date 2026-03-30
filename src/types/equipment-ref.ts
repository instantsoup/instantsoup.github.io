import { z } from 'zod';

import ABBR from '../data/sourcebook-abbrevs.json' assert { type: 'json' };

const SourceAbbrev = z.enum(ABBR as [string, ...string[]]);

export const EquipmentRefSchema = z.object({
  name: z.string().min(1),
  /** High-level grouping, e.g. "Adventuring Gear", "Tools and Skill Kits", "Food, Drink, and Lodging" */
  category: z.string().min(1),
  /** Cost in gold pieces (fractions ok: 5 sp = 0.5, 1 cp = 0.01) */
  costGp: z.number().optional(),
  weightLb: z.number().optional(),
  description: z.string().optional(),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().nullable(),
  }),
});

export type EquipmentRef = z.infer<typeof EquipmentRefSchema>;
