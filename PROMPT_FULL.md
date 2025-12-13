# D&D 3.5e Character Builder (Single Page App) — Prompt Context

This document defines the authoritative project architecture and code conventions for ChatGPT (GPT-5) / Claude when acting as **technical copilot** for the D&D 3.5e Character Builder webapp.

The project is a **client-only React/Vite SPA** written in **TypeScript**, using **Zod** for schema validation and **Vitest** for tests.  
It is hosted at **https://instantsoup.github.io/** and deployed via GitHub Pages from the `main` branch.

---

## Project Rules and Constraints

- No backend, API, or database — this is a **fully client-only** application.
- Persistence is via **localStorage** (optional) and **JSON import/export** (primary).
- All data must be validated with **Zod schemas**.
- The build must stay **modular, type-safe, and schema-driven**.
- Components, utilities, and schemas must remain **independent and testable**.
- **Iterative development** — add one small, self-contained feature at a time.
- **Never suggest** any backend, server, or API-based features.
- Always generate **Vite-compatible**, **TypeScript-valid**, and **buildable** code.
- All styles must use **CSS classes only** (no inline styles).
- Components must use **named exports** (except `App.tsx`, which remains the single `default export`).

---

## Architecture Summary

| Layer                | Purpose                                       |
| -------------------- | --------------------------------------------- |
| React (Vite SPA)     | UI + client logic only                        |
| TypeScript + Zod     | Strong typing and schema validation           |
| localStorage         | Optional local cache for current character    |
| JSON Download/Upload | True persistence format                       |
| GitHub Pages         | Static hosting (build from `/dist` on `main`) |

---

## Directory Layout

