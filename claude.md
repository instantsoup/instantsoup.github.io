# claude.md

Guidance for Claude Code when working in this repository.

## Project Overview

**D&D 3.5e Character Sheet** — Client-only React/Vite SPA. No backend, API, or database ever.
Persistence: localStorage (`v0-char` key) + JSON import/export only.

**Live:** https://instantsoup.github.io/dnd35/

---

## Commands

```bash
npm run dev                # dev server
npm run build              # production build → /dist
npm run test               # run all tests (`npm test` prints the current count)
npm run test:watch         # watch mode
npm run test:coverage      # v8 coverage report
npm run typecheck          # tsc --noEmit
npm run lint               # ESLint check
npm run check              # format + lint + inline-style guard
npm run validate:feats     # validate feats.json with Zod
npm run validate:skills    # validate skills.json with Zod
npm run ingest-rulebook    # extract spells/classes/etc. from a PDF (needs ANTHROPIC_API_KEY)
npm run merge-rulebook-classes  # review ingested class entries against class-progressions.json
```

---

## Architecture

### Mode / Tab Routing (App.tsx)

```
mode: 'build' | 'play'
tab:  'character' | 'build' | 'skills' | 'spells'

Build tabs:  character  build
Play tabs:   character  skills  spells

tab==='character' && mode==='build'  →  identity editing panels
tab==='character' && mode==='play'   →  PlaySheet (compact play dashboard)
tab==='skills'                       →  SkillsPanel readOnly
tab==='spells'                       →  SpellSlotsPanel readOnly + SpellsSummary
```

Mode toggle button is in `TabNav` (right-aligned pill). Always lands on `'character'` in both directions.

### Hook Composition

`useCharacter` composes these domain hooks:

| Hook                      | Owns                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `useCharacterIdentity`    | name, race, alignment, flaws, languages                                                     |
| `useCharacterScores`      | ability scores, effective scores (−abilityDamage −condPen), mods                            |
| `useCharacterLevels`      | levels, feats, spells, skill ranks                                                          |
| `useCharacterCombat`      | HP, AC components, saves, spell slots, weapons                                              |
| `useCharacterExtras`      | taint, custom resources, notes, status effects, ability damage, equipment, skillMiscBonuses |
| `useCharacterPersistence` | localStorage, JSON import/export                                                            |

`conditionPenalties` is computed via `useMemo` in `useCharacter` from `extras.statusEffects` using `computeConditionPenalties()` from `src/rules/character`, then passed into `useCharacterScores` so STR/DEX penalties propagate automatically into all derived stats.

### Data-Driven Pattern

```
src/data/*.json      → source of truth
src/types/*.ts       → Zod schema + TypeScript type
src/data/*.ts        → validated exports + named constants (e.g. RACE_NAMES)
src/schema/schema.ts → uses z.enum(DERIVED_CONSTANTS)
```

Every `src/data/*.ts` module has a co-located `*.test.ts`.

### Rules Engine (`src/rules/`)

`src/rules/` is the **sole holder of D&D 3.5e rule logic**. Layering contract:

```
src/data/*      (static content, Zod-validated at load)
      ↓
src/rules/*     (pure rule logic — no React/DOM, imports only src/data + src/types)
      ↓
src/components/, src/hooks/   (UI — consumes rules + data, never inlines rule math)
```

This is enforced mechanically by ESLint (`eslint.config.js`): `import/no-restricted-paths` blocks
`src/rules/**` from importing `src/components/**` or `src/hooks/**`, and `src/data/**` from
importing `src/rules/**` or `src/components/**`; a separate `no-restricted-imports` rule bans
`react`/`react-dom` inside `src/rules/**`. If you're adding a new calculation, it goes in
`src/rules/`, not inlined in a component — a duplicate/orphaned reimplementation of rules logic is
exactly the bug this layer was created to fix (see `docs/plans/rules-engine-migration-plan.md`).

Module map — import from the top-level barrel `src/rules` (re-exports all three):

| Module             | Owns                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| `rules/character/` | ability scores/point-buy, BAB, saves, HP, skills, encumbrance, conditions, XP       |
| `rules/caster/`    | caster summary/DC, effective caster level (prestige-class advancement), spell slots |
| `rules/wizard/`    | specialist eligibility, spellbook rules, level progression                          |

Every module returns pure functions; calculation-breakdown functions return:

```ts
interface CalculationBreakdown {
  total: number;
  components: Array<{ label: string; value: number }>;
}

calculateTotalBAB(levels)              → CalculationBreakdown
calculateTotalSave(levels, saveType)   → CalculationBreakdown
calculateMaxHP(levels, conMod)         → CalculationBreakdown
cumulativeSkillRanks(levels)           → Record<skillName, ranks>
```

