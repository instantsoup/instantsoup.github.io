// src/lib/progressions.ts
import { findClassProgression } from '../data/class-progressions';
import { classes } from '../data/classes';
import { races } from '../data/races';
import type { BABProgression, SaveProgression } from '../types/class-progression';
import type { Level } from '../types/level';

export function getRacialMods(raceName: string | undefined): Record<string, number> {
  if (!raceName) return {};
  return races.find((r) => r.name === raceName)?.modifiers ?? {};
}

/**
 * Breakdown of how a value is calculated
 */
export interface CalculationBreakdown {
  total: number;
  components: Array<{
    label: string;
    value: number;
  }>;
}

/**
 * Calculate BAB for a specific number of levels in a class
 */
export function calculateBABForClass(levels: number, progression: BABProgression): number {
  // levels is always >= 1 and progression is always valid due to schema/UI
  switch (progression) {
    case 'high':
      return levels; // +1 per level
    case 'medium':
      return Math.floor((levels * 3) / 4); // +3/4 per level
    case 'low':
      return Math.floor(levels / 2); // +1/2 per level
  }
}

/**
 * Calculate save bonus for a specific number of levels in a class
 */
export function calculateSaveForClass(levels: number, progression: SaveProgression): number {
  // levels is always >= 1 and progression is always valid due to schema/UI
  switch (progression) {
    case 'good':
      return 2 + Math.floor(levels / 2); // +2 base + 1/2 level
    case 'poor':
      return Math.floor(levels / 3); // +1/3 level
  }
}

/**
 * Calculate total BAB from all character levels
 */
export function calculateTotalBAB(levels: Level[]): CalculationBreakdown {
  const classCounts = new Map<string, number>();

  // Count levels per class
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) || 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let total = 0;

  // Calculate BAB for each class
  for (const [className, count] of classCounts.entries()) {
    const progression = findClassProgression(className)!;
    const bab = calculateBABForClass(count, progression.babProgression);
    components.push({
      label: `${className} (${count} level${count !== 1 ? 's' : ''})`,
      value: bab,
    });
    total += bab;
  }

  return { total, components };
}

/**
 * Calculate total save bonus from all character levels for a specific save
 */
export function calculateTotalSave(
  levels: Level[],
  saveType: 'fortitude' | 'reflex' | 'will',
): CalculationBreakdown {
  const classCounts = new Map<string, number>();

  // Count levels per class
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) || 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let total = 0;

  // Calculate save for each class
  for (const [className, count] of classCounts.entries()) {
    const progression = findClassProgression(className);
    if (progression) {
      const saveProgression =
        saveType === 'fortitude'
          ? progression.fortitudeProgression
          : saveType === 'reflex'
            ? progression.reflexProgression
            : progression.willProgression;
      const save = calculateSaveForClass(count, saveProgression);
      components.push({
        label: `${className} (${count} level${count !== 1 ? 's' : ''})`,
        value: save,
      });

      total += save;
    }
  }
  return { total, components };
}

/**
 * Calculate max HP from all character levels (assuming max HP per level)
 */
export function calculateMaxHP(levels: Level[], conModifier: number): CalculationBreakdown {
  const classCounts = new Map<string, number>();

  // Count levels per class
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) || 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let hpFromHitDice = 0;

  // Calculate HP from hit dice for each class
  for (const [className, count] of classCounts.entries()) {
    const progression = findClassProgression(className)!;
    const hp = count * progression.hitDie;
    components.push({
      label: `${className} (${count}d${progression.hitDie})`,
      value: hp,
    });
    hpFromHitDice += hp;
  }

  // Add CON modifier per level
  const totalLevels = levels.length;
  const conBonus = totalLevels * conModifier;
  if (conBonus !== 0) {
    components.push({
      label: `CON modifier (${totalLevels} × ${conModifier >= 0 ? '+' : ''}${conModifier})`,
      value: conBonus,
    });
  }

  const total = hpFromHitDice + conBonus;

  return { total, components };
}

/**
 * Calculate skill points available per level
 * Formula: class base + INT modifier (minimum 1)
 * First level: 4× the normal amount
 */
export function calculateSkillPointsForLevel(
  levelNumber: number,
  className: string,
  intModifier: number,
): number {
  // className is always valid due to schema/UI
  const progression = findClassProgression(className)!;
  const basePoints = progression.skillPointsPerLevel;
  const pointsPerLevel = Math.max(1, basePoints + intModifier);
  // First level gets 4x skill points
  return levelNumber === 1 ? pointsPerLevel * 4 : pointsPerLevel;
}

/**
 * Calculate total skill points available from all levels
 */
export function calculateTotalSkillPoints(levels: Level[], intModifier: number): number {
  let total = 0;
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    total += calculateSkillPointsForLevel(i + 1, level.class, intModifier);
  }
  return total;
}

/**
 * Calculate skill points spent based on current skill ranks
 * Class skills: 1 point per rank
 * Cross-class skills: 2 points per rank
 */
