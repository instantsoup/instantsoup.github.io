import { describe, expect, it } from 'vitest';

import { computeConditionPenalties } from './conditions';
import type { StatusEffect } from '../schema/schema';

function active(): StatusEffect {
  return { active: true };
}

function inactive(): StatusEffect {
  return { active: false };
}

describe('computeConditionPenalties', () => {
  it('returns empty object when no conditions are active', () => {
    const result = computeConditionPenalties({});
    expect(result).toEqual({});
  });

  it('ignores inactive conditions', () => {
    const result = computeConditionPenalties({ Exhausted: inactive() });
    expect(result.str ?? 0).toBe(0);
    expect(result.dex ?? 0).toBe(0);
  });

  it('applies STR/DEX for Exhausted', () => {
    const result = computeConditionPenalties({ Exhausted: active() });
    expect(result.str).toBe(-6);
    expect(result.dex).toBe(-6);
  });

  it('applies STR/DEX for Fatigued', () => {
    const result = computeConditionPenalties({ Fatigued: active() });
    expect(result.str).toBe(-2);
    expect(result.dex).toBe(-2);
  });

  it('applies attack/save for Shaken', () => {
    const result = computeConditionPenalties({ Shaken: active() });
    expect(result.attack).toBe(-2);
    expect(result.save).toBe(-2);
  });

  it('applies initiative penalty for Deafened', () => {
    const result = computeConditionPenalties({ Deafened: active() });
    expect(result.initiative).toBe(-4);
  });

  it('sets loseDexToAC for Blinded', () => {
    const result = computeConditionPenalties({ Blinded: active() });
    expect(result.loseDexToAC).toBe(true);
    expect(result.ac).toBe(-2);
  });

  it('sets loseDexToAC for Stunned', () => {
    const result = computeConditionPenalties({ Stunned: active() });
    expect(result.loseDexToAC).toBe(true);
  });

  it('stacks multiple conditions additively', () => {
    const result = computeConditionPenalties({
      Exhausted: active(), // str -6, dex -6
      Shaken: active(),    // attack -2, save -2
      Deafened: active(),  // initiative -4
    });
    expect(result.str).toBe(-6);
    expect(result.dex).toBe(-6);
    expect(result.attack).toBe(-2);
    expect(result.save).toBe(-2);
    expect(result.initiative).toBe(-4);
    expect(result.loseDexToAC).toBe(false);
  });

  it('stacks loseDexToAC from multiple conditions (OR)', () => {
    const result = computeConditionPenalties({
      Blinded: active(),
      Stunned: active(),
    });
    expect(result.loseDexToAC).toBe(true);
    expect(result.ac).toBe(-4); // -2 + -2
  });

  it('applies DEX/attack for Entangled', () => {
    const result = computeConditionPenalties({ Entangled: active() });
    expect(result.dex).toBe(-4);
    expect(result.attack).toBe(-2);
  });

  it('applies attack penalty for Prone', () => {
    const result = computeConditionPenalties({ Prone: active() });
    expect(result.attack).toBe(-4);
    expect(result.ac).toBe(-4);
  });
});
