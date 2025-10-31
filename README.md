D&D 3.5e Character Sheet (Single Page App)

This project is a client-only React/Vite webapp hosted on GitHub Pages at
https://instantsoup.github.io/.

The app models D&D 3.5e character sheets, beginning with ability scores → modifiers, and will iteratively grow toward full offline JSON-based sheet management.

No server or persistence beyond localStorage and JSON download/upload will ever be introduced.

🧩 Project Overview
Architecture
Layer	Purpose
React (Vite SPA)	UI + client logic only
TypeScript + Zod	Schema validation for character + feat data
localStorage	Optional convenience cache for the current character
JSON Download/Upload	True persistence format — no backend
GitHub Pages	Hosting (via main branch /dist build)
Core Design Goals

Full offline support

Incremental, testable iteration

Data formats portable as JSON

Modular components + utilities

📂 Directory Structure

/ (repo root)
├── 404.html # GitHub Pages SPA redirect
├── index.html # main Vite entry
├── package.json / tsconfig.json / vite.config.ts
│
├── scripts/
│ ├── feats.csv # raw feat data (Google Sheets export)
│ ├── convert-feats.mjs # CSV → JSON converter
│ └── validate-feats.mjs # Zod validator for feats.json (shared abbrev list)
│
├── src/
│ ├── App.tsx # main component (save/export/import/reset)
│ ├── main.tsx # entrypoint
│ ├── types.ts # shared Scores + emptyScores
│
│ ├── components/
│ │ ├── AbilityGrid.tsx
│ │ ├── DropZone.tsx
│ │ ├── ImportExportBar.tsx
│ │ ├── RollCharacter.tsx
│ │ ├── SourceBadge.tsx / SourceBadges.tsx
│ │ └── UtilitiesPanel.tsx
│
│ ├── data/
│ │ ├── feats.json # generated 1879 feats
│ │ ├── sourcebook-abbrevs.json
│ │ └── sourcebooks.ts # abbrev → full name + helpers
│
│ ├── hooks/
│ │ └── useCharacter.ts # manages character state
│
│ ├── lib/
│ │ ├── download.ts # JSON download helper
│ │ ├── mods.ts # ability modifier calc
│ │ ├── statline.ts # roll + adjustTo28 normalization
│ │ └── statline.test.ts # tests verifying normalization logic
│
│ ├── schema/
│ │ └── schema.ts # CharacterSchemaV1 + migrateToLatest()
│
│ ├── store/
│ │ └── local.ts # localStorage save/load/clear utilities
│
│ └── types/
│ └── feat.ts # Feat schema + type
│
└── dist/ # vite build output

🧠 Core Data Structures
Character JSON (v1)

{
"version": 1,
"name": "Mialee",
"scores": { "str": 10, "dex": 14, "con": 12, "int": 16, "wis": 10, "cha": 8 }
}

Feat JSON entry

{
"name": "Ancestral Relic",
"source": { "abbr": "BoED", "page": 39 },
"types": ["General"],
"bonusFeat": false,
"prerequisites": "Any good alignment, character level 3rd",
"description": "Create personal magic item"
}

🧰 Scripts
Script	Purpose	Example
convert-feats.mjs	Converts /scripts/feats.csv → /src/data/feats.json	node scripts/convert-feats.mjs
validate-feats.mjs	Validates feats.json against Zod + shared abbrev list	npm run validate:feats
vite dev/build	Runs local dev server / builds production bundle	npm run dev, npm run build
test	Runs Vitest tests (statline, etc.)	npm run test
🧩 Schema Summary
Schema	File	Description
CharacterSchemaV1	src/schema/schema.ts	Zod schema for current character format
FeatSchema	src/types/feat.ts	Zod schema for feats
SourceAbbrev enum	src/data/sourcebook-abbrevs.json	Canonical allowed sources (used by both TS + validator)
💾 Local Persistence

Local save key: v0-char

Stored format: validated CharacterV1

Source: src/store/local.ts

🧮 Statline Rules Recap

Roll 3d6 six times → base stat line.

Adjust toward 28-point buy:

When over 28: drop lowest stat first, repeating round-robin until ≤28.

When under 28: raise highest stat first, repeating round-robin until ≥28.

Scores are clamped 3–18.

Adjustment must distribute evenly (no greedy loops).

Result verified by src/lib/statline.test.ts.

🌐 Deployment (GitHub Pages)

Hosted at https://instantsoup.github.io/

Branch: main

Build command:
npm run build

Output directory: dist/

Ensure 404.html exists (for client routing fallback).

🔍 Test Checklist (for development)
Area	Validation
Schema	Run npm run validate:feats
Statline Logic	Run npm run test
Build	npm run build then open dist/index.html
Deploy	Push to main, verify at https://instantsoup.github.io/
🧭 Quick Context Recap (for ChatGPT memory resets)

If ChatGPT forgets context, paste this README and remind it that:

This is a Vite React SPA hosted at instantsoup.github.io.

No server — only localStorage + JSON download/upload.

Uses Zod schemas for validation (CharacterV1, Feat).

You have data and validator scripts in /scripts/.

You use TypeScript, Vitest, and GitHub Pages.

You’re building iteratively — next features will expand the SPA.