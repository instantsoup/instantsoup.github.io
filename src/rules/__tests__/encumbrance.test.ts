import { describe, expect, it } from 'vitest';

import {
  encumbranceACP,
  encumbranceMaxDex,
  encumbranceSpeed,
  getEncumbranceSummary,
  heavyLoad,
  lightLoad,
  loadCategory,
  mediumLoad,
} from '../character/encumbrance';

describe('load thresholds (STR 10)', () => {
  const str = 10;
  it('heavy = 100 lbs', () => expect(heavyLoad(str)).toBe(100));
  it('medium = 66 lbs', () => expect(mediumLoad(str)).toBe(66));
  it('light = 33 lbs', () => expect(lightLoad(str)).toBe(33));
});

describe('heavyLoad edge cases', () => {
  it('returns 0 for STR ≤ 0', () => {
    expect(heavyLoad(0)).toBe(0);
    expect(heavyLoad(-5)).toBe(0);
  });

  it('multiplies by 4 per 10 points above STR 29', () => {
    expect(heavyLoad(30)).toBe(1600); // STR 20 (400) × 4
    expect(heavyLoad(40)).toBe(6400); // STR 30 (1600) × 4
  });
});

describe('loadCategory', () => {
  it('≤ light is light', () => expect(loadCategory(33, 10)).toBe('light'));
  it('> light but ≤ medium is medium', () => expect(loadCategory(50, 10)).toBe('medium'));
  it('> medium but ≤ heavy is heavy', () => expect(loadCategory(90, 10)).toBe('heavy'));
  it('> heavy is overloaded', () => expect(loadCategory(101, 10)).toBe('overloaded'));
});

describe('encumbranceMaxDex', () => {
  it('light: unlimited', () => expect(encumbranceMaxDex('light')).toBe(Infinity));
  it('medium: +3', () => expect(encumbranceMaxDex('medium')).toBe(3));
  it('heavy: +1', () => expect(encumbranceMaxDex('heavy')).toBe(1));
  it('overloaded: +1', () => expect(encumbranceMaxDex('overloaded')).toBe(1));
});

describe('encumbranceACP', () => {
  it('light: 0', () => expect(encumbranceACP('light')).toBe(0));
  it('medium: 3', () => expect(encumbranceACP('medium')).toBe(3));
  it('heavy: 6', () => expect(encumbranceACP('heavy')).toBe(6));
  it('overloaded: 6', () => expect(encumbranceACP('overloaded')).toBe(6));
});

describe('encumbranceSpeed (30 ft base)', () => {
  it('light: unchanged', () => expect(encumbranceSpeed(30, 'light')).toBe(30));
  it('medium: 20 ft (30 × 3/4 → 22.5 → 20)', () => expect(encumbranceSpeed(30, 'medium')).toBe(20));
  it('heavy: 20 ft', () => expect(encumbranceSpeed(30, 'heavy')).toBe(20));
  it('overloaded: unchanged (DM handles this separately)', () =>
    expect(encumbranceSpeed(30, 'overloaded')).toBe(30));
});

describe('getEncumbranceSummary', () => {
  it('light load with no armor has 0 ACP and full DEX', () => {
    const summary = getEncumbranceSummary([{ weight: 10 }], 10, 0, 30);
    expect(summary.loadCategory).toBe('light');
    expect(summary.totalACP).toBe(0);
    expect(summary.encMaxDex).toBe(Infinity);
    expect(summary.effectiveSpeed).toBe(30);
  });

  it('armor ACP stacks with encumbrance ACP', () => {
    // 50 lbs on STR 10 = medium load (> light 33, ≤ medium 66), ACP from encumbrance = 3
    const summary = getEncumbranceSummary([{ weight: 50 }], 10, 2, 30);
    expect(summary.loadCategory).toBe('medium');
    expect(summary.totalACP).toBe(5); // 2 armor + 3 medium
  });
});
