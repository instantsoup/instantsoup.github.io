import { describe, expect, it } from 'vitest';

import { classProgressions, findClassProgression } from './class-progressions';

const VALID_BAB = ['high', 'medium', 'low'] as const;
const VALID_SAVE = ['good', 'poor'] as const;

describe('classProgressions data', () => {
  it('loads progressions for all 11 core classes', () => {
    expect(classProgressions).toHaveLength(11);
  });

  it('has all required fields on every entry', () => {
    classProgressions.forEach((cp) => {
      expect(cp).toHaveProperty('name');
      expect(cp).toHaveProperty('hitDie');
      expect(cp).toHaveProperty('babProgression');
      expect(cp).toHaveProperty('fortitudeProgression');
      expect(cp).toHaveProperty('reflexProgression');
      expect(cp).toHaveProperty('willProgression');
      expect(cp).toHaveProperty('skillPointsPerLevel');
      expect(cp).toHaveProperty('spellcastingAbility');
    });
  });

  it('has valid spellcastingAbility on every entry (null or ability key)', () => {
    const VALID_ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha', null];
    classProgressions.forEach((cp) => {
      expect(VALID_ABILITIES).toContain(cp.spellcastingAbility);
    });
  });

  it('has correct spellcastingAbility for caster classes', () => {
    expect(classProgressions.find((c) => c.name === 'Wizard')?.spellcastingAbility).toBe('int');
    expect(classProgressions.find((c) => c.name === 'Sorcerer')?.spellcastingAbility).toBe('cha');
    expect(classProgressions.find((c) => c.name === 'Cleric')?.spellcastingAbility).toBe('wis');
    expect(classProgressions.find((c) => c.name === 'Druid')?.spellcastingAbility).toBe('wis');
    expect(classProgressions.find((c) => c.name === 'Bard')?.spellcastingAbility).toBe('cha');
    expect(classProgressions.find((c) => c.name === 'Fighter')?.spellcastingAbility).toBeNull();
    expect(classProgressions.find((c) => c.name === 'Barbarian')?.spellcastingAbility).toBeNull();
  });

  it('has valid BAB progressions', () => {
    classProgressions.forEach((cp) => {
      expect(VALID_BAB).toContain(cp.babProgression);
    });
  });

  it('has valid save progressions', () => {
    classProgressions.forEach((cp) => {
      expect(VALID_SAVE).toContain(cp.fortitudeProgression);
      expect(VALID_SAVE).toContain(cp.reflexProgression);
      expect(VALID_SAVE).toContain(cp.willProgression);
    });
  });

  it('has positive hit dice and skill points', () => {
    classProgressions.forEach((cp) => {
      expect(cp.hitDie).toBeGreaterThan(0);
      expect(cp.skillPointsPerLevel).toBeGreaterThan(0);
    });
  });

  it('has no duplicate class names', () => {
    const names = classProgressions.map((cp) => cp.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('has correct progressions for Fighter (high BAB, good fort)', () => {
    const fighter = classProgressions.find((cp) => cp.name === 'Fighter');
    expect(fighter?.babProgression).toBe('high');
    expect(fighter?.fortitudeProgression).toBe('good');
    expect(fighter?.reflexProgression).toBe('poor');
    expect(fighter?.willProgression).toBe('poor');
    expect(fighter?.hitDie).toBe(10);
  });

  it('has correct progressions for Wizard (low BAB, good will)', () => {
    const wizard = classProgressions.find((cp) => cp.name === 'Wizard');
    expect(wizard?.babProgression).toBe('low');
    expect(wizard?.willProgression).toBe('good');
    expect(wizard?.hitDie).toBe(4);
  });

  it('has correct progressions for Rogue (medium BAB, good reflex)', () => {
    const rogue = classProgressions.find((cp) => cp.name === 'Rogue');
    expect(rogue?.babProgression).toBe('medium');
    expect(rogue?.reflexProgression).toBe('good');
    expect(rogue?.skillPointsPerLevel).toBe(8);
  });
});

describe('findClassProgression', () => {
  it('finds a progression by exact name', () => {
    const result = findClassProgression('Fighter');
    expect(result).toBeDefined();
    expect(result?.babProgression).toBe('high');
  });

  it('is case-insensitive', () => {
    const result = findClassProgression('WIZARD');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Wizard');
  });

  it('trims whitespace', () => {
    const result = findClassProgression('  Rogue  ');
    expect(result?.name).toBe('Rogue');
  });

  it('returns undefined for an unknown class', () => {
    expect(findClassProgression('Artificer')).toBeUndefined();
  });
});
