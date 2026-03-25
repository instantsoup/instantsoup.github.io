import { z } from 'zod';

import ABBR from '../data/sourcebook-abbrevs.json' assert { type: 'json' };

const SourceAbbrev = z.enum(ABBR as [string, ...string[]]);

export const FlawSchema = z.object({
  name: z.string().min(1),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().nullable(),
  }),
  description: z.string(),
  effect: z.string(),
});

export type Flaw = z.infer<typeof FlawSchema>;
