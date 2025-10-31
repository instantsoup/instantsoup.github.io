import { z } from "zod"
import ABBR from "../data/sourcebook-abbrevs.json" assert { type: "json" }

export const SourceAbbrev = z.enum(ABBR as [string, ...string[]])

export const FeatSchema = z.object({
  name: z.string().min(1),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().nullable(),
  }),
  types: z.array(z.string().min(1)).default([]),
  bonusFeat: z.boolean().default(false),
  prerequisites: z.string().default(""),
  description: z.string().default(""),
})

export type Feat = z.infer<typeof FeatSchema>