```
/ (repo root)
├── 404.html                      # GitHub Pages SPA redirect
├── index.html                    # Main Vite entry
├── package.json / tsconfig.json / vite.config.ts
│
├── scripts/
│   ├── feats.csv                 # Raw feat data (Google Sheets export)
│   ├── convert-feats.mjs         # CSV → JSON converter
│   ├── validate-feats.mjs        # Feat validator (Zod)
│   ├── validate-skills.mjs       # Skill validator (Zod)
│   └── ...                       # Other validators/converters
│
├── src/
│   ├── App.tsx                   # Main app layout (default export)
│   ├── main.tsx                  # Entrypoint
│   ├── types.ts                  # Shared Scores + emptyScores
│
│   ├── components/
│   │   ├── AbilityGrid.tsx       # Ability score grid with modifiers
│   │   ├── AlignmentSelector.tsx # 3x3 grid for D&D alignments
│   │   ├── CombatStats.tsx       # HP, AC, SR, initiative, BAB (with auto-calc)
│   │   ├── DiceRollerPanel.tsx   # Add/Roll/Clear dice pool
│   │   ├── ImportExportBar.tsx   # Persistence controls
│   │   ├── LeftSidebar.tsx       # Sidebar with collapsible panels
│   │   ├── LevelsPanel.tsx       # Level-based progression with per-level feats
│   │   ├── PanelSection.tsx      # Reusable collapsible panel component
│   │   ├── RaceSelector.tsx      # 7 core race selection with descriptions
│   │   ├── RollCharacterPanel.tsx # Roll random character stats
│   │   ├── SavesPanel.tsx        # Fortitude, Reflex, Will saves (with auto-calc)
│   │   ├── SkillsPanel.tsx       # Skills with rank tracking
│   │   ├── SourceBadge.tsx / SourceBadges.tsx
│   │   └── UtilitiesPanel.tsx    # Utility features for character management
│
│   ├── data/
│   │   ├── alignments.json        # 9 D&D alignments (LG, NG, CG, etc.)
│   │   ├── alignments.ts          # Alignment data helpers
│   │   ├── class-progressions.json # Class progression tables (HD, BAB, saves)
│   │   ├── classes.json           # 11 core D&D 3.5e classes
│   │   ├── classes.ts             # Class data helpers
│   │   ├── feats.json             # 1,826 D&D 3.5e feats
│   │   ├── feats.ts               # Feat data helpers
│   │   ├── feats.test.ts          # Feat validation tests
│   │   ├── races.json             # 7 core D&D 3.5e races
│   │   ├── races.ts               # Race data helpers
│   │   ├── saves.json             # 3 saving throws
│   │   ├── saves.ts               # Saves data helpers
│   │   ├── skills.json            # 43 D&D 3.5e skills
│   │   ├── skills.ts              # Skill data helpers
│   │   ├── skills.test.ts
│   │   ├── sourcebook-abbrevs.json
│   │   └── sourcebooks.ts
│
│   ├── hooks/
│   │   └── useCharacter.ts       # Manages character state
│
│   ├── lib/
│   │   ├── download.ts           # JSON download helper
│   │   ├── mods.ts               # Ability modifier calculations
│   │   ├── progressions.ts       # Class progression calculations (HP, BAB, saves)
│   │   ├── progressions.test.ts  # Progression calculation tests
│   │   ├── statline.ts           # 3d6 rolls + 28-point-buy normalization
│   │   ├── statline.test.ts
│   │   ├── dice.ts               # Dice roll logic
│   │   └── dice.test.ts
│
│   ├── schema/
│   │   └── schema.ts             # CharacterSchemaV1 + migrateToLatest()
│
│   ├── store/
│   │   └── local.ts              # localStorage save/load/clear utilities
│
│   ├── styles/
│   │   ├── index.css             # Imports all partials below
│   │   ├── utilities.css         # Shared utility classes (margins, spacing)
│   │   ├── alignment.css         # Alignment selector 3x3 grid
│   │   ├── race.css              # Race selector styles
│   │   ├── saves.css             # Saves panel card layout
│   │   ├── combat-stats.css      # Combat statistics panel styles
│   │   ├── skills.css            # Skills panel table layout
│   │   └── levels.css            # Levels panel with per-level feats
│
│   └── types/
│       ├── alignment.ts          # Alignment type + Zod schema
│       ├── class.ts              # Class type + Zod schema
│       ├── feat.ts               # Feat type + Zod schema
│       ├── level.ts              # Level type + Zod schema (with feats)
│       ├── race.ts               # Race type + Zod schema
│       ├── save.ts               # Save type + Zod schema
│       └── skill.ts              # Skill type + Zod schema
│
└── dist/                         # Vite build output
```

---

## UI Layout

The app uses a **two-column grid layout** defined in `layout.css`:

```
+----------------+--------------------------------+
|  Left Sidebar  |           Main Area            |
|  (260px wide)  |   Character sheet + content    |
+----------------+--------------------------------+
```

### Left Sidebar

- Built via `LeftSidebar.tsx`.
- Contains collapsible `PanelSection`s.
- Default panels:
  - **Dice Roller** (open by default) — uses `DiceRollerPanel.tsx`
  - **Utilities** (closed by default) — wraps `UtilitiesPanel.tsx`
- Collapsible behavior handled by `PanelSection.tsx`.

### Dice Roller

- Add dice by clicking buttons (`d4`, `d6`, `d8`, etc).
- Click **Roll** to roll the pool; **Clear** empties it.
- Uses reusable `.btn` and `.btn-row` classes.
- Logic handled by `lib/dice.ts`.

### Utilities Panel

- Contains other tools (character reset, import/export, etc.).
- Hidden when collapsed.

### Main Content Area

Character sheet sections displayed in the main area (top to bottom):

1. **Name Field** - Character name input
2. **Race Selector** - Choose from 7 core D&D 3.5e races with descriptions (Human, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling)
3. **Levels Panel** - Character progression system (1-20 levels):
   - Each level card shows level number, class selector dropdown, and feat count badge
   - Collapsible per-level feat management (expand/collapse per level)
   - Feat search within each level (max 10 results, alphabetically sorted)
   - Add/remove levels with full persistence
   - Natural multiclassing support (different class per level)
   - Feats tracked historically by level
