#!/usr/bin/env node
/**
 * ingest-rulebook.mjs
 *
 * Extracts spells, classes, feats, races, and items from a D&D 3.5e PDF rulebook
 * and writes structured JSON to src/data/rulebooks/<slug>.json.
 *
 * Usage:
 *   node scripts/ingest-rulebook.mjs <path-to-pdf> [--abbr ABBR] [--name "Full Name"]
 *
 * Example:
 *   node scripts/ingest-rulebook.mjs "C:/Users/insta/Dropbox/DnD/spell_compendium.pdf" --abbr SC --name "Spell Compendium"
 *
 * Requirements:
 *   npm install pdf-parse @anthropic-ai/sdk  (one-time setup, dev only)
 *
 * Env:
 *   ANTHROPIC_API_KEY  must be set
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'rulebooks');

// ── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log(`Usage: node scripts/ingest-rulebook.mjs <pdf-path> [--abbr ABBR] [--name "Book Name"]`);
  process.exit(0);
}

const pdfPath = args[0];
let abbr = null;
let bookName = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--abbr') abbr = args[++i];
  if (args[i] === '--name') bookName = args[++i];
}

if (!fs.existsSync(pdfPath)) {
  console.error(`Error: file not found: ${pdfPath}`);
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
  process.exit(1);
}

// ── Load dependencies ────────────────────────────────────────────────────────

let pdfParse, Anthropic;
try {
  pdfParse = require('pdf-parse');
} catch {
  console.error('pdf-parse not found. Run: npm install pdf-parse');
  process.exit(1);
}
try {
  const mod = await import('@anthropic-ai/sdk');
  Anthropic = mod.default ?? mod.Anthropic;
} catch {
  console.error('@anthropic-ai/sdk not found. Run: npm install @anthropic-ai/sdk');
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Slugify ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Extract text from PDF ────────────────────────────────────────────────────

console.log(`\nReading PDF: ${pdfPath}`);
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfData = await pdfParse(pdfBuffer);
const fullText = pdfData.text;
const pageCount = pdfData.numpages;

if (!bookName) bookName = path.basename(pdfPath, path.extname(pdfPath)).replace(/[-_]/g, ' ');
if (!abbr) abbr = bookName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4);

const slug = slugify(bookName);
console.log(`Book: "${bookName}" (${abbr}), ${pageCount} pages, ${fullText.length} chars`);

// ── Chunk text ───────────────────────────────────────────────────────────────

const CHUNK_CHARS = 80000;  // ~20k tokens per chunk
const chunks = [];
for (let i = 0; i < fullText.length; i += CHUNK_CHARS) {
  chunks.push(fullText.slice(i, i + CHUNK_CHARS));
}
console.log(`Split into ${chunks.length} chunk(s) for processing`);

// ── Build extraction prompt ───────────────────────────────────────────────────

const SYSTEM = `You are a D&D 3.5e rules expert extracting structured game data from rulebook text.
Extract only what is clearly present in the provided text. Do not invent or guess.
Return valid JSON only — no prose, no markdown fences.`;

function chunkPrompt(chunk, chunkIdx, totalChunks) {
  return `This is chunk ${chunkIdx + 1} of ${totalChunks} from the rulebook "${bookName}" (abbreviation: ${abbr}).

Extract ALL of the following that appear in this chunk:

1. SPELLS: { name, school, subschool, descriptor, levels (as object mapping class → level), components, castingTime, range, duration, savingThrow, spellResistance, description }
   - levels example: { "Sor/Wiz": 3, "Clr": 4 }
   - Class keys must match D&D 3.5 standard: "Sor/Wiz", "Clr", "Drd", "Brd", "Pal", "Rgr", "Blk", "Arc", "Div"

2. CLASSES (base or prestige): { name, description, hitDie, babProgression ("high"|"medium"|"low"), fortitudeProgression ("good"|"poor"), reflexProgression ("good"|"poor"), willProgression ("good"|"poor"), skillPointsPerLevel, spellcastingAbility (null|"int"|"wis"|"cha"), castingType (null|"prepared"|"spontaneous"), advancesClass (null or base class name for PrCs), classSkills (array), spellSlotsPerDay (null or 20×10 array, -1 for inaccessible) }

3. FEATS: { name, type ("General"|"Fighter"|"Metamagic"|"Item Creation"|"Special"), prerequisites, benefit, special }

4. RACES: { name, description, abilityMods (e.g. {"str":2,"dex":-2}), size, speed, racialTraits }

5. ITEMS/EQUIPMENT: { name, type ("weapon"|"armor"|"wondrous"|"ring"|"rod"|"staff"|"wand"|"scroll"|"potion"|"general"), cost, weight, description, properties }

Return JSON in this exact shape:
{
  "spells": [...],
  "classes": [...],
  "feats": [...],
  "races": [...],
  "items": []
}

If nothing of a category appears, return an empty array for that key.

RULEBOOK TEXT:
${chunk}`;
}

// ── Call Claude API per chunk ─────────────────────────────────────────────────

const results = { spells: [], classes: [], feats: [], races: [], items: [] };

for (let i = 0; i < chunks.length; i++) {
  console.log(`\nProcessing chunk ${i + 1}/${chunks.length}…`);
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8192,
      system: SYSTEM,
      messages: [{ role: 'user', content: chunkPrompt(chunks[i], i, chunks.length) }],
    });
    const raw = response.content[0]?.text ?? '';
    // Strip markdown code fences if present
    const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(json);
    for (const key of Object.keys(results)) {
      if (Array.isArray(parsed[key])) {
        results[key].push(...parsed[key]);
      }
    }
    const counts = Object.entries(results).map(([k, v]) => `${v.length} ${k}`).join(', ');
    console.log(`  Chunk ${i + 1} done. Running totals: ${counts}`);
  } catch (err) {
    console.error(`  Chunk ${i + 1} failed: ${err.message}`);
  }
}

// ── Deduplicate by name ───────────────────────────────────────────────────────

function dedupe(arr) {
  const seen = new Set();
  return arr.filter(item => {
    const key = item.name?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

for (const key of Object.keys(results)) {
  results[key] = dedupe(results[key]);
}

// ── Build final output ────────────────────────────────────────────────────────

const output = {
  name: bookName,
  abbreviation: abbr,
  slug,
  pageCount,
  extractedAt: new Date().toISOString(),
  ...results,
};

const counts = Object.entries(results)
  .map(([k, v]) => `${v.length} ${k}`)
  .join(', ');
console.log(`\nExtraction complete: ${counts}`);

// ── Write output ──────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `${slug}.json`);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nWritten to: ${outPath}`);
console.log('\nNext: rebuild the app (npm run build) to include the new data.\n');
