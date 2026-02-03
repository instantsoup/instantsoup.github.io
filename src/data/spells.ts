// src/data/spells.ts
import { type Spell } from '../types/spell';
import rawSpells from './spells.json' assert { type: 'json' };

// Export all spells
export const spells: Spell[] = rawSpells as Spell[];

// Extract valid spell names for quick lookup
export const SPELL_NAMES = spells.map((s) => s.name) as [string, ...string[]];

export function findSpell(name: string): Spell | undefined {
  const needle = name.trim().toLowerCase();
  return spells.find((s) => s.name.toLowerCase() === needle);
}

export function findSpellsByClass(cls: string, level?: number): Spell[] {
  const classKey = cls.trim();
  return spells.filter((s) => {
    const spellLevel = s.levels[classKey];
    if (spellLevel === undefined) return false;
    if (level !== undefined && spellLevel !== level) return false;
    return true;
  });
}
