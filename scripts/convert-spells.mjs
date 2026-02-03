// Usage: node scripts/convert-spells.mjs scripts/all-spells.csv src/data/spells.json
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parse } from 'csv-parse/sync';

// Load allowed source abbreviations
const allowedSources = new Set(
  JSON.parse(
    await readFile(new URL('../src/data/sourcebook-abbrevs.json', import.meta.url), 'utf8'),
  ),
);

// School abbreviation mapping
const SCHOOL_MAP = {
  Abj: 'Abjuration',
  Conj: 'Conjuration',
  Div: 'Divination',
  Ench: 'Enchantment',
  Evoc: 'Evocation',
  Illu: 'Illusion',
  Necr: 'Necromancy',
  Tran: 'Transmutation',
  Univ: 'Universal',
};

// Core class columns to extract
const CLASS_COLUMNS = ['Brd', 'Clr', 'Drd', 'Pal', 'Rgr', 'Sor/Wiz'];

function parseSource(bookCell, pageCell) {
  if (!bookCell) return null;
  const abbr = String(bookCell).trim();
  if (!allowedSources.has(abbr)) return null;

  const page = pageCell != null && pageCell !== '' ? Number(pageCell) : null;
  return { abbr, page: page && !isNaN(page) ? page : null };
}

function expandSchool(abbr) {
  const trimmed = String(abbr ?? '').trim();
  return SCHOOL_MAP[trimmed] || trimmed;
}

function parseDescriptor(descriptor) {
  if (!descriptor) return [];
  return String(descriptor)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLevels(row) {
  const levels = {};
  for (const cls of CLASS_COLUMNS) {
    const val = row[cls];
    if (val != null && val !== '') {
      const num = Number(val);
      if (!isNaN(num)) {
        levels[cls] = num;
      }
    }
  }
  return levels;
}

function normalizeRow(r) {
  const name = String(r['Name'] ?? '').trim();
  if (!name) return null;

  const source = parseSource(r['Source Book'], r['Src Page']);
  if (!source) return null;

  return {
    name,
    source,
    school: expandSchool(r['Schl']),
    subschool: r['Sub-school']?.trim() || null,
    descriptor: parseDescriptor(r['Descriptor']),
    levels: parseLevels(r),
    components: String(r['Components'] ?? '').trim(),
    castingTime: String(r['Casting Time'] ?? '').trim(),
    range: String(r['Range'] ?? '').trim(),
    duration: String(r['Duration'] ?? '').trim(),
    savingThrow: String(r['Saving Throw'] ?? '').trim(),
    spellResistance: String(r['Resistance'] ?? '').trim(),
    description: String(r['Short Description'] ?? '').trim(),
  };
}

async function main() {
  const [inPathArg, outPathArg] = process.argv.slice(2);
  if (!inPathArg || !outPathArg) {
    console.error('Usage: node scripts/convert-spells.mjs <input.csv> <output.json>');
    process.exit(1);
  }
  const inPath = resolve(inPathArg);
  const outPath = resolve(outPathArg);

  const csv = await readFile(inPath, 'utf8');
  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const spells = [];
  let skipped = 0;
  const skippedSources = new Map();

  for (const r of records) {
    const norm = normalizeRow(r);
    if (norm) {
      spells.push(norm);
    } else if (r['Name']?.trim()) {
      skipped++;
      const src = r['Source Book']?.trim() || 'unknown';
      skippedSources.set(src, (skippedSources.get(src) || 0) + 1);
    }
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(spells, null, 2), 'utf8');

  console.log(`Wrote ${spells.length} spells → ${outPath}`);
  console.log(`Skipped ${skipped} spells from excluded sources:`);
  for (const [src, count] of [...skippedSources.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${src}: ${count}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
