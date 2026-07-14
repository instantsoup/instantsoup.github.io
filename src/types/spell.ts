import { z } from 'zod';

import ABBR from '../data/sourcebook-abbrevs.json' with { type: 'json' };

export const SourceAbbrev = z.enum(ABBR as [string, ...string[]]);

export const SpellSchema = z.object({
  name: z.string().min(1),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().nullable(),
  }),
  school: z.string(),
  subschool: z.string().nullable(),
  descriptor: z.array(z.string()),
  levels: z.record(z.string(), z.number()).default({}),
  components: z.string(),
  castingTime: z.string(),
  range: z.string(),
  duration: z.string(),
  savingThrow: z.string(),
  spellResistance: z.string(),
  description: z.string(),
});

export type Spell = z.infer<typeof SpellSchema>;
