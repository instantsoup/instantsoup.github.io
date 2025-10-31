// Usage: node scripts/validate-feats.mjs src/data/feats.json
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { z } from "zod"
import ABBR from "../src/data/sourcebook-abbrevs.json" with { type: "json" }

// Build the enum from the shared JSON
const SourceAbbrev = z.enum(ABBR)

/** Main schema */
const FeatSchema = z.object({
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

const FeatArray = z.array(FeatSchema)

/** Utility: normalize smart quotes etc. */
function asciiQuotes(s) {
  return s?.replace?.(/[‘’]/g, "'").replace(/[“”]/g, '"') ?? s
}

/** Normalize one feat object (light cleanup) */
function normalize(feat) {
  const f = structuredClone(feat)

  f.name = asciiQuotes(f.name)?.trim() ?? ""
  f.prerequisites = asciiQuotes(f.prerequisites ?? "")?.trim()
  f.description = asciiQuotes(f.description ?? "")?.trim()

  if (/^\s*none\s*$/i.test(f.prerequisites)) f.prerequisites = ""

  if (Array.isArray(f.types)) {
    const set = new Set(f.types.map(t => String(t).trim()).filter(Boolean))
    f.types = [...set]
  } else {
    f.types = []
  }

  // Coerce page if it slipped in as a string like "39–40" or "p. 98"
  if (f.source && typeof f.source.page === "string") {
    const m = f.source.page.match(/\d+/)
    f.source.page = m ? Number(m[0]) : null
  }

  // Uppercase abbr defensively
  if (f.source?.abbr) f.source.abbr = String(f.source.abbr).trim()

  return f
}

async function main() {
  const path = resolve(process.argv[2] || "src/data/feats.json")
  const raw = JSON.parse(await readFile(path, "utf8"))

  // Report any unknown abbreviations BEFORE validation
  const abbrevsInData = new Set(raw.map(f => f?.source?.abbr).filter(Boolean))
  const unknown = [...abbrevsInData].filter(a => !ABBR.includes(a))
  if (unknown.length) {
    console.warn("⚠️ Unknown abbreviations found (not in sourcebook-abbrevs.json):", unknown.join(", "))
  }

  const cleaned = raw.map(normalize)
  const parsed = FeatArray.safeParse(cleaned)

  if (!parsed.success) {
    console.error("❌ Validation failed.")
    for (const issue of parsed.error.issues.slice(0, 50)) {
      console.error(`- ${issue.path.join(".")}: ${issue.message}`)
    }
    process.exit(1)
  }

  const feats = parsed.data
  // quick stats
  const bySource = feats.reduce((m, f) => (m[f.source.abbr] = (m[f.source.abbr] || 0) + 1, m), {})
  console.log(`✅ ${feats.length} feats valid.`)
  console.log(
    "By source (top 10):",
    Object.entries(bySource).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`${k}:${v}`).join(", ")
  )
}

main().catch(e => (console.error(e), process.exit(1)))
