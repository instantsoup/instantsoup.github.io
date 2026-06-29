import { describe, expect, it } from 'vitest';

import { CLASS_NAMES, classes, findClass } from './classes';

describe('classes', () => {
  it('should export all core classes including supplements', () => {
    expect(classes.length).toBeGreaterThanOrEqual(11);
  });

  it('should have CLASS_NAMES matching class count', () => {
    expect(CLASS_NAMES.length).toBeGreaterThanOrEqual(11);
  });

  it('should include expected class names', () => {
    const expected = [
      'Barbarian',
      'Bard',
      'Cleric',
      'Druid',
      'Fighter',
      'Monk',
      'Paladin',
      'Ranger',
      'Rogue',
      'Sorcerer',
      'Wizard',
    ];
    expect(CLASS_NAMES).toEqual(expect.arrayContaining(expected));
  });
});

describe('findClass', () => {
  it('should find a class by exact name', () => {
    const result = findClass('Fighter');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Fighter');
  });

  it('should find a class case-insensitively', () => {
    const result = findClass('WIZARD');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Wizard');
  });

  it('should trim whitespace from input', () => {
    const result = findClass('  Rogue  ');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Rogue');
  });

  it('should return undefined for unknown class', () => {
    const result = findClass('Artificer');
    expect(result).toBeUndefined();
  });
});
