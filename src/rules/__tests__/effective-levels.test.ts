import { describe, expect, it } from 'vitest';

import {
  advancesSpellcastingOf,
  buildEffectiveLevels,
  effectiveCasterLevel,
} from '../caster/effective-levels';
import type { Level } from '../types';

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

describe('buildEffectiveLevels', () => {
  it('pure Wizard 5 → Wizard effective level 5', () => {
    const map = buildEffectiveLevels(levels(['Wizard', 'Wizard', 'Wizard', 'Wizard', 'Wizard']));
    expect(map.get('Wizard')).toBe(5);
  });

  it('Wizard 5 / Tainted Scholar 3 → Wizard effective level 8', () => {
    const map = buildEffectiveLevels(
      levels([...Array(5).fill('Wizard'), ...Array(3).fill('Tainted Scholar')]),
    );
    expect(map.get('Wizard')).toBe(8);
    // Tainted Scholar should NOT appear as its own caster entry
    expect(map.get('Tainted Scholar')).toBe(3); // raw count remains for reference
  });

  it('non-casting classes do not pollute the map with casting entries', () => {
    const map = buildEffectiveLevels(levels(['Fighter', 'Fighter']));
    // Fighter has no castingType, but we track raw levels
    expect(map.get('Fighter')).toBe(2);
  });

  it('two different casters are tracked independently', () => {
    const map = buildEffectiveLevels(levels(['Wizard', 'Wizard', 'Cleric', 'Cleric', 'Cleric']));
    expect(map.get('Wizard')).toBe(2);
    expect(map.get('Cleric')).toBe(3);
  });
});

describe('effectiveCasterLevel', () => {
  it('returns 0 for a class with no levels', () => {
    const lvls = levels(['Fighter', 'Fighter']);
    expect(effectiveCasterLevel(lvls, 'Wizard')).toBe(0);
  });

  it('folds Tainted Scholar levels into Wizard', () => {
    const lvls = levels([...Array(5).fill('Wizard'), ...Array(2).fill('Tainted Scholar')]);
    expect(effectiveCasterLevel(lvls, 'Wizard')).toBe(7);
  });
});

describe('advancesSpellcastingOf', () => {
  it('Tainted Scholar advances Wizard', () => {
    expect(advancesSpellcastingOf('Tainted Scholar')).toBe('Wizard');
  });

  it('Wizard does not advance another class', () => {
    expect(advancesSpellcastingOf('Wizard')).toBeNull();
  });

  it('Fighter does not advance spellcasting', () => {
    expect(advancesSpellcastingOf('Fighter')).toBeNull();
  });
});
