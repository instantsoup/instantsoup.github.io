// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { CharacterSchema } from '../schema/schema';
import { clearLocal, loadLocal, parseCharacter, saveLocal } from './local';

// Minimal valid v2 character shape for testing
const minimalV2 = {
  version: 2 as const,
  name: 'Test',
  scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  levels: [],
  saveBonuses: {},
  combatStats: {},
  flaws: [],
  languages: [],
  customResources: [],
};

describe('CharacterSchema', () => {
  it('parses a valid v2 character', () => {
    const result = CharacterSchema.safeParse(minimalV2);
    expect(result.success).toBe(true);
  });

  it('includes spellSlotsMax and spellSlotsUsed defaults in combatStats', () => {
    const char = CharacterSchema.parse(minimalV2);
    expect(char.combatStats.spellSlotsMax).toEqual({});
    expect(char.combatStats.spellSlotsUsed).toEqual({});
  });

  it('rejects a v1 character (version mismatch)', () => {
    const v1 = { ...minimalV2, version: 1 };
    const result = CharacterSchema.safeParse(v1);
    expect(result.success).toBe(false);
  });

  it('defaults flaws and languages to empty arrays', () => {
    const char = CharacterSchema.parse({ ...minimalV2, flaws: undefined, languages: undefined });
    expect(char.flaws).toEqual([]);
    expect(char.languages).toEqual([]);
  });

  it('defaults customResources to empty array', () => {
    const char = CharacterSchema.parse({ ...minimalV2, customResources: undefined });
    expect(char.customResources).toEqual([]);
  });

  it('accepts taint with depravity and corruption', () => {
    const char = CharacterSchema.parse({ ...minimalV2, taint: { depravity: 4, corruption: 2 } });
    expect(char.taint?.depravity).toBe(4);
    expect(char.taint?.corruption).toBe(2);
  });

  it('accepts optional notes', () => {
    const char = CharacterSchema.parse({ ...minimalV2, notes: 'Remember the cave troll' });
    expect(char.notes).toBe('Remember the cave troll');
  });
});

describe('localStorage migration (v1 → v2)', () => {
  it('loadLocal returns an empty character when nothing saved', () => {
    localStorage.clear();
    const char = loadLocal();
    expect(char.version).toBe(2);
    expect(char.name).toBe('');
    expect(char.levels).toEqual([]);
  });

  it('loadLocal returns empty character for corrupt JSON', () => {
    localStorage.setItem('v0-char', 'not valid json{{{');
    const char = loadLocal();
    expect(char.version).toBe(2);
    expect(char.name).toBe('');
    localStorage.clear();
  });

  it('loadLocal migrates a v1 character to v2', () => {
    const v1Character = {
      version: 1,
      name: 'OldHero',
      scores: { str: 18, dex: 14, con: 16, int: 12, wis: 10, cha: 8 },
      levels: [
        {
          level: 1,
          class: 'Fighter',
          feats: ['Cleave'],
          spells: [],
          skillRanks: {},
          unspentSkillPoints: 0,
        },
      ],
      class: 'Fighter',
      feats: ['Cleave'],
      skillRanks: { Jump: 4 },
      saveBonuses: {},
      combatStats: {},
    };
    localStorage.setItem('v0-char', JSON.stringify(v1Character));
    const char = loadLocal();
    expect(char.version).toBe(2);
    expect(char.name).toBe('OldHero');
    expect(char.scores.str).toBe(18);
    // Deprecated fields stripped
    expect((char as Record<string, unknown>).class).toBeUndefined();
    expect((char as Record<string, unknown>).feats).toBeUndefined();
    expect((char as Record<string, unknown>).skillRanks).toBeUndefined();
    // Level data preserved
    expect(char.levels[0].class).toBe('Fighter');
    expect(char.levels[0].feats).toContain('Cleave');
    localStorage.clear();
  });

  it('round-trips a v2 character through save/load', () => {
    const char = CharacterSchema.parse(minimalV2);
    saveLocal(char);
    const loaded = loadLocal();
    expect(loaded.version).toBe(2);
    expect(loaded.name).toBe('Test');
    clearLocal();
  });
});

describe('parseCharacter', () => {
  it('parses a v2 character directly', () => {
    const char = parseCharacter(minimalV2);
    expect(char.version).toBe(2);
    expect(char.name).toBe('Test');
  });

  it('migrates a v1 character to v2, matching loadLocal/migrateCharacter behavior', () => {
    const v1Character = {
      version: 1,
      name: 'OldHero',
      scores: { str: 18, dex: 14, con: 16, int: 12, wis: 10, cha: 8 },
      levels: [
        {
          level: 1,
          class: 'Fighter',
          feats: ['Cleave'],
          spells: [],
          skillRanks: {},
          unspentSkillPoints: 0,
        },
      ],
      class: 'Fighter',
      feats: ['Cleave'],
      skillRanks: { Jump: 4 },
      saveBonuses: {},
      combatStats: {},
    };
    const char = parseCharacter(v1Character);
    expect(char.version).toBe(2);
    expect(char.name).toBe('OldHero');
    expect((char as Record<string, unknown>).class).toBeUndefined();
    expect(char.levels[0].class).toBe('Fighter');
  });

  it('throws a ZodError for an invalid shape (e.g. an imported file that fails validation)', () => {
    expect(() => parseCharacter({ version: 2, name: 'Broken' })).toThrow();
  });
});
