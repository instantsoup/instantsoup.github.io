# D&D 3.5e Character Sheet (Single Page App) — Prompt Context

This document serves as the authoritative context for ChatGPT (GPT-5) when acting as **technical copilot** for the D&D 3.5e Character Sheet webapp.

You are GPT-5, my technical copilot for the D&D 3.5e Character Sheet webapp.
This is a client-only React/Vite + TypeScript + Zod SPA hosted on GitHub Pages (https://instantsoup.github.io/).

---

## Project Rules and Constraints

- No backend, API, or database — this is a **fully client-only** application.  
- Persistence is via **localStorage** (optional) and **JSON import/export** (primary).  
- All data must be validated with Zod schemas.  
- The build must stay **modular, type-safe, and schema-driven**.  
- Iterative feature development — small, isolated increments only.  
- Components must remain portable, declarative, and consistent with existing architecture.  
- Tests should be **co-located** next to the module or data they verify (e.g., `skills.test.ts` beside `skills.ts`).  
- Never suggest any backend, database, or external API service.  
- The app must always build and deploy cleanly through Vite → GitHub Pages.

---

## Architecture Summary

| Layer | Purpose |
|-------|----------|
| React (Vite SPA) | UI + client logic only |
| TypeScript + Zod | Strong typing and schema validation |
| localStorage | Optional local cache for current character |
| JSON Download/Upload | True persistence format |
| GitHub Pages | Static hosting (build from `/dist` on `main`) |

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
│   ├── App.tsx                   # Main component (save/export/import/reset)
│   ├── main.tsx                  # Entrypoint
│   ├── types.ts                  # Shared Scores + emptyScores
│
│   ├── components/
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
│   │   ├── skills.ts             # Typed skill loader + helpers
│   │   └── skills.test.ts        # Validates skill schema + rules
│
│   ├── hooks/
│   │   └── useCharacter.ts       # Manages character state
│
│   ├── lib/
│   │   ├── download.ts           # JSON download helper
│   │   ├── mods.ts               # Ability modifier calculations
│   │   ├── statline.ts           # 3d6 rolls + 28-point-buy normalization
│   │   └── statline.test.ts      # Verifies statline normalization logic
│
│   ├── schema/
│   │   └── schema.ts             # CharacterSchemaV1 + migrateToLatest()
│
│   ├── store/
│   │   └── local.ts              # LocalStorage save/load/clear utilities
│
│   └── types/
│       ├── feat.ts               # Feat schema + type
│       └── skill.ts              # Skill schema + type
│
└── dist/                         # Vite build output
```

---

## Data Format Overview

### Character (v1)
```json
{
  "version": 1,
  "name": "Mialee",
  "scores": { "str": 10, "dex": 14, "con": 12, "int": 16, "wis": 10, "cha": 8 }
}
```

### Feat entry
```json
{
  "name": "Ancestral Relic",
  "source": { "abbr": "BoED", "page": 39 },
  "types": ["General"],
  "bonusFeat": false,
  "prerequisites": "Any good alignment, character level 3rd",
  "description": "Create personal magic item"
}
```

### Skill entry
```json
{
  "name": "Balance",
  "ability": "dex",
  "trainedOnly": false,
  "armorCheckPenalty": true,
  "description": "Keep your footing on narrow or slippery surfaces.",
  "source": { "abbr": "PHB", "page": 67 }
}
```

---

## Schema Summary

| Schema | File | Description |
|---------|------|-------------|
| `CharacterSchemaV1` | `src/schema/schema.ts` | Zod schema for current character format |
| `FeatSchema` | `src/types/feat.ts` | Zod schema for feats |
| `SkillSchema` | `src/types/skill.ts` | Zod schema for skills |
| `SourceAbbrev` | `src/data/sourcebook-abbrevs.json` | Canonical allowed sources (shared) |

---

## Testing Conventions

- Use **Vitest** for all unit and schema validation.  
- Tests are **co-located** next to what they verify (`*.test.ts` beside module/data).  
- Example:  
  - `src/lib/statline.test.ts` → tests `statline.ts`  
  - `src/data/skills.test.ts` → tests `skills.json` + `skills.ts`  
- Each test should be independent, schema-validated, and portable.  
- No global mocks, no test folder hierarchy.

---

## Build & Deployment

- Build: `npm run build`  
- Output: `/dist`  
- Hosted: GitHub Pages (branch `main`)  
- SPA fallback: `404.html` present in root

---

## Validation and Scripts

| Script | Purpose |
|---------|----------|
| `validate-feats.mjs` | Ensures feats.json matches FeatSchema |
| `validate-skills.mjs` | Ensures skills.json matches SkillSchema |
| `convert-feats.mjs` | Converts CSV → JSON for feats |
| `npm run test` | Runs all Vitest suites |
| `npm run build` | Compiles for GitHub Pages |

---

## Statline Rules

- Roll 3d6 six times → base statline  
- Adjust toward 28-point buy:  
  - If > 28: drop lowest stat(s) round-robin until ≤28  
  - If < 28: raise highest stat(s) round-robin until ≥28  
- Clamp scores 3–18  
- Even distribution (no greedy loop)  
- Verified in `statline.test.ts`

---

## Quick Context Recap

When ChatGPT (GPT-5) is re-initialized or loses memory:

1. Re-read this file.  
2. Remember this project is a **client-only Vite + React SPA**.  
3. Never suggest backends, databases, or APIs.  
4. Keep everything schema-validated with Zod.  
5. Maintain **co-located tests**.  
6. Maintain build compatibility with GitHub Pages.  
7. Each new feature must be self-contained, incremental, and modular.