import { describe, expect, it } from 'vitest';

import { findFlaw, flaws } from './flaws';

describe('flaws data', () => {
  it('loads flaws from JSON', () => {
    expect(flaws).toBeDefined();
    expect(flaws.length).toBeGreaterThan(0);
  });

  it('has all required fields on every flaw', () => {
    flaws.forEach((flaw) => {
      expect(flaw).toHaveProperty('name');
      expect(flaw).toHaveProperty('source');
      expect(flaw).toHaveProperty('description');
      expect(flaw).toHaveProperty('effect');
      expect(flaw.name.length).toBeGreaterThan(0);
      expect(flaw.source.abbr.length).toBeGreaterThan(0);
      expect(flaw.effect.length).toBeGreaterThan(0);
    });
  });

  it('has no duplicate flaw names', () => {
    const names = flaws.map((f) => f.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('includes well-known UA flaws', () => {
    const names = flaws.map((f) => f.name);
    expect(names).toContain('Vulnerable');
    expect(names).toContain('Poor Reflexes');
    expect(names).toContain('Weak Will');
    expect(names).toContain('Meager Fortitude');
    expect(names).toContain('Inattentive');
  });
});

describe('findFlaw', () => {
  it('finds a flaw by exact name', () => {
    const flaw = findFlaw('Vulnerable');
    expect(flaw).toBeDefined();
    expect(flaw?.name).toBe('Vulnerable');
  });

  it('is case-insensitive', () => {
    const flaw = findFlaw('VULNERABLE');
    expect(flaw).toBeDefined();
    expect(flaw?.name).toBe('Vulnerable');
  });

  it('trims whitespace', () => {
    const flaw = findFlaw('  Vulnerable  ');
    expect(flaw?.name).toBe('Vulnerable');
  });

  it('returns undefined for non-existent flaw', () => {
    expect(findFlaw('Invisible Flaw')).toBeUndefined();
  });
});
