import { describe, expect, it } from 'vitest';

import {
  calculateSkillPointsSpent,
  calculateTotalSkillPoints,
  cumulativeSkillRanks,
  isClassSkillForLevels,
  maxSkillRanks,
  recalculateSkillPointsFromLevel,
  skillPointsAvailableAtLevel,
  skillPointsForLevel,
  skillPointsSpentAtLevel,
  validateSkillRanksAtLevel,
} from '../character/skills';
import type { Level } from '../types';

const mkLevel = (cls: string, overrides: Partial<Level> = {}): Level => ({
  level: 1,
  class: cls as never,
  feats: [],
  spells: [],
  skillRanks: {},
  unspentSkillPoints: 0,
  ...overrides,
});

describe('skillPointsForLevel', () => {
  it('applies the 4x multiplier at level 1', () => {
    expect(skillPointsForLevel(1, 'Fighter', 0)).toBe(8); // (2 + 0) × 4
    expect(skillPointsForLevel(1, 'Rogue', 2)).toBe(40); // (8 + 2) × 4
  });

  it('applies no multiplier for subsequent levels', () => {
    expect(skillPointsForLevel(2, 'Fighter', 0)).toBe(2);
    expect(skillPointsForLevel(5, 'Rogue', 2)).toBe(10);
  });

  it('enforces a minimum of 1 skill point per level', () => {
    expect(skillPointsForLevel(1, 'Fighter', -3)).toBe(4); // max(1, 2-3) × 4
    expect(skillPointsForLevel(2, 'Wizard', -5)).toBe(1);
  });
});

describe('calculateTotalSkillPoints', () => {
  it('sums across a multiclass character', () => {
    const levels: Level[] = [
      mkLevel('Fighter'), // (2+1)×4 = 12
      mkLevel('Rogue'), // 8+1 = 9
      mkLevel('Rogue'), // 8+1 = 9
    ];
    expect(calculateTotalSkillPoints(levels, 1)).toBe(30);
  });
});

describe('isClassSkillForLevels', () => {
  it('is true when any level up to the index has the skill as a class skill', () => {
    const levels: Level[] = [mkLevel('Fighter'), mkLevel('Barbarian')];
    expect(isClassSkillForLevels('Climb', levels, 1)).toBe(true);
  });

  it('is false for a skill no relevant class has', () => {
    const levels: Level[] = [mkLevel('Fighter')];
    expect(isClassSkillForLevels('Use Magic Device', levels, 0)).toBe(false);
  });
});

describe('calculateSkillPointsSpent', () => {
  it('costs 1 point/rank for class skills, 2 for cross-class', () => {
    const levels: Level[] = [mkLevel('Fighter')];
    const skillRanks = { Climb: 4, 'Move Silently': 2, Jump: 3 };
    // Climb 4 (class) + Move Silently 4 (cross-class 2x2) + Jump 3 (class) = 11
    expect(calculateSkillPointsSpent(skillRanks, levels)).toBe(11);
  });

  it('skips skills with 0 ranks', () => {
    const levels: Level[] = [mkLevel('Fighter')];
    expect(calculateSkillPointsSpent({ Climb: 0, Jump: 2 }, levels)).toBe(2);
  });

  it('returns 0 for empty skill ranks', () => {
    expect(calculateSkillPointsSpent({}, [mkLevel('Fighter')])).toBe(0);
  });
});

describe('maxSkillRanks', () => {
  it('class skills: level + 3', () => {
    expect(maxSkillRanks(1, true)).toBe(4);
    expect(maxSkillRanks(20, true)).toBe(23);
  });

  it('cross-class skills: floor((level + 3) / 2)', () => {
    expect(maxSkillRanks(1, false)).toBe(2);
    expect(maxSkillRanks(20, false)).toBe(11);
  });

  it('returns 0 at character level 0', () => {
    expect(maxSkillRanks(0, true)).toBe(0);
    expect(maxSkillRanks(0, false)).toBe(0);
  });
});