PHB Table 9-1 encumbrance helpers (`rules/character/encumbrance.ts`):

```ts
heavyLoad(str)                                → number (lbs)
lightLoad(str) / mediumLoad(str)              → number
loadCategory(totalWeight, str)                → 'light' | 'medium' | 'heavy' | 'overloaded'
encumbranceMaxDex(cat)                        → Infinity | 3 | 1  (DEX cap for AC)
encumbranceACP(cat)                           → 0 | 3 | 6         (extra ACP from load)
encumbranceSpeed(baseSpeed, cat)              → reduced speed (PHB ×3/4, rounded to 5 ft)
getEncumbranceSummary(equipment, str, acp, baseSpeed) → EncumbranceSummary (bundles all four)
```

Skill-point helpers (`rules/character/skills.ts`) are named `skillPointsAvailableAtLevel`,
`skillPointsSpentAtLevel`, `maxSkillRanks`, `cumulativeSkillRanks` — not the `calculate*` names an
earlier duplicate copy in `src/lib/` used before that copy was deleted.

`src/lib/` now holds **only true utilities with no game-rule content**: `dice.ts`, `download.ts`.

### Rulebook Ingestion (`scripts/ingest-rulebook.mts`)

Extracts spells/classes/feats/races/items from a PDF via the Anthropic API and writes
`src/data/rulebooks/<slug>.json`:

```
PDF → scripts/ingest-rulebook.mts → RulebookFileSchema.parse() gate → src/data/rulebooks/*.json
                                            (src/types/rulebook.ts)
                                                    ↓
                              src/data/rulebook-loader.ts (Zod-validates again at app load time,
                                                            skips a malformed file rather than
                                                            trusting it blindly)
                                                    ↓
                                    src/data/spells.ts (allSpells = SRD + rulebookSpells)
```

`RulebookFileSchema` (`src/types/rulebook.ts`) is imported by **both** the ingest script and the
app — the single source of truth that keeps them from drifting apart. Key points:

- Every ingested spell must fully conform to the app's real `SpellSchema` (`src/types/spell.ts`),
  including a `source: { abbr, page }` object — the script assembles this from `--abbr` and a
  per-spell page number it asks the model for.
- `--abbr` must already exist in `src/data/sourcebook-abbrevs.json`; the script fails fast (before
  touching the PDF or the API) if it doesn't.
- Class entries carry the rules engine's data-driven extension fields — `advancesSpellcastingOf`
  (prestige-class caster-level advancement), `hasDomains`, `spellListKey` — which is how a new
  class can extend rule behavior **without touching `src/rules/` code**. A genuinely novel
  mechanic (not expressible via those fields) needs a hand-written `src/rules/` module instead.
- Ingested class entries are never merged into `src/data/class-progressions.json` automatically.
  Run `npm run merge-rulebook-classes -- <path-to-rulebook.json>` to get a reviewed diff and a
  `*.classes.proposed.json` file to manually copy from.
- Text is chunked with overlap (`scripts/lib/chunk.ts`) so entries at chunk boundaries aren't
  split/dropped; a chunk that fails is retried once, and any still-unextractable chunks are
  recorded in the output file's `discardedChunks` field.

---

## UI Patterns

### Displaying Calculated Numbers

**Any computed value shown in play mode must have a `title` tooltip showing the full breakdown.**

```tsx
// Build tooltip from CalculationBreakdown
const result = calculateTotalSave(levels, 'fortitude');
const tooltip = [
  ...result.components.map((c) => `${c.label}: +${c.value}`),
  `CON: ${mods.con >= 0 ? '+' : ''}${mods.con}`,
  miscBonus !== 0 ? `Bonus: +${miscBonus}` : null,
  condSave !== 0 ? `Conditions: ${condSave}` : null,
]
  .filter(Boolean)
  .join('\n');

// Render as stat card
<div className="play-sheet__stat" title={tooltip}>
  <span className="play-sheet__stat-label">Fort</span>
  <span className="play-sheet__stat-value">+5</span>
</div>;
```

Standard tooltip content per value:

| Value         | Sources                                                          |
| ------------- | ---------------------------------------------------------------- |
| BAB           | `calculateTotalBAB(levels).components`                           |
| Fort/Ref/Will | `calculateTotalSave` components + ability mod + misc + cond      |
| AC            | `10 base`, DEX mod (0 if loseDexToAC), armor, shield, misc, cond |
| Init          | DEX mod + misc bonus + cond                                      |
| HP            | `calculateMaxHP` components                                      |
| Skill total   | `N ranks\n+M ABILITY`                                            |
| Weapon attack | `BAB ±N, ability ±N, bonus ±N, conditions ±N`                    |

Add `cursor: help` on the container when a tooltip is present.

