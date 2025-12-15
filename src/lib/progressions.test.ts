// src/lib/progressions.test.ts
import { describe, expect, it } from 'vitest';

import type { Level } from '../types/level';
import {
  calculateBABForClass,
  calculateCumulativeSkillRanks,
  calculateMaxHP,
  calculateMaxRanks,
  calculateSaveForClass,
  calculateSkillPointsAvailableAtLevel,
  calculateSkillPointsForLevel,
  calculateSkillPointsSpent,
  calculateSkillPointsSpentAtLevel,
  calculateTotalBAB,
  calculateTotalSave,
  calculateTotalSkillPoints,
  recalculateSkillPointsFromLevel,
  validateSkillRanksAtLevel,
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

describe('calculateSkillPointsForLevel', () => {
  it('calculates skill points for first level with 4x multiplier', () => {
    expect(calculateSkillPointsForLevel(1, 'Fighter', 0)).toBe(8); // (2 + 0) × 4 = 8
    expect(calculateSkillPointsForLevel(1, 'Rogue', 2)).toBe(40); // (8 + 2) × 4 = 40
    expect(calculateSkillPointsForLevel(1, 'Wizard', 3)).toBe(20); // (2 + 3) × 4 = 20
  });

  it('calculates skill points for subsequent levels without multiplier', () => {
    expect(calculateSkillPointsForLevel(2, 'Fighter', 0)).toBe(2); // 2 + 0 = 2
    expect(calculateSkillPointsForLevel(5, 'Rogue', 2)).toBe(10); // 8 + 2 = 10
    expect(calculateSkillPointsForLevel(10, 'Wizard', 3)).toBe(5); // 2 + 3 = 5
  });

  it('enforces minimum of 1 skill point per level', () => {
    expect(calculateSkillPointsForLevel(1, 'Fighter', -3)).toBe(4); // max(1, 2 - 3) × 4 = 1 × 4 = 4
    expect(calculateSkillPointsForLevel(2, 'Wizard', -5)).toBe(1); // max(1, 2 - 5) = 1
  });
});

describe('calculateTotalSkillPoints', () => {
  it('calculates total for single-class character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Rogue', feats: [] },
      { level: 2, class: 'Rogue', feats: [] },
      { level: 3, class: 'Rogue', feats: [] },
    ];
    // Level 1: (8 + 2) × 4 = 40
    // Level 2: 8 + 2 = 10
    // Level 3: 8 + 2 = 10
    // Total: 60
    expect(calculateTotalSkillPoints(levels, 2)).toBe(60);
  });

  it('calculates total for multiclass character', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // (2 + 1) × 4 = 12
      { level: 2, class: 'Rogue', feats: [] }, // 8 + 1 = 9
      { level: 3, class: 'Rogue', feats: [] }, // 8 + 1 = 9
    ];
    // Total: 30
    expect(calculateTotalSkillPoints(levels, 1)).toBe(30);
  });
});

describe('calculateSkillPointsSpent', () => {
  it('calculates spent points with class and cross-class skills', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // Class skills: Climb, Intimidate, etc.
    ];
    const skillRanks = {
      Climb: 4, // Class skill: 4 points
      'Move Silently': 2, // Cross-class: 2 × 2 = 4 points
      Jump: 3, // Class skill: 3 points
    };
    // Total: 4 + 4 + 3 = 11
    expect(calculateSkillPointsSpent(skillRanks, levels)).toBe(11);
  });

  it('handles multiclass with overlapping class skills', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] }, // Has Climb as class skill
      { level: 2, class: 'Barbarian', feats: [] }, // Also has Climb as class skill
    ];
    const skillRanks = {
      Climb: 5, // Class skill for both: 5 points
      Diplomacy: 2, // Cross-class for both: 2 × 2 = 4 points
    };
    // Total: 5 + 4 = 9
    expect(calculateSkillPointsSpent(skillRanks, levels)).toBe(9);
  });
});

describe('calculateMaxRanks', () => {
  it('calculates max ranks for class skills', () => {
    expect(calculateMaxRanks(1, true)).toBe(4); // 1 + 3
    expect(calculateMaxRanks(5, true)).toBe(8); // 5 + 3
    expect(calculateMaxRanks(20, true)).toBe(23); // 20 + 3
  });

  it('calculates max ranks for cross-class skills', () => {
    expect(calculateMaxRanks(1, false)).toBe(2); // (1 + 3) / 2 = 2
    expect(calculateMaxRanks(5, false)).toBe(4); // (5 + 3) / 2 = 4
    expect(calculateMaxRanks(20, false)).toBe(11); // (20 + 3) / 2 = 11.5 → 11
  });

  it('returns 0 for character level 0', () => {
    expect(calculateMaxRanks(0, true)).toBe(0);
    expect(calculateMaxRanks(0, false)).toBe(0);
  });
});

