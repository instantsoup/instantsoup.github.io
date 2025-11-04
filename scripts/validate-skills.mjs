// scripts/validate-skills.mjs
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'

// Local imports relative to repo root
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const skillsPath = resolve(__dirname, '../src/data/skills.json')
const sourceAbbrevsPath = resolve(__dirname, '../src/data/sourcebook-abbrevs.json')

// Define schema inline to avoid TS build during validation
const AbilityKey = z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha'])
const makeSourceAbbrev = (abbrevs) => z.enum(abbrevs)
const SkillSchema = (SourceAbbrev) => z.object({
  name: z.string().min(1),
  ability: AbilityKey,
  trainedOnly: z.boolean(),
  armorCheckPenalty: z.boolean(),
  description: z.string().optional(),
  check: z.string().optional(),
  action: z.string().optional(),
  tryAgain: z.string().optional(),
  special: z.string().optional(),
  restriction: z.string().optional(),
  untrained: z.string().optional(),
  tools: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  source: z.object({
    abbr: SourceAbbrev,
    page: z.number().int().positive().optional(),
  }).optional(),
  synergy: z.array(z.object({
    from: z.string().min(1),
    bonus: z.number(),
    note: z.string().optional(),
  })).optional(),
}).strict()

function fail(msg) {
  console.error(`❌ ${msg}`)
  process.exitCode = 1
}

try {
  const [skillsRaw, abbrevsRaw] = await Promise.all([
    readFile(skillsPath, 'utf8'),
    readFile(sourceAbbrevsPath, 'utf8'),
  ])

  const abbrevs = JSON.parse(abbrevsRaw)
  if (!Array.isArray(abbrevs) || abbrevs.length === 0) {
    fail('sourcebook-abbrevs.json is empty or invalid')
  }
  const SourceAbbrev = makeSourceAbbrev(abbrevs)

  const arr = JSON.parse(skillsRaw)
  if (!Array.isArray(arr)) fail('skills.json must be an array')

  const schema = SkillSchema(SourceAbbrev)
  const parsed = arr.map((s, i) => {
    try {
      return schema.parse(s)
    } catch (e) {
      fail(`Schema error at index ${i}: ${e}`)
    }
  })

  // Name uniqueness (case-insensitive)
  const seen = new Map()
  for (const s of parsed) {
    const k = s.name.trim().toLowerCase()
    if (seen.has(k)) {
      fail(`Duplicate skill name: "${s.name}" (also seen as "${seen.get(k)}")`)
    } else {
      seen.set(k, s.name)
    }
  }

  // Optional: alphabetical by name for easier diff review
  const names = parsed.map(s => s.name)
  const sorted = [...names].sort((a, b) => a.localeCompare(b))
  for (let i = 0; i < names.length; i++) {
    if (names[i] !== sorted[i]) {
      console.warn('⚠️ skills.json not alphabetically sorted by name (recommended)')
      break
    }
  }

  console.log(`✅ ${parsed.length} skills validated successfully`)
} catch (e) {
  fail(e?.message ?? String(e))
}
