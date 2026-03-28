import { describe, expect, it } from 'vitest';

import {
  getEncumbranceACP,
  getEncumbranceMaxDex,
  getEncumbranceSpeed,
  getHeavyLoad,
  getLightLoad,
  getLoadCategory,
  getMediumLoad,
} from './encumbrance';

describe('getHeavyLoad', () => {
  it('returns 0 for STR ≤ 0', () => {
    expect(getHeavyLoad(0)).toBe(0);
    expect(getHeavyLoad(-5)).toBe(0);
  });

  it('returns PHB table values for STR 1–29', () => {
    expect(getHeavyLoad(1)).toBe(10);
    expect(getHeavyLoad(10)).toBe(100);
    expect(getHeavyLoad(15)).toBe(200);
    expect(getHeavyLoad(18)).toBe(300);
    expect(getHeavyLoad(20)).toBe(400);
    expect(getHeavyLoad(29)).toBe(1400);
  });

  it('multiplies by 4 per 10 above 29 (STR 30+)', () => {
    // STR 30 = STR 20 × 4 = 400 × 4 = 1600
    expect(getHeavyLoad(30)).toBe(1600);
    // STR 35 = STR 25 × 4 = 800 × 4 = 3200
    expect(getHeavyLoad(35)).toBe(3200);
    // STR 40 = STR 30 × 4 = 1600 × 4 = 6400
    expect(getHeavyLoad(40)).toBe(6400);
  });
});

describe('getLightLoad', () => {
  it('is floor(heavy / 3)', () => {
    expect(getLightLoad(10)).toBe(Math.floor(100 / 3)); // 33
    expect(getLightLoad(15)).toBe(Math.floor(200 / 3)); // 66
    expect(getLightLoad(20)).toBe(Math.floor(400 / 3)); // 133
  });
});

describe('getMediumLoad', () => {
  it('is floor(heavy * 2 / 3)', () => {
    expect(getMediumLoad(10)).toBe(Math.floor((100 * 2) / 3)); // 66
    expect(getMediumLoad(15)).toBe(Math.floor((200 * 2) / 3)); // 133
    expect(getMediumLoad(20)).toBe(Math.floor((400 * 2) / 3)); // 266
  });
});

describe('getLoadCategory', () => {
  // STR 10: light ≤33, medium ≤66, heavy ≤100
  it('returns light when weight ≤ light limit', () => {
    expect(getLoadCategory(0, 10)).toBe('light');
    expect(getLoadCategory(33, 10)).toBe('light');
  });

  it('returns medium when weight > light and ≤ medium limit', () => {
    expect(getLoadCategory(34, 10)).toBe('medium');
    expect(getLoadCategory(66, 10)).toBe('medium');
  });

  it('returns heavy when weight > medium and ≤ heavy limit', () => {
    expect(getLoadCategory(67, 10)).toBe('heavy');
    expect(getLoadCategory(100, 10)).toBe('heavy');
  });

  it('returns overloaded when weight > heavy limit', () => {
    expect(getLoadCategory(101, 10)).toBe('overloaded');
    expect(getLoadCategory(9999, 10)).toBe('overloaded');
  });
});

describe('getEncumbranceMaxDex', () => {
  it('returns Infinity for light load', () => {
    expect(getEncumbranceMaxDex('light')).toBe(Infinity);
  });

  it('returns 3 for medium load', () => {
    expect(getEncumbranceMaxDex('medium')).toBe(3);
  });

  it('returns 1 for heavy load', () => {
    expect(getEncumbranceMaxDex('heavy')).toBe(1);
  });

  it('returns 1 for overloaded', () => {
    expect(getEncumbranceMaxDex('overloaded')).toBe(1);
  });
});

describe('getEncumbranceACP', () => {
  it('returns 0 for light load', () => {
    expect(getEncumbranceACP('light')).toBe(0);
  });

  it('returns 3 for medium load', () => {
    expect(getEncumbranceACP('medium')).toBe(3);
  });

  it('returns 6 for heavy load', () => {
    expect(getEncumbranceACP('heavy')).toBe(6);
  });

  it('returns 6 for overloaded', () => {
    expect(getEncumbranceACP('overloaded')).toBe(6);
  });
});

describe('getEncumbranceSpeed', () => {
  it('returns base speed unchanged for light load', () => {
    expect(getEncumbranceSpeed(30, 'light')).toBe(30);
  });

  it('returns base speed unchanged for overloaded (can barely move)', () => {
    expect(getEncumbranceSpeed(30, 'overloaded')).toBe(30);
  });

  it('returns floor(30 * 3/4 / 5) * 5 = 20 for medium load with base 30', () => {
    expect(getEncumbranceSpeed(30, 'medium')).toBe(20);
  });

  it('returns floor(20 * 3/4 / 5) * 5 = 15 for medium load with base 20', () => {
    expect(getEncumbranceSpeed(20, 'medium')).toBe(15);
  });

  it('applies same reduction for heavy load', () => {
    expect(getEncumbranceSpeed(30, 'heavy')).toBe(20);
    expect(getEncumbranceSpeed(20, 'heavy')).toBe(15);
  });
});
