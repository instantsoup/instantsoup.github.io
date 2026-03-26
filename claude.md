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
npm run test               # run all tests (206 tests, all passing)
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

Mode toggle always lands on `'character'` in both directions.

### Hook Composition

`useCharacter` composes these domain hooks:

| Hook | Owns |
|---|---|
| `useCharacterIdentity` | name, race, alignment, flaws, languages |
| `useCharacterScores` | ability scores, modifiers |
| `useCharacterLevels` | levels, feats, spells, skill ranks |
| `useCharacterCombat` | HP, AC components, saves, spell slots |
| `useCharacterExtras` | taint, custom resources, notes |
| `useCharacterPersistence` | localStorage, JSON import/export |

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

---

## UI Patterns

### Displaying Calculated Numbers

**Any computed value shown in play mode must have a `title` tooltip showing the full breakdown.**

```tsx
// Build tooltip from CalculationBreakdown
const result = calculateTotalSave(levels, 'fortitude');
const tooltip = [
  ...result.components.map(c => `${c.label}: +${c.value}`),
  `CON: ${mods.con >= 0 ? '+' : ''}${mods.con}`,
  miscBonus !== 0 ? `Bonus: +${miscBonus}` : null,
].filter(Boolean).join('\n');

// Render as stat card
<div className="play-sheet__stat" title={tooltip}>
  <span className="play-sheet__stat-label">Fort</span>
  <span className="play-sheet__stat-value">+5</span>
</div>
```

Standard tooltip content per value:

| Value | Sources |
|---|---|
| BAB | `calculateTotalBAB(levels).components` |
| Fort/Ref/Will | `calculateTotalSave` components + ability mod + misc |
| AC | `10 base`, DEX mod, armor, shield, misc |
| Init | DEX mod + misc bonus |
| HP | `calculateMaxHP` components |
| Skill total | `N ranks\n+M ABILITY` |

Add `cursor: help` on the container when a tooltip is present.

### Stat Cards (compact display)

```tsx
<div className="play-sheet__stat" title={tooltip}>
  <span className="play-sheet__stat-label">LABEL</span>   // small, uppercase, muted
  <span className="play-sheet__stat-value">+5</span>       // large, bold, tabular-nums
</div>
```

`sticky-stat` in `StickyBar.tsx` uses the same visual pattern at a smaller size.

### `readOnly` Prop

Components that appear in both build and play modes accept `readOnly?: boolean`:
- Inputs → static spans
- Add/remove/edit controls hidden
- The accordion/PanelSection wrapper is NOT aware of readOnly — only the leaf component

Components with readOnly support: `CombatStatsPanel`, `SavesPanel`, `SpellSlotsPanel`, `SkillsPanel`, `FlawsPanel`, `LanguagesPanel`, `TaintPanel`, `NotesPanel`.

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

| File | Purpose |
|---|---|
| `src/App.tsx` | Mode/tab routing, all prop wiring |
| `src/components/PlaySheet.tsx` | Compact play mode character tab |
| `src/components/StickyBar.tsx` | Always-visible stat bar + mode toggle |
| `src/components/SkillsPanel.tsx` | Skills list (build + play, readOnly) |
| `src/lib/progressions.ts` | BAB, saves, HP, skill rank calculations |
| `src/schema/schema.ts` | CharacterSchema (Zod) |
| `src/hooks/useCharacter.ts` | Composed character state |
| `src/styles/play.css` | Stat cards, play sheet layout |
| `src/styles/skills.css` | Skill list layout and badges |
| `readme.md` | Full feature docs and UI pattern reference |
