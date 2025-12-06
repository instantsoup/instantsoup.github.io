// src/lib/progressions.test.ts
import { describe, expect, it } from 'vitest';

import type { Level } from '../types/level';
import {
  calculateBABForClass,
  calculateMaxHP,
  calculateSaveForClass,
  calculateTotalBAB,
  calculateTotalSave,
} from './progressions';

describe('calculateBABForClass', () => {
  it('calculates high BAB progression correctly', () => {
    expect(calculateBABForClass(0, 'high')).toBe(0);
    expect(calculateBABForClass(1, 'high')).toBe(1);
    expect(calculateBABForClass(5, 'high')).toBe(5);
    expect(calculateBABForClass(20, 'high')).toBe(20);
  });

  it('calculates medium BAB progression correctly', () => {
    expect(calculateBABForClass(0, 'medium')).toBe(0);
    expect(calculateBABForClass(1, 'medium')).toBe(0); // 3/4 = 0.75 → 0
    expect(calculateBABForClass(2, 'medium')).toBe(1); // 6/4 = 1.5 → 1
    expect(calculateBABForClass(4, 'medium')).toBe(3); // 12/4 = 3
    expect(calculateBABForClass(20, 'medium')).toBe(15); // 60/4 = 15
  });

  it('calculates low BAB progression correctly', () => {
    expect(calculateBABForClass(0, 'low')).toBe(0);
    expect(calculateBABForClass(1, 'low')).toBe(0); // 1/2 = 0.5 → 0
    expect(calculateBABForClass(2, 'low')).toBe(1); // 2/2 = 1
    expect(calculateBABForClass(10, 'low')).toBe(5); // 10/2 = 5
    expect(calculateBABForClass(20, 'low')).toBe(10); // 20/2 = 10
  });
});

describe('calculateSaveForClass', () => {
  it('calculates good save progression correctly', () => {
    expect(calculateSaveForClass(0, 'good')).toBe(0);
    expect(calculateSaveForClass(1, 'good')).toBe(2); // 2 + 1/2 = 2 + 0 = 2
    expect(calculateSaveForClass(2, 'good')).toBe(3); // 2 + 2/2 = 2 + 1 = 3
    expect(calculateSaveForClass(10, 'good')).toBe(7); // 2 + 10/2 = 2 + 5 = 7
    expect(calculateSaveForClass(20, 'good')).toBe(12); // 2 + 20/2 = 2 + 10 = 12
  });

  it('calculates poor save progression correctly', () => {
    expect(calculateSaveForClass(0, 'poor')).toBe(0);
    expect(calculateSaveForClass(1, 'poor')).toBe(0); // 1/3 = 0.33 → 0
    expect(calculateSaveForClass(3, 'poor')).toBe(1); // 3/3 = 1
    expect(calculateSaveForClass(6, 'poor')).toBe(2); // 6/3 = 2
    expect(calculateSaveForClass(20, 'poor')).toBe(6); // 20/3 = 6.66 → 6
  });
});

describe('calculateTotalBAB', () => {
  it('returns 0 for no levels', () => {
    const result = calculateTotalBAB([]);
    expect(result.total).toBe(0);
    expect(result.components).toHaveLength(0);
  });

  it('calculates BAB for single-class character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] },
      { level: 2, class: 'Fighter', feats: [] },
      { level: 3, class: 'Fighter', feats: [] },
    ];
    const result = calculateTotalBAB(levels);
    expect(result.total).toBe(3); // 3 levels of high BAB
    expect(result.components).toHaveLength(1);
    expect(result.components[0].label).toBe('Fighter (3 levels)');
    expect(result.components[0].value).toBe(3);
  });

  it('calculates BAB for multiclass character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // high BAB
      { level: 2, class: 'Fighter', feats: [] },
      { level: 3, class: 'Wizard', feats: [] }, // low BAB
      { level: 4, class: 'Wizard', feats: [] },
    ];
    const result = calculateTotalBAB(levels);
    expect(result.total).toBe(3); // 2 Fighter (2) + 2 Wizard (1) = 3
    expect(result.components).toHaveLength(2);
  });
});

