# claude.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**D&D 3.5e Character Builder** — Client-only React/Vite SPA. No backend, API, or database. Persistence via localStorage (`v0-char` key) and JSON import/export only.

**Live:** https://instantsoup.github.io/dnd35/

## Commands

```bash
npm run dev                # Dev server
npm run build              # Production build → /dist
npm run test               # Run all tests (64 tests, ~85% coverage)
npm run test:watch         # Watch mode
npm run lint               # ESLint check
npm run check              # Full check (format + lint + no inline styles)
npm run validate:feats     # Validate feats.json
npm run validate:skills    # Validate skills.json
```

## Architecture

### Data-Driven Pattern

All game data follows: **JSON → Zod Schema → Helper → Character Schema**

```
src/data/*.json     → Source of truth
src/types/*.ts      → Zod schemas
src/data/*.ts       → Helpers export validated data + constants (e.g., RACE_NAMES)
src/schema/schema.ts → Character schema uses z.enum(DERIVED_CONSTANTS)
```

### Key Modules

| Path | Purpose |
|------|---------|
| `src/hooks/useCharacter.ts` | Main character state management |
| `src/lib/progressions.ts` | HP, BAB, saves calculations (multiclass support) |
| `src/store/local.ts` | localStorage persistence |
| `src/schema/schema.ts` | Zod character validation |

### Per-Level Tracking

Feats and skills tracked per character level:
- Class skills: 1 point = 1 rank
- Cross-class: 1 point = 0.5 ranks
- First level gets 4× skill points
- Unspent points carry forward; editing past levels triggers forward recalculation

## Code Conventions

- **No inline styles** — CSS in `src/styles/`, imported via `index.css`
- **Named exports** — All modules except `App.tsx` (default export)
- **Co-located tests** — `*.test.ts` next to source files
- **Zod validation** — All runtime data validated
- **Exact versions** — No `^` or `~` in dependencies

## Boundaries

✅ Client-only features, backward-compatible schema changes, SRD/OGL content only
❌ No backend/API, no analytics/telemetry, no product identity content

## Reference Files

Load these on request for detailed context:

| File | Contents |
|------|----------|
| [readme.md](readme.md) | Full feature docs, directory structure, UI layout |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Detailed coding standards |
| [src/data/classes.json](src/data/classes.json) | 11 core classes |
| [src/data/races.json](src/data/races.json) | 7 core races |
| [src/data/skills.json](src/data/skills.json) | 43 skills with abilities |
| [src/data/class-progressions.json](src/data/class-progressions.json) | HD, BAB, saves by level |
| [src/data/feats.json](src/data/feats.json) | 1,826 feats (507KB) |
