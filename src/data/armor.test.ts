import { describe, expect, it } from 'vitest';

import { armorRefs, armorRefsByCategory, findArmorRef } from './armor';

describe('armor data', () => {
  it('loads armor from JSON', () => {
    expect(armorRefs).toBeDefined();
    expect(armorRefs.length).toBeGreaterThan(0);
  });

  it('has all required fields on every entry', () => {
    armorRefs.forEach((a) => {
      expect(a).toHaveProperty('name');
      expect(a).toHaveProperty('category');
      expect(a).toHaveProperty('acBonus');
      expect(a).toHaveProperty('armorCheckPenalty');
      expect(a).toHaveProperty('arcaneSpellFailure');
      expect(a.name.length).toBeGreaterThan(0);
      expect(['light', 'medium', 'heavy', 'shield', 'extra']).toContain(a.category);
      expect(a.acBonus).toBeGreaterThanOrEqual(0);
      expect(a.armorCheckPenalty).toBeGreaterThanOrEqual(0);
      expect(a.arcaneSpellFailure).toBeGreaterThanOrEqual(0);
    });
  });

  it('has no duplicate armor names', () => {
    const names = armorRefs.map((a) => a.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('includes all core armor types', () => {
    const names = armorRefs.map((a) => a.name);
    expect(names).toContain('Leather');
    expect(names).toContain('Chain shirt');
    expect(names).toContain('Chainmail');
    expect(names).toContain('Full plate');
    expect(names).toContain('Heavy steel shield');
    expect(names).toContain('Tower shield');
  });

  it('heavy armor reduces speed', () => {
    const heavy = armorRefs.filter((a) => a.category === 'heavy');
    heavy.forEach((a) => {
      expect(a.speed30).toBe(20);
      expect(a.speed20).toBe(15);
    });
  });

  it('shields do not reduce speed', () => {
    const shields = armorRefs.filter((a) => a.category === 'shield');
    shields.forEach((a) => {
      expect(a.speed30).toBeUndefined();
      expect(a.speed20).toBeUndefined();
    });
  });
});

describe('findArmorRef', () => {
  it('finds armor by exact name', () => {
    const a = findArmorRef('Full plate');
    expect(a).toBeDefined();
    expect(a?.acBonus).toBe(8);
    expect(a?.category).toBe('heavy');
  });

  it('is case-insensitive', () => {
    const a = findArmorRef('FULL PLATE');
    expect(a?.name).toBe('Full plate');
  });

  it('returns undefined for unknown armor', () => {
    expect(findArmorRef('Mithral full plate')).toBeUndefined();
  });
});

describe('armorRefsByCategory', () => {
  it('returns only light armor', () => {
    const light = armorRefsByCategory('light');
    expect(light.length).toBeGreaterThan(0);
    light.forEach((a) => expect(a.category).toBe('light'));
  });

  it('returns only shields', () => {
    const shields = armorRefsByCategory('shield');
    expect(shields.length).toBeGreaterThan(0);
    shields.forEach((a) => expect(a.category).toBe('shield'));
  });
});
