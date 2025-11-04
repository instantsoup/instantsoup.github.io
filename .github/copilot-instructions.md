copilot-instructions.md
Purpose

These rules define how GitHub Copilot (chat or Agent Mode) should behave in this repository.
The project is a static single-page application (SPA) built with React, TypeScript, and Vite, deployed via GitHub Pages, with JSON export/import for persistence.
There is no server, no database, and no backend logic.

Scope and Structure

Language & Framework: TypeScript + React (Vite build system)

Deployment: GitHub Actions → GitHub Pages (instantsoup.github.io)

Persistence: localStorage (temporary) and JSON export/import only

Licensing: D&D 3.5e SRD/OGL-compliant — no proprietary or product-identity content

Project Boundaries
✅ Allowed

Create or edit TypeScript (.ts) and React (.tsx) files under src/.

Add small, self-contained components under src/components/.

Add utility functions under src/lib/, persistence helpers under src/store/, and hooks under src/hooks/.

Update schemas and types in src/schema.ts and src/types.ts only if backward compatible.

Modify configuration files (vite.config.ts, tsconfig.json, or .github/workflows/pages.yml) as needed for build/deploy fixes.

Maintain accessibility, keyboard navigation, and labeled form fields.

Keep all builds passing (npm run build).

🚫 Disallowed

❌ Adding any server, API, backend, or database.

❌ Introducing network calls, analytics, telemetry, or third-party tracking.

❌ Committing build artifacts (dist/), dependencies (node_modules/), or local settings files.

❌ Adding environment variables or secret files (.env\*).

❌ Including non-SRD or copyrighted D&D content.

❌ Changing deployment target away from GitHub Pages.

❌ Modifying repository permissions, branch protection, or workflow environment names.

Coding Standards

Type Safety: All runtime inputs validated with Zod schemas.

Schema Changes: Additive only — do not break existing JSON imports.

Accessibility: Every input must have a label; components must remain keyboard-friendly.

Error Handling: Always catch and display import/export errors; the app must never crash.

File Organization:

src/components → UI elements

src/hooks → state and logic

src/lib → pure functions and helpers

src/store → localStorage and persistence

src/schema.ts → JSON shape definitions

src/types.ts → static TypeScript types

Git & Build Rules

node_modules/, dist/, and .env\* must remain in .gitignore.

Use the provided npm scripts:

npm ci

npm run dev

npm run build

npm run preview

Do not modify the GitHub Pages workflow except for necessary maintenance.

Commit messages should describe intent clearly and remain small in scope.

Licensing & Compliance

Only use material derived from the D&D 3.5e System Reference Document (SRD) under OGL 1.0a.

Do not include any product identity (e.g., Beholders, Forgotten Realms, etc.).

Maintain a valid LICENSE-OGL.md whenever SRD data is referenced.

Environment and Safety

If builds fail or Vite dependencies are missing, run:
rm -rf node_modules package-lock.json && npm ci

Never copy node_modules or dist between Codespaces.

Do not modify or disable environment protection rules.

This file serves as the source of truth for all AI or Copilot-driven operations in this repository.
All generated code and configuration must adhere to these guardrails.
