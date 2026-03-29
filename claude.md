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
npm run test               # run all tests (269 tests, all passing)
npm run test:watch         # watch mode
npm run test:coverage      # v8 coverage report
npm run lint               # ESLint check
npm run check              # format + lint + inline-style guard
npm run validate:feats     # validate feats.json with Zod
npm run validate:skills    # validate skills.json with Zod
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

`conditionPenalties` is computed via `useMemo` in `useCharacter` from `extras.statusEffects` using `computeConditionPenalties()` in `src/lib/conditions.ts`, then passed into `useCharacterScores` so STR/DEX penalties propagate automatically into all derived stats.

### Data-Driven Pattern

```
src/data/*.json      → source of truth
src/types/*.ts       → Zod schema + TypeScript type
src/data/*.ts        → validated exports + named constants (e.g. RACE_NAMES)
src/schema/schema.ts → uses z.enum(DERIVED_CONSTANTS)
```

Every `src/data/*.ts` module has a co-located `*.test.ts`.

### Calculations Library

`src/lib/progressions.ts` exports pure functions returning `CalculationBreakdown`:

```ts
interface CalculationBreakdown {
  total: number;
  components: Array<{ label: string; value: number }>;
}

calculateTotalBAB(levels)              → CalculationBreakdown
calculateTotalSave(levels, saveType)   → CalculationBreakdown
calculateMaxHP(levels, conMod)         → CalculationBreakdown
calculateCumulativeSkillRanks(levels)  → Record<skillName, ranks>
```

`src/lib/encumbrance.ts` — PHB Table 9-1 helpers:

```ts
getHeavyLoad(str)                            → number (lbs)
getLightLoad(str) / getMediumLoad(str)       → number
getLoadCategory(totalWeight, str)            → 'light' | 'medium' | 'heavy' | 'overloaded'
getEncumbranceMaxDex(cat)                    → Infinity | 3 | 1  (DEX cap for AC)
getEncumbranceACP(cat)                       → 0 | 3 | 6         (extra ACP from load)
getEncumbranceSpeed(baseSpeed, cat)          → reduced speed (PHB ×3/4, rounded to 5 ft)
```

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
❌ No backend, no analytics, no product identity content

---

## Key Files

| File                                | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| `src/App.tsx`                       | Mode/tab routing, all prop wiring            |
| `src/components/PlaySheet.tsx`      | Compact play mode character tab              |
| `src/components/WeaponsPanel.tsx`   | Weapon CRUD (build) and attack cards (play)  |
| `src/components/EquipmentPanel.tsx` | Equipment list with weight/encumbrance       |
| `src/components/SkillsPanel.tsx`    | Skills list (build + play, readOnly)         |
| `src/components/TabNav.tsx`         | Mode-aware tab nav with mode toggle button   |
| `src/lib/progressions.ts`           | BAB, saves, HP, skill rank calculations      |
| `src/lib/encumbrance.ts`            | PHB Table 9-1 load limits by STR             |
| `src/lib/conditions.ts`             | `computeConditionPenalties()` aggregator     |
| `src/data/conditions.ts`            | Condition list with penalty definitions      |
| `src/schema/schema.ts`              | CharacterSchema (Zod)                        |
| `src/hooks/useCharacter.ts`         | Composed character state                     |
| `src/styles/play.css`               | Stat cards, play sheet layout                |
| `src/styles/play-panels.css`        | Equipment, weapons, resources, status panels |
| `src/styles/skills.css`             | Skill list layout and badges                 |
| `src/styles/tabs.css`               | Tab nav + `.sticky-bar*` CSS (kept, unused)  |
| `readme.md`                         | Full feature docs and UI pattern reference   |