describe('cumulativeSkillRanks', () => {
  it('aggregates ranks from multiple levels', () => {
    const levels: Level[] = [
      mkLevel('Fighter', { level: 1, skillRanks: { Climb: 2, Jump: 1 } }),
      mkLevel('Fighter', { level: 2, skillRanks: { Climb: 1, Swim: 2 } }),
    ];
    const cumulative = cumulativeSkillRanks(levels);
    expect(cumulative.Climb).toBe(3);
    expect(cumulative.Jump).toBe(1);
    expect(cumulative.Swim).toBe(2);
  });

  it('returns an empty object for levels with no skills', () => {
    expect(cumulativeSkillRanks([mkLevel('Fighter')])).toEqual({});
  });
});

describe('skillPointsAvailableAtLevel', () => {
  it('level 1 has no carryover', () => {
    const levels: Level[] = [mkLevel('Fighter', { level: 1, unspentSkillPoints: 0 })];
    expect(skillPointsAvailableAtLevel(0, levels, 2)).toBe(16); // (2+2)×4
  });

  it('level 2+ includes carryover from the previous level', () => {
    const levels: Level[] = [
      mkLevel('Fighter', { level: 1, unspentSkillPoints: 3 }),
      mkLevel('Fighter', { level: 2 }),
    ];
    expect(skillPointsAvailableAtLevel(1, levels, 2)).toBe(7); // (2+2) + 3
  });

  it('defaults missing unspentSkillPoints to 0', () => {
    const levels: Level[] = [mkLevel('Fighter', { level: 1 }), mkLevel('Fighter', { level: 2 })];
    expect(skillPointsAvailableAtLevel(1, levels, 2)).toBe(4);
  });
});

describe('skillPointsSpentAtLevel', () => {
  it('costs 1 point/rank for class skills, 2 for cross-class', () => {
    const level = mkLevel('Fighter', { skillRanks: { Climb: 2, Diplomacy: 1 } });
    expect(skillPointsSpentAtLevel(level, [level])).toBe(4); // 2×1 + 1×2
  });

  it('returns 0 when skillRanks is empty or missing', () => {
    expect(skillPointsSpentAtLevel(mkLevel('Fighter', { skillRanks: {} }), [])).toBe(0);
    const noRanks = mkLevel('Fighter');
    delete (noRanks as { skillRanks?: unknown }).skillRanks;
    expect(skillPointsSpentAtLevel(noRanks, [noRanks])).toBe(0);
  });
});

describe('validateSkillRanksAtLevel', () => {
  it('is valid when ranks are within the max', () => {
    const levels: Level[] = [mkLevel('Fighter', { level: 1, skillRanks: { Climb: 2 } })];
    expect(validateSkillRanksAtLevel(levels[0], levels).valid).toBe(true);
  });

  it('flags class-skill ranks exceeding the max', () => {
    const levels: Level[] = [mkLevel('Fighter', { level: 1, skillRanks: { Climb: 5 } })];
    const result = validateSkillRanksAtLevel(levels[0], levels);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('exceeds max');
  });

  it('flags cross-class-skill ranks exceeding the max', () => {
    const levels: Level[] = [mkLevel('Fighter', { level: 1, skillRanks: { Diplomacy: 3 } })];
    const result = validateSkillRanksAtLevel(levels[0], levels);
    expect(result.valid).toBe(false);
  });

  it('validates cumulative ranks across multiple levels', () => {
    const levels: Level[] = [
      mkLevel('Fighter', { level: 1, skillRanks: { Climb: 4 } }),
      mkLevel('Fighter', { level: 2, skillRanks: { Climb: 2 } }), // total 6, max at level 2 is 5
    ];
    const result = validateSkillRanksAtLevel(levels[1], levels);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('6 ranks exceeds max 5');
  });
});

describe('recalculateSkillPointsFromLevel', () => {
  it('recalculates carryover forward from the given index', () => {
    const levels: Level[] = [
      mkLevel('Fighter', { level: 1, skillRanks: { Climb: 2 }, unspentSkillPoints: 0 }),
      mkLevel('Fighter', { level: 2 }),
      mkLevel('Fighter', { level: 3 }),
    ];
    const updated = recalculateSkillPointsFromLevel(0, levels, 2);
    expect(updated[0].unspentSkillPoints).toBe(14); // 16 available - 2 spent
    expect(updated[1].unspentSkillPoints).toBe(18); // 4 base + 14 carryover
    expect(updated[2].unspentSkillPoints).toBe(22); // 4 base + 18 carryover
  });
});
