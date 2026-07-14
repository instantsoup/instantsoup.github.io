#!/usr/bin/env node
/// <reference types="node" />
/**
 * merge-rulebook-classes.mts
 *
 * Reviews class entries extracted by scripts/ingest-rulebook.mts against the
 * app's existing src/data/class-progressions.json and prints a proposed diff
 * for human review. This script NEVER writes to class-progressions.json -
 * the rules engine's class data is hand-reviewed, not merged automatically
 * at runtime or by any script. It writes a *proposed* entries file alongside
 * the rulebook JSON for you to manually copy from after reviewing.
 *
 * The only sanctioned way ingested content extends the rules engine's
 * behavior is through class-progressions.json's data-driven fields:
 *   - advancesSpellcastingOf: names the base class a prestige class advances
 *     caster level for (src/rules/caster/effective-levels.ts)
 *   - hasDomains: grants Cleric-style domain spell slots
 *   - spellListKey: the spell-list key (e.g. "Sor/Wiz") a class draws from
 * A class needing genuinely novel mechanics beyond these three fields needs
 * a hand-written src/rules/ module - it is out of scope for ingestion.
 *
 * Usage:
 *   node scripts/merge-rulebook-classes.mts <path-to-rulebook.json>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ClassProgressionsFileSchema } from '../src/types/class-progression.ts';
import { RulebookFileSchema } from '../src/types/rulebook.ts';
import { reviewClassMerge } from './lib/class-diff.ts';

const SANCTIONED_FIELDS = ['advancesSpellcastingOf', 'hasDomains', 'spellListKey'] as const;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
  console.log('Usage: node scripts/merge-rulebook-classes.mts <path-to-rulebook.json>');
  process.exit(0);
}

const rulebookPath = args[0];
if (!fs.existsSync(rulebookPath)) {
  console.error(`Error: file not found: ${rulebookPath}`);
  process.exit(1);
}

const rulebookRaw: unknown = JSON.parse(fs.readFileSync(rulebookPath, 'utf-8'));
const rulebookResult = RulebookFileSchema.safeParse(rulebookRaw);
if (!rulebookResult.success) {
  console.error(`Error: ${rulebookPath} does not conform to RulebookFileSchema:`);
  for (const issue of rulebookResult.error.issues.slice(0, 20)) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}
const rulebook = rulebookResult.data;

const existingPath = path.join(ROOT, 'src', 'data', 'class-progressions.json');
const existingRaw: unknown = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
// Parse through the same schema as `incoming` (rulebook.classes) so both
// sides get identical Zod defaults applied before diffing - otherwise every
// class-progressions.json entry that omits an optional field (most of them
// predate advancesSpellcastingOf/hasDomains/spellListKey) would show a false
// `undefined -> null` diff against the defaulted incoming data.
const existing = ClassProgressionsFileSchema.parse(existingRaw);

if (rulebook.classes.length === 0) {
  console.log(
    `No classes found in "${rulebook.name}" (${rulebook.abbreviation}). Nothing to review.`,
  );
  process.exit(0);
}

const review = reviewClassMerge(existing, rulebook.classes);

console.log(
  `\nReviewing ${rulebook.classes.length} class(es) from "${rulebook.name}" (${rulebook.abbreviation})`,
);
console.log(`Sanctioned rule-variant extension fields: ${SANCTIONED_FIELDS.join(', ')}.`);
console.log(`Anything else needs a hand-written src/rules/ module, not a data merge.\n`);

if (review.additions.length > 0) {
  console.log(`NEW CLASSES (${review.additions.length}):`);
  for (const cls of review.additions) {
    const note = cls.advancesSpellcastingOf ? ` (advances ${cls.advancesSpellcastingOf})` : '';
    console.log(`  + ${cls.name}${note}`);
  }
  console.log();
}

if (review.updates.length > 0) {
  console.log(`CHANGED CLASSES (${review.updates.length}):`);
  for (const u of review.updates) {
    console.log(`  ~ ${u.name}`);
    for (const line of u.changes) console.log(`      ${line}`);
  }
  console.log();
}

if (review.unchanged.length > 0) {
  console.log(`UNCHANGED (${review.unchanged.length}): ${review.unchanged.join(', ')}\n`);
}

if (review.additions.length === 0 && review.updates.length === 0) {
  console.log('Nothing to merge.');
  process.exit(0);
}

const proposed = [...review.additions, ...review.updates.map((u) => u.proposed)];
const outPath = rulebookPath.replace(/\.json$/, '.classes.proposed.json');
fs.writeFileSync(outPath, JSON.stringify(proposed, null, 2));
console.log(`Proposed entries (${proposed.length}) written to: ${outPath}`);
console.log(
  '\nThis file was NOT merged automatically. Review each entry, then manually copy the\n' +
    'ones you approve into src/data/class-progressions.json, and run:\n' +
    '  npx vitest run src/data/class-progressions.test.ts\n',
);
