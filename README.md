# D&D 3.5e Character Sheet (Single Page App)

This project is a client-only React/Vite webapp hosted on GitHub Pages at  
https://instantsoup.github.io/.

The app models D&D 3.5e character sheets, beginning with ability scores → modifiers, and will iteratively grow toward full offline JSON-based sheet management.

No server or persistence beyond localStorage and JSON download/upload will ever be introduced.

---

## Project Overview

### Architecture

| Layer | Purpose |
|-------|----------|
| React (Vite SPA) | UI + client logic only |
| TypeScript + Zod | Schema validation for character + feat + skill data |
| localStorage | Optional convenience cache for the current character |
| JSON Download/Upload | True persistence format — no backend |
| GitHub Pages | Hosting (via `main` branch `/dist` build) |

### Core Design Goals

- Full offline support  
- Incremental, testable iteration  
- Data formats portable as JSON  
- Modular components + utilities  
- Co-located tests (next to the module or data they verify)

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
│   └── ...                       # (other data validators/converters)
│
├── src/
│   ├── App.tsx                   # main component (save/export/import/reset)
│   ├── main.tsx                  # entrypoint
│   ├── types.ts                  # shared Scores + emptyScores
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
│   │   ├── skills.ts             # typed skill loader + helpers
│   │   └── skills.test.ts        # validates schema + core rules
│
│   ├── hooks/
│   │   └── useCharacter.ts       # manages character state
│
│   ├── lib/
│   │   ├── download.ts           # JSON download helper
│   │   ├── mods.ts               # ability modifier calc
│   │   ├── statline.ts           # roll + adjustTo28 normalization
│   │   └── statline.test.ts      # tests verifying normalization logic
│
│   ├── schema/
│   │   └── schema.ts             # CharacterSchemaV1 + migrateToLatest()
│
│   ├── store/
│   │   └── local.ts              # localStorage save/load/clear utilities
│
│   └── types/
│       ├── feat.ts               # Feat schema + type
│       └── skill.ts              # Skill schema + type
│
└── dist/                         # vite build output
```

---

## Core Data Structures

### Character JSON (v1)
```json
{
  "version": 1,
  "name": "Mialee",
  "scores": { "str": 10, "dex": 14, "con": 12, "int": 16, "wis": 10, "cha": 8 }
}
```

### Feat JSON entry
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

### Skill JSON entry
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

## Scripts

| Script | Purpose | Example |
|---------|----------|---------|
| `convert-feats.mjs` | Converts `/scripts/feats.csv` → `/src/data/feats.json` | `node scripts/convert-feats.mjs` |
| `validate-feats.mjs` | Validates feats.json against Zod + shared abbrev list | `npm run validate:feats` |
| `validate-skills.mjs` | Validates skills.json against Zod | `npm run validate:skills` |
| `vite dev/build` | Runs local dev server / builds production bundle | `npm run dev`, `npm run build` |
| `test` | Runs Vitest tests (schema + logic) | `npm run test` |

---

## Schema Summary

| Schema | File | Description |
|---------|------|-------------|
| `CharacterSchemaV1` | `src/schema/schema.ts` | Zod schema for current character format |
| `FeatSchema` | `src/types/feat.ts` | Zod schema for feats |
| `SkillSchema` | `src/types/skill.ts` | Zod schema for skills |
| `SourceAbbrev` | `src/data/sourcebook-abbrevs.json` | Canonical allowed sources (shared) |

---

## Local Persistence

- **Local save key:** `v0-char`  
- **Stored format:** validated `CharacterV1`  
- **Source:** `src/store/local.ts`

---

## Statline Rules Recap

Roll 3d6 six times → base stat line.  
Adjust toward 28-point buy:

- When over 28: drop lowest stat first, round-robin until ≤28.  
- When under 28: raise highest stat first, round-robin until ≥28.  
- Scores clamped 3–18.  
- Adjustment distributes evenly (no greedy loops).  
- Verified by `src/lib/statline.test.ts`.

---

## Deployment (GitHub Pages)

- Hosted at [https://instantsoup.github.io/](https://instantsoup.github.io/)  
- Branch: `main`  
- Build command: `npm run build`  
- Output directory: `dist/`  
- Ensure `404.html` exists (for SPA routing fallback)

---

## Test Checklist (for development)

| Area | Validation |
|-------|-------------|
| Schema | `npm run validate:feats`, `npm run validate:skills` |
| Statline Logic | `npm run test` |
| Build | `npm run build` then open `dist/index.html` |
| Deploy | Push to `main`, verify at instantsoup.github.io |

---

## Quick Context Recap (for ChatGPT resets)

If ChatGPT forgets context, paste this README and remind it that:

- This is a **Vite React SPA** hosted at `instantsoup.github.io`.  
- No server — only **localStorage + JSON download/upload**.  
- Uses **Zod schemas** for validation (`CharacterV1`, `Feat`, `Skill`).  
- Has **data + validator scripts** in `/scripts/`.  
- Uses **TypeScript, Vitest, GitHub Pages**.  
- Tests live **next to the module or data they test**.  
- Built incrementally — each feature is self-contained and modular.