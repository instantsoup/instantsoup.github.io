# D&D 3.5e Character Sheet (Single Page App)

This project is a client-only React/Vite webapp hosted on GitHub Pages at  
[https://instantsoup.github.io/](https://instantsoup.github.io/)

The app models D&D 3.5e character sheets, beginning with ability scores → modifiers, and will iteratively grow toward full offline JSON-based sheet management.

No server or persistence beyond localStorage and JSON download/upload will ever be introduced.

---

## Project Overview

### Architecture

| Layer | Purpose |
|-------|----------|
| React (Vite SPA) | UI + client logic only |
| TypeScript + Zod | Schema validation for character, feat, and skill data |
| localStorage | Optional convenience cache for the current character |
| JSON Download/Upload | True persistence format — no backend |
| GitHub Pages | Static hosting (via `main` branch `/dist` build) |

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
│   │   ├── LeftSidebar.tsx       # sidebar with collapsible panels
│   │   ├── PanelSection.tsx      # reusable collapsible panel
│   │   ├── DiceRollerPanel.tsx   # dice roller UI
│   │   ├── UtilitiesPanel.tsx    # general character tools
│   │   ├── AbilityGrid.tsx
│   │   ├── DropZone.tsx
│   │   ├── ImportExportBar.tsx
│   │   ├── RollCharacter.tsx
│   │   ├── SourceBadge.tsx / SourceBadges.tsx
│   │   └── UtilitiesPanel.tsx
│
│   ├── data/
│   │   ├── feats.json
│   │   ├── skills.json
│   │   ├── sourcebook-abbrevs.json
│   │   ├── sourcebooks.ts
│   │   ├── skills.ts
│   │   └── skills.test.ts
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
│   │   ├── base.css              # variables, resets, body defaults
│   │   ├── layout.css            # app grid and main area
│   │   ├── sidebar.css           # sidebar + panels
│   │   ├── buttons.css           # shared button styles
│   │   ├── dice.css              # dice roller
│   │   └── utilities.css         # small utility classes
│
│   └── types/
│       ├── feat.ts
│       └── skill.ts
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

| Type | Export Style |
|-------|---------------|
| Components | Named exports (`export function ComponentName`) |
| Hooks | Named exports |
| Utilities | Named exports |
| Schemas | Named exports |
| App.tsx | Single default export |

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

| Script | Purpose | Example |
|---------|----------|---------|
| `convert-feats.mjs` | Convert `/scripts/feats.csv` → `/src/data/feats.json` | `node scripts/convert-feats.mjs` |
| `validate-feats.mjs` | Validate feats.json with Zod | `npm run validate:feats` |
| `validate-skills.mjs` | Validate skills.json with Zod | `npm run validate:skills` |
| `vite dev/build` | Dev server or build | `npm run dev`, `npm run build` |
| `test` | Run all Vitest suites | `npm run test` |

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
- Tests live next to source files
- Styles are modular CSS classes
- Components are all named exports (except App)
- Sidebar layout provides expandable **Dice Roller** and **Utilities** panels
- Every feature is self-contained, type-safe, and incremental

---