export function calculateSkillPointsSpent(
  skillRanks: Record<string, number>,
  levels: Level[],
): number {
  // levels is always non-empty and valid
  let totalSpent = 0;
  for (const [skillName, ranks] of Object.entries(skillRanks)) {
    if (ranks === 0) continue;
    // Check if this skill is a class skill for any of the character's classes
    const isClassSkill = levels.some((level) => {
      const classData = classes.find((c) => c.name === level.class);
      return classData?.classSkills?.includes(skillName) ?? false;
    });
    // Class skills cost 1 point per rank, cross-class cost 2 points per rank
    totalSpent += isClassSkill ? ranks : ranks * 2;
  }
  return totalSpent;
}

/**
 * Calculate maximum allowed skill ranks for a skill
 * Class skills: character level + 3
 * Cross-class skills: (character level + 3) / 2 (rounded down)
 */
export function calculateMaxRanks(characterLevel: number, isClassSkill: boolean): number {
  if (characterLevel === 0) return 0;

  if (isClassSkill) {
    return characterLevel + 3;
  } else {
    return Math.floor((characterLevel + 3) / 2);
  }
}

/**
 * Calculate cumulative skill ranks across all levels
 * Aggregates skillRanks from each level into a single total per skill
 */
export function calculateCumulativeSkillRanks(levels: Level[]): Record<string, number> {
  const cumulative: Record<string, number> = {};

  for (const level of levels) {
    const levelSkillRanks = level.skillRanks ?? {};
    for (const [skillName, ranks] of Object.entries(levelSkillRanks)) {
      cumulative[skillName] = (cumulative[skillName] || 0) + ranks;
    }
  }

  return cumulative;
}

/**
 * Calculate skill points available at a specific level
 * Returns: base points for this level + carryover from previous level
 */
export function calculateSkillPointsAvailableAtLevel(
  levelIndex: number,
  levels: Level[],
  intModifier: number,
): number {
  // levelIndex is always valid due to UI
  const level = levels[levelIndex];
  const basePoints = calculateSkillPointsForLevel(levelIndex + 1, level.class, intModifier);
  const carryover = levelIndex === 0 ? 0 : (levels[levelIndex - 1].unspentSkillPoints ?? 0);
  return basePoints + carryover;
}

/**
 * Calculate skill points spent at a specific level
 * Considers class/cross-class skill costs
 */
export function calculateSkillPointsSpentAtLevel(level: Level, allLevels: Level[]): number {
  // level.skillRanks is always defined (may be empty)
  const levelSkillRanks = level.skillRanks ?? {};
  let spent = 0;
  for (const [skillName, ranks] of Object.entries(levelSkillRanks)) {
    if (ranks === 0) continue;
    // Check if this skill is a class skill for any of the character's classes up to this level
    const levelIndex = level.level - 1;
    const relevantLevels = allLevels.slice(0, levelIndex + 1);
    const isClassSkill = relevantLevels.some((lvl) => {
      const classData = classes.find((c) => c.name === lvl.class);
      return classData?.classSkills?.includes(skillName) ?? false;
    });
    // Class skills cost 1 point per rank, cross-class cost 2 points per rank
    spent += isClassSkill ? ranks : ranks * 2;
  }
  return spent;
}

/**
 * Validation result for skill ranks at a level
 */
export interface SkillValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate skill ranks at a specific level
 * Checks max ranks and points available constraints
 */
export function validateSkillRanksAtLevel(level: Level, allLevels: Level[]): SkillValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const levelIndex = level.level - 1;
  const levelSkillRanks = level.skillRanks ?? {};
  const characterLevel = level.level;

  // Check each skill's ranks against max ranks
  for (const [skillName, ranks] of Object.entries(levelSkillRanks)) {
    if (ranks === 0) continue;

    const relevantLevels = allLevels.slice(0, levelIndex + 1);
    const isClassSkill = relevantLevels.some((lvl) => {
      const classData = classes.find((c) => c.name === lvl.class);
      return classData?.classSkills?.includes(skillName) ?? false;
    });

    const maxRanks = calculateMaxRanks(characterLevel, isClassSkill);
    const cumulative = calculateCumulativeSkillRanks(relevantLevels);
    const totalRanks = cumulative[skillName] || 0;

    if (totalRanks > maxRanks) {
      errors.push(
        `${skillName}: ${totalRanks} ranks exceeds max of ${maxRanks} at level ${characterLevel}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Recalculate skill points and carryover from a specific level forward
 * Updates unspentSkillPoints for all levels starting from levelIndex
 */
export function recalculateSkillPointsFromLevel(
  levelIndex: number,
  levels: Level[],
  intModifier: number,
): Level[] {
  // levelIndex is always valid and levels is always non-empty
  const updated = [...levels];
  for (let i = levelIndex; i < updated.length; i++) {
    const level = updated[i];
    const available = calculateSkillPointsAvailableAtLevel(i, updated, intModifier);
    const spent = calculateSkillPointsSpentAtLevel(level, updated);
    const remaining = available - spent;
    updated[i] = {
      ...level,
      unspentSkillPoints: Math.max(0, remaining),
    };
  }
  return updated;
}
