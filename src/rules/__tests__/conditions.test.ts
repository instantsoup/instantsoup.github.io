import { describe, expect, it } from 'vitest';

import { computeConditionPenalties } from '../character/conditions';

function active(names: string[]): Record<string, { active: boolean }> {
  const obj: Record<string, { active: boolean }> = {};
  for (const name of names) obj[name] = { active: true };
  return obj;
}

describe('computeConditionPenalties', () => {
  it('no active conditions → all zeros', () => {
    const p = computeConditionPenalties({});
    expect(p.str).toBe(0);
    expect(p.dex).toBe(0);
    expect(p.attack).toBe(0);
    expect(p.save).toBe(0);
    expect(p.ac).toBe(0);
    expect(p.initiative).toBe(0);
    expect(p.loseDexToAC).toBe(false);
  });

  it('Blinded: -2 AC and loseDexToAC', () => {
    const p = computeConditionPenalties(active(['Blinded']));
    expect(p.ac).toBe(-2);
    expect(p.loseDexToAC).toBe(true);
  });

  it('Deafened: -4 initiative', () => {
    const p = computeConditionPenalties(active(['Deafened']));
    expect(p.initiative).toBe(-4);
  });

  it('Exhausted: -6 STR, -6 DEX', () => {
    const p = computeConditionPenalties(active(['Exhausted']));
    expect(p.str).toBe(-6);
    expect(p.dex).toBe(-6);
  });

  it('Fatigued: -2 STR, -2 DEX', () => {
    const p = computeConditionPenalties(active(['Fatigued']));
    expect(p.str).toBe(-2);
    expect(p.dex).toBe(-2);
  });

  it('Shaken: -2 attack, -2 save', () => {
    const p = computeConditionPenalties(active(['Shaken']));
    expect(p.attack).toBe(-2);
    expect(p.save).toBe(-2);
  });

  it('stacks multiple conditions: Shaken + Fatigued', () => {
    const p = computeConditionPenalties(active(['Shaken', 'Fatigued']));
    expect(p.attack).toBe(-2);
    expect(p.save).toBe(-2);
    expect(p.str).toBe(-2);
    expect(p.dex).toBe(-2);
  });

  it('Entangled: -2 attack, -4 DEX', () => {
    const p = computeConditionPenalties(active(['Entangled']));
    expect(p.attack).toBe(-2);
    expect(p.dex).toBe(-4);
  });

  it('Stunned: -2 AC, loseDexToAC', () => {
    const p = computeConditionPenalties(active(['Stunned']));
    expect(p.ac).toBe(-2);
    expect(p.loseDexToAC).toBe(true);
  });

  it('inactive conditions have no effect', () => {
    const p = computeConditionPenalties({ Shaken: { active: false } });
    expect(p.attack).toBe(0);
    expect(p.save).toBe(0);
  });
});
