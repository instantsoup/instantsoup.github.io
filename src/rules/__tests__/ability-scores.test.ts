import { describe, expect, it } from 'vitest';

import type { Scores } from '../../types';
import {
  abilityMod,
  adjustTo28,
  computeMods,
  costOf,
  pointBuyCost,
  roll3d6,
  rollStatLine,
  totalCost,
  totalPointBuyCost,
} from '../character/ability-scores';

const sortAsc = (a: number[]) => [...a].sort((x, y) => x - y);

describe('abilityMod', () => {
  it('score 10 → mod 0', () => expect(abilityMod(10)).toBe(0));
  it('score 11 → mod 0', () => expect(abilityMod(11)).toBe(0));
  it('score 12 → mod +1', () => expect(abilityMod(12)).toBe(1));
  it('score 8 → mod -1', () => expect(abilityMod(8)).toBe(-1));
  it('score 18 → mod +4', () => expect(abilityMod(18)).toBe(4));
  it('score 3 → mod -4', () => expect(abilityMod(3)).toBe(-4));
  it('score 20 → mod +5', () => expect(abilityMod(20)).toBe(5));
  it('score 1 → mod -5', () => expect(abilityMod(1)).toBe(-5));
  it('score 0 → mod -5', () => expect(abilityMod(0)).toBe(-5));
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

// -- The following operate on a 6-element StatLine array rather than a Scores object.

describe('costOf / totalCost (StatLine array form)', () => {
  it('costOf matches pointBuyCost for in-range values', () => {
    expect(costOf(3)).toBe(-5);
    expect(costOf(8)).toBe(0);
    expect(costOf(10)).toBe(2);
    expect(costOf(18)).toBe(16);
  });

  it('clamps values below 3 to cost of 3', () => {
    expect(costOf(2)).toBe(-5);
    expect(costOf(0)).toBe(-5);
  });

  it('clamps values above 18 to cost of 18', () => {
    expect(costOf(19)).toBe(16);
    expect(costOf(100)).toBe(16);
  });

  it('totalCost sums costOf across a stat line', () => {
    expect(totalCost([15, 14, 13, 12, 11, 10])).toBe(28);
  });
});

describe('adjustTo28 (round-robin, never cross 28; dec: low→high, inc: high→low)', () => {
  it('throws for arrays not of length 6', () => {
    expect(() => adjustTo28([10, 10, 10])).toThrow('Stat line must have 6 scores');
    expect(() => adjustTo28([])).toThrow('Stat line must have 6 scores');
  });

  it('keeps exact-28 lines unchanged', () => {
    const input = [15, 14, 13, 12, 11, 10]; // cost 28
    const result = adjustTo28(input);
    expect(sortAsc(result)).toEqual(sortAsc(input));
    expect(totalCost(result)).toBe(28);
  });

  it('decreases toward 28 by touching LOWEST first', () => {
    const input = [17, 16, 15, 14, 13, 12]; // cost 46
    const result = adjustTo28(input);
    expect(sortAsc(result)).toEqual(sortAsc([15, 14, 13, 12, 11, 10]));
    expect(totalCost(result)).toBe(28);
  });

  it('increases toward 28 by touching HIGHEST first', () => {
    const input = [12, 12, 11, 13, 10, 11]; // cost 21
    const result = adjustTo28(input);
    expect(sortAsc(result)).toEqual([11, 12, 12, 13, 14, 14]);
    expect(totalCost(result)).toBe(28);
  });

  it('edge: [18,18,18,3,3,3] cannot hit 28 exactly (any step is 3 pts); stops at 30', () => {
    const input = [18, 18, 18, 3, 3, 3]; // cost 33
    const result = adjustTo28(input);
    expect(sortAsc(result)).toEqual([3, 3, 3, 17, 18, 18]);
    expect(totalCost(result)).toBe(30);
  });

  it('never produces a score outside 3-18', () => {
    const cases: number[][] = [
      [12, 12, 11, 13, 10, 11],
      [17, 16, 15, 14, 13, 12],
      [16, 16, 16, 8, 8, 8],
    ];
    for (const input of cases) {
      const out = adjustTo28(input);
      expect(Math.min(...out)).toBeGreaterThanOrEqual(3);
      expect(Math.max(...out)).toBeLessThanOrEqual(18);
    }
  });
});

describe('roll3d6', () => {
  it('returns an integer between 3 and 18', () => {
    for (let i = 0; i < 100; i++) {
      const result = roll3d6();
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(18);
    }
  });
});

describe('rollStatLine', () => {
  it('returns 6 integer values each between 3 and 18', () => {
    const result = rollStatLine();
    expect(result).toHaveLength(6);
    for (const value of result) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(18);
    }
  });
});
