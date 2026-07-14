import { describe, expect, it } from 'vitest';

import { calculateMaxHP } from '../character/hp';
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

describe('calculateMaxHP', () => {
  it('returns 0 for no levels', () => {
    const result = calculateMaxHP([], 0);
    expect(result.total).toBe(0);
    expect(result.components).toHaveLength(0);
  });

  it('single-class character with no CON modifier', () => {
    const levels: Level[] = [level('Fighter'), level('Fighter'), level('Fighter')];
    const result = calculateMaxHP(levels, 0);
    expect(result.total).toBe(30); // 3 × 10
    expect(result.components).toHaveLength(1);
    expect(result.components[0].label).toBe('Fighter (3d10)');
    expect(result.components[0].value).toBe(30);
  });

  it('single-class character with positive CON modifier', () => {
    const levels: Level[] = [level('Barbarian'), level('Barbarian')];
    const result = calculateMaxHP(levels, 3);
    expect(result.total).toBe(30); // 2 × 12 + 2 × 3
    expect(result.components).toHaveLength(2);
    expect(result.components[0].label).toBe('Barbarian (2d12)');
    expect(result.components[0].value).toBe(24);
    expect(result.components[1].label).toBe('CON modifier (2 × +3)');
    expect(result.components[1].value).toBe(6);
  });

  it('single-class character with negative CON modifier', () => {
    const levels: Level[] = [level('Wizard')]; // d4
    const result = calculateMaxHP(levels, -1);
    expect(result.total).toBe(3); // 1 × 4 - 1
    expect(result.components).toHaveLength(2);
    expect(result.components[1].label).toBe('CON modifier (1 × -1)');
    expect(result.components[1].value).toBe(-1);
  });

  it('omits the CON modifier component when it is 0', () => {
    const levels: Level[] = [level('Fighter')];
    const result = calculateMaxHP(levels, 0);
    expect(result.components).toHaveLength(1);
  });

  it('multiclass character sums HP across classes plus total CON bonus', () => {
    const levels: Level[] = [
      level('Fighter'), // d10
      level('Fighter'),
      level('Wizard'), // d4
    ];
    const result = calculateMaxHP(levels, 2);
    expect(result.total).toBe(30); // 2×10 + 1×4 + 3×2
    expect(result.components).toHaveLength(3);
    expect(result.components[0].label).toBe('Fighter (2d10)');
    expect(result.components[1].label).toBe('Wizard (1d4)');
    expect(result.components[2].label).toBe('CON modifier (3 × +2)');
  });
});
