import { type Character, CharacterSchema } from '../schema/schema';
import { emptyScores } from '../types';

const KEY = 'v0-char';

/** Migrate a v1 character save (or any unknown shape) to v2. */
function migrateCharacter(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1) return obj;
  const migrated: Record<string, unknown> = { ...obj, version: 2 };
  // Drop deprecated top-level fields
  delete migrated.class;
  delete migrated.feats;
  delete migrated.skillRanks;
  // Keep spells field removed (spells now live on levels[].spells)
  delete migrated.spells;
  return migrated;
}

/** Migrate then validate a raw parsed-JSON value into a Character. Throws on invalid shape. */
export function parseCharacter(raw: unknown): Character {
  return CharacterSchema.parse(migrateCharacter(raw));
}

function emptyCharacter(): Character {
  return CharacterSchema.parse({
    version: 2,
    name: '',
    scores: emptyScores,
    levels: [],
    saveBonuses: {},
    combatStats: {},
    flaws: [],
    languages: [],
    customResources: [],
  });
}

export function loadLocal(): Character {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyCharacter();
    return parseCharacter(JSON.parse(raw));
  } catch {
    return emptyCharacter();
  }
}

export function saveLocal(v: Character) {
  localStorage.setItem(KEY, JSON.stringify(v));
}

export function clearLocal() {
  localStorage.removeItem(KEY);
}
