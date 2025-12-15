import { z } from 'zod';

import { ALIGNMENT_CODES } from '../data/alignments';
import { classes } from '../data/classes';
import { CLASS_NAMES } from '../data/classes';
import { RACE_NAMES } from '../data/races';
import { computeMods } from '../lib/mods';
import { calculateMaxRanks, recalculateSkillPointsFromLevel } from '../lib/progressions';
import type { Level } from '../types/level';
import { LevelsArraySchema } from '../types/level';

export const VERSION = 2;

export const ScoresSchema = z.object({
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
});

export const SkillRanksSchema = z.record(z.string(), z.number().min(0).max(99)); // Allow decimals for 0.5 ranks

export const SaveBonusesSchema = z.record(z.string(), z.number().int().min(0).max(99));

// Derive alignment codes from data layer
export const AlignmentCodeSchema = z.enum(ALIGNMENT_CODES);

export type AlignmentCode = z.infer<typeof AlignmentCodeSchema>;

// Derive race names from data layer
export const RaceNameSchema = z.enum(RACE_NAMES);

export type RaceName = z.infer<typeof RaceNameSchema>;

// Derive class names from data layer
export const ClassNameSchema = z.enum(CLASS_NAMES);

export type ClassName = z.infer<typeof ClassNameSchema>;

export const CombatStatsSchema = z.object({
  currentHP: z.number().int().min(0).optional(),
  maxHP: z.number().int().min(0).optional(),
  armorBonus: z.number().int().optional(),
  shieldBonus: z.number().int().optional(),
  miscACBonus: z.number().int().optional(),
  spellResistance: z.number().int().min(0).optional(),
  initiativeBonus: z.number().int().optional(),
  baseAttackBonus: z.number().int().optional(),
});

export type CombatStats = z.infer<typeof CombatStatsSchema>;

export const CharacterSchemaV1 = z.object({
  version: z.literal(1),
  name: z.string().min(0),
  scores: ScoresSchema,
  race: RaceNameSchema.optional(),
  class: ClassNameSchema.optional(), // Deprecated - use levels[0].class instead
  levels: LevelsArraySchema.optional().default([]),
  alignment: AlignmentCodeSchema.optional(),
  feats: z.array(z.string()).optional().default([]), // Deprecated - use levels[].feats instead
  skillRanks: SkillRanksSchema.optional().default({}),
  saveBonuses: SaveBonusesSchema.optional().default({}),
  combatStats: CombatStatsSchema.optional().default({}),
  notes: z.string().optional(),
});

export type CharacterV1 = z.infer<typeof CharacterSchemaV1>;

export const CharacterSchemaV2 = z.object({
  version: z.literal(2),
  name: z.string().min(0),
  scores: ScoresSchema,
  race: RaceNameSchema.optional(),
  class: ClassNameSchema.optional(), // Deprecated - use levels[0].class instead
  levels: LevelsArraySchema.optional().default([]),
  alignment: AlignmentCodeSchema.optional(),
  feats: z.array(z.string()).optional().default([]), // Deprecated - use levels[].feats instead
  skillRanks: SkillRanksSchema.optional().default({}), // Deprecated - use levels[].skillRanks instead
  saveBonuses: SaveBonusesSchema.optional().default({}),
  combatStats: CombatStatsSchema.optional().default({}),
  notes: z.string().optional(),
});

export type CharacterV2 = z.infer<typeof CharacterSchemaV2>;

/**
 * Migrate V1 character to V2 by distributing global skillRanks to per-level tracking
 */
export function migrateV1toV2(v1: CharacterV1): CharacterV2 {
  // If levels already have skillRanks, assume migration already done
  if (v1.levels && v1.levels.length > 0 && v1.levels[0].skillRanks !== undefined) {
    return {
      ...v1,
      version: 2,
    };
  }

  // No levels or no global skills - simple upgrade
  if (
    !v1.levels ||
    v1.levels.length === 0 ||
    !v1.skillRanks ||
    Object.keys(v1.skillRanks).length === 0
  ) {
    return {
      ...v1,
      version: 2,
    };
  }

  // Distribute global skillRanks to levels
  const intModifier = computeMods(v1.scores).int;
  const distributedLevels = distributeSkillRanksToLevels(v1.skillRanks, v1.levels, intModifier);

  return {
    ...v1,
    version: 2,
    levels: distributedLevels,
  };
}

/**
 * Helper: Distribute global skill ranks to levels
 * Strategy: Place ranks at the earliest possible level where they fit
 */
function distributeSkillRanksToLevels(
  globalSkillRanks: Record<string, number>,
  levels: Level[],
  intModifier: number,
): Level[] {
  if (levels.length === 0) return levels;

  // Initialize all levels with empty skillRanks
  const updated: Level[] = levels.map((level) => ({
    ...level,
    skillRanks: {},
    unspentSkillPoints: 0,
  }));

  // For each skill with ranks, distribute across levels
  for (const [skillName, totalRanks] of Object.entries(globalSkillRanks)) {
    if (totalRanks === 0) continue;

    let remaining = totalRanks;

    // Check if this skill is a class skill for any of the character's classes
    const isClassSkill = levels.some((level) => {
      const classData = classes.find((c) => c.name === level.class);
      return classData?.classSkills?.includes(skillName) ?? false;
    });

    // Distribute ranks starting from level 1
    for (let i = 0; i < updated.length && remaining > 0; i++) {
      const level = updated[i];
      const characterLevel = i + 1;

      // Calculate cumulative ranks for this skill up to this level
      let cumulativeRanks = 0;
      for (let j = 0; j <= i; j++) {
        cumulativeRanks += updated[j].skillRanks?.[skillName] || 0;
      }

      // Calculate max ranks allowed at this level
      const maxRanks = calculateMaxRanks(characterLevel, isClassSkill);

      // How many more ranks can we add at this level?
      const canAdd = Math.min(remaining, maxRanks - cumulativeRanks);

      if (canAdd > 0) {
        updated[i] = {
          ...level,
          skillRanks: {
            ...level.skillRanks,
            [skillName]: canAdd,
          },
        };
        remaining -= canAdd;
      }
    }
  }

  // Recalculate skill points from level 0 forward
  return recalculateSkillPointsFromLevel(0, updated, intModifier);
}

export function migrateToLatest(input: unknown): CharacterV2 {
  // Try V2 first
  const v2Parse = CharacterSchemaV2.safeParse(input);
  if (v2Parse.success) return v2Parse.data;

  // Try V1 and migrate
  const v1Parse = CharacterSchemaV1.safeParse(input);
  if (v1Parse.success) return migrateV1toV2(v1Parse.data);

  throw new Error('Invalid character file: schema mismatch or unsupported version.');
}
