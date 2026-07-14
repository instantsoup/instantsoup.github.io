# Migration Plan: Converge on the Three-Layer Architecture

_Produced by a Fable 5 planning agent, 2026-07-14, from a prior Fable 5 code-review pass over commit `f911e42` ("feat: rules engine layer with full unit-test coverage; wire UI to it") and commit `32437b5` ("feat: wizard spellbook, Tainted Scholar class, and PDF rulebook ingestion system")._

All findings from the punch list verified against the code (details inline below; a few line numbers refined). Baseline: 36 test files / 504 tests, all passing (`claude.md`'s "269 tests" is stale). The `src/rules/` layer was added wholesale in the latest commit `f911e42` ("rules engine layer with full unit-test coverage; wire UI to it") but only three files were actually wired to it: `src/App.tsx` (`isWizardCharacter` only), `src/components/SpellbookPanel.tsx`, `src/components/LevelsPanel.tsx` (wizard modules only). Zero production consumers exist for `src/rules/character/*` and `src/rules/caster/*`.

---

## Headline decisions (with rationale)

**Decision A — `src/rules/` is the canonical rules layer; `src/lib/` rule modules are deleted.**
Rationale: (1) it matches the stated goal architecture; (2) `src/rules/` is the only home of the wizard subsystem (`eligibility`, `spellbook`, `specialist`, `levels`) which has no `src/lib` counterpart and is already live in the UI — migrating the other direction would mean moving 5 wizard modules into a flat 500+-line `progressions.ts`; (3) `src/rules/` has the right shape: domain-organized modules, a documented layering contract in `src/rules/index.ts`, no React/DOM imports, and a dedicated `__tests__/` suite. The cost of this direction is that `src/rules/` currently contains one real bug (point-buy table) and one deliberate drift (`isCaster`), both fixed in Phase 1 _before_ any consumer migrates. `src/lib/` survives only as a true-utilities directory (`dice.ts`, `download.ts`).

**Decision B — the app's `Spell` type (`src/types/spell.ts`) is the contract; the ingest script conforms to it.**
Rationale: `SpellSchema` is what the UI actually depends on — `src/components/SpellDetail.tsx:20` calls `spell.descriptor.length`/`.join()` and `:37-40` renders `spell.source.abbr`/`spell.source.page` unguarded. Weakening the app type to `Partial<Spell>` would spread null-guards through every spell consumer to accommodate one script. The script already runs Zod; it just validates the wrong shape.

**Decision C — rules stay hand-authored; ingestion extends behavior only through declared data fields.**
Rationale: the rules engine is already parameterized by data for the variants that matter — `advancesSpellcastingOf`, `hasDomains`, `spellListKey`, `castingType`, `spellSlotsPerDay` in `src/data/class-progressions.json` (schema at `src/types/class-progression.ts:51-58`). A new prestige class that advances Wizard casting, or a new domain-granting class, needs **zero rules-code changes** — only a validated data row. Genuinely novel mechanics (e.g. incarnum, binding) require hand-written rules modules and are explicitly out of scope for ingestion. Ingested class entries flow through a human-reviewed merge into `class-progressions.json`, not an automatic runtime merge (LLM extraction is too error-prone to feed the slot engine unreviewed).

---

## Phase 0 — Independent safety fixes and tooling baseline (3 small commits, no dependencies)

### Step 0.1 — Add a typecheck script

- **What:** Add `"typecheck": "tsc --noEmit"` to `package.json` scripts. `npm run build` is bare `vite build` (no type-checking), so nothing currently gates on `tsc` — every later step's "verify" relies on this.
- **Files:** `package.json`.
- **Verify:** `npm run typecheck` passes on the untouched tree.

### Step 0.2 — Fix the import-migration bug (independent bug fix, do it early)

- **What:** `useCharacterPersistence.importFromFile` (`src/hooks/useCharacterPersistence.ts:41-59`) calls `CharacterSchema.parse(json)` directly; `CharacterSchema` has `version: z.literal(2)` (`src/schema/schema.ts:144`), so importing a v1 export fails even though `migrateCharacter` exists in `src/store/local.ts:7-17`. Extract a shared `parseCharacter(raw: unknown): Character` (migrate → parse) in `src/store/local.ts`, export it, and use it in both `loadLocal` and `importFromFile`.
- **Files:** `src/store/local.ts`, `src/hooks/useCharacterPersistence.ts`, `src/store/local.test.ts` (add: v1 JSON round-trips through `parseCharacter`).
- **Why now:** user-facing data bug, zero coupling to the rules migration.
- **Verify:** new unit test importing a `version: 1` fixture; full suite green.

### Step 0.3 — Fix silent data loss in `loadLocal`

- **What:** `src/store/local.ts:33-45` swallows any parse failure and returns `emptyCharacter()`; the next autosave overwrites the original. Before returning empty, copy the raw string to a backup key (e.g. `v0-char-backup`) and `console.warn`. Only write the backup if one doesn't already exist for this failure (don't clobber an earlier backup with the empty character's own corruption).
- **Files:** `src/store/local.ts`, `src/store/local.test.ts` (jsdom localStorage tests: unparseable payload → backup key populated, empty character returned).
- **Verify:** new tests; suite green.

---

## Phase 1 — Make `src/rules/` correct and complete (must precede any consumer migration)

### Step 1.1 — Fix the point-buy table bug

- **What:** `src/rules/character/ability-scores.ts:24-41` has a wrong table (`8: -1, 9: 1, 10: 2 … 14: 7, 15: 9, 16: 12, 17: 15, 18: 19`); the correct RAW table is in `src/lib/statline.ts:4-21` (`8: 0 … 14: 6, 15: 8, 16: 10, 17: 13, 18: 16`). Replace the table and the sub-3 clamp semantics to match `statline.costOf`, and fix `src/rules/__tests__/ability-scores.test.ts`, which currently asserts the wrong values.
- **Files:** `src/rules/character/ability-scores.ts`, `src/rules/__tests__/ability-scores.test.ts`.
- **Why first:** this code is dead today (zero production consumers — verified), so it's a zero-risk fix; it must land before Step 1.3 folds `statline.ts` in and before anything migrates onto `rules/`.
- **Verify:** corrected tests assert the PHB values and assert agreement with `lib/statline.costOf` for 3–18 (delete that cross-check assertion in Phase 3 when statline is removed).

### Step 1.2 — Reconcile drifted duplicate behavior, with characterization tests

- **What:** For each duplicated pair, diff behavior and lock the winner in `src/rules/__tests__/`:
  - `isCaster`: `src/rules/caster/caster-summary.ts:42-47` also counts `advancesSpellcastingOf` classes; `src/lib/progressions.ts:412-417` doesn't. **Keep the rules version** — it's correct: `buildEffectiveLevels` (`src/rules/caster/effective-levels.ts`) grants slots to a character whose only levels are in a casting-advancing PrC, so `isCaster` must be true for them. Add a test naming this case explicitly.
  - Port every behavior asserted in `src/lib/progressions.test.ts`, `src/lib/encumbrance.test.ts`, `src/lib/conditions.test.ts`, `src/lib/mods.test.ts`, `src/lib/statline.test.ts` into the corresponding `src/rules/__tests__/` file if not already covered (spot-checks show the implementations are line-for-line duplicates for bab/encumbrance/spell-slots, but do the diff mechanically: `diff <(…)` per pair).
- **Files:** `src/rules/__tests__/*.test.ts` only (test additions).
- **Why here:** guarantees Phase 2's import swaps are behavior-preserving, and Phase 3's deletion of `src/lib/*.test.ts` loses no coverage.
- **Verify:** suite green; every `lib` test case has a `rules` twin.

### Step 1.3 — Close the API gaps so no consumer will need `src/lib`

- **What:**
  - Move `getRacialMods` (only in `src/lib/progressions.ts:50-53`; a pure data lookup) to `src/data/races.ts` — it belongs in the data layer, not rules.
  - Fold `src/lib/statline.ts` (`costOf`, `totalCost`, `adjustTo28`, `roll3d6`, `rollStatLine`) into `src/rules/character/ability-scores.ts` (point-buy and 3d6 generation are D&D rules). Keep old names exported from rules to make Step 2.6's swap mechanical.
  - Confirm exports exist in rules for everything consumers use (verified present: `calculateTotalBAB/Save/MaxHP`, `getIterativeAttacks`, `formatAttacks`, `xpForLevel`, `calculateSpellSlots`, `getCasterSummary`, `computeConditionPenalties`, `computeMods`, `getEncumbranceSummary`, skills functions — note rules renamed several: `cumulativeSkillRanks`, `maxSkillRanks`, `skillPointsAvailableAtLevel`, `skillPointsSpentAtLevel`, `heavyLoad`/`lightLoad`/`mediumLoad`/`loadCategory`). **Do not add back-compat aliases** for the renames; Phase 2 updates call sites to the rules names so there's exactly one name per function at the end.
- **Files:** `src/data/races.ts` (+test), `src/rules/character/ability-scores.ts` (+tests), `src/rules/character/index.ts`.
- **Verify:** typecheck + suite green; `lib/statline.ts` untouched (still the live copy until 2.6).

---

## Phase 2 — Migrate consumers off `src/lib`, one commit per cluster (all depend on Phase 1)

Ordering principle: leaf display components first (lowest fan-out, identical function names → pure import-path swaps), then components needing renames, then hooks (highest fan-out), then `App.tsx` last (it aggregates everything). After each step: `npm run typecheck && npm test && npm run check`, plus a `npm run dev` smoke of the affected panel.

| Step    | Consumers (files)                                                                                                                                                                                                                                        | lib imports being replaced                                                                                                                                                                                            | Notes                                                                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1** | `src/components/SavesPanel.tsx`, `CombatStats.tsx`, `HPTracker.tsx`, `StickyBar.tsx`                                                                                                                                                                     | `calculateTotalSave`, `calculateTotalBAB`, `calculateMaxHP`                                                                                                                                                           | Names identical in `src/rules/character` — import-path-only diff.                                                                                                                 |
| **2.2** | `src/components/WeaponsPanel.tsx`                                                                                                                                                                                                                        | `formatAttacks`, `getIterativeAttacks`                                                                                                                                                                                | Identical names in `rules/character/bab`.                                                                                                                                         |
| **2.3** | `src/components/EquipmentPanel.tsx`, `PlaySheet.tsx` (encumbrance imports only)                                                                                                                                                                          | `getHeavyLoad/getLightLoad/getMediumLoad/getLoadCategory`, `getEncumbranceSummary`                                                                                                                                    | Renames: `heavyLoad`, `lightLoad`, `mediumLoad`, `loadCategory`; `getEncumbranceSummary` keeps its name.                                                                          |
| **2.4** | `src/components/SkillsPanel.tsx`, `SkillSpendingPanel.tsx`, `LevelsPanel.tsx` (its two skills imports at lines 8-10)                                                                                                                                     | `calculateCumulativeSkillRanks`, `calculateMaxRanks`, `calculateSkillPointsAvailableAtLevel`, `calculateSkillPointsSpentAtLevel`                                                                                      | Renames: `cumulativeSkillRanks`, `maxSkillRanks`, `skillPointsAvailableAtLevel`, `skillPointsSpentAtLevel`. LevelsPanel already imports rules wizard modules — this completes it. |
| **2.5** | `src/hooks/useCharacter.ts` (`computeConditionPenalties` ← `lib/conditions`), `useCharacterScores.ts` (`computeMods` ← `lib/mods`, `getRacialMods` ← `lib/progressions` → now `data/races`), `useCharacterLevels.ts` (`recalculateSkillPointsFromLevel`) |                                                                                                                                                                                                                       | Hooks feed everything; migrate only after 2.1–2.4 proved parity in the field.                                                                                                     |
| **2.6** | `src/components/RollCharacterPanel.tsx`                                                                                                                                                                                                                  | `adjustTo28`, `rollStatLine`, `totalCost`, `StatLine` ← `lib/statline`                                                                                                                                                | Swap to the rules copies created in 1.3.                                                                                                                                          |
| **2.7** | `src/App.tsx` (lines 27-34), `PlaySheet.tsx` (remaining progressions imports, lines 5-12)                                                                                                                                                                | `getEncumbranceSummary`, `calculateSpellSlots`, `calculateTotalBAB`, `getCasterSummary`, `getRacialMods`, `xpForLevel`, `calculateTotalSave`, `formatAttacks`, `getIterativeAttacks`, `getPrimarySpellcastingAbility` | Last because App aggregates all state; the `isCaster`/caster-summary drift was resolved in 1.2 so `getCasterSummary` from `rules/caster` is a safe swap.                          |

Untouched by design: `DiceRollerPanel.tsx` (`lib/dice`) and `useCharacterPersistence.ts` (`lib/download`) — genuine utilities, stay in `src/lib`.

---

## Phase 3 — Delete the losing copy and lock the layering (depends on all of Phase 2)

### Step 3.1 — Delete dead lib modules

- **What:** Delete `src/lib/progressions.ts`, `src/lib/encumbrance.ts`, `src/lib/conditions.ts`, `src/lib/mods.ts`, `src/lib/statline.ts` and their five `.test.ts` files (coverage already ported in 1.2). Remove the statline↔rules cross-check test from 1.1. `src/lib/` retains only `dice.ts`, `download.ts` (+tests).
- **Verify:** `git grep -n "lib/progressions\|lib/encumbrance\|lib/conditions\|lib/mods\|lib/statline" src/` returns nothing; typecheck + suite green; test count should drop by exactly the deleted duplicate cases.

### Step 3.2 — Enforce the layering with ESLint

- **What:** Add `import/no-restricted-paths` zones to `eslint.config` (the repo already uses `eslint-plugin-import`): (a) `src/rules/**` may not import from `src/components/**`, `src/hooks/**`, or `react`; (b) `src/data/**` may not import from `src/rules/**` or `src/components/**`. This is the mechanical guard that prevents the re-divergence documented in Phase 6.
- **Files:** `eslint.config.js` (or `.mjs` — whichever exists at root).
- **Verify:** `npm run lint` passes; temporarily adding a forbidden import fails lint (manual check, then revert).

---

## Phase 4 — Wire the dead rules functions into the UI (each an independent commit; depends only on Phase 1)

These can interleave with Phase 2 but are listed separately because they change _call sites_, not import paths:

1. **Specialist +1 slot bonus:** replace the inline `Object.fromEntries(...map(([k, v]) => [k, v + 1]))` in `src/App.tsx:156-160` and its duplicate in `src/components/SpellbookPanel.tsx:126` with `calculateEffectiveSlots(levels, scores, wizardSpecialty)` from `src/rules/caster/spell-slots.ts:53-61`. Prefer computing once in `App.tsx` and passing `effectiveSlots` down so SpellbookPanel's copy disappears entirely.
2. **Forbidden-school cap:** replace `wizardSpecialty === 'Divination' ? 1 : 2` at `SpellbookPanel.tsx:219` and `:567` with `maxForbiddenSchools()` from `src/rules/wizard/specialist.ts`; also adopt `toggleForbiddenSchool()` for the toggle handler if the panel reimplements it.
3. **Spell acquisition costs:** replace the inline `100 * Math.max(1, lvl)` / `1000 * Math.max(1, lvl)` at `SpellbookPanel.tsx:187-196` and `:718-722` with `copySpellCost()` / `researchSpellCost()` from `src/rules/wizard/spellbook.ts` (the static label strings at `:602`, `:687-688` may stay literal).
4. **Spell DC:** replace `10 + Number(lvl) + castingMod` at `src/components/PreparedSpellsPanel.tsx:163` with `spellDC()` from `src/rules/caster/caster-summary.ts:68-70`.

**Verify each:** identical rendered values (existing wizard rules tests cover the functions; do a dev-server smoke on the Spellbook/Prepared panels), suite green.

---

## Phase 5 — Fix the PDF-ingestion → data-layer contract (independent of Phases 2–4; needs nothing from them)

### Step 5.1 — Single shared Zod schema for rulebook files

- **What:** Create `src/types/rulebook.ts` defining `RulebookFileSchema` with Zod: `spells: SpellSchema[]` (reusing `src/types/spell.ts`), `classes: ClassProgressionSchema`-compatible entries (with `advancesSpellcastingOf`, `hasDomains`, `spellListKey` — fixing the loader's phantom `advancesClass` field at `src/data/rulebook-loader.ts:42` by deletion), plus feats/races/items schemas, and book metadata (`name`, `abbreviation`, `slug`, `pageCount`, `extractedAt`). The ingest script imports this same module — since `engines` requires Node ≥ 24 (native TS type-stripping), the cleanest path is renaming `scripts/ingest-rulebook.mjs` → `.mts` and importing `../src/types/rulebook.ts` directly; the script's local schema definitions (`ingest-rulebook.mjs:101-165`) are deleted.
- **Why first in this phase:** everything else in Phase 5 keys off one schema existing in exactly one place.
- **Verify:** typecheck; a schema unit test (`src/types/rulebook.test.ts`) parses a small fixture file.

### Step 5.2 — Make ingest output conform to `Spell`

- **What:** In the ingest script: emit `descriptor` as `string[]` (prompt change at `ingest-rulebook.mjs:213` + schema), emit `source: { abbr, page }` per spell (script knows `abbr`; ask the model for the page number, `null` if absent), and default the `SpellSchema`-required string fields (`components`, `castingTime`, …) to `''` rather than omitting. Additionally: `SourceAbbrev` is `z.enum` over `src/data/sourcebook-abbrevs.json` (`src/types/spell.ts:3-5`), so the script must fail fast with a clear message if `--abbr` isn't in that list, instructing the operator to add it — otherwise every spell in the book fails load-time validation.
- **Files:** `scripts/ingest-rulebook.mts`, possibly `src/data/sourcebook-abbrevs.json` (operator-driven additions).
- **Verify:** run the script against a small test PDF (manual, needs `ANTHROPIC_API_KEY`); output file parses under `RulebookFileSchema.parse` — add a script-side final `RulebookFileSchema.parse(output)` before writing so a nonconforming file can never be produced.

### Step 5.3 — Zod-validate in `rulebook-loader.ts` and delete the casts

- **What:** Replace the interface cast at `src/data/rulebook-loader.ts:14-16` with per-module `RulebookFileSchema.safeParse`; on failure, `console.error` the file path + issues and skip that book (never blindly merge). Delete the hand-written `RulebookFile`/`RulebookClass`/etc. interfaces (types now infer from Zod). Export `rulebookSpells: Spell[]` (full type). Then in `src/data/spells.ts` delete both `as unknown as Spell[]` casts (lines 10 and 20). Prune dead exports: keep `rulebookSpells`, `findRulebookSpell`, `getLoadedRulebookSummary` (for future attribution UI) and `rulebookClasses` (consumed by 5.5's review flow); delete `rulebookFeats`/`rulebookRaces`/`rulebookItems` until a consumer exists — unused exports are exactly what masked the `advancesClass` bug.
- **Files:** `src/data/rulebook-loader.ts`, `src/data/spells.ts`, new `src/data/rulebook-loader.test.ts` (fixture-driven: valid book loads; malformed book is skipped with error, not thrown).
- **Verify:** typecheck confirms `SpellDetail.tsx` is now sound with no code change (its unguarded `spell.descriptor`/`spell.source` derefs become genuinely type-true); suite green.

### Step 5.4 — Ingestion robustness (chunking/retry)

- **What:** In the ingest script: (a) overlap chunks by ~4–8k chars so entries split at an 80k boundary appear whole in one chunk (the existing name-dedupe at `ingest-rulebook.mjs:360-375` absorbs the duplicates); (b) check `response.stop_reason === 'max_tokens'` and, when hit, split that chunk in half and re-request; (c) retry a failed/unparseable chunk once before discarding, and record discarded chunk indices in the output metadata so the operator knows coverage is incomplete. Extract the chunking function as a pure helper so it gets a unit test.
- **Files:** `scripts/ingest-rulebook.mts` (+ a small pure-helper test if the helper moves somewhere testable, e.g. `scripts/lib/chunk.ts`).
- **Verify:** helper unit test for overlap/boundary behavior; manual run on a test PDF.

### Step 5.5 — Class-content flow (implements Decision C)

- **What:** Add a script `scripts/merge-rulebook-classes.mts` (or extend ingest with `--merge-classes`) that takes validated rulebook class entries and emits a _proposed_ diff against `src/data/class-progressions.json` for human review — never auto-merged at runtime. Document in the script output that `advancesSpellcastingOf` / `hasDomains` / `spellListKey` are the only sanctioned rule-variant extension points; anything else needs a hand-written `src/rules/` module.
- **Verify:** `src/data/class-progressions.test.ts` (existing) validates the merged JSON; run it after any merge.

---

## Phase 6 — Update `claude.md` (last, after the architecture is real; small doc-only commit)

- **What:** In `/workspaces/instantsoup.github.io/claude.md`:
  - Replace the "Calculations Library" section (lines 75-100, which documents `src/lib/progressions.ts`/`encumbrance.ts` as _the_ library — the root cause of the divergence) with a "Rules Engine (`src/rules/`)" section: module map (`character/`, `caster/`, `wizard/`), the layering contract (data → rules → UI; rules import only from `src/data` + `src/types`; components/hooks never inline rule math), and the renamed function names.
  - Add a "Rulebook ingestion" section: `scripts/ingest-rulebook.mts` → `RulebookFileSchema` → `src/data/rulebooks/*.json` → `rulebook-loader.ts` (Zod-validated at load), abbr must exist in `sourcebook-abbrevs.json`, class entries merge via reviewed diff, and the three data-driven rule-extension fields.
  - Update the Key Files table (swap `src/lib/progressions.ts`/`src/lib/encumbrance.ts` rows for `src/rules/` rows; add `src/data/rulebook-loader.ts`, `src/types/rulebook.ts`), the stale test count, and the tooltip-pattern code sample's import path. Mention the ESLint layering guard from 3.2 so future agents know it exists. Mirror any duplicated architecture text in `readme.md`.

---

## Dependency graph summary

- Phase 0 (0.1–0.3): fully independent; do first.
- Phase 1 → gates Phase 2 and Phase 4. (1.1 gates 1.3; 1.2 gates Phase 3's test deletion.)
- Phase 2 steps in order 2.1→2.7 (leaf→hooks→App); Phase 4 items can interleave anywhere after Phase 1.
- Phase 3 requires all of Phase 2.
- Phase 5 is independent of Phases 2–4 and can run in parallel; internally 5.1 → 5.2 → 5.3, with 5.4/5.5 after 5.2.
- Phase 6 last.

Every step is verified by: `npm run typecheck` (new in 0.1) + `npm test` (vitest; the pre-commit hook also runs prettier → eslint --fix → inline-style guard → vitest) + a `npm run dev` smoke of the touched panel. New tests are called out per step; the bulk of new test writing is in 0.2/0.3 (persistence), 1.1/1.2 (rules parity/characterization), 5.1/5.3/5.4 (rulebook schema, loader fixtures, chunk helper).

### Critical Files for Implementation

- /workspaces/instantsoup.github.io/src/lib/progressions.ts (the 517-line live copy every consumer migrates off)
- /workspaces/instantsoup.github.io/src/rules/index.ts (canonical rules-layer entry point and its `character/`, `caster/`, `wizard/` modules)
- /workspaces/instantsoup.github.io/src/data/rulebook-loader.ts (unvalidated-cast hotspot; Phase 5 pivot)
- /workspaces/instantsoup.github.io/scripts/ingest-rulebook.mjs (schema-mismatch source; becomes `.mts` sharing `src/types/rulebook.ts`)
- /workspaces/instantsoup.github.io/src/App.tsx (aggregates both layers today; final consumer migration + specialist-slot de-inlining)
