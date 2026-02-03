import { describe, expect, it } from 'vitest';

import { SpellSchema } from '../types/spell';
import { findSpell, findSpellsByClass, spells } from './spells';

describe('spells data', () => {
  it('should load all spells from JSON', () => {
    expect(spells).toBeDefined();
    expect(spells.length).toBeGreaterThan(0);
  });

  it('should have no exact duplicates (same name + source + page)', () => {
    const seen = new Map<string, number>();
    const duplicates: string[] = [];

    spells.forEach((spell, idx) => {
      const key = `${spell.name}|${spell.source.abbr}|${spell.source.page || ''}`;
      if (seen.has(key)) {
        duplicates.push(
          `${spell.name} (${spell.source.abbr} p.${spell.source.page}) at indices ${seen.get(key)} and ${idx}`,
        );
      } else {
        seen.set(key, idx);
      }
    });

    expect(duplicates).toEqual([]);
  });

  it('should have all required spell fields', () => {
    spells.forEach((spell) => {
      expect(spell).toHaveProperty('name');
      expect(spell).toHaveProperty('source');
      expect(spell.source).toHaveProperty('abbr');
      expect(spell).toHaveProperty('school');
      expect(spell).toHaveProperty('levels');
      expect(spell).toHaveProperty('components');
      expect(spell).toHaveProperty('description');
      expect(spell.name).toBeTruthy();
    });
  });

  it('should have valid schools', () => {
    const validSchools = [
      'Abjuration',
      'Conjuration',
      'Divination',
      'Enchantment',
      'Evocation',
      'Illusion',
      'Necromancy',
      'Transmutation',
      'Universal',
    ];
    spells.forEach((spell) => {
      expect(validSchools).toContain(spell.school);
    });
  });

  it('should validate all spells against schema', () => {
    spells.forEach((spell) => {
      const result = SpellSchema.safeParse(spell);
      if (!result.success) {
        throw new Error(`Spell "${spell.name}" failed validation: ${result.error.message}`);
      }
    });
  });
});

describe('findSpell', () => {
  it('should find a spell by exact name', () => {
    const spell = findSpell('Fireball');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Fireball');
  });

  it('should find a spell by name (case insensitive)', () => {
    const spell = findSpell('FIREBALL');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Fireball');
  });

  it('should handle leading/trailing whitespace', () => {
    const spell = findSpell('  Fireball  ');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Fireball');
  });

  it('should return undefined for non-existent spell', () => {
    const spell = findSpell('This Spell Does Not Exist');
    expect(spell).toBeUndefined();
  });
});

describe('findSpellsByClass', () => {
  it('should find spells for a class', () => {
    const wizardSpells = findSpellsByClass('Sor/Wiz');
    expect(wizardSpells.length).toBeGreaterThan(0);
    wizardSpells.forEach((spell) => {
      expect(spell.levels['Sor/Wiz']).toBeDefined();
    });
  });

  it('should find spells for a class at specific level', () => {
    const clericLevel1 = findSpellsByClass('Clr', 1);
    expect(clericLevel1.length).toBeGreaterThan(0);
    clericLevel1.forEach((spell) => {
      expect(spell.levels['Clr']).toBe(1);
    });
  });

  it('should return empty array for non-existent class', () => {
    const spells = findSpellsByClass('NonExistentClass');
    expect(spells).toEqual([]);
  });
});
