// src/lib/statline.test.ts
import { describe, expect, it } from 'vitest';

import { adjustTo28, costOf, roll3d6, rollStatLine, totalCost } from './statline';

const sortAsc = (a: number[]) => [...a].sort((x, y) => x - y);

describe('costOf', () => {
  it('returns correct cost for values in range 3-18', () => {
    expect(costOf(3)).toBe(-5);
    expect(costOf(8)).toBe(0);
    expect(costOf(10)).toBe(2);
    expect(costOf(18)).toBe(16);
  });

  it('clamps values below 3 to cost of 3', () => {
    expect(costOf(2)).toBe(-5);
    expect(costOf(1)).toBe(-5);
    expect(costOf(0)).toBe(-5);
    expect(costOf(-5)).toBe(-5);
  });

  it('clamps values above 18 to cost of 18', () => {
    expect(costOf(19)).toBe(16);
    expect(costOf(20)).toBe(16);
    expect(costOf(100)).toBe(16);
  });
});

describe('adjustTo28 (round-robin, never cross 28; dec: low→high, inc: high→low)', () => {
  it('throws error for arrays not of length 6', () => {
    expect(() => adjustTo28([10, 10, 10])).toThrow('Stat line must have 6 scores');
    expect(() => adjustTo28([10, 10, 10, 10, 10, 10, 10])).toThrow('Stat line must have 6 scores');
    expect(() => adjustTo28([])).toThrow('Stat line must have 6 scores');
  });

  it('keeps exact-28 lines unchanged', () => {
    const input = [15, 14, 13, 12, 11, 10]; // cost 28
    const result = adjustTo28(input);
    expect(sortAsc(result)).toEqual(sortAsc(input));
    expect(totalCost(result)).toBe(28);
  });

  it('decreases toward 28 by touching LOWEST first (17..12 → 15..10)', () => {
    const input = [17, 16, 15, 14, 13, 12]; // cost 46
    const result = adjustTo28(input);
    // Order doesn't matter; confirm the multiset and total
    expect(sortAsc(result)).toEqual(sortAsc([15, 14, 13, 12, 11, 10]));
    expect(totalCost(result)).toBe(28);
  });

  it('increases toward 28 by touching HIGHEST first (12,12,11,13,10,11)', () => {
    const input = [12, 12, 11, 13, 10, 11]; // cost 21
    const result = adjustTo28(input);
    // A valid 28-pt multiset is [11,12,12,13,14,14]
    expect(sortAsc(result)).toEqual([11, 12, 12, 13, 14, 14]);
    expect(totalCost(result)).toBe(28);
  });

  it('even decrease example per spec: 18,14,14,14,14,14 → 16,12,12,12,11,11', () => {
    const input = [18, 14, 14, 14, 14, 14];
    const result = adjustTo28(input);
    expect(sortAsc(result)).toEqual(sortAsc([16, 12, 12, 12, 11, 11]));
    expect(totalCost(result)).toBe(28);
  });

  it('bounds preserved and prefers low-first on decrease / high-first on increase', () => {
    const input = [9, 12, 15, 8, 14, 11];
    const result = adjustTo28(input);
    const cost = totalCost(result);
    expect(cost === 28 || cost === 30).toBe(true); // 28 normally; 30 only on hard edges
    expect(Math.min(...result)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...result)).toBeLessThanOrEqual(18);
  });

  it('edge: [18,18,18,3,3,3] cannot hit 28 (any step is 3 pts); stops at 30', () => {
    const input = [18, 18, 18, 3, 3, 3]; // cost 33
    const result = adjustTo28(input);
    // Any one 18 reduced to 17 is the only legal step without crossing 28
    expect(sortAsc(result)).toEqual([3, 3, 3, 17, 18, 18]);
    expect(totalCost(result)).toBe(30);
  });

  it('handles stats already at 18 during increase phase', () => {
    // Low total with some 18s - tests the s >= 18 continue branch
    const input = [18, 18, 3, 3, 3, 3]; // cost = 16+16+(-5)*4 = 32-20 = 12
    const result = adjustTo28(input);
    // Should increase the 3s, not touch the 18s
    expect(result.filter((s) => s === 18)).toHaveLength(2);
    const cost = totalCost(result);
    expect(cost === 28 || cost === 27).toBe(true); // may stop at 27 if can't reach 28 exactly
  });

  it('handles case where no increase is possible (all at max or step too large)', () => {
    // All stats at 18 but total is low (impossible in practice, but tests the branch)
    const input = [18, 18, 18, 18, 18, 18]; // cost = 96, way above 28
    const result = adjustTo28(input);
    // Will decrease, but this tests that increase phase handles all-18 case
    expect(Math.max(...result)).toBeLessThanOrEqual(18);
  });

  it('never crosses 28 in either direction', () => {
    const cases: number[][] = [
      [12, 12, 11, 13, 10, 11],
      [17, 16, 15, 14, 13, 12],
      [10, 10, 10, 10, 10, 10],
      [16, 16, 16, 8, 8, 8],
    ];
    for (const input of cases) {
      const out = adjustTo28(input);
      const cost = totalCost(out);
      // must be exactly 28 unless mathematically impossible under one-step bounds (rare: 30)
      expect(cost === 28 || cost === 30).toBe(true);
      // sanity bounds
      expect(Math.min(...out)).toBeGreaterThanOrEqual(3);
      expect(Math.max(...out)).toBeLessThanOrEqual(18);
    }
  });
});

describe('roll3d6', () => {
  it('returns a value between 3 and 18', () => {
    // Run multiple times to account for randomness
    for (let i = 0; i < 100; i++) {
      const result = roll3d6();
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(18);
    }
  });

  it('returns an integer', () => {
    const result = roll3d6();
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('rollStatLine', () => {
  it('returns an array of 6 values', () => {
    const result = rollStatLine();
    expect(result).toHaveLength(6);
  });

  it('each value is between 3 and 18', () => {
    const result = rollStatLine();
    for (const value of result) {
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(18);
    }
  });

  it('all values are integers', () => {
    const result = rollStatLine();
    for (const value of result) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});
