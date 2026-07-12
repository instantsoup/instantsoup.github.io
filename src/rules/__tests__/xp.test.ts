import { describe, expect, it } from 'vitest';

import { levelForXP, xpForLevel, xpToNextLevel } from '../character/xp';

describe('xpForLevel', () => {
  it('level 1 requires 0 XP', () => expect(xpForLevel(1)).toBe(0));
  it('level 2 requires 1000 XP', () => expect(xpForLevel(2)).toBe(1000));
  it('level 5 requires 10000 XP', () => expect(xpForLevel(5)).toBe(10_000));
  it('level 20 requires 190000 XP', () => expect(xpForLevel(20)).toBe(190_000));
});

describe('levelForXP', () => {
  it('0 XP is level 1', () => expect(levelForXP(0)).toBe(1));
  it('999 XP is still level 1', () => expect(levelForXP(999)).toBe(1));
  it('1000 XP is level 2', () => expect(levelForXP(1000)).toBe(2));
  it('10000 XP is level 5', () => expect(levelForXP(10_000)).toBe(5));
  it('roundtrips correctly', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      expect(levelForXP(xpForLevel(lvl))).toBe(lvl);
    }
  });
});

describe('xpToNextLevel', () => {
  it('level 1 → 2 requires 1000 XP', () => expect(xpToNextLevel(1)).toBe(1000));
  it('level 19 → 20 requires 19000 XP', () => expect(xpToNextLevel(19)).toBe(19_000));
});
