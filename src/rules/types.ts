/**
 * Shared input/output types for the rules engine.
 * The rules layer only depends on these types and the data layer.
 * No React, no DOM.
 */

export type { Scores } from '../types';
export type { Level } from '../types/level';

/** A spell's class-level map from the data layer */
export type SpellLevels = Record<string, number>;

/** Minimal spell shape the rules engine needs */
export interface RulesSpell {
  name: string;
  school: string;
  subschool?: string | null;
  levels: SpellLevels;
  description?: string | null;
}

/** Context required to evaluate wizard spellbook rules */
export interface WizardContext {
  /** Raw Wizard class levels (used for free-spell budget, a Wizard class feature) */
  wizardClassLevels: number;
  /** Effective wizard caster level = Wizard levels + levels in classes that advance Wizard casting */
  effectiveWizardLevels: number;
  /** Specialist school, if any */
  wizardSpecialty: string | undefined;
  /** Forbidden schools for this specialist */
  wizardForbiddenSchools: string[];
  /** Intelligence modifier (for free spell budget) */
  intMod: number;
  /** Spells already in the spellbook (names, lower-cased) */
  spellbookNames: Set<string>;
}

/** Result of a rules eligibility check */
export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}
