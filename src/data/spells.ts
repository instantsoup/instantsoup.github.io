// src/data/spells.ts
import { type Spell } from '../types/spell';
import { findRulebookSpell, rulebookSpells } from './rulebook-loader';
import rawSpells from './spells.json' assert { type: 'json' };

// SRD spells
export const spells: Spell[] = rawSpells as Spell[];

// All spells: SRD + supplement (cast to Spell for compatibility — supplement entries may be partial)
export const allSpells: Spell[] = [
  ...spells,
  ...(rulebookSpells as unknown as Spell[]),
];

// Extract valid spell names for quick lookup
export const SPELL_NAMES = spells.map((s) => s.name) as [string, ...string[]];

/** Find a spell by name. Searches SRD first, then loaded rulebooks. */
export function findSpell(name: string): Spell | undefined {
  const needle = name.trim().toLowerCase();
  return (
    spells.find((s) => s.name.toLowerCase() === needle) ??
    (findRulebookSpell(name) as unknown as Spell | undefined)
  );
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