describe('calculateCumulativeSkillRanks', () => {
  it('aggregates skill ranks from multiple levels', () => {
    const levels: Level[] = [
      {
        level: 1,
        class: 'Fighter',
        feats: [],
        skillRanks: { Climb: 2, Jump: 1 },
        unspentSkillPoints: 0,
      },
      {
        level: 2,
        class: 'Fighter',
        feats: [],
        skillRanks: { Climb: 1, Swim: 2 },
        unspentSkillPoints: 0,
      },
      { level: 3, class: 'Fighter', feats: [], skillRanks: { Jump: 1 }, unspentSkillPoints: 0 },
    ];
    const cumulative = calculateCumulativeSkillRanks(levels);
    expect(cumulative['Climb']).toBe(3); // 2 + 1
    expect(cumulative['Jump']).toBe(2); // 1 + 1
    expect(cumulative['Swim']).toBe(2);
  });

  it('returns empty object for levels with no skills', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [] },
      { level: 2, class: 'Fighter', feats: [] },
    ];
    const cumulative = calculateCumulativeSkillRanks(levels);
    expect(cumulative).toEqual({});
  });
});

describe('calculateSkillPointsAvailableAtLevel', () => {
  it('calculates available points for level 1 (no carryover)', () => {
    const levels: Level[] = [{ level: 1, class: 'Fighter', feats: [], unspentSkillPoints: 0 }];
    // Fighter: 2 base + 2 INT = 4, first level 4x = 16
    expect(calculateSkillPointsAvailableAtLevel(0, levels, 2)).toBe(16);
  });

  it('calculates available points for level 2+ with carryover', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [], unspentSkillPoints: 3 },
      { level: 2, class: 'Fighter', feats: [], unspentSkillPoints: 0 },
    ];
    // Fighter: 2 base + 2 INT = 4, plus 3 carryover = 7
    expect(calculateSkillPointsAvailableAtLevel(1, levels, 2)).toBe(7);
  });

  it('returns 0 for invalid level index', () => {
    const levels: Level[] = [{ level: 1, class: 'Fighter', feats: [] }];
    expect(calculateSkillPointsAvailableAtLevel(-1, levels, 2)).toBe(0);
    expect(calculateSkillPointsAvailableAtLevel(5, levels, 2)).toBe(0);
  });
});

describe('calculateSkillPointsSpentAtLevel', () => {
  it('calculates spent points considering class/cross-class', () => {
    const level: Level = {
      level: 1,
      class: 'Fighter',
      feats: [],
      skillRanks: { Climb: 2, Diplomacy: 1 }, // Climb is class, Diplomacy is cross-class
    };
    // Climb: 2 ranks × 1 = 2, Diplomacy: 1 rank × 2 = 2, Total: 4
    expect(calculateSkillPointsSpentAtLevel(level, [level])).toBe(4);
  });

  it('returns 0 for level with no skill ranks', () => {
    const level: Level = {
      level: 1,
      class: 'Fighter',
      feats: [],
      skillRanks: {},
    };
    expect(calculateSkillPointsSpentAtLevel(level, [level])).toBe(0);
  });
});

describe('validateSkillRanksAtLevel', () => {
  it('validates skill ranks within max', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [], skillRanks: { Climb: 2 } }, // Max: 4 for class skill
    ];
    const result = validateSkillRanksAtLevel(levels[0], levels);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects when skill ranks exceed max', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [], skillRanks: { Climb: 5 } }, // Max: 4 for class skill
    ];
    const result = validateSkillRanksAtLevel(levels[0], levels);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('exceeds max');
  });
});

describe('recalculateSkillPointsFromLevel', () => {
  it('recalculates carryover from specified level forward', () => {
    const levels: Level[] = [
      { level: 1, class: 'Fighter', feats: [], skillRanks: { Climb: 2 }, unspentSkillPoints: 0 },
      { level: 2, class: 'Fighter', feats: [], skillRanks: {}, unspentSkillPoints: 0 },
      { level: 3, class: 'Fighter', feats: [], skillRanks: {}, unspentSkillPoints: 0 },
    ];
    const updated = recalculateSkillPointsFromLevel(0, levels, 2);
    // Level 1: 16 available, 2 spent (class skill), 14 remaining
    expect(updated[0].unspentSkillPoints).toBe(14);
    // Level 2: 4 base + 14 carryover = 18 available, 0 spent, 18 remaining
    expect(updated[1].unspentSkillPoints).toBe(18);
    // Level 3: 4 base + 18 carryover = 22 available, 0 spent, 22 remaining
    expect(updated[2].unspentSkillPoints).toBe(22);
  });

  it('returns original array for invalid level index', () => {
    const levels: Level[] = [{ level: 1, class: 'Fighter', feats: [] }];
    const updated = recalculateSkillPointsFromLevel(-1, levels, 2);
    expect(updated).toEqual(levels);
  });
});
