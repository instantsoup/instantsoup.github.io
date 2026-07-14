// src/data/spells.ts
import { type Spell } from '../types/spell';
import { findRulebookSpell, rulebookSpells } from './rulebook-loader';
import rawSpells from './spells.json' with { type: 'json' };

// SRD spells
export const spells: Spell[] = rawSpells as Spell[];

// All spells: SRD + supplement (rulebookSpells is Zod-validated to Spell shape at load time)
export const allSpells: Spell[] = [...spells, ...rulebookSpells];

// Extract valid spell names for quick lookup
export const SPELL_NAMES = spells.map((s) => s.name) as [string, ...string[]];

/** Find a spell by name. Searches SRD first, then loaded rulebooks. */
export function findSpell(name: string): Spell | undefined {
  const needle = name.trim().toLowerCase();
  return spells.find((s) => s.name.toLowerCase() === needle) ?? findRulebookSpell(name);
}

export function findSpellsByClass(cls: string, level?: number): Spell[] {
  const classKey = cls.trim();
  return allSpells.filter((s) => {
    const spellLevel = s.levels?.[classKey];
    if (spellLevel === undefined) return false;
    if (level !== undefined && spellLevel !== level) return false;
    return true;
  });
}
