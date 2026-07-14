import { type Character, CharacterSchema } from '../schema/schema';
import { emptyScores } from '../types';

const KEY = 'v0-char';
const BACKUP_KEY = 'v0-char-backup';

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
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return emptyCharacter();
  }
  if (!raw) return emptyCharacter();
  try {
    return parseCharacter(JSON.parse(raw));
  } catch (e) {
    console.warn('Saved character could not be loaded; backing up raw data.', e);
    // Don't clobber an earlier backup with this failure's own corrupt data.
    try {
      if (!localStorage.getItem(BACKUP_KEY)) {
        localStorage.setItem(BACKUP_KEY, raw);
      }
    } catch {
      // localStorage unavailable (private mode, quota) - nothing more we can do.
    }
    return emptyCharacter();
  }
}

export function saveLocal(v: Character) {
  localStorage.setItem(KEY, JSON.stringify(v));
}

export function clearLocal() {
  localStorage.removeItem(KEY);
}
