# D&D 3.5e Character Sheet (Single Page App)

Client-only React/Vite webapp hosted on GitHub Pages at
[https://instantsoup.github.io/dnd35/](https://instantsoup.github.io/dnd35/)

No server or persistence beyond localStorage and JSON download/upload will ever be introduced.

---

## Features

### Build Mode

Used when leveling up, starting a character, or making changes to the character's permanent record.

**Character tab** — identity panels (all editable):

- Name, Race (7 core PHB races), Alignment (9-option grid)
- Flaws, Languages, Taint/Corruption tracker
- Notes

**Build tab** — mechanical progression:

- Ability scores (STR/DEX/CON/INT/WIS/CHA) with auto modifier
- Levels (1–20): per-level class selection, feats, spell learning, skill allocation
  - Class skills: 1 point = 1 rank; cross-class: 1 point = 0.5 ranks
  - First level gets 4× skill points (min 1); unspent points carry forward
  - Editing a past level triggers forward recalculation
- Combat stats: AC components (armor/shield/misc), Initiative bonus, Spell Resistance, movement speed
- Saving throws: base bonus inputs (auto-calculated from class progressions)
- Spell slot maximums per level
- Feats summary, Known spells summary
- Weapons: add/edit/remove weapons (name, damage die, crit range/mult, attack type, bonuses, damage type)

### Play Mode

Used at the table. Everything is read-only except session-state elements.

**Character tab** — compact play sheet:

- Identity line (name · race · alignment)
- HP tracker (current/temp/max with damage input)
- Stat cards: AC, Initiative, BAB, SR, Movement — each with hover tooltip showing breakdown
- Save cards: Fort, Ref, Will — each with hover tooltip showing breakdown
- Conditions (status effects): toggle active conditions; penalties flow into all derived stats automatically
  - STR/DEX reductions (Exhausted −6 STR/DEX, Fatigued −2, Entangled/Grappled −4 DEX, etc.)
  - Flat penalties: AC (Blinded/Prone −2/−4), Initiative (Deafened −4), saves (Shaken/Sickened −2), attacks
  - `loseDexToAC` flag for Blinded and Stunned
- Ability score damage: per-score damage fields; effective score shown; reduces mods live
- Weapons: read-only attack cards per weapon
  - Iterative attacks from BAB (`+7/+2`, `+12/+7/+2`, etc.)
  - STR mod on melee attack and damage; DEX mod on ranged attack
  - Condition attack penalty applied automatically
  - Crit string (`19–20/×2`, `20/×3`, etc.)
  - Hover tooltip shows BAB + ability mod + weapon bonus + condition penalty breakdown
- Equipment: item list with equipped checkbox, weight input, and notes
  - Total carried weight displayed with PHB Table 9-1 load category badge (Light/Medium/Heavy/Overloaded)
  - Light/Medium/Heavy load limits shown, calculated from effective STR score
- Custom resources: tracked pools (spell slots, ki points, lay on hands, etc.)
- Notes (editable in both modes)

**Skills tab** — read-only skill list:

- Alphabetical, flat list of all 43 D&D 3.5e skills
- Default view: all usable skills (cross-class skills + trained-only skills with ranks)
- "Show trained-only skills without ranks" checkbox to reveal hidden skills
- Each skill shows total modifier with hover tooltip: `3 ranks\n+2 DEX`
- C badge = class skill, T badge = trained only, ACP badge = armor check penalty

**Spells tab**:

- Spell slot tracker (cast/recover/new day — max is read-only in play)
- Known spells summary

---

## UI Patterns

### Calculated Numbers → `title` Tooltip

**Rule:** Any displayed value that is computed from multiple sources must have a `title` attribute showing the full breakdown. Users hover to understand how numbers are derived.

```tsx
// Stat card pattern (PlaySheet)
<div className="play-sheet__stat" title={tooltip}>
  <span className="play-sheet__stat-label">Fort</span>
  <span className="play-sheet__stat-value">+5</span>
</div>;

// tooltip string assembled from CalculationBreakdown.components:
const result = calculateTotalSave(levels, 'fortitude');
const tooltip = [
  ...result.components.map((c) => `${c.label}: +${c.value}`),
  `CON: ${mods.con >= 0 ? '+' : ''}${mods.con}`,
  condSave !== 0 ? `Conditions: ${condSave}` : null,
]
  .filter(Boolean)
  .join('\n');
```

`CalculationBreakdown` is defined in `src/lib/progressions.ts`:

```ts
interface CalculationBreakdown {
  total: number;
  components: Array<{ label: string; value: number }>;
}
```

Used by: `calculateTotalBAB`, `calculateTotalSave`, `calculateMaxHP`.

### Hover-Revealed Breakdown Sources

| Value         | Tooltip content                                                          |
| ------------- | ------------------------------------------------------------------------ |
| BAB           | `Fighter 3: +3\nRogue 2: +1` (from `calculateTotalBAB`)                 |
| Fort/Ref/Will | class components + ability mod + misc bonus + conditions                 |
| AC            | `10 base\nDEX: +2\nArmor: +4\nShield: +2\nConditions: −2`              |
| Init          | `DEX: +2\nMisc: +1\nConditions: −4`                                     |
| HP            | hit die per level + CON mod (from `calculateMaxHP`)                      |
| Skill total   | `3 ranks\n+2 DEX`                                                        |
| Weapon attack | `BAB +5, ability +3, bonus +1, conditions −2`                            |

### Condition Penalties Flow

When a condition is toggled active in play mode:

1. `computeConditionPenalties(statusEffects)` aggregates all active penalties
2. STR/DEX penalties subtract from `effectiveScores` inside `useCharacterScores` → mods update → saves, skills, HP auto-update
3. Flat `ac`, `initiative`, `save`, `attack` penalties applied in `PlaySheet` display and `WeaponsPanel`
4. `loseDexToAC` zeroes the DEX-to-AC contribution (Blinded, Stunned)

### Compact Stat Cards

Used in `PlaySheet`. CSS class `.play-sheet__stat`:

```
┌─────────┐
│  FORT   │  ← .play-sheet__stat-label (small, uppercase, muted)
│   +5    │  ← .play-sheet__stat-value (large, bold)
└─────────┘
  cursor: help; title="breakdown"
```

### `readOnly` Prop Pattern

Components that appear in both build and play modes accept `readOnly?: boolean`. When true:

- Inputs become static spans or display values
- Add/remove/edit controls are hidden
- The component is safe to render in play mode

Components with `readOnly`: `CombatStatsPanel`, `SavesPanel`, `SpellSlotsPanel`, `SkillsPanel`, `FlawsPanel`, `LanguagesPanel`, `TaintPanel`, `NotesPanel`, `WeaponsPanel`.

### Backward-Compatible Schema Changes

New schema fields use `.optional().default(value)` so existing saved characters load without error. No version bump needed for additive changes.

---

## Architecture

### Mode / Tab Routing

```
mode: 'build' | 'play'   (top-level App state)
tab:  'character' | 'build' | 'skills' | 'spells'

Build mode tabs:  character  build
Play mode tabs:   character  skills  spells

tab === 'character' && mode === 'build'  →  identity editing panels
tab === 'character' && mode === 'play'   →  PlaySheet (compact play dashboard)
tab === 'skills'                         →  SkillsPanel (readOnly)
tab === 'spells'                         →  SpellSlotsPanel (readOnly) + SpellsSummary
```

Mode toggle button lives in `TabNav` (right-aligned pill). Always routes to `'character'` in both directions.

### Hook Composition

`useCharacter` composes domain-specific hooks:

| Hook                      | Owns                                                                       |
| ------------------------- | -------------------------------------------------------------------------- |
| `useCharacterIdentity`    | name, race, alignment, flaws, languages                                    |
| `useCharacterScores`      | ability scores, effective scores (−abilityDamage −condPen), mods           |
| `useCharacterLevels`      | levels array, feats, spells, skill ranks                                   |
| `useCharacterCombat`      | HP, AC components, saves, spell slots, weapons                             |
| `useCharacterExtras`      | taint, custom resources, notes, status effects, ability damage, equipment  |
| `useCharacterPersistence` | localStorage save/load, JSON import/export                                 |

`conditionPenalties` is computed via `useMemo` in `useCharacter.ts` from `extras.statusEffects` using `computeConditionPenalties()`, then passed into `useCharacterScores`.

### Calculations Library (`src/lib/`)

```ts
// progressions.ts
calculateTotalBAB(levels)              → { total, components[] }
calculateTotalSave(levels, saveType)   → { total, components[] }
calculateMaxHP(levels, conMod)         → { total, components[] }
calculateCumulativeSkillRanks(levels)  → Record<skillName, ranks>

// encumbrance.ts — PHB Table 9-1
getHeavyLoad(str)                      → number (lbs)
getLightLoad(str)                      → number
getMediumLoad(str)                     → number
getLoadCategory(weight, str)           → 'light' | 'medium' | 'heavy' | 'overloaded'

// conditions.ts
computeConditionPenalties(statusEffects) → ConditionPenalties
```

### Data-Driven Pattern

```
src/data/*.json      → Source of truth for game data
src/types/*.ts       → Zod schemas + TypeScript types
src/data/*.ts        → Parse JSON, export validated data + named constants
src/schema/schema.ts → Character schema uses z.enum(DERIVED_CONSTANTS)
```

---

## Directory Structure

```
src/
├── App.tsx                    # mode/tab routing, default export
├── main.tsx                   # entry point
├── types.ts                   # shared Scores type + emptyScores
│
├── components/
│   ├── AbilityDamagePanel.tsx # per-ability damage inputs with effective score display
│   ├── AbilityGrid.tsx
│   ├── AlignmentSelector.tsx
│   ├── CombatStats.tsx        # AC/Init/SR/BAB inputs; readOnly support
│   ├── EquipmentPanel.tsx     # item list with weight, encumbrance display
│   ├── FeatsSummary.tsx
│   ├── FlawsPanel.tsx         # readOnly support
│   ├── HPTracker.tsx          # current/temp/max HP with damage input
│   ├── LanguagesPanel.tsx     # readOnly support
│   ├── LeftSidebar.tsx        # Import/Export, Dice Roller, Roll Character
│   ├── LevelsPanel.tsx        # level cards with feats/spells/skills per level
│   ├── NotesPanel.tsx         # readOnly support
│   ├── PanelSection.tsx       # collapsible accordion wrapper
│   ├── PlaySheet.tsx          # compact play mode character tab
│   ├── RaceSelector.tsx
│   ├── ResourceTracker.tsx    # custom named resource pools
│   ├── SavesPanel.tsx         # Fort/Ref/Will with auto-calc; readOnly support
│   ├── SkillsPanel.tsx        # flat alphabetical skill list; readOnly support
│   ├── SkillSpendingPanel.tsx # per-level skill point allocation (build)
│   ├── SpellSlotsPanel.tsx    # cast/recover/max per spell level; readOnly support
│   ├── SpellsSummary.tsx
│   ├── StatusEffectsPanel.tsx # condition checklist with rounds tracking
│   ├── StickyBar.tsx          # CSS kept; component not rendered
│   ├── TabNav.tsx             # mode-aware tab nav + mode toggle button
│   ├── TaintPanel.tsx         # readOnly support
│   └── WeaponsPanel.tsx       # weapon CRUD (build) + attack cards (play); readOnly support
│
├── data/
│   ├── alignments.json / .ts / .test.ts
│   ├── class-progressions.json / .ts / .test.ts
│   ├── classes.json / .ts / .test.ts
│   ├── conditions.ts                           # condition list with ConditionPenalties
│   ├── feats.json / .ts / .test.ts    # 1,826 feats
│   ├── flaws.json / .ts / .test.ts
│   ├── languages.json / .ts / .test.ts
│   ├── races.json / .ts / .test.ts
│   ├── saves.json / .ts / .test.ts
│   ├── skills.json / .ts / .test.ts   # 43 skills
│   ├── sourcebook-abbrevs.json
│   ├── sourcebooks.ts / .test.ts
│   ├── spells.json / .ts / .test.ts
│   └── taint.json / .ts / .test.ts
│
├── hooks/
│   ├── useCharacter.ts            # composes all sub-hooks; wires conditionPenalties
│   ├── useCharacterCombat.ts      # + weapons state and actions
│   ├── useCharacterExtras.ts      # + status effects, ability damage, equipment
│   ├── useCharacterIdentity.ts
│   ├── useCharacterLevels.ts
│   ├── useCharacterPersistence.ts
│   └── useCharacterScores.ts      # effectiveScores = scores − abilityDamage − condPen
│
├── lib/
│   ├── conditions.ts              # computeConditionPenalties()
│   ├── dice.ts / .test.ts
│   ├── download.ts
│   ├── encumbrance.ts             # PHB Table 9-1 load limits
│   ├── mods.ts                    # ability score → modifier
│   ├── progressions.ts / .test.ts # BAB, saves, HP, skill ranks
│   └── statline.ts / .test.ts     # 28-point-buy normalization
│
├── schema/
│   └── schema.ts                  # CharacterSchema (Zod); includes WeaponSchema
│
├── store/
│   └── local.ts / .test.ts        # localStorage (key: v0-char)
│
├── styles/
│   ├── index.css                  # imports all partials
│   ├── alignment.css
│   ├── browser.css                # feat/spell/skill browser panels
│   ├── combat-stats.css
│   ├── levels.css
│   ├── play.css                   # PlaySheet layout and stat cards
│   ├── play-panels.css            # equipment, weapons, resources, status panels
│   ├── saves.css
│   ├── selectors.css              # race/class selector styles
│   ├── skills.css
│   ├── tabs.css                   # tab nav + .sticky-bar* classes (kept)
│   └── utilities.css
│
└── types/
    ├── alignment.ts / class.ts / class-progression.ts
    ├── feat.ts / flaw.ts / language.ts
    ├── level.ts / race.ts / save.ts
    ├── skill.ts / spell.ts / taint-data.ts
    └── (each exports a Zod schema + TypeScript type)
```

---

## Testing

- **Vitest** with v8 coverage
- **206 tests**, all passing
- Tests co-located with source: `foo.ts` → `foo.test.ts`
- All `src/data/*.ts` modules have test coverage
- Coverage: ~97% statements, ~94% branches on covered files

```bash
npm run test              # run all tests
npm run test:watch        # watch mode
npm run test:coverage     # coverage report
```

---

## Styling

- No inline styles — enforced by pre-commit hook (`guard:no-inline-styles`)
- All CSS in `src/styles/`, imported via `index.css`
- CSS custom properties: `var(--space-N)`, `var(--clr-*)`, `var(--clr-border)`, `var(--clr-border-strong)`
- BEM-style class names: `.play-sheet__stat-label`, `.skill-item--class`, etc.
- Shared utilities: `.mt-12`, `.text-error`, `.btn`, `.btn--primary`, `.btn--danger`

---

## Code Conventions

| Type       | Export                        |
| ---------- | ----------------------------- |
| Components | Named (`export function Foo`) |
| Hooks      | Named                         |
| Utilities  | Named                         |
| `App.tsx`  | Default                       |

- Pre-commit: Prettier format → ESLint fix → inline style guard → Vitest run
- All deps pinned to exact versions (no `^`/`~`)

---

## Build and Deployment

- **Dev:** `npm run dev`
- **Build:** `npm run build` → `dist/`
- **Hosted:** `main` branch → GitHub Pages → `/dnd35/`
- **PR previews** deploy to `/latest/` automatically
- `404.html` handles client-side routing fallback

---

## Statline Rules

Roll 3d6 six times → base stat line.
Adjust toward 28-point buy:

- If total > 28: drop lowest stat(s) round-robin until ≤ 28
- If total < 28: raise highest stat(s) round-robin until ≥ 28
- Clamp scores 3–18
- Verified by `lib/statline.test.ts`