4. **Alignment Selector** - 3x3 grid for all 9 D&D alignments (LG, NG, CG, LN, N, CN, LE, NE, CE)
5. **Ability Grid** - Six ability scores (STR, DEX, CON, INT, WIS, CHA) with automatic modifier calculations
6. **Saving Throws** - Three saves (Fortitude, Reflex, Will) with:
   - Automatic calculation from class progressions + ability modifier
   - Hover tooltips show calculation breakdown (e.g., "Fighter 3: +3, Wizard 2: +0, +2 WIS = +5")
   - Green text indicates calculated values
   - Manual base bonus inputs still available for characters without levels
7. **Combat Statistics** - Combat-related stats with:
   - Current HP / Max HP tracking (Max HP auto-calculated from hit dice + CON per level)
   - AC calculation (10 + armor + shield + DEX mod + misc)
   - Spell Resistance
   - Initiative Bonus
   - Base Attack Bonus (auto-calculated from class progressions)
   - Hover tooltips show calculation breakdowns
   - Green text indicates calculated values
8. **Skills Panel** - All 43 D&D 3.5e skills with:
   - Rank inputs (0-99)
   - Automatic total calculation (ranks + ability modifier)
   - Badges for trained-only skills and armor check penalty

---

## Data-Driven Architecture

All game data (alignments, races, saves, skills, etc.) follows a consistent pattern for maximum maintainability:

### Pattern

1. **JSON Data File** (`src/data/*.json`) - Single source of truth
2. **Type Definition** (`src/types/*.ts`) - Zod schema for validation
3. **Helper Module** (`src/data/*.ts`) - Parses JSON and exports validated data
4. **Schema Integration** - Character schema derives validation from data layer

### Examples

**Alignments:**

- **Data**: `alignments.json` contains all 9 alignments with code, label, description
- **Type**: `alignment.ts` defines `AlignmentSchema` and exports validated `alignments` array
- **Helper**: `alignments.ts` exports `ALIGNMENT_CODES` for schema use
- **Schema**: `CharacterSchemaV1` uses `z.enum(ALIGNMENT_CODES)` instead of hardcoded values

**Races:**

- **Data**: `races.json` contains 7 core races with name and description
- **Type**: `race.ts` defines `RaceSchema` for validation
- **Helper**: `races.ts` exports `RACE_NAMES` for schema use
- **Schema**: `CharacterSchemaV1` uses `z.enum(RACE_NAMES)` for race validation

**Classes:**

- **Data**: `classes.json` contains 11 core classes with name and description
- **Type**: `class.ts` defines `ClassSchema` for validation
- **Helper**: `classes.ts` exports `CLASS_NAMES` for schema use
- **Schema**: `CharacterSchemaV1` uses `z.enum(CLASS_NAMES)` for class validation

**Saves:**

- **Data**: `saves.json` contains 3 saves with name, ability, and description
- **Type**: `save.ts` defines `SaveSchema` for validation
- **Helper**: `saves.ts` exports validated saves data

This pattern ensures:

- Single source of truth for all game data
- Type safety via Zod validation
- Easy to extend or modify without touching multiple files
- Schema stays in sync with data automatically

---

## Styling Conventions

- **All styles use class-based CSS**, never inline styles.
- Styles live in `/src/styles/` and are imported through `index.css`.
- Each component imports no CSS directly — `main.tsx` imports `index.css` globally.
- Class naming follows a **block\_\_element--modifier** pattern when needed.
- Shared small utility classes (e.g., `.mb-8`) go in `utilities.css`.

Example CSS references:

```html
<div className="panel__content">
  <div className="btn-row mb-8">
    <button className="btn btn--primary">Roll</button>
    <button className="btn btn--danger">Clear</button>
  </div>
</div>
```

---

## Code Export Conventions

