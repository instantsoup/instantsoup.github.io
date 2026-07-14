import { describe, expect, it } from 'vitest';

import { costOf } from '../../lib/statline';
import type { Scores } from '../../types';
import {
  abilityMod,
  computeMods,
  pointBuyCost,
  totalPointBuyCost,
} from '../character/ability-scores';

describe('abilityMod', () => {
  it('score 10 → mod 0', () => expect(abilityMod(10)).toBe(0));
  it('score 11 → mod 0', () => expect(abilityMod(11)).toBe(0));
  it('score 12 → mod +1', () => expect(abilityMod(12)).toBe(1));
  it('score 8 → mod -1', () => expect(abilityMod(8)).toBe(-1));
  it('score 18 → mod +4', () => expect(abilityMod(18)).toBe(4));
  it('score 3 → mod -4', () => expect(abilityMod(3)).toBe(-4));
  it('score 20 → mod +5', () => expect(abilityMod(20)).toBe(5));
});

describe('computeMods', () => {
  it('maps all six scores to modifiers', () => {
    const scores: Scores = { str: 16, dex: 12, con: 14, int: 10, wis: 8, cha: 18 };
    const mods = computeMods(scores);
    expect(mods.str).toBe(3);
    expect(mods.dex).toBe(1);
    expect(mods.con).toBe(2);
    expect(mods.int).toBe(0);
    expect(mods.wis).toBe(-1);
    expect(mods.cha).toBe(4);
  });
});

describe('pointBuyCost', () => {
  it('score 8 costs 0 points', () => expect(pointBuyCost(8)).toBe(0));
  it('score 10 costs 2 points', () => expect(pointBuyCost(10)).toBe(2));
  it('score 14 costs 6 points', () => expect(pointBuyCost(14)).toBe(6));
  it('score 18 costs 16 points', () => expect(pointBuyCost(18)).toBe(16));

  it('agrees with lib/statline.costOf for every score 3-18', () => {
    // Cross-check against the pre-existing, independently-verified point-buy
    // table until src/lib/statline.ts is folded into this module (Phase 1.3)
    // and eventually deleted (Phase 3.1).
    for (let s = 3; s <= 18; s++) {
      expect(pointBuyCost(s)).toBe(costOf(s));
    }
  });
});

describe('totalPointBuyCost', () => {
  it('all 10s costs 12 points', () => {
    const scores: Scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    expect(totalPointBuyCost(scores)).toBe(12); // 6 × 2
  });

  it('standard array (15/14/13/12/10/8) costs expected total', () => {
    // 8 + 6 + 5 + 4 + 2 + 0 = 25
    const scores: Scores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
    expect(totalPointBuyCost(scores)).toBe(25);
  });
});
