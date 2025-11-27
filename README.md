# D&D 3.5e Character Sheet (Single Page App)

This project is a client-only React/Vite webapp hosted on GitHub Pages at  
[https://instantsoup.github.io/](https://instantsoup.github.io/)

The app models D&D 3.5e character sheets with ability scores, alignments, skills, and saving throws, and will iteratively grow toward full offline JSON-based sheet management.

No server or persistence beyond localStorage and JSON download/upload will ever be introduced.

## Current Features

- **Character Basics**: Name and ability scores (STR, DEX, CON, INT, WIS, CHA) with automatic modifier calculation
- **Alignment Selector**: Interactive 3x3 grid for all 9 D&D alignments
- **Skills Panel**: All 43 D&D 3.5e skills with rank tracking and total calculation
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
│   │   ├── AlignmentSelector.tsx # 3x3 alignment grid
│   │   ├── DiceRollerPanel.tsx   # dice roller UI
│   │   ├── DropZone.tsx
│   │   ├── ImportExportBar.tsx
│   │   ├── LeftSidebar.tsx       # sidebar with collapsible panels
│   │   ├── PanelSection.tsx      # reusable collapsible panel
│   │   ├── RollCharacterPanel.tsx
│   │   ├── SkillsPanel.tsx       # skills with rank tracking
│   │   ├── SourceBadge.tsx / SourceBadges.tsx
│   │   └── UtilitiesPanel.tsx    # general character tools
│
│   ├── data/
│   │   ├── alignments.json       # 9 D&D alignments
│   │   ├── alignments.ts         # alignment data helpers
│   │   ├── feats.json
│   │   ├── skills.json           # 43 D&D 3.5e skills
│   │   ├── skills.ts             # skill data helpers
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
│   │   ├── skills.css            # skills panel styles
│   │   └── alignment.css         # alignment selector styles
│
│   └── types/
│       ├── alignment.ts          # alignment type + schema
│       ├── feat.ts
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
- Default panels:
  - **Dice Roller** (open by default) — manages a dice pool, roll, and clear
  - **Utilities** (closed by default) — wraps the `UtilitiesPanel`

### Dice Roller

- Buttons add dice (e.g., `4` → d4, `6` → d6)
- "Roll" computes totals using logic from `lib/dice.ts`
- "Clear" empties the pool
- Uses CSS classes `.btn`, `.btn--primary`, `.btn--danger`, and `.btn-row`

### Main Content Area

Character sheet sections displayed in the main area:

1. **Name Field** - Character name input
2. **Alignment Selector** - 3x3 grid for selecting D&D alignment (LG, NG, CG, LN, N, CN, LE, NE, CE)
3. **Ability Grid** - Six ability scores with modifier calculations
4. **Skills Panel** - All 43 skills with rank inputs and total modifiers
   - Shows trained-only badges and armor check penalty indicators
   - Automatically calculates total = ranks + ability modifier

---

## Data-Driven Architecture

All game data (skills, alignments, etc.) follows a consistent pattern:

1. **JSON Data Files** (`src/data/*.json`) - Single source of truth for game data
2. **Type Definitions** (`src/types/*.ts`) - Zod schemas for validation
3. **Helper Modules** (`src/data/*.ts`) - Parse and export validated data
4. **Schema Integration** - Character schema derives from data layer

Example: Alignments are defined in `alignments.json`, validated with `AlignmentSchema`, and the character schema uses derived codes via `z.enum(ALIGNMENT_CODES)`.

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

- Uses **Vitest** for all tests
- Tests live **next to the files they verify**
  - `lib/statline.test.ts` → `lib/statline.ts`
  - `lib/dice.test.ts` → `lib/dice.ts`
  - `data/skills.test.ts` → `data/skills.json` and `data/skills.ts`
- Run all tests via:
  ```bash
  npm run test
  ```

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

- Hosted at [https://instantsoup.github.io/](https://instantsoup.github.io/)
- Branch: `main`
- Build command:
  ```bash
  npm run build
  ```
- Output directory: `dist/`
- Ensure `404.html` exists for client-side routing fallback

---

## Quick Reference

- No backend — client-only SPA
- All logic is local, schema-validated with Zod
- Data-driven architecture: All game data in JSON files
- Tests live next to source files
- Styles are modular CSS classes (no inline styles)
- Components are all named exports (except App)
- Sidebar layout provides expandable **Dice Roller** and **Utilities** panels
- Character features: Name, Alignment (9 options), Ability Scores, Skills (43 total)
- Every feature is self-contained, type-safe, and incremental

---
