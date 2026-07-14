import { describe, expect, it } from 'vitest';

import {
  babForClass,
  calculateTotalBAB,
  formatAttacks,
  getIterativeAttacks,
} from '../character/bab';
import type { Level } from '../types';

function level(cls: string): Level {
  return {
    level: 1,
    class: cls as never,
    feats: [],
    spells: [],
    skillRanks: {},
    unspentSkillPoints: 0,
  };
}

describe('babForClass', () => {
  it('high: +1 per level', () => {
    expect(babForClass(1, 'high')).toBe(1);
    expect(babForClass(5, 'high')).toBe(5);
    expect(babForClass(20, 'high')).toBe(20);
  });

  it('medium: +3/4 per level, floored', () => {
    expect(babForClass(1, 'medium')).toBe(0);
    expect(babForClass(4, 'medium')).toBe(3);
    expect(babForClass(8, 'medium')).toBe(6);
    expect(babForClass(20, 'medium')).toBe(15);
  });

  it('low: +1/2 per level, floored', () => {
    expect(babForClass(1, 'low')).toBe(0);
    expect(babForClass(2, 'low')).toBe(1);
    expect(babForClass(10, 'low')).toBe(5);
    expect(babForClass(20, 'low')).toBe(10);
  });
});

describe('calculateTotalBAB', () => {
  it('returns 0 for no levels', () => {
    const result = calculateTotalBAB([]);
    expect(result.total).toBe(0);
    expect(result.components).toHaveLength(0);
  });

  it('singularizes the label for a single level', () => {
    const result = calculateTotalBAB([level('Rogue')]);
    expect(result.components[0].label).toBe('Rogue (1 level)');
  });

  it('pure Fighter 5 has BAB +5', () => {
    const levels: Level[] = Array(5)
      .fill(null)
      .map(() => level('Fighter'));
    const result = calculateTotalBAB(levels);
    expect(result.total).toBe(5);
  });

  it('pure Wizard 5 (low) has BAB +2', () => {
    const levels: Level[] = Array(5)
      .fill(null)
      .map(() => level('Wizard'));
    const result = calculateTotalBAB(levels);
    expect(result.total).toBe(2);
  });

  it('multiclass Fighter 4 / Wizard 4 sums correctly', () => {
    const levels: Level[] = [
      ...Array(4)
        .fill(null)
        .map(() => level('Fighter')),
      ...Array(4)
        .fill(null)
        .map(() => level('Wizard')),
    ];
    const result = calculateTotalBAB(levels);
    // Fighter 4 (high) = 4, Wizard 4 (low) = 2 → total 6
    expect(result.total).toBe(6);
    expect(result.components).toHaveLength(2);
  });
});

describe('getIterativeAttacks', () => {
  it('BAB < 6 gets only one attack', () => {
    expect(getIterativeAttacks(4, 4)).toEqual([4]);
  });

  it('BAB 6 gets two attacks at -5', () => {
    expect(getIterativeAttacks(6, 6)).toEqual([6, 1]);
  });

  it('BAB 11 gets three attacks', () => {
    expect(getIterativeAttacks(11, 11)).toEqual([11, 6, 1]);
  });

  it('BAB 16 gets four attacks', () => {
    expect(getIterativeAttacks(16, 16)).toEqual([16, 11, 6, 1]);
  });

  it('total attack bonus (with ability mods) is passed through', () => {
    // BAB 10, STR +4 → total +14, still only 2 iteratives (BAB < 11)
    expect(getIterativeAttacks(14, 10)).toEqual([14, 9]);
  });

  it('works with a negative total attack bonus', () => {
    expect(getIterativeAttacks(-1, 3)).toEqual([-1]);
  });
});

describe('formatAttacks', () => {
  it('formats positive and negative attacks with sign', () => {
    expect(formatAttacks([11, 6, 1])).toBe('+11/+6/+1');
    expect(formatAttacks([-1])).toBe('-1');
  });

  it('formats mixed-sign attacks', () => {
    expect(formatAttacks([2, -3])).toBe('+2/-3');
  });
});
