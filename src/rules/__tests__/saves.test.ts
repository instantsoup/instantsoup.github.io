import { describe, expect, it } from 'vitest';

import { calculateTotalSave, saveForClass } from '../character/saves';
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

describe('saveForClass', () => {
  it('good: +2 base + 1/2 level', () => {
    expect(saveForClass(1, 'good')).toBe(2);
    expect(saveForClass(2, 'good')).toBe(3);
    expect(saveForClass(10, 'good')).toBe(7);
    expect(saveForClass(20, 'good')).toBe(12);
  });

  it('poor: 1/3 level', () => {
    expect(saveForClass(1, 'poor')).toBe(0);
    expect(saveForClass(3, 'poor')).toBe(1);
    expect(saveForClass(6, 'poor')).toBe(2);
    expect(saveForClass(20, 'poor')).toBe(6);
  });
});

describe('calculateTotalSave', () => {
  it('returns 0 for no levels', () => {
    const result = calculateTotalSave([], 'fortitude');
    expect(result.total).toBe(0);
    expect(result.components).toHaveLength(0);
  });

  it('singularizes the label for a single level', () => {
    const result = calculateTotalSave([level('Cleric')], 'fortitude');
    expect(result.components[0].label).toBe('Cleric (1 level)');
  });

  it('Cleric 5 has good Will, good Fortitude, poor Reflex', () => {
    const levels: Level[] = Array(5)
      .fill(null)
      .map(() => level('Cleric'));
    expect(calculateTotalSave(levels, 'will').total).toBe(saveForClass(5, 'good'));
    expect(calculateTotalSave(levels, 'fortitude').total).toBe(saveForClass(5, 'good'));
    expect(calculateTotalSave(levels, 'reflex').total).toBe(saveForClass(5, 'poor'));
  });

  it('Wizard 5 has good Will, poor Fort, poor Reflex', () => {
    const levels: Level[] = Array(5)
      .fill(null)
      .map(() => level('Wizard'));
    expect(calculateTotalSave(levels, 'will').total).toBe(saveForClass(5, 'good'));
    expect(calculateTotalSave(levels, 'fortitude').total).toBe(saveForClass(5, 'poor'));
  });

  it('multiclass sums correctly', () => {
    // Fighter 4 (good Fort, poor Will) + Wizard 4 (good Will, poor Fort)
    const levels: Level[] = [
      ...Array(4)
        .fill(null)
        .map(() => level('Fighter')),
      ...Array(4)
        .fill(null)
        .map(() => level('Wizard')),
    ];
    const fort = calculateTotalSave(levels, 'fortitude');
    const will = calculateTotalSave(levels, 'will');
    expect(fort.total).toBe(saveForClass(4, 'good') + saveForClass(4, 'poor'));
    expect(will.total).toBe(saveForClass(4, 'poor') + saveForClass(4, 'good'));
    expect(fort.components).toHaveLength(2);
  });
});
