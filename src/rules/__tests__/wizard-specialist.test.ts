import { describe, expect, it } from 'vitest';

import {
  canForbidSchool,
  forbiddenSchoolsComplete,
  maxForbiddenSchools,
  toggleForbiddenSchool,
} from '../wizard/specialist';

describe('maxForbiddenSchools', () => {
  it('Divination specialist requires only 1 forbidden school', () => {
    expect(maxForbiddenSchools('Divination')).toBe(1);
  });

  it('other specialists require 2 forbidden schools', () => {
    for (const school of [
      'Evocation',
      'Necromancy',
      'Abjuration',
      'Conjuration',
      'Illusion',
      'Enchantment',
      'Transmutation',
    ]) {
      expect(maxForbiddenSchools(school)).toBe(2);
    }
  });
});

describe('canForbidSchool', () => {
  it('Universal cannot be forbidden', () => {
    expect(canForbidSchool('Universal')).toBe(false);
  });

  it('any other school can be forbidden', () => {
    for (const school of [
      'Evocation',
      'Necromancy',
      'Abjuration',
      'Conjuration',
      'Illusion',
      'Enchantment',
      'Transmutation',
      'Divination',
    ]) {
      expect(canForbidSchool(school)).toBe(true);
    }
  });
});

describe('forbiddenSchoolsComplete', () => {
  it('Divination: complete with exactly 1 forbidden school', () => {
    expect(forbiddenSchoolsComplete('Divination', ['Evocation'])).toBe(true);
    expect(forbiddenSchoolsComplete('Divination', [])).toBe(false);
    expect(forbiddenSchoolsComplete('Divination', ['Evocation', 'Necromancy'])).toBe(false);
  });

  it('Evocation: complete with exactly 2 forbidden schools', () => {
    expect(forbiddenSchoolsComplete('Evocation', ['Illusion', 'Enchantment'])).toBe(true);
    expect(forbiddenSchoolsComplete('Evocation', ['Illusion'])).toBe(false);
    expect(forbiddenSchoolsComplete('Evocation', [])).toBe(false);
  });
});

describe('toggleForbiddenSchool', () => {
  it('adds a school if not present and under cap', () => {
    expect(toggleForbiddenSchool('Evocation', [], 'Necromancy')).toEqual(['Evocation']);
  });

  it('removes a school if already present', () => {
    expect(toggleForbiddenSchool('Evocation', ['Evocation', 'Illusion'], 'Necromancy')).toEqual([
      'Illusion',
    ]);
  });

  it('does not exceed the cap', () => {
    // Necromancy specialist already has 2 forbidden; toggling a 3rd has no effect
    const result = toggleForbiddenSchool('Conjuration', ['Evocation', 'Illusion'], 'Necromancy');
    expect(result).toEqual(['Evocation', 'Illusion']);
  });

  it('Divination specialist cannot add a 2nd forbidden school', () => {
    const result = toggleForbiddenSchool('Illusion', ['Evocation'], 'Divination');
    expect(result).toEqual(['Evocation']); // no change
  });
});
