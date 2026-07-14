import { z } from 'zod';

import ABBR from '../data/sourcebook-abbrevs.json' with { type: 'json' };

const SourceAbbrev = z.enum(ABBR as [string, ...string[]]);

export const WeaponRefSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['simple', 'martial', 'exotic']),
  handedness: z.enum(['unarmed', 'light', 'one-handed', 'two-handed', 'ranged']),
  damageSm: z.string(),
  damageMd: z.string(),
  critRange: z.number().int().min(1).max(20),
  critMult: z.number().int().min(2).max(5),
  damageType: z.string(),
  rangeIncrement: z.number().int().optional(),
  weightLb: z.number().optional(),
  costGp: z.number().optional(),
  special: z.array(z.string()).optional().default([]),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().nullable(),
  }),
});

export type WeaponRef = z.infer<typeof WeaponRefSchema>;