describe('calculateTotalSave', () => {
  it('returns 0 for no levels', () => {
    const result = calculateTotalSave([], 'fortitude');
    expect(result.total).toBe(0);
    expect(result.components).toHaveLength(0);
  });

  it('calculates fortitude save for single-class character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // good Fort
      { level: 2, class: 'Fighter', feats: [] },
    ];
    const result = calculateTotalSave(levels, 'fortitude');
    expect(result.total).toBe(3); // 2 + 2/2 = 3
    expect(result.components).toHaveLength(1);
    expect(result.components[0].label).toBe('Fighter (2 levels)');
    expect(result.components[0].value).toBe(3);
  });

  it('calculates reflex save for multiclass character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // poor Reflex
      { level: 2, class: 'Rogue', feats: [] }, // good Reflex
      { level: 3, class: 'Rogue', feats: [] },
    ];
    const result = calculateTotalSave(levels, 'reflex');
    expect(result.total).toBe(3); // 1 Fighter (0) + 2 Rogue (3) = 3
    expect(result.components).toHaveLength(2);
  });

  it('calculates will save for multiclass character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Wizard', feats: [] }, // good Will
      { level: 2, class: 'Fighter', feats: [] }, // poor Will
    ];
    const result = calculateTotalSave(levels, 'will');
    expect(result.total).toBe(2); // 1 Wizard (2) + 1 Fighter (0) = 2
    expect(result.components).toHaveLength(2);
  });
});

describe('calculateMaxHP', () => {
  it('returns 0 for no levels', () => {
    const result = calculateMaxHP([], 0);
    expect(result.total).toBe(0);
    expect(result.components).toHaveLength(0);
  });

  it('calculates HP for single-class character with no CON modifier', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // d10
      { level: 2, class: 'Fighter', feats: [] },
      { level: 3, class: 'Fighter', feats: [] },
    ];
    const result = calculateMaxHP(levels, 0);
    expect(result.total).toBe(30); // 3 × 10 = 30
    expect(result.components).toHaveLength(1);
    expect(result.components[0].label).toBe('Fighter (3d10)');
    expect(result.components[0].value).toBe(30);
  });

  it('calculates HP for single-class character with positive CON modifier', () => {
    const levels: Level[] = [
      { level: 1, class: 'Barbarian', feats: [] }, // d12
      { level: 2, class: 'Barbarian', feats: [] },
    ];
    const result = calculateMaxHP(levels, 3);
    expect(result.total).toBe(30); // 2 × 12 + 2 × 3 = 24 + 6 = 30
    expect(result.components).toHaveLength(2);
    expect(result.components[0].label).toBe('Barbarian (2d12)');
    expect(result.components[0].value).toBe(24);
    expect(result.components[1].label).toBe('CON modifier (2 × +3)');
    expect(result.components[1].value).toBe(6);
  });

  it('calculates HP for single-class character with negative CON modifier', () => {
    const levels: Level[] = [{ level: 1, class: 'Wizard', feats: [] }]; // d4
    const result = calculateMaxHP(levels, -1);
    expect(result.total).toBe(3); // 1 × 4 + 1 × (-1) = 4 - 1 = 3
    expect(result.components).toHaveLength(2);
    expect(result.components[0].label).toBe('Wizard (1d4)');
    expect(result.components[0].value).toBe(4);
    expect(result.components[1].label).toBe('CON modifier (1 × -1)');
    expect(result.components[1].value).toBe(-1);
  });

  it('calculates HP for multiclass character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // d10
      { level: 2, class: 'Fighter', feats: [] },
      { level: 3, class: 'Wizard', feats: [] }, // d4
    ];
    const result = calculateMaxHP(levels, 2);
    expect(result.total).toBe(30); // 2 × 10 + 1 × 4 + 3 × 2 = 20 + 4 + 6 = 30
    expect(result.components).toHaveLength(3);
    expect(result.components[0].label).toBe('Fighter (2d10)');
    expect(result.components[0].value).toBe(20);
    expect(result.components[1].label).toBe('Wizard (1d4)');
    expect(result.components[1].value).toBe(4);
    expect(result.components[2].label).toBe('CON modifier (3 × +2)');
    expect(result.components[2].value).toBe(6);
  });
});
