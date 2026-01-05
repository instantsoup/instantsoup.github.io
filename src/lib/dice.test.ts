import { describe, expect, it } from 'vitest';

import { formatDetailed, formatPool, type RNG, rollMany, rollManyDetailed, rollOnce } from './dice';

function seqRng(values: number[]): RNG {
  let i = 0;
  return () => {
    const v = values[i % values.length];
    i += 1;
    return v;
  };
}

describe('dice', () => {
  it('rollOnce maps rng to [1..sides]', () => {
    const rng = seqRng([0.0, 0.5, 0.999999]);
    expect(rollOnce(6, rng)).toBe(1);
    expect(rollOnce(6, rng)).toBe(4);
    expect(rollOnce(6, rng)).toBe(6);
  });

  it('rollMany returns rolls and total', () => {
    const rng = seqRng([0.0, 0.5, 0.9999]);
    const { rolls, total } = rollMany([4, 6, 8], rng);
    expect(rolls).toEqual([1, 4, 8]);
    expect(total).toBe(13);
  });

  it('formatPool compacts counts', () => {
    expect(formatPool([])).toBe('—');
    expect(formatPool([6])).toBe('d6');
    expect(formatPool([6, 6, 20])).toBe('d6×2 + d20');
  });

  it('rejects invalid sides', () => {
    expect(() => rollOnce(1)).toThrow();
    expect(() => rollOnce(2.5)).toThrow();
  });

  it('rollManyDetailed groups and rolls dice correctly', () => {
    const rng = seqRng([0.0, 0.5, 0.9, 0.1]);
    // Pool: [6, 6, 8, 100] → d6×2, d8, d100
    const result = rollManyDetailed([6, 6, 8, 100], rng);
    expect(result).toEqual([
      { sides: 6, rolls: [1, 4] },
      { sides: 8, rolls: [8] },
      { sides: 100, rolls: [11] },
    ]);
  });

  it('rollManyDetailed returns empty array for empty pool', () => {
    expect(rollManyDetailed([])).toEqual([]);
  });

  it('formatDetailed pretty-prints grouped results', () => {
    const groups = [
      { sides: 6, rolls: [2, 5] },
      { sides: 8, rolls: [7] },
    ];
    expect(formatDetailed(groups)).toEqual(['d6: 2, 5', 'd8: 7']);
  });
});
