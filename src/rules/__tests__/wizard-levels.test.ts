import { describe, expect, it } from 'vitest';

import type { Level } from '../types';
import { effectiveWizardLevels, isWizardCharacter, wizardClassLevels } from '../wizard/levels';

function levels(classes: string[]): Level[] {
  return classes.map((cls) => ({
    level: 1,
    class: cls as never,
    feats: [],
    spells: [],
    skillRanks: {},
    unspentSkillPoints: 0,
  }));
}

describe('wizardClassLevels', () => {
  it('counts only Wizard levels, not prestige class levels', () => {
    expect(
      wizardClassLevels(levels([...Array(5).fill('Wizard'), ...Array(3).fill('Tainted Scholar')])),
    ).toBe(5);
  });

  it('returns 0 for non-wizard characters', () => {
    expect(wizardClassLevels(levels(['Fighter', 'Cleric']))).toBe(0);
  });
});

describe('effectiveWizardLevels', () => {
  it('pure Wizard 7 → 7', () => {
    expect(effectiveWizardLevels(levels(Array(7).fill('Wizard')))).toBe(7);
  });

  it('Wizard 5 / Tainted Scholar 3 → 8', () => {
    expect(
      effectiveWizardLevels(
        levels([...Array(5).fill('Wizard'), ...Array(3).fill('Tainted Scholar')]),
      ),
    ).toBe(8);
  });

  it('Tainted Scholar alone (no Wizard) still counts toward effective levels', () => {
    // Edge case: pure Tainted Scholar technically advances Wizard but has 0 base Wizard levels
    expect(effectiveWizardLevels(levels(Array(3).fill('Tainted Scholar')))).toBe(3);
  });

  it('Fighter has 0 effective wizard levels', () => {
    expect(effectiveWizardLevels(levels(['Fighter', 'Cleric']))).toBe(0);
  });
});

describe('isWizardCharacter', () => {
  it('true for Wizard', () => {
    expect(isWizardCharacter(levels(['Wizard']))).toBe(true);
  });

  it('true for Wizard + Tainted Scholar', () => {
    expect(isWizardCharacter(levels([...Array(3).fill('Wizard'), 'Tainted Scholar']))).toBe(true);
  });

  it('false for Fighter', () => {
    expect(isWizardCharacter(levels(['Fighter']))).toBe(false);
  });

  it('false for Cleric', () => {
    expect(isWizardCharacter(levels(['Cleric']))).toBe(false);
  });
});
