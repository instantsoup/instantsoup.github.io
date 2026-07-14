import { findClassProgression } from '../../data/class-progressions';
import { classes } from '../../data/classes';
import type { Level } from '../types';

/**
 * Skill points granted at a specific character level.
 * Level 1 gets 4× the normal amount (PHB).
 */
export function skillPointsForLevel(
  levelNumber: number,
  className: string,
  intModifier: number,
): number {
  const prog = findClassProgression(className);
  if (!prog) return 0;
  const pointsPerLevel = Math.max(1, prog.skillPointsPerLevel + intModifier);
  return levelNumber === 1 ? pointsPerLevel * 4 : pointsPerLevel;
}

/** Total skill points across all levels */
export function calculateTotalSkillPoints(levels: Level[], intModifier: number): number {
  return levels.reduce(
    (total, lvl, i) => total + skillPointsForLevel(i + 1, lvl.class, intModifier),
    0,
  );
}

/**
 * Skill points available at a specific level index, including carryover
 * from unspent points at the previous level.
 */
export function skillPointsAvailableAtLevel(
  levelIndex: number,
  levels: Level[],
  intModifier: number,
): number {
  const base = skillPointsForLevel(levelIndex + 1, levels[levelIndex].class, intModifier);
  const carryover = levelIndex === 0 ? 0 : (levels[levelIndex - 1].unspentSkillPoints ?? 0);
  return base + carryover;
}

/** Whether a skill is a class skill for any of the character's classes up to a given level index */
export function isClassSkillForLevels(
  skillName: string,
  levels: Level[],
  upToIndex: number,
): boolean {
  return levels.slice(0, upToIndex + 1).some((lvl) => {
    const classData = classes.find((c) => c.name === lvl.class);
    return classData?.classSkills?.includes(skillName) ?? false;
  });
}

/**
 * Skill points spent at a single level, considering class/cross-class cost.
 * Class skills: 1 pt/rank. Cross-class: 2 pts/rank.
 */
export function skillPointsSpentAtLevel(level: Level, allLevels: Level[]): number {
  const levelIndex = level.level - 1;
  let spent = 0;
  for (const [skillName, ranks] of Object.entries(level.skillRanks ?? {})) {
    if (!ranks) continue;
    const isClass = isClassSkillForLevels(skillName, allLevels, levelIndex);
    spent += isClass ? ranks : ranks * 2;
  }
  return spent;
}

/**
 * Total skill points spent across all levels.
 * Class skills: 1 pt/rank. Cross-class: 2 pts/rank.
 */
export function calculateSkillPointsSpent(
  skillRanks: Record<string, number>,
  levels: Level[],
): number {
  let total = 0;
  for (const [skillName, ranks] of Object.entries(skillRanks)) {
    if (!ranks) continue;
    const isClass = levels.some((lvl) => {
      const classData = classes.find((c) => c.name === lvl.class);
      return classData?.classSkills?.includes(skillName) ?? false;
    });
    total += isClass ? ranks : ranks * 2;
  }
  return total;
}

/**
 * Maximum ranks allowed in a skill.
 * Class skills: level + 3. Cross-class: (level + 3) / 2 (floored).
 */
export function maxSkillRanks(characterLevel: number, isClassSkill: boolean): number {
  if (characterLevel === 0) return 0;
  const cap = characterLevel + 3;
  return isClassSkill ? cap : Math.floor(cap / 2);
}

/** Cumulative skill ranks across all levels */
export function cumulativeSkillRanks(levels: Level[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const lvl of levels) {
    for (const [skill, ranks] of Object.entries(lvl.skillRanks ?? {})) {
      totals[skill] = (totals[skill] ?? 0) + ranks;
    }
  }
  return totals;
}

export interface SkillValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Validate that skill ranks at a given level don't exceed the allowed max */
export function validateSkillRanksAtLevel(level: Level, allLevels: Level[]): SkillValidationResult {
  const errors: string[] = [];
  const levelIndex = level.level - 1;
  const relevantLevels = allLevels.slice(0, levelIndex + 1);
  const cumulative = cumulativeSkillRanks(relevantLevels);

  for (const [skillName, ranks] of Object.entries(level.skillRanks ?? {})) {
    if (!ranks) continue;
    const isClass = isClassSkillForLevels(skillName, allLevels, levelIndex);
    const max = maxSkillRanks(level.level, isClass);
    const total = cumulative[skillName] ?? 0;
    if (total > max) {
      errors.push(`${skillName}: ${total} ranks exceeds max ${max} at level ${level.level}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings: [] };
}

/**
 * Recalculate unspent skill points and carryover from a given level index forward.
 * Returns a new levels array with updated `unspentSkillPoints`.
 */
export function recalculateSkillPointsFromLevel(
  fromIndex: number,
  levels: Level[],
  intModifier: number,
): Level[] {
  const updated = [...levels];
  for (let i = fromIndex; i < updated.length; i++) {
    const available = skillPointsAvailableAtLevel(i, updated, intModifier);
    const spent = skillPointsSpentAtLevel(updated[i], updated);
    updated[i] = { ...updated[i], unspentSkillPoints: Math.max(0, available - spent) };
  }
  return updated;
}
