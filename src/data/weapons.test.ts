import { describe, expect, it } from 'vitest';

import { findWeaponRef, weaponRefs, weaponRefsByCategory } from './weapons';

describe('weapons data', () => {
  it('loads weapons from JSON', () => {
    expect(weaponRefs).toBeDefined();
    expect(weaponRefs.length).toBeGreaterThan(0);
  });

  it('has all required fields on every weapon', () => {
    weaponRefs.forEach((w) => {
      expect(w).toHaveProperty('name');
      expect(w).toHaveProperty('category');
      expect(w).toHaveProperty('handedness');
      expect(w).toHaveProperty('damageMd');
      expect(w).toHaveProperty('critRange');
      expect(w).toHaveProperty('critMult');
      expect(w).toHaveProperty('damageType');
      expect(w.name.length).toBeGreaterThan(0);
      expect(['simple', 'martial', 'exotic']).toContain(w.category);
      expect(['unarmed', 'light', 'one-handed', 'two-handed', 'ranged']).toContain(w.handedness);
      expect(w.critRange).toBeGreaterThanOrEqual(1);
      expect(w.critRange).toBeLessThanOrEqual(20);
      expect(w.critMult).toBeGreaterThanOrEqual(2);
    });
  });

  it('has no duplicate weapon names', () => {
    const names = weaponRefs.map((w) => w.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('includes core simple weapons', () => {
    const names = weaponRefs.map((w) => w.name);
    expect(names).toContain('Dagger');
    expect(names).toContain('Quarterstaff');
    expect(names).toContain('Light crossbow');
    expect(names).toContain('Heavy crossbow');
  });

  it('includes core martial weapons', () => {
    const names = weaponRefs.map((w) => w.name);
    expect(names).toContain('Longsword');
    expect(names).toContain('Greatsword');
    expect(names).toContain('Longbow');
    expect(names).toContain('Shortbow');
  });

  it('includes core exotic weapons', () => {
    const names = weaponRefs.map((w) => w.name);
    expect(names).toContain('Bastard sword');
    expect(names).toContain('Spiked chain');
    expect(names).toContain('Hand crossbow');
  });
});

describe('findWeaponRef', () => {
  it('finds a weapon by exact name', () => {
    const w = findWeaponRef('Longsword');
    expect(w).toBeDefined();
    expect(w?.name).toBe('Longsword');
    expect(w?.critRange).toBe(19);
    expect(w?.critMult).toBe(2);
  });

  it('is case-insensitive', () => {
    const w = findWeaponRef('LONGSWORD');
    expect(w?.name).toBe('Longsword');
  });

  it('trims whitespace', () => {
    const w = findWeaponRef('  Longsword  ');
    expect(w?.name).toBe('Longsword');
  });

  it('returns undefined for unknown weapon', () => {
    expect(findWeaponRef('Laser Rifle')).toBeUndefined();
  });
});

describe('weaponRefsByCategory', () => {
  it('returns only simple weapons', () => {
    const simple = weaponRefsByCategory('simple');
    expect(simple.length).toBeGreaterThan(0);
    simple.forEach((w) => expect(w.category).toBe('simple'));
  });

  it('returns only martial weapons', () => {
    const martial = weaponRefsByCategory('martial');
    expect(martial.length).toBeGreaterThan(0);
    martial.forEach((w) => expect(w.category).toBe('martial'));
  });
});
