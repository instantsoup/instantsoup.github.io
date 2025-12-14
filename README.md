# D&D 3.5e Character Builder (Single Page App)

This project is a client-only React/Vite webapp hosted on GitHub Pages at
[https://instantsoup.github.io/dnd35/](https://instantsoup.github.io/dnd35/)

The app models D&D 3.5e character sheets with full level-based character progression, automatic calculations from class progressions, and comprehensive feat/skill management. All data persists through localStorage and JSON import/export.

No server or persistence beyond localStorage and JSON download/upload will ever be introduced.

## Current Features

- **Character Basics**: Name and ability scores (STR, DEX, CON, INT, WIS, CHA) with automatic modifier calculation
- **Race Selector**: Choose from 7 core D&D 3.5e races (Human, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling)
- **Levels System**: Character progression from levels 1-20 with per-level class selection
  - Each level has independent class selection (natural multiclassing support)
  - Collapsible card-based UI for clean level management
  - Add/remove levels with full persistence
- **Per-Level Feats**: Search and select from 1,826 D&D 3.5e feats
  - Feats assigned to specific character levels (historical tracking)
  - Collapsible feat management per level
  - Shows feat prerequisites and descriptions
  - Alphabetically sorted search results (max 10 per level)
- **Alignment Selector**: Interactive 3x3 grid for all 9 D&D alignments
- **Automatic Calculations**: HP, BAB, and saves calculated from class progressions
  - Max HP calculated from hit dice + CON modifier per level
  - BAB calculated from class progression tables
  - Saving throws calculated from class progressions + ability modifiers
  - Hover tooltips show calculation breakdowns
  - Full multiclass support
- **Combat Statistics**: HP tracking, Armor Class calculation (10 + armor + shield + DEX mod + misc), Spell Resistance, Initiative
- **Skills Panel**: All 43 D&D 3.5e skills with complete D&D 3.5e skill points system
  - Skill points tracking: Available/Spent/Remaining display
  - First level gets 4× skill points (class base + INT modifier, minimum 1)
  - Class/cross-class skill indicators with cost badges
  - Green "C" badge for class skills (1 point per rank)
  - Blue "CC" badge for cross-class skills (2 points per rank)
  - Automatic max rank validation (level + 3 for class, (level + 3) ÷ 2 for cross-class)
  - Visual feedback for overspending (red highlighting)
- **Dice Roller**: Sidebar panel for rolling multiple dice
- **Persistence**: localStorage auto-save and JSON import/export

---

## Project Overview

### Architecture

| Layer                | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| React (Vite SPA)     | UI + client logic only                                |
| TypeScript + Zod     | Schema validation for character, feat, and skill data |
| localStorage         | Optional convenience cache for the current character  |
| JSON Download/Upload | True persistence format — no backend                  |
| GitHub Pages         | Static hosting (via `main` branch `/dist` build)      |

### Core Design Goals

- Full offline support
- Incremental, testable iteration
- Data formats portable as JSON
- Modular, self-contained components + utilities
- Schema-driven validation with Zod
- Class-based CSS (no inline styles)
- Named exports for all modules (except `App.tsx`, which is default)

---

## Directory Structure

```
/ (repo root)
├── 404.html                      # GitHub Pages SPA redirect
├── index.html                    # main Vite entry
├── package.json / tsconfig.json / vite.config.ts
│
├── scripts/
│   ├── feats.csv                 # raw feat data (Google Sheets export)
│   ├── convert-feats.mjs         # CSV → JSON converter
│   ├── validate-feats.mjs        # Zod validator for feats.json
│   ├── validate-skills.mjs       # Zod validator for skills.json
│   └── ...                       # other data validators/converters
│
├── src/
│   ├── App.tsx                   # main layout (default export)
│   ├── main.tsx                  # entrypoint (imports global CSS)
│   ├── types.ts                  # shared Scores + emptyScores
│
│   ├── components/
│   │   ├── AbilityGrid.tsx
│   │   ├── AlignmentSelector.tsx  # 3x3 alignment grid
│   │   ├── CombatStats.tsx        # HP, AC, SR, initiative, BAB (with auto-calc)
│   │   ├── DiceRollerPanel.tsx    # dice roller UI
│   │   ├── ImportExportBar.tsx
│   │   ├── LeftSidebar.tsx        # sidebar with collapsible panels
│   │   ├── LevelsPanel.tsx        # level-based progression with per-level feats
│   │   ├── PanelSection.tsx       # reusable collapsible panel
│   │   ├── RaceSelector.tsx       # 7 core race selection
│   │   ├── RollCharacterPanel.tsx
│   │   ├── SavesPanel.tsx         # Fortitude, Reflex, Will saves (with auto-calc)
│   │   ├── SkillsPanel.tsx        # skills with rank tracking
│   │   ├── SourceBadge.tsx / SourceBadges.tsx
│   │   └── UtilitiesPanel.tsx     # general character tools
│
│   ├── data/
│   │   ├── alignments.json        # 9 D&D alignments
│   │   ├── alignments.ts          # alignment data helpers
│   │   ├── class-progressions.json # class progression tables (HD, BAB, saves)
│   │   ├── classes.json           # 11 core D&D 3.5e classes
│   │   ├── classes.ts             # class data helpers
│   │   ├── feats.json             # 1,826 D&D 3.5e feats
│   │   ├── feats.ts               # feat data helpers
│   │   ├── feats.test.ts          # feat validation tests
│   │   ├── races.json             # 7 core D&D 3.5e races
│   │   ├── races.ts               # race data helpers
│   │   ├── saves.json             # 3 saving throws
│   │   ├── saves.ts               # saves data helpers
│   │   ├── skills.json            # 43 D&D 3.5e skills
│   │   ├── skills.ts              # skill data helpers
│   │   ├── skills.test.ts
│   │   ├── sourcebook-abbrevs.json
│   │   └── sourcebooks.ts
│
│   ├── hooks/
│   │   └── useCharacter.ts       # manages character state
│
│   ├── lib/
│   │   ├── download.ts           # JSON download helper
│   │   ├── mods.ts               # ability modifier logic
│   │   ├── progressions.ts       # class progression calculations (HP, BAB, saves)
│   │   ├── progressions.test.ts  # progression calculation tests
│   │   ├── statline.ts           # roll + 28-point normalization
│   │   ├── statline.test.ts
│   │   ├── dice.ts               # dice utilities
│   │   └── dice.test.ts
│
│   ├── schema/
│   │   └── schema.ts             # CharacterSchemaV1 + migrateToLatest()
│
│   ├── store/
│   │   └── local.ts              # localStorage save/load/clear
│
│   ├── styles/
│   │   ├── index.css             # imports all partials below
│   │   ├── utilities.css         # small utility classes
│   │   ├── alignment.css         # alignment selector styles
│   │   ├── race.css              # race selector styles
│   │   ├── saves.css             # saves panel styles
│   │   ├── combat-stats.css      # combat statistics panel styles
│   │   ├── skills.css            # skills panel styles
│   │   └── levels.css            # levels panel with per-level feats
│
│   └── types/
│       ├── alignment.ts          # alignment type + schema
│       ├── class.ts              # class type + schema
│       ├── feat.ts               # feat type + schema
│       ├── level.ts              # level type + schema (with feats)
│       ├── race.ts               # race type + schema
│       ├── save.ts               # save type + schema
│       └── skill.ts              # skill type + schema
│
└── dist/                         # vite build output
```

---

## UI Layout

The app uses a two-column grid layout defined in `layout.css`:

```
+----------------+--------------------------------+
|  Left Sidebar  |           Main Area            |
|  (260px wide)  |   Character sheet + content    |
+----------------+--------------------------------+
```

### Left Sidebar

- Built by `LeftSidebar.tsx`
- Contains collapsible panels using `PanelSection.tsx`
- All panels start closed by default for fast loading
- Default panels:
  - **Import/Export** — JSON import/export and reset functionality
  - **Dice Roller** — manages a dice pool, roll, and clear
  - **Roll Character** — random character generation tools

### Dice Roller

- Buttons add dice (e.g., `4` → d4, `6` → d6)
- "Roll" computes totals using logic from `lib/dice.ts`
- "Clear" empties the pool
- Uses CSS classes `.btn`, `.btn--primary`, `.btn--danger`, and `.btn-row`

### Main Content Area

All sections use consistent collapsible panels with no redundant internal headers. Most panels start closed by default for fast loading. Character sheet sections displayed in the main area (top to bottom):

1. **Name** (closed by default) - Character name input field

2. **Race** (closed by default) - Choose from 7 core races with descriptions

3. **Alignment** (closed by default) - 3x3 grid for all 9 D&D alignments

4. **Abilities** (closed by default) - Six ability scores (STR, DEX, CON, INT, WIS, CHA) with automatic modifier calculations

5. **Combat** (closed by default) - Combat statistics:
   - Max HP auto-calculated from hit dice + CON modifier per level
   - Current HP tracking
   - AC calculation (10 + armor + shield + DEX mod + misc)
   - Spell Resistance
   - Initiative Bonus
   - BAB auto-calculated from class progressions
   - Hover tooltips show calculation breakdowns
   - Green text indicates calculated values

6. **Saves** (closed by default) - Three saving throws (Fortitude, Reflex, Will):
   - Auto-calculated from class progressions + ability modifiers
   - Hover tooltips show calculation breakdown
   - Green text indicates calculated values
   - Manual base bonus inputs available for characters without levels

7. **Skills** (closed by default) - All 43 D&D 3.5e skills:
   - Rank inputs (0-99)
   - Automatic total calculation (ranks + ability modifier)
   - Trained-only badges and armor check penalty indicators

8. **Levels** (closed by default) - Character progression system at bottom:
   - 1-20 levels with per-level class selection
   - Each level card shows level number, class selector, and feat count
   - Collapsible per-level feat management
   - Add/remove levels with full persistence
   - Natural multiclassing support

---

## Data-Driven Architecture

All game data (alignments, races, saves, skills, etc.) follows a consistent pattern:

1. **JSON Data Files** (`src/data/*.json`) - Single source of truth for game data
2. **Type Definitions** (`src/types/*.ts`) - Zod schemas for validation
3. **Helper Modules** (`src/data/*.ts`) - Parse and export validated data
4. **Schema Integration** - Character schema derives from data layer

Examples:

- Alignments are defined in `alignments.json`, validated with `AlignmentSchema`, and the character schema uses derived codes via `z.enum(ALIGNMENT_CODES)`.
- Races are defined in `races.json`, validated with `RaceSchema`, and exported as `RACE_NAMES` for schema validation.
- Classes are defined in `classes.json`, validated with `ClassSchema`, and exported as `CLASS_NAMES` for schema validation.
- Saves are defined in `saves.json` with their governing abilities and descriptions.

---

## Styling

- All styles live in `/src/styles/` and are imported globally via `index.css`
- No inline styles anywhere
- Common layout classes:
  - `.app-grid` → main two-column layout
  - `.app-main` → right-hand content area
  - `.sidebar` → left column
  - `.panel__header` / `.panel__header--open` / `.panel__content`
  - `.btn`, `.btn--primary`, `.btn--danger`, `.btn-row`
  - `.dice__pool`, `.dice__result`
- Shared utilities (e.g. `.mb-8`) live in `utilities.css`

---

## Code Conventions

| Type       | Export Style                                    |
| ---------- | ----------------------------------------------- |
| Components | Named exports (`export function ComponentName`) |
| Hooks      | Named exports                                   |
| Utilities  | Named exports                                   |
| Schemas    | Named exports                                   |
| App.tsx    | Single default export                           |

---

## Testing

- Uses **Vitest** for all tests with **v8 coverage** reporting
- Tests live **next to the files they verify**
  - `lib/statline.test.ts` → `lib/statline.ts`
  - `lib/dice.test.ts` → `lib/dice.ts`
  - `lib/progressions.test.ts` → `lib/progressions.ts`
  - `data/skills.test.ts` → `data/skills.json` and `data/skills.ts`
  - `data/feats.test.ts` → `data/feats.json` and `data/feats.ts`
- **53 tests** currently passing
- Run tests:
  ```bash
  npm run test              # Run all tests
  npm run test:watch        # Watch mode
  npm run test:coverage     # Generate coverage report
  ```
- **Current Coverage**: ~85% statements, ~80% branches
- Coverage reports generated in `coverage/` directory
  - Text output in console
  - HTML report: `open coverage/index.html`
  - JSON report for CI integration

---

## Validation and Scripts

| Script                | Purpose                                               | Example                          |
| --------------------- | ----------------------------------------------------- | -------------------------------- |
| `convert-feats.mjs`   | Convert `/scripts/feats.csv` → `/src/data/feats.json` | `node scripts/convert-feats.mjs` |
| `validate-feats.mjs`  | Validate feats.json with Zod                          | `npm run validate:feats`         |
| `validate-skills.mjs` | Validate skills.json with Zod                         | `npm run validate:skills`        |
| `vite dev/build`      | Dev server or build                                   | `npm run dev`, `npm run build`   |
| `test`                | Run all Vitest suites                                 | `npm run test`                   |

---

## Local Persistence

- **Local save key:** `v0-char`
- **Stored format:** validated `CharacterV1`
- **Source:** `src/store/local.ts`

---

## Statline Rules

Roll 3d6 six times → base stat line.  
Adjust toward 28-point buy:

- If total > 28: drop lowest stat(s) round-robin until ≤ 28
- If total < 28: raise highest stat(s) round-robin until ≥ 28
- Clamp scores 3–18
- Even distribution (no greedy loops)
- Verified by `lib/statline.test.ts`

---

## Build and Deployment

- Hosted at [https://instantsoup.github.io/dnd35/](https://instantsoup.github.io/dnd35/)
- Root URL redirects to `/dnd35/`
- PR previews deploy to `/latest/` for testing before merge
- Branch: `main`
- Build command:
  ```bash
  npm run build
  ```
- Output directory: `dist/`
- Ensure `404.html` exists for client-side routing fallback
- **PR Preview**: Pull requests automatically deploy to `/latest/` for testing before merge

## Dependency Management

- **All dependencies pinned to exact versions** (no `^` or `~` prefixes)
- Prevents automatic updates that could introduce breaking changes or security issues
- Updates must be done manually and intentionally
- Check for updates:
  ```bash
  npm outdated
  ```
- Update process follows security-conscious protocol (see `/home/wesb/git/CLAUDE.md`)
  - Review release notes and maintainer changes
  - Update one package at a time
  - Test after each update
  - Watch for supply chain attack indicators

---

## Quick Reference

- No backend — client-only SPA
- All logic is local, schema-validated with Zod
- Data-driven architecture: All game data in JSON files
- Tests live next to source files (53 tests passing, ~85% coverage)
- Styles are modular CSS classes (no inline styles)
- Components are all named exports (except App)
- All dependencies pinned to exact versions for security
- Sidebar layout provides collapsible **Import/Export**, **Dice Roller**, and **Roll Character** panels
- Character features:
  - Name field
  - Race selection (7 core races)
  - Levels system (1-20 levels with per-level class selection)
  - Per-level feats (1,826 feats available)
  - Alignment (9 options)
  - Ability Scores (6 abilities with modifiers)
  - Saving Throws (3 saves with automatic calculation)
  - Combat Statistics (HP, AC, SR, Initiative, BAB with automatic calculation)
  - Skills (43 total)
- Automatic calculations from class progressions with multiclass support
- Every feature is self-contained, type-safe, and incremental

---