| Type          | Export Style                                        |
| ------------- | --------------------------------------------------- |
| Components    | **Named exports** (`export function ComponentName`) |
| Hooks         | **Named exports**                                   |
| Lib utilities | **Named exports**                                   |
| Schemas       | **Named exports**                                   |
| `App.tsx`     | **Default export** (single entrypoint)              |

---

## Testing Conventions

- All tests use **Vitest**.
- Tests are **co-located** next to what they verify:
  - `statline.test.ts` → tests `statline.ts`
  - `dice.test.ts` → tests `dice.ts`
  - `skills.test.ts` → tests `skills.json` + schema
- Tests must:
  - Pass `npm run test` cleanly.
  - Validate data via Zod schemas when applicable.
  - Avoid global side effects or mocks.

---

## Validation and Scripts

| Script                | Purpose                                 |
| --------------------- | --------------------------------------- |
| `validate-feats.mjs`  | Ensures feats.json matches FeatSchema   |
| `validate-skills.mjs` | Ensures skills.json matches SkillSchema |
| `convert-feats.mjs`   | Converts CSV → JSON for feats           |
| `npm run test`        | Runs all Vitest suites                  |
| `npm run build`       | Compiles for GitHub Pages               |

---

## Deployment and Build

- Build: `npm run build`
- Output: `/dist`
- Hosted: GitHub Pages (branch `main`)
- SPA fallback: `404.html` at repo root

---

## Statline Rules

- Roll 3d6 six times → base statline
- Adjust toward 28-point buy:
  - If > 28: drop lowest stats round-robin until ≤28
  - If < 28: raise highest stats round-robin until ≥28
- Clamp scores 3–18
- Even distribution (no greedy loop)
- Verified in `statline.test.ts`

---

## Quick Context Recap

When ChatGPT (GPT-5) / Claude is re-initialized or loses memory:

1. Re-read this file and `/home/wesb/git/CONTEXT.md`.
2. Remember: this is a **client-only Vite + React SPA**, no backend.
3. Follow all **CSS class-based** and **named export** conventions.
4. Maintain modular structure and co-located tests (43 tests currently passing).
5. Preserve build and schema validation compatibility.
6. All UI changes must fit into the sidebar layout and style system.
7. Every new feature should be a **self-contained, TypeScript-safe, schema-validated module**.
8. **Follow the data-driven pattern**: All game data in JSON → Zod validation → Schema integration.

## Current Character Builder Features

- **Name** - Character name field
- **Race** - 7 core D&D 3.5e races (Human, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling)
- **Levels System** - Character progression (1-20 levels) with:
  - Per-level class selection (11 core classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Wizard)
  - Natural multiclassing support
  - Collapsible card-based UI
  - Per-level feat management (1,826 feats available)
  - Feats tracked historically by level
  - Search within each level (max 10 results, alphabetically sorted)
- **Alignment** - 9 D&D alignments in 3x3 grid (LG, NG, CG, LN, N, CN, LE, NE, CE)
- **Ability Scores** - STR, DEX, CON, INT, WIS, CHA with modifier calculations
- **Automatic Calculations** from class progressions:
  - **Max HP** - Calculated from hit dice + CON modifier per level
  - **Base Attack Bonus** - Calculated from class progression tables
  - **Saving Throws** - Fortitude, Reflex, Will calculated from class progressions + ability modifiers
  - Hover tooltips show calculation breakdowns
  - Full multiclass support
  - Green text indicates calculated values
- **Combat Statistics** - HP tracking, AC calculation, Spell Resistance, Initiative
- **Skills** - All 43 D&D 3.5e skills with rank tracking and totals
- **Dice Roller** - Sidebar panel for rolling multiple dice

All features persist via localStorage and JSON import/export.

## Major Architectural Changes (PRs 10-12)

**Level-Based System**: Replaced standalone class selector with level-based progression system supporting multiclassing.

**Per-Level Feats**: Feats now associated with specific character levels for historical tracking.

**Automatic Calculations**: HP, BAB, and saves calculated automatically from class progression tables with full multiclass support.

---
