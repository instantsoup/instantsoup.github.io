import { describe, expect, it } from 'vitest';

import { findSave, saves } from './saves';

describe('saves data', () => {
  it('loads all 3 saves from JSON', () => {
    expect(saves).toHaveLength(3);
  });

  it('has all required fields on every save', () => {
    saves.forEach((s) => {
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('ability');
      expect(s).toHaveProperty('description');
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.description!.length).toBeGreaterThan(0);
    });
  });

  it('includes Fortitude, Reflex, and Will', () => {
    const names = saves.map((s) => s.name);
    expect(names).toContain('Fortitude');
    expect(names).toContain('Reflex');
    expect(names).toContain('Will');
  });

  it('maps saves to the correct ability scores', () => {
    const fort = saves.find((s) => s.name === 'Fortitude');
    const ref = saves.find((s) => s.name === 'Reflex');
    const will = saves.find((s) => s.name === 'Will');
    expect(fort?.ability).toBe('con');
    expect(ref?.ability).toBe('dex');
    expect(will?.ability).toBe('wis');
  });

  it('has no duplicate save names', () => {
    const names = saves.map((s) => s.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('findSave', () => {
  it('finds a save by exact name', () => {
    const result = findSave('Fortitude');
    expect(result).toBeDefined();
    expect(result?.ability).toBe('con');
  });

  it('is case-insensitive', () => {
    const result = findSave('REFLEX');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Reflex');
  });

  it('trims whitespace', () => {
    const result = findSave('  Will  ');
    expect(result?.name).toBe('Will');
  });

  it('returns undefined for an unknown save', () => {
    expect(findSave('Perception')).toBeUndefined();
  });
});