### Stat Cards (compact display)

```tsx
<div className="play-sheet__stat" title={tooltip}>
  <span className="play-sheet__stat-label">LABEL</span> // small, uppercase, muted
  <span className="play-sheet__stat-value">+5</span> // large, bold, tabular-nums
</div>
```

### Condition Penalties Flow

`ConditionPenalties` (from `src/data/conditions.ts`) has fields: `str`, `dex`, `attack`, `save`, `ac`, `initiative`, `loseDexToAC`.

- `str`/`dex` subtract from `effectiveScores` inside `useCharacterScores` → all downstream (saves, AC, skills) update automatically
- `attack`, `save`, `ac`, `initiative` are flat values applied in `PlaySheet` display and `WeaponsPanel`
- `loseDexToAC` zeroes the DEX-to-AC contribution in `PlaySheet`

### `readOnly` Prop

Components that appear in both build and play modes accept `readOnly?: boolean`:

- Inputs → static spans
- Add/remove/edit controls hidden
- The accordion/PanelSection wrapper is NOT aware of readOnly — only the leaf component

Components with readOnly support: `CombatStatsPanel`, `SavesPanel`, `SpellSlotsPanel`, `SkillsPanel`, `FlawsPanel`, `LanguagesPanel`, `TaintPanel`, `NotesPanel`, `WeaponsPanel`.

### Schema Changes

New fields: use `.optional().default(value)` for backward compatibility. Existing saved characters load without error, no version bump needed for additive changes.

---

## Code Conventions

- **No inline styles** — enforced by pre-commit guard. CSS only in `src/styles/`.
- **Named exports** — all modules except `App.tsx` (default export)
- **Co-located tests** — `foo.ts` → `foo.test.ts`
- **Zod everywhere** — all runtime data validated at load
- **Exact dep versions** — no `^` or `~` in package.json
- **CSS custom properties** — `var(--space-N)`, `var(--clr-*)`, `var(--clr-border)`, `var(--clr-border-strong)`
- **BEM-style class names** — `.play-sheet__stat-label`, `.skill-item--class`
- Pre-commit hook order: Prettier → ESLint fix → inline-style guard → Vitest

---

## Boundaries

✅ Client-only features, additive schema changes, SRD/OGL content
❌ No homebrew content — official D&D 3.5e SRD/OGL material only (PHB, DMG, MM, Complete series, etc.)
❌ No product identity content (Forgotten Realms / Eberron proper nouns, etc.)
❌ No backend, no analytics

---

## Key Files

| File                                        | Purpose                                                             |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `src/App.tsx`                               | Mode/tab routing, all prop wiring                                   |
| `src/components/PlaySheet.tsx`              | Compact play mode character tab                                     |
| `src/components/WeaponsPanel.tsx`           | Weapon CRUD (build) and attack cards (play)                         |
| `src/components/EquipmentPanel.tsx`         | Equipment list with weight/encumbrance                              |
| `src/components/SkillsPanel.tsx`            | Skills list (build + play, readOnly)                                |
| `src/components/TabNav.tsx`                 | Mode-aware tab nav with mode toggle button                          |
| `src/rules/index.ts`                        | Rules engine entry point (barrel export)                            |
| `src/rules/character/`                      | BAB, saves, HP, skills, encumbrance, conditions, ability scores, XP |
| `src/rules/caster/`                         | Caster summary/DC, effective caster level, spell slots              |
| `src/rules/wizard/`                         | Specialist, spellbook, eligibility, level rules                     |
| `src/data/conditions.ts`                    | Condition list with penalty definitions                             |
| `src/types/rulebook.ts`                     | `RulebookFileSchema` shared by ingestion + loader                   |
| `src/data/rulebook-loader.ts`               | Zod-validates and merges `src/data/rulebooks/*.json`                |
| `scripts/ingest-rulebook.mts`               | PDF → rulebook JSON extraction (Anthropic API)                      |
| `scripts/merge-rulebook-classes.mts`        | Human-reviewed diff for ingested class content                      |
| `src/schema/schema.ts`                      | CharacterSchema (Zod)                                               |
| `src/hooks/useCharacter.ts`                 | Composed character state                                            |
| `src/styles/play.css`                       | Stat cards, play sheet layout                                       |
| `src/styles/play-panels.css`                | Equipment, weapons, resources, status panels                        |
| `src/styles/skills.css`                     | Skill list layout and badges                                        |
| `src/styles/tabs.css`                       | Tab nav + `.sticky-bar*` CSS (kept, unused)                         |
| `readme.md`                                 | Full feature docs and UI pattern reference                          |
| `docs/plans/rules-engine-migration-plan.md` | Rationale/history for the rules-engine + ingestion architecture     |
