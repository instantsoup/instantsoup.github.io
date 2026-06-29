import { z } from 'zod';

import { ALIGNMENT_CODES } from '../data/alignments';
import { CLASS_NAMES } from '../data/classes';
import { RACE_NAMES } from '../data/races';
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

export const SpellbookEntrySchema = z.object({
  spellName: z.string(),
  /** How this spell was acquired. */
  source: z.enum(['starting', 'free-levelup', 'purchased', 'researched', 'found']),
  /** Gold paid to copy or research. 0 for free spells. */
  goldPaid: z.number().int().min(0).default(0),
  /** Character level when the entry was added. */
  addedAtCharLevel: z.number().int().min(1).max(20).default(1),
});

export type SpellbookEntry = z.infer<typeof SpellbookEntrySchema>;

export const CombatStatsSchema = z.object({
  currentHP: z.number().int().optional(),
  maxHP: z.number().int().min(0).optional(),
  tempHP: z.number().int().min(0).optional(),
  armorBonus: z.number().int().optional(),
  shieldBonus: z.number().int().optional(),
  miscACBonus: z.number().int().optional(),
  spellResistance: z.number().int().min(0).optional(),
  initiativeBonus: z.number().int().optional(),
  baseAttackBonus: z.number().int().optional(),
  spellSlotsMax: z.record(z.string(), z.number().int().min(0)).optional().default({}),
  spellSlotsUsed: z.record(z.string(), z.number().int().min(0)).optional().default({}),
  /** Memorized spells keyed by spell level string ('0'..'9'), each value a list of spell names. */
  memorizedSpells: z.record(z.string(), z.array(z.string())).optional().default({}),
  /** Parallel to memorizedSpells: which specific prepared-spell slots have been cast today. */
  memorizedSpellsUsed: z.record(z.string(), z.array(z.boolean())).optional().default({}),
  movementSpeed: z.number().int().min(0).optional(),
  movementType: z.string().optional(),
  armorCheckPenalty: z.number().int().min(0).optional().default(0),
  naturalArmorBonus: z.number().int().min(0).optional().default(0),
  stable: z.boolean().optional().default(false),
  inCombat: z.boolean().optional().default(false),
  combatRound: z.number().int().min(1).optional().default(1),
  combatInitiative: z.number().int().optional(),
});

export type CombatStats = z.infer<typeof CombatStatsSchema>;

export const TaintSchema = z.object({
  depravity: z.number().int().min(0).max(9).optional().default(0),
  corruption: z.number().int().min(0).max(9).optional().default(0),
});

export type Taint = z.infer<typeof TaintSchema>;

export const CustomResourceSchema = z.object({
  name: z.string().min(1),
  max: z.number().int().min(0),
  used: z.number().int().min(0),
});

export type CustomResource = z.infer<typeof CustomResourceSchema>;

export const StatusEffectSchema = z.object({
  active: z.boolean(),
  rounds: z.number().int().min(0).optional(),
});

export type StatusEffect = z.infer<typeof StatusEffectSchema>;

export const CurrencySchema = z.object({
  pp: z.number().int().min(0).optional().default(0),
  gp: z.number().int().min(0).optional().default(0),
  sp: z.number().int().min(0).optional().default(0),
  cp: z.number().int().min(0).optional().default(0),
});

export type Currency = z.infer<typeof CurrencySchema>;

export const AbilityDamageSchema = z.object({
  str: z.number().int().min(0).optional().default(0),
  dex: z.number().int().min(0).optional().default(0),
  con: z.number().int().min(0).optional().default(0),
  int: z.number().int().min(0).optional().default(0),
  wis: z.number().int().min(0).optional().default(0),
  cha: z.number().int().min(0).optional().default(0),
});

export type AbilityDamage = z.infer<typeof AbilityDamageSchema>;

export const EquipmentItemSchema = z.object({
  name: z.string().min(1),
  equipped: z.boolean().default(false),
  weight: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export type EquipmentItem = z.infer<typeof EquipmentItemSchema>;

export const WeaponSchema = z.object({
  name: z.string().min(1),
  damage: z.string().default('1d6'),
  critRange: z.number().int().min(1).max(20).default(20),
  critMult: z.number().int().min(2).max(4).default(2),
  attackType: z.enum(['melee', 'ranged', 'touch', 'ranged touch']).default('melee'),
  attackBonus: z.number().int().default(0),
  damageBonus: z.number().int().default(0),
  damageType: z.string().optional(),
  rangeIncrement: z.number().int().min(5).optional(),
});

export type Weapon = z.infer<typeof WeaponSchema>;

export const CharacterSchema = z.object({
  version: z.literal(2),
  name: z.string().min(0),
  scores: ScoresSchema,
  race: RaceNameSchema.optional(),
  levels: LevelsArraySchema.optional().default([]),
  alignment: AlignmentCodeSchema.optional(),
  saveBonuses: SaveBonusesSchema.optional().default({}),
  combatStats: CombatStatsSchema.optional().default(() => CombatStatsSchema.parse({})),
  flaws: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  taint: TaintSchema.optional(),
  customResources: z.array(CustomResourceSchema).optional().default([]),
  notes: z.string().optional(),
  statusEffects: z.record(z.string(), StatusEffectSchema).optional().default({}),
  abilityDamage: AbilityDamageSchema.optional().default(() => AbilityDamageSchema.parse({})),
  equipment: z.array(EquipmentItemSchema).optional().default([]),
  weapons: z.array(WeaponSchema).optional().default([]),
  skillMiscBonuses: z.record(z.string(), z.number().int()).optional().default({}),
  age: z.number().int().min(0).optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  deity: z.string().optional(),
  homeland: z.string().optional(),
  xp: z.number().int().min(0).optional().default(0),
  currency: CurrencySchema.optional().default(() => CurrencySchema.parse({})),
  /** Physical spellbook contents — spells the wizard knows and can prepare from. */
  spellbook: z.array(SpellbookEntrySchema).optional().default([]),
  /** Wizard specialist school, e.g. 'Divination'. Grants +1 slot/level for that school. */
  wizardSpecialty: z.string().optional(),
  /** Schools the wizard has given up access to (specialist restriction). */
  wizardForbiddenSchools: z.array(z.string()).optional().default([]),
});

export type Character = z.infer<typeof CharacterSchema>;
