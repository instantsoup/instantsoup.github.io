import { describe, expect, it } from 'vitest';

import { findLanguage, languages } from './languages';

describe('languages data', () => {
  it('loads languages from JSON', () => {
    expect(languages).toBeDefined();
    expect(languages.length).toBeGreaterThan(0);
  });

  it('has all required fields on every language', () => {
    languages.forEach((lang) => {
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('script');
      expect(lang).toHaveProperty('speakers');
      expect(lang).toHaveProperty('description');
      expect(lang.name.length).toBeGreaterThan(0);
    });
  });

  it('has no duplicate language names', () => {
    const names = languages.map((l) => l.name.toLowerCase());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('includes core D&D 3.5e languages', () => {
    const names = languages.map((l) => l.name);
    expect(names).toContain('Common');
    expect(names).toContain('Dwarven');
    expect(names).toContain('Elven');
    expect(names).toContain('Draconic');
    expect(names).toContain('Infernal');
    expect(names).toContain('Celestial');
    expect(names).toContain('Abyssal');
  });
});

describe('findLanguage', () => {
  it('finds a language by exact name', () => {
    const lang = findLanguage('Common');
    expect(lang).toBeDefined();
    expect(lang?.name).toBe('Common');
  });

  it('is case-insensitive', () => {
    const lang = findLanguage('COMMON');
    expect(lang?.name).toBe('Common');
  });

  it('trims whitespace', () => {
    const lang = findLanguage('  Elven  ');
    expect(lang?.name).toBe('Elven');
  });

  it('returns undefined for non-existent language', () => {
    expect(findLanguage('Klingon')).toBeUndefined();
  });
});
