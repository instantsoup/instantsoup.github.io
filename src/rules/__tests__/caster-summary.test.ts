import { describe, expect, it } from 'vitest';

import type { Scores } from '../../types';
import {
  getCasterSummary,
  getPrimarySpellcastingAbility,
  isCaster,
  spellDC,
} from '../caster/caster-summary';
import type { Level } from '../types';

const BASE_SCORES: Scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

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

describe('getCasterSummary', () => {
  it('pure Wizard 5 returns a single entry with effective level 5', () => {
    const summary = getCasterSummary(levels(Array(5).fill('Wizard')), BASE_SCORES);
    expect(summary).toHaveLength(1);
    expect(summary[0].className).toBe('Wizard');
    expect(summary[0].casterLevel).toBe(5);
    expect(summary[0].castingAbility).toBe('int');
    expect(summary[0].castingType).toBe('prepared');
  });

  it('Wizard 5 / Tainted Scholar 3 folds into single Wizard entry at level 8', () => {
    const lvls = levels([...Array(5).fill('Wizard'), ...Array(3).fill('Tainted Scholar')]);
    const summary = getCasterSummary(lvls, BASE_SCORES);
    // Should not have a Tainted Scholar entry; only Wizard
    expect(summary.find((e) => e.className === 'Tainted Scholar')).toBeUndefined();
    const wiz = summary.find((e) => e.className === 'Wizard');
    expect(wiz).toBeDefined();
    expect(wiz!.casterLevel).toBe(8);
  });

  it('Fighter has no caster entries', () => {
    const summary = getCasterSummary(levels(['Fighter', 'Fighter']), BASE_SCORES);
    expect(summary).toHaveLength(0);
  });

  it('multiclass Wizard 3 / Cleric 3 returns two entries', () => {
    const lvls = levels([...Array(3).fill('Wizard'), ...Array(3).fill('Cleric')]);
    const summary = getCasterSummary(lvls, BASE_SCORES);
    expect(summary).toHaveLength(2);
    const classes = summary.map((e) => e.className).sort();
    expect(classes).toEqual(['Cleric', 'Wizard']);
  });

  it('casting modifier is computed from scores', () => {
    const scores: Scores = { ...BASE_SCORES, int: 18 }; // +4 INT
    const summary = getCasterSummary(levels(Array(3).fill('Wizard')), scores);
    expect(summary[0].castingMod).toBe(4);
  });
});

describe('isCaster', () => {
  it('returns true for Wizard', () => {
    expect(isCaster(levels(['Wizard']))).toBe(true);
  });

  it('returns true for Tainted Scholar (advances Wizard)', () => {
    expect(isCaster(levels(['Wizard', 'Tainted Scholar']))).toBe(true);
  });

  it('returns false for Fighter', () => {
    expect(isCaster(levels(['Fighter']))).toBe(false);
  });
});

describe('getPrimarySpellcastingAbility', () => {
  it('Wizard uses INT', () => {
    expect(getPrimarySpellcastingAbility(levels(Array(5).fill('Wizard')))).toBe('int');
  });

  it('Cleric uses WIS', () => {
    expect(getPrimarySpellcastingAbility(levels(Array(3).fill('Cleric')))).toBe('wis');
  });

  it('Fighter has null casting ability', () => {
    expect(getPrimarySpellcastingAbility(levels(['Fighter']))).toBeNull();
  });

  it('dominant class wins by level count', () => {
    // 5 Wizard, 2 Cleric → Wizard wins
    const result = getPrimarySpellcastingAbility(
      levels([...Array(5).fill('Wizard'), ...Array(2).fill('Cleric')]),
    );
    expect(result).toBe('int');
  });

  it('returns null for an empty level array', () => {
    expect(getPrimarySpellcastingAbility([])).toBeNull();
  });
});

describe('spellDC', () => {
  it('DC 10 + spell level + ability mod', () => {
    expect(spellDC(3, 4)).toBe(17); // 10 + 3 + 4
    expect(spellDC(0, 0)).toBe(10);
    expect(spellDC(9, 5)).toBe(24);
  });
});
