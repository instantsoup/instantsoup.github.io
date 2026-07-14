#!/usr/bin/env node
/// <reference types="node" />
/**
 * ingest-rulebook.mts
 *
 * Extracts spells, classes, feats, races, and items from a D&D 3.5e PDF rulebook
 * and writes structured JSON to src/data/rulebooks/<slug>.json.
 *
 * Usage:
 *   node scripts/ingest-rulebook.mts <path-to-pdf> [--abbr ABBR] [--name "Full Name"]
 *
 * Example:
 *   node scripts/ingest-rulebook.mts "Books/spell_compendium.pdf" --abbr SC --name "Spell Compendium"
 *
 * Requirements:
 *   npm install pdf-parse @anthropic-ai/sdk  (one-time setup, dev only)
 *
 * Env:
 *   ANTHROPIC_API_KEY  must be set
 *
 * Output conforms exactly to src/types/rulebook.ts's RulebookFileSchema, which
 * is the same schema shared with src/data/rulebook-loader.ts. In particular:
 *   - each spell fully conforms to the app's real SpellSchema (src/types/spell.ts),
 *     including a `source: { abbr, page }` object - not a script-local shape
 *   - class entries include `advancesSpellcastingOf` for prestige classes that grant
 *     caster level advancement, which the rules engine uses to compute effective
 *     caster level, plus `hasDomains`/`spellListKey` for other rule-variant hooks
 *   - the script never writes a file that doesn't pass RulebookFileSchema.parse()
 */

import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import { ClassProgressionSchema } from '../src/types/class-progression.ts';
import {
  ChunkResultSchema,
  type IngestedSpell,
  IngestedSpellSchema,
  RulebookFeatSchema,
  RulebookFileSchema,
  RulebookItemSchema,
  RulebookRaceSchema,
} from '../src/types/rulebook.ts';
import { SourceAbbrev } from '../src/types/spell.ts';
import { chunkText, splitChunkInHalf } from './lib/chunk.ts';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'rulebooks');

// ── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log(
    `Usage: node scripts/ingest-rulebook.mts <pdf-path> [--abbr ABBR] [--name "Book Name"]`,
  );
  process.exit(0);
}

const pdfPath = args[0];
let abbr: string | null = null;
let bookName: string | null = null;
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

// Fail fast, before any PDF/API work: every spell's source.abbr must be a
// recognized sourcebook abbreviation or every spell in the book fails
// load-time validation in rulebook-loader.ts.
if (abbr && !SourceAbbrev.safeParse(abbr).success) {
  console.error(
    `Error: "--abbr ${abbr}" is not a recognized sourcebook abbreviation.\n` +
      `Add it to src/data/sourcebook-abbrevs.json first, then re-run this script.`,
  );
  process.exit(1);
}

// ── Load dependencies ────────────────────────────────────────────────────────

let pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }>;
let Anthropic: new (opts: { apiKey: string }) => {
  messages: {
    create: (opts: {
      model: string;
      max_tokens: number;
      system: string;
      messages: Array<{ role: string; content: string }>;
    }) => Promise<{ content: Array<{ text?: string }>; stop_reason: string }>;
  };
};
try {
  pdfParse = require('pdf-parse');
} catch {
  console.error('pdf-parse not found. Run: npm install pdf-parse');
  process.exit(1);
}
try {
  const mod = await import('@anthropic-ai/sdk');
  Anthropic = (mod.default ?? mod.Anthropic) as typeof Anthropic;
} catch {
  console.error('@anthropic-ai/sdk not found. Run: npm install @anthropic-ai/sdk');
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Slugify ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Extract text from PDF ────────────────────────────────────────────────────

console.log(`\nReading PDF: ${pdfPath}`);
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfData = await pdfParse(pdfBuffer);
const fullText = pdfData.text;
const pageCount = pdfData.numpages;

if (!bookName) bookName = path.basename(pdfPath, path.extname(pdfPath)).replace(/[-_]/g, ' ');
if (!abbr) {
  abbr = bookName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
  if (!SourceAbbrev.safeParse(abbr).success) {
    console.error(
      `Error: no --abbr given and the derived abbreviation "${abbr}" is not in ` +
        `src/data/sourcebook-abbrevs.json. Pass --abbr explicitly.`,
    );
    process.exit(1);
  }
}
const abbrValue = abbr;
const bookNameValue = bookName;

const slug = slugify(bookNameValue);
console.log(
  `Book: "${bookNameValue}" (${abbrValue}), ${pageCount} pages, ${fullText.length} chars`,
);

// ── Chunk text ───────────────────────────────────────────────────────────────

const CHUNK_CHARS = 80000; // ~20k tokens per chunk
// Overlap so an entry (spell, class, etc.) whose text straddles a chunk
// boundary appears whole in at least one chunk; the name-based dedupe step
// below absorbs the resulting duplicate extraction.
const OVERLAP_CHARS = 6000;
const chunks = chunkText(fullText, CHUNK_CHARS, OVERLAP_CHARS);
console.log(`Split into ${chunks.length} chunk(s) for processing (${OVERLAP_CHARS}-char overlap)`);

// ── Build extraction prompt ───────────────────────────────────────────────────

const SYSTEM = `You are a D&D 3.5e rules expert extracting structured game data from rulebook text.
Extract only what is clearly present in the provided text. Do not invent or guess.
Return valid JSON only — no prose, no markdown fences, no code blocks.`;

function chunkPrompt(chunk: string, chunkIdx: number, totalChunks: number): string {
  return `This is chunk ${chunkIdx + 1} of ${totalChunks} from the rulebook "${bookNameValue}" (abbreviation: ${abbrValue}).

Extract ALL of the following that appear in this chunk:

1. SPELLS — one object per spell:
{
  "name": string,
  "school": string (e.g. "Evocation"),
  "subschool": string|null,
  "descriptor": string[] (e.g. ["Fire"]; empty array if the spell has no descriptors),
  "page": number|null (the page number within this book where this spell is printed, if you can determine it; null if not),
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
  "hitDie": number (e.g. 6, 8, 10, 12),
  "babProgression": "high"|"medium"|"low",
  "fortitudeProgression": "good"|"poor",
  "reflexProgression": "good"|"poor",
  "willProgression": "good"|"poor",
  "skillPointsPerLevel": number,
  "spellcastingAbility": "int"|"wis"|"cha"|null,
  "castingType": "prepared"|"spontaneous"|null,
  "advancesSpellcastingOf": string|null,  // CRITICAL: for prestige classes that grant "+1 caster level" advancement, set this to the BASE class name they advance (e.g. "Wizard", "Cleric"). null for base classes or PrCs that don't advance casting.
  "hasDomains": boolean,  // true only for classes that grant Cleric-style domain spell slots
  "spellListKey": string|null,  // the spell-list key this class draws from (e.g. "Sor/Wiz", "Clr"); null if non-caster
  "spellSlotsPerDay": null  // leave null unless you have the full 20-row slot table; do not guess
}
// Do NOT include a classSkills field - class skill lists are tracked separately
// (src/data/classes.json) and aren't part of this ingestion pipeline's contract
// (src/types/class-progression.ts's ClassProgressionSchema has no such field, so
// it would be silently discarded during validation - don't waste output on it).

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

type Results = {
  spells: IngestedSpell[];
  classes: z.infer<typeof ChunkResultSchema>['classes'];
  feats: z.infer<typeof ChunkResultSchema>['feats'];
  races: z.infer<typeof ChunkResultSchema>['races'];
  items: z.infer<typeof ChunkResultSchema>['items'];
};

const ITEM_SCHEMAS = {
  spells: IngestedSpellSchema,
  classes: ClassProgressionSchema,
  feats: RulebookFeatSchema,
  races: RulebookRaceSchema,
  items: RulebookItemSchema,
} as const;

function mergeInto(target: Results, source: Results) {
  for (const key of Object.keys(target) as Array<keyof Results>) {
    (target[key] as unknown[]).push(...(source[key] as unknown[]));
  }
}

/** Validates a parsed chunk-response object, tolerating entry-level failures. */
function validateChunkResponse(parsed: unknown, label: string): Results {
  const out: Results = { spells: [], classes: [], feats: [], races: [], items: [] };
  const validated = ChunkResultSchema.safeParse(parsed);
  if (validated.success) {
    mergeInto(out, validated.data);
    return out;
  }

  const issues = validated.error.issues.slice(0, 5).map((e) => `${e.path.join('.')}: ${e.message}`);
  console.warn(`  ${label}: ${validated.error.issues.length} validation issue(s). First 5:`);
  for (const issue of issues) console.warn(`    - ${issue}`);

  // Fall back to validating each entry individually so one bad entry doesn't
  // discard every entry of that type from this response.
  const parsedObj = (parsed ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(out) as Array<keyof Results>) {
    const arr = parsedObj[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      const r = ITEM_SCHEMAS[key].safeParse(item);
      if (r.success) (out[key] as unknown[]).push(r.data);
    }
  }
  return out;
}

const MAX_SPLIT_DEPTH = 2; // 80k chars can split down to ~20k chars before giving up

/**
 * Requests extraction for a single piece of chunk text. On a max_tokens stop
 * reason, splits the text in half and recursively extracts each half
 * (up to MAX_SPLIT_DEPTH), merging the results. Throws on JSON parse failure
 * or API error so the caller can retry.
 */
async function extractChunk(
  text: string,
  chunkIdx: number,
  totalChunks: number,
  label: string,
  depth = 0,
): Promise<Results> {
  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 8192,
    system: SYSTEM,
    messages: [{ role: 'user', content: chunkPrompt(text, chunkIdx, totalChunks) }],
  });

  if (response.stop_reason === 'max_tokens' && depth < MAX_SPLIT_DEPTH) {
    console.warn(`  ${label}: hit max_tokens, splitting in half and retrying (depth ${depth + 1})`);
    const [first, second] = splitChunkInHalf(text);
    const merged: Results = { spells: [], classes: [], feats: [], races: [], items: [] };
    mergeInto(merged, await extractChunk(first, chunkIdx, totalChunks, `${label}a`, depth + 1));
    mergeInto(merged, await extractChunk(second, chunkIdx, totalChunks, `${label}b`, depth + 1));
    return merged;
  }

  const raw = response.content[0]?.text ?? '';
  const json = raw
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.error(`  ${label}: JSON parse error — ${(e as Error).message}`);
    console.error(`  Raw response (first 500 chars): ${raw.slice(0, 500)}`);
    throw e;
  }

  return validateChunkResponse(parsed, label);
}

const results: Results = { spells: [], classes: [], feats: [], races: [], items: [] };
const discardedChunks: number[] = [];

for (let i = 0; i < chunks.length; i++) {
  const chunkNum = i + 1;
  console.log(`\nProcessing chunk ${chunkNum}/${chunks.length}…`);

  let chunkResults: Results | null = null;
  for (let attempt = 1; attempt <= 2 && chunkResults === null; attempt++) {
    try {
      chunkResults = await extractChunk(chunks[i], i, chunks.length, `Chunk ${chunkNum}`);
    } catch (err) {
      const willRetry = attempt === 1;
      console.error(
        `  Chunk ${chunkNum} attempt ${attempt} failed: ${(err as Error).message}${
          willRetry ? ' — retrying once' : ' — giving up on this chunk'
        }`,
      );
    }
  }

  if (chunkResults === null) {
    discardedChunks.push(chunkNum);
    continue;
  }

  mergeInto(results, chunkResults);
  const counts = Object.entries(results)
    .map(([k, v]) => `${(v as unknown[]).length} ${k}`)
    .join(', ');
  console.log(`  Chunk ${chunkNum} done. Running totals: ${counts}`);
}

if (discardedChunks.length > 0) {
  console.warn(
    `\n${discardedChunks.length} chunk(s) could not be extracted after retrying: ${discardedChunks.join(', ')}. ` +
      `Coverage of this book is incomplete; the discarded chunk numbers are recorded in the output file.`,
  );
}

// ── Deduplicate by name ───────────────────────────────────────────────────────

function dedupe<T extends { name?: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = item.name?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

for (const key of Object.keys(results) as Array<keyof Results>) {
  const before = (results[key] as unknown[]).length;
  (results[key] as unknown[]) = dedupe(results[key] as Array<{ name?: string }>);
  const dupes = before - (results[key] as unknown[]).length;
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

// ── Assign each spell's real `source` object (Decision B: conform to SpellSchema) ─

const finalSpells = results.spells.map(({ page, ...spell }) => ({
  ...spell,
  source: { abbr: abbrValue, page: page ?? null },
}));

// ── Build and validate final output ───────────────────────────────────────────

const output = {
  name: bookNameValue,
  abbreviation: abbrValue,
  slug,
  pageCount,
  extractedAt: new Date().toISOString(),
  spells: finalSpells,
  classes: results.classes,
  feats: results.feats,
  races: results.races,
  items: results.items,
  discardedChunks,
};

const finalValidation = RulebookFileSchema.safeParse(output);
if (!finalValidation.success) {
  console.error(
    `\nError: extracted output does not conform to RulebookFileSchema. This file was NOT written.`,
  );
  for (const issue of finalValidation.error.issues.slice(0, 20)) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const counts = Object.entries(results)
  .map(([k, v]) => `${(v as unknown[]).length} ${k}`)
  .join(', ');
console.log(`\nExtraction complete: ${counts}`);

// ── Write output ──────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `${slug}.json`);
fs.writeFileSync(outPath, JSON.stringify(finalValidation.data, null, 2));
console.log(`\nWritten to: ${outPath}`);
console.log('\nNext steps:');
console.log('  1. Review extracted data, especially advancesSpellcastingOf on classes');
console.log(
  '  2. Run node scripts/merge-rulebook-classes.mts to review/merge class entries into src/data/class-progressions.json',
);
console.log('  3. npm run build to include the new spell/feat data\n');
