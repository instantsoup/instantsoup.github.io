# D&D 3.5e Character Sheet (Single Page App) — Prompt Context

This document defines the authoritative project architecture and code conventions for ChatGPT (GPT-5) when acting as **technical copilot** for the D&D 3.5e Character Sheet webapp.

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
│   │   ├── DiceRollerPanel.tsx   # Add/Roll/Clear dice pool
│   │   ├── DropZone.tsx          # Drag-and-drop file import
│   │   ├── ImportExportBar.tsx   # Persistence controls
│   │   ├── LeftSidebar.tsx       # Sidebar with collapsible panels
│   │   ├── PanelSection.tsx      # Reusable collapsible panel component
│   │   ├── RollCharacterPanel.tsx # Roll random character stats
│   │   ├── SkillsPanel.tsx       # Skills with rank tracking
│   │   ├── SourceBadge.tsx / SourceBadges.tsx
│   │   └── UtilitiesPanel.tsx    # Utility features for character management
│
│   ├── data/
│   │   ├── alignments.json       # 9 D&D alignments (LG, NG, CG, etc.)
│   │   ├── alignments.ts         # Alignment data helpers
│   │   ├── feats.json
│   │   ├── skills.json           # 43 D&D 3.5e skills
│   │   ├── skills.ts             # Skill data helpers
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
│   │   ├── skills.css            # Skills panel table layout
│   │   └── alignment.css         # Alignment selector 3x3 grid
│
│   └── types/
│       ├── alignment.ts          # Alignment type + Zod schema
│       ├── feat.ts               # Feat type + Zod schema
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
2. **Alignment Selector** - 3x3 grid for all 9 D&D alignments (LG, NG, CG, LN, N, CN, LE, NE, CE)
3. **Ability Grid** - Six ability scores (STR, DEX, CON, INT, WIS, CHA) with automatic modifier calculations
4. **Skills Panel** - All 43 D&D 3.5e skills with:
   - Rank inputs (0-99)
   - Automatic total calculation (ranks + ability modifier)
   - Badges for trained-only skills and armor check penalty

---

## Data-Driven Architecture

All game data (skills, alignments, etc.) follows a consistent pattern for maximum maintainability:

### Pattern

1. **JSON Data File** (`src/data/*.json`) - Single source of truth
2. **Type Definition** (`src/types/*.ts`) - Zod schema for validation
3. **Helper Module** (`src/data/*.ts`) - Parses JSON and exports validated data
4. **Schema Integration** - Character schema derives validation from data layer

### Example: Alignments

- **Data**: `alignments.json` contains all 9 alignments with code, label, description
- **Type**: `alignment.ts` defines `AlignmentSchema` and exports validated `alignments` array
- **Helper**: `alignments.ts` exports `ALIGNMENT_CODES` for schema use
- **Schema**: `CharacterSchemaV1` uses `z.enum(ALIGNMENT_CODES)` instead of hardcoded values

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

When ChatGPT (GPT-5) is re-initialized or loses memory:

1. Re-read this file.
2. Remember: this is a **client-only Vite + React SPA**, no backend.
3. Follow all **CSS class-based** and **named export** conventions.
4. Maintain modular structure and co-located tests.
5. Preserve build and schema validation compatibility.
6. All UI changes must fit into the sidebar layout and style system.
7. Every new feature should be a **self-contained, TypeScript-safe, schema-validated module**.
8. **Follow the data-driven pattern**: All game data in JSON → Zod validation → Schema integration.

## Current Character Sheet Features

- **Name** - Character name field
- **Alignment** - 9 D&D alignments in 3x3 grid (LG, NG, CG, LN, N, CN, LE, NE, CE)
- **Ability Scores** - STR, DEX, CON, INT, WIS, CHA with modifier calculations
- **Skills** - All 43 D&D 3.5e skills with rank tracking and totals
- **Dice Roller** - Sidebar panel for rolling multiple dice

All features persist via localStorage and JSON import/export.

---
