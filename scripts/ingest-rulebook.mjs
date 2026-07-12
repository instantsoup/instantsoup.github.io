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
 *   node scripts/ingest-rulebook.mjs "Books/spell_compendium.pdf" --abbr SC --name "Spell Compendium"
 *
 * Requirements:
 *   npm install pdf-parse @anthropic-ai/sdk zod  (one-time setup, dev only)
 *
 * Env:
 *   ANTHROPIC_API_KEY  must be set
 *
 * Output shape is compatible with the rules engine:
 *   - Spell.levels keys match D&D 3.5e class spell-list keys ("Sor/Wiz", "Clr", etc.)
 *   - Class entries include `advancesSpellcastingOf` for prestige classes that grant
 *     caster level advancement, which the rules engine uses to compute effective caster level.
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
  console.log(
    `Usage: node scripts/ingest-rulebook.mjs <pdf-path> [--abbr ABBR] [--name "Book Name"]`,
  );
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

let pdfParse, Anthropic, z;
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
try {
  const mod = await import('zod');
  z = mod.z ?? mod.default;
} catch {
  console.error('zod not found. Run: npm install zod');
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Slugify ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Validation schemas (mirrors the rules engine's expected shapes) ───────────

const SpellSchema = z.object({
  name: z.string().min(1),
  school: z.string().min(1),
  subschool: z.string().nullable().optional(),
  descriptor: z.string().nullable().optional(),
  levels: z.record(z.string(), z.number()).default({}),
  components: z.string().optional(),
  castingTime: z.string().optional(),
  range: z.string().optional(),
  duration: z.string().optional(),
  savingThrow: z.string().optional(),
  spellResistance: z.string().optional(),
  description: z.string().optional(),
});

const ClassSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  hitDie: z.number().int().positive(),
  babProgression: z.enum(['high', 'medium', 'low']),
  fortitudeProgression: z.enum(['good', 'poor']),
  reflexProgression: z.enum(['good', 'poor']),
  willProgression: z.enum(['good', 'poor']),
  skillPointsPerLevel: z.number().int().nonnegative(),
  spellcastingAbility: z.enum(['int', 'wis', 'cha']).nullable().default(null),
  castingType: z.enum(['prepared', 'spontaneous']).nullable().default(null),
  // Key rules-engine field: prestige class caster level advancement
  advancesSpellcastingOf: z.string().nullable().default(null),
  classSkills: z.array(z.string()).default([]),
  spellSlotsPerDay: z.array(z.array(z.number())).nullable().default(null),
});

const FeatSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  prerequisites: z.string().optional(),
  benefit: z.string().optional(),
  special: z.string().optional(),
});

const RaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  abilityMods: z.record(z.string(), z.number()).default({}),
  size: z.string().optional(),
  speed: z.number().optional(),
  racialTraits: z.array(z.string()).default([]),
});

const ItemSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  cost: z.string().optional(),
  weight: z.number().optional(),
  description: z.string().optional(),
  properties: z.string().optional(),
});

const ChunkResultSchema = z.object({
  spells: z.array(SpellSchema).default([]),
  classes: z.array(ClassSchema).default([]),
  feats: z.array(FeatSchema).default([]),
  races: z.array(RaceSchema).default([]),
  items: z.array(ItemSchema).default([]),
});

// ── Extract text from PDF ────────────────────────────────────────────────────

console.log(`\nReading PDF: ${pdfPath}`);
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfData = await pdfParse(pdfBuffer);
const fullText = pdfData.text;
const pageCount = pdfData.numpages;

if (!bookName) bookName = path.basename(pdfPath, path.extname(pdfPath)).replace(/[-_]/g, ' ');
if (!abbr)
  abbr = bookName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);

const slug = slugify(bookName);
console.log(`Book: "${bookName}" (${abbr}), ${pageCount} pages, ${fullText.length} chars`);

// ── Chunk text ───────────────────────────────────────────────────────────────

const CHUNK_CHARS = 80000; // ~20k tokens per chunk
const chunks = [];
for (let i = 0; i < fullText.length; i += CHUNK_CHARS) {
  chunks.push(fullText.slice(i, i + CHUNK_CHARS));
}
console.log(`Split into ${chunks.length} chunk(s) for processing`);

// ── Build extraction prompt ───────────────────────────────────────────────────

const SYSTEM = `You are a D&D 3.5e rules expert extracting structured game data from rulebook text.
Extract only what is clearly present in the provided text. Do not invent or guess.
Return valid JSON only — no prose, no markdown fences, no code blocks.`;

