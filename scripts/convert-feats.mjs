// Usage: node scripts/convert-feats.mjs "Feats by Book.xlsx - BoED.csv" src/data/feats.json
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { parse } from 'csv-parse/sync'

function parseBookCell(bookCell) {
  if (!bookCell) return { abbr: '', page: null }
  // Examples: "BoED 39", "PHB 98", "SC 12"
  const m = String(bookCell).trim().match(/^([A-Za-z0-9]+)\s+(\d+)(?:.*)?$/)
  if (m) return { abbr: m[1], page: Number(m[2]) }
  // Fallback: just abbreviation, no page
  return { abbr: String(bookCell).trim(), page: null }
}

function coerceBool(x) {
  const s = String(x ?? '').trim().toLowerCase()
  return s === 'yes' || s === 'y' || s === 'true' || s === '1'
}

function splitTypes(x) {
  if (x == null) return []
  return String(x)
    .split(/[,/]/)           // comma or slash separated
    .map(s => s.trim())
    .filter(Boolean)
}

function normalizeRow(r) {
  // Column headers seen in your screenshot:
  // Name | Book | Feat Type | Bonus Feat? | Prerequisites | Description
  const name = String(r['Name'] ?? '').trim()
  if (!name) return null

  const { abbr, page } = parseBookCell(r['Book'])
  return {
    name,
    source: { abbr, page },
    types: splitTypes(r['Feat Type']),
    bonusFeat: coerceBool(r['Bonus Feat?']),
    prerequisites: String(r['Prerequisites'] ?? '').trim(),
    description: String(r['Description'] ?? '').trim(),
  }
}

async function main() {
  const [inPathArg, outPathArg] = process.argv.slice(2)
  if (!inPathArg || !outPathArg) {
    console.error('Usage: node scripts/convert-feats.mjs <input.csv> <output.json>')
    process.exit(1)
  }
  const inPath = resolve(inPathArg)
  const outPath = resolve(outPathArg)

  const csv = await readFile(inPath, 'utf8')
  const records = parse(csv, { columns: true, skip_empty_lines: true })

  const feats = []
  for (const r of records) {
    const norm = normalizeRow(r)
    if (norm) feats.push(norm)
  }

  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, JSON.stringify(feats, null, 2), 'utf8')
  console.log(`Wrote ${feats.length} feats → ${outPath}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
