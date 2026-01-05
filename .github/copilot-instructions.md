src/components → UI elements
src/hooks → state and logic
src/lib → pure functions and helpers
src/store → localStorage and persistence
src/schema.ts → JSON shape definitions
src/types.ts → static TypeScript types
npm ci
npm run dev
npm run build
npm run preview

# copilot-instructions.md

These rules define how GitHub Copilot (chat or Agent Mode) should behave in this repository.

## Project Overview

- **SPA**: Static, client-only React + TypeScript app (Vite build), deployed via GitHub Pages. No server, API, or backend logic.
- **Persistence**: Only localStorage (`v0-char` key) and JSON import/export (see `src/store/local.ts`).
- **Data-driven**: All game data (races, classes, feats, skills, etc.) lives in `src/data/*.json`, validated by Zod schemas in `src/types/`, and loaded via helpers in `src/data/*.ts`. The character schema (`src/schema/schema.ts`) derives from these sources.
- **UI**: Two-column layout (`LeftSidebar.tsx` for panels, main area for character sheet). All panels are collapsible and use consistent CSS classes from `src/styles/` (no inline styles).
- **Automatic calculations**: HP, BAB, saves, and skill totals are computed from class progressions and ability scores, supporting multiclassing and per-level history.

## File & Directory Conventions

- `src/components/` — UI elements (named exports only; `App.tsx` is the sole default export)
- `src/hooks/` — state and logic (named exports)
- `src/lib/` — pure helpers (e.g., dice, statline, progressions)
- `src/store/` — localStorage and persistence logic
- `src/data/` — all game data (JSON + helpers)
- `src/types/` — Zod schemas and static types
- `src/styles/` — modular CSS, imported globally via `index.css`
- Tests are co-located: e.g., `lib/statline.test.ts` tests `lib/statline.ts`

## Coding Standards & Patterns

- **Type safety**: All runtime data validated with Zod schemas.
- **Schema changes**: Additive only—never break existing JSON imports.
- **Accessibility**: Every input must have a label; all UI must be keyboard-friendly.
- **Error handling**: Always catch and display import/export errors; never crash the app.
- **Exports**: Use named exports for all modules except `App.tsx` (default export).
- **Styling**: Use only class-based CSS from `src/styles/`; never use inline styles.
- **Data pattern**: For any new data type, follow: `src/data/*.json` (source) → `src/types/*.ts` (Zod schema) → `src/data/*.ts` (helper) → `src/schema/schema.ts` (integration).

## Build, Test, and Validation Workflows

- **Build**: `npm run build` (output: `dist/`).
- **Dev server**: `npm run dev`
- **Preview**: `npm run preview`
- **Test**: `npm run test` (all tests), `npm run test:watch`, `npm run test:coverage` (HTML in `coverage/`)
- **Validation scripts**: `npm run validate:feats`, `npm run validate:skills` (see `scripts/` for CSV→JSON and Zod validation helpers)
- **If builds fail or dependencies break**: `rm -rf node_modules package-lock.json && npm ci`

## Project Boundaries

- ✅ Add/edit TypeScript/React files under `src/` (components, hooks, lib, store, data, types, styles)
- ✅ Update schemas/types only in a backward-compatible way
- ✅ Maintain accessibility and keyboard navigation
- ✅ Keep all builds/tests passing
- ❌ Never add a server, API, backend, or network call
- ❌ Never add analytics, telemetry, or tracking
- ❌ Never commit build artifacts, dependencies, or local settings
- ❌ Never add environment variables or secret files
- ❌ Never include non-SRD or product-identity D&D content
- ❌ Never change deployment target from GitHub Pages

## Licensing & Compliance

- Only use D&D 3.5e SRD/OGL content (see LICENSE-OGL.md)
- Never include product identity (e.g., Beholders, Forgotten Realms)
- Maintain a valid LICENSE-OGL.md if SRD data is referenced

## Examples & Patterns

- **Data-driven**: To add a new race, update `src/data/races.json`, validate with `race.ts`, and integrate via `schema.ts`.
- **Component**: All new UI goes in `src/components/` as a named export, styled via `src/styles/`.
- **Test**: Place `*.test.ts` next to the file it tests; use Vitest.
- **Persistence**: Use only helpers in `src/store/local.ts` for save/load/clear.

---

This file is the source of truth for all AI/Copilot-driven operations in this repository. All generated code and config **must** follow these rules.
