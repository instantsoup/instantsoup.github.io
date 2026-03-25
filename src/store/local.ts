import { type Character, CharacterSchema } from '../schema/schema';
import { emptyScores } from '../types';

const KEY = 'v0-char';

/** Migrate a v1 character save (or any unknown shape) to v2. */
function migrateCharacter(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw.version !== 1) return raw;
  const migrated: Record<string, unknown> = { ...raw, version: 2 };
  // Drop deprecated top-level fields
  delete migrated.class;
  delete migrated.feats;
  delete migrated.skillRanks;
  // Keep spells field removed (spells now live on levels[].spells)
  delete migrated.spells;
  return migrated;
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
    const json = JSON.parse(raw) as Record<string, unknown>;
    const migrated = migrateCharacter(json);
    const safe = CharacterSchema.safeParse(migrated);
    if (safe.success) return safe.data;
    return emptyCharacter();
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