function chunkPrompt(chunk, chunkIdx, totalChunks) {
  return `This is chunk ${chunkIdx + 1} of ${totalChunks} from the rulebook "${bookName}" (abbreviation: ${abbr}).

Extract ALL of the following that appear in this chunk:

1. SPELLS — one object per spell:
{
  "name": string,
  "school": string (e.g. "Evocation"),
  "subschool": string|null,
  "descriptor": string|null (e.g. "Fire"),
  "levels": { "<classKey>": <level> },   // class keys: "Sor/Wiz", "Clr", "Drd", "Brd", "Pal", "Rgr", "Arc", "Div"
  "components": string,
  "castingTime": string,
  "range": string,
  "duration": string,
  "savingThrow": string,
  "spellResistance": string,
  "description": string
}

2. CLASSES (base or prestige) — one object per class:
{
  "name": string,
  "description": string,
  "hitDie": number (e.g. 6, 8, 10, 12),
  "babProgression": "high"|"medium"|"low",
  "fortitudeProgression": "good"|"poor",
  "reflexProgression": "good"|"poor",
  "willProgression": "good"|"poor",
  "skillPointsPerLevel": number,
  "spellcastingAbility": "int"|"wis"|"cha"|null,
  "castingType": "prepared"|"spontaneous"|null,
  "advancesSpellcastingOf": string|null,  // CRITICAL: for prestige classes that grant "+1 caster level" advancement, set this to the BASE class name they advance (e.g. "Wizard", "Cleric"). null for base classes or PrCs that don't advance casting.
  "classSkills": [string],
  "spellSlotsPerDay": null  // leave null unless you have the full 20-row slot table; do not guess
}

3. FEATS — one object per feat:
{
  "name": string,
  "type": "General"|"Fighter"|"Metamagic"|"Item Creation"|"Special"|string,
  "prerequisites": string,
  "benefit": string,
  "special": string
}

4. RACES — one object per race:
{
  "name": string,
  "description": string,
  "abilityMods": { "<ability>": <modifier> },  // e.g. {"str": 2, "dex": -2}
  "size": "Small"|"Medium"|"Large"|string,
  "speed": number,
  "racialTraits": [string]
}

5. ITEMS/EQUIPMENT — one object per item:
{
  "name": string,
  "type": "weapon"|"armor"|"wondrous"|"ring"|"rod"|"staff"|"wand"|"scroll"|"potion"|"general",
  "cost": string,
  "weight": number,
  "description": string,
  "properties": string
}

Return ONLY this JSON structure, nothing else:
{
  "spells": [...],
  "classes": [...],
  "feats": [...],
  "races": [...],
  "items": []
}

RULEBOOK TEXT:
${chunk}`;
}

// ── Call Claude API per chunk ─────────────────────────────────────────────────

const results = { spells: [], classes: [], feats: [], races: [], items: [] };
const validationWarnings = [];

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
    const json = raw
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      console.error(`  Chunk ${i + 1}: JSON parse error — ${e.message}`);
      console.error(`  Raw response (first 500 chars): ${raw.slice(0, 500)}`);
      continue;
    }

    // Validate with Zod if requested or always at the chunk level
    const validated = ChunkResultSchema.safeParse(parsed);
    if (!validated.success) {
      const issues = validated.error.issues
        .slice(0, 5)
        .map((e) => `${e.path.join('.')}: ${e.message}`);
      console.warn(
        `  Chunk ${i + 1}: ${validated.error.issues.length} validation issue(s). First 5:`,
      );
      for (const issue of issues) console.warn(`    - ${issue}`);
      validationWarnings.push({ chunk: i + 1, count: validated.error.issues.length });

      // Use the partial data that did parse correctly
      for (const key of Object.keys(results)) {
        if (Array.isArray(parsed[key])) {
          // Filter to only valid entries
          const valid = [];
          for (const item of parsed[key]) {
            const schema = {
              spells: SpellSchema,
              classes: ClassSchema,
              feats: FeatSchema,
              races: RaceSchema,
              items: ItemSchema,
            }[key];
            const r = schema?.safeParse(item);
            if (r?.success) valid.push(r.data);
          }
          results[key].push(...valid);
        }
      }
    } else {
      for (const key of Object.keys(results)) {
        results[key].push(...(validated.data[key] ?? []));
      }
    }

    const counts = Object.entries(results)
      .map(([k, v]) => `${v.length} ${k}`)
      .join(', ');
    console.log(`  Chunk ${i + 1} done. Running totals: ${counts}`);
  } catch (err) {
    console.error(`  Chunk ${i + 1} failed: ${err.message}`);
  }
}

// ── Deduplicate by name ───────────────────────────────────────────────────────

function dedupe(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = item.name?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

for (const key of Object.keys(results)) {
  const before = results[key].length;
  results[key] = dedupe(results[key]);
  const dupes = before - results[key].length;
  if (dupes > 0) console.log(`  Deduped ${dupes} duplicate ${key}`);
}

// ── Summarize prestige class caster advancement ──────────────────────────────

const advancingClasses = results.classes.filter((c) => c.advancesSpellcastingOf);
if (advancingClasses.length > 0) {
  console.log(`\nPrestige classes with spellcasting advancement:`);
  for (const cls of advancingClasses) {
    console.log(`  ${cls.name} → advances ${cls.advancesSpellcastingOf}`);
  }
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

if (validationWarnings.length > 0) {
  console.warn(
    `\nValidation warnings occurred in ${validationWarnings.length} chunk(s). Some entries may have been skipped.`,
  );
}

// ── Write output ──────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `${slug}.json`);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nWritten to: ${outPath}`);
console.log('\nNext steps:');
console.log('  1. Review extracted data, especially advancesSpellcastingOf on classes');
console.log('  2. Copy class entries to src/data/class-progressions.json if needed');
console.log('  3. npm run build to include the new spell/feat data\n');
