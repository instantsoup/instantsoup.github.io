import { describe, expect, it } from 'vitest';

import { equipmentRefs, equipmentRefsByCategory, findEquipmentRef } from './equipment';

describe('equipment data', () => {
  it('loads equipment from JSON', () => {
    expect(equipmentRefs).toBeDefined();
    expect(equipmentRefs.length).toBeGreaterThan(0);
  });

  it('has all required fields on every entry', () => {
    equipmentRefs.forEach((e) => {
      expect(e).toHaveProperty('name');
      expect(e).toHaveProperty('category');
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.category.length).toBeGreaterThan(0);
    });
  });

  it('has no duplicate equipment names', () => {
    const names = equipmentRefs.map((e) => e.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('includes essential adventuring gear', () => {
    const names = equipmentRefs.map((e) => e.name);
    expect(names).toContain('Rope, hempen (50 ft.)');
    expect(names).toContain('Torch');
    expect(names).toContain('Rations, trail (per day)');
    expect(names).toContain('Backpack (empty)');
    expect(names).toContain('Waterskin');
  });

  it('includes alchemical items', () => {
    const names = equipmentRefs.map((e) => e.name);
    expect(names).toContain("Alchemist's fire (flask)");
    expect(names).toContain('Acid (flask)');
    expect(names).toContain('Antitoxin (vial)');
  });

  it('includes skill kit items', () => {
    const names = equipmentRefs.map((e) => e.name);
    expect(names).toContain("Healer's kit");
    expect(names).toContain("Thieves' tools");
    expect(names).toContain("Climber's kit");
  });
});

describe('findEquipmentRef', () => {
  it('finds equipment by exact name', () => {
    const e = findEquipmentRef('Torch');
    expect(e).toBeDefined();
    expect(e?.category).toBe('Adventuring Gear');
    expect(e?.costGp).toBe(0.01);
  });

  it('is case-insensitive', () => {
    const e = findEquipmentRef('TORCH');
    expect(e?.name).toBe('Torch');
  });

  it('returns undefined for unknown item', () => {
    expect(findEquipmentRef('Unobtanium bar')).toBeUndefined();
  });
});

describe('equipmentRefsByCategory', () => {
  it('returns only adventuring gear', () => {
    const gear = equipmentRefsByCategory('Adventuring Gear');
    expect(gear.length).toBeGreaterThan(0);
    gear.forEach((e) => expect(e.category).toBe('Adventuring Gear'));
  });

  it('returns only special substances', () => {
    const special = equipmentRefsByCategory('Special Substances and Items');
    expect(special.length).toBeGreaterThan(0);
    special.forEach((e) => expect(e.category).toBe('Special Substances and Items'));
  });
});
