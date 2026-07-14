import { describe, expect, it } from 'vitest';

import type { Scores } from '../../types';
import {
  bonusSlotsForMod,
  calculateEffectiveSlots,
  calculateSpellSlots,
} from '../caster/spell-slots';
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

describe('bonusSlotsForMod', () => {
  it('level 0 always gets 0 bonus slots', () => {
    expect(bonusSlotsForMod(5, 0)).toBe(0);
  });

  it('mod < spell level gets 0 bonus slots', () => {
    expect(bonusSlotsForMod(2, 3)).toBe(0);
  });

  it('mod === spell level gets 1 bonus slot', () => {
    expect(bonusSlotsForMod(3, 3)).toBe(1);
  });

  it('mod 4 above spell level adds 2 bonus slots', () => {
    expect(bonusSlotsForMod(5, 1)).toBe(2); // (5 - 1) / 4 = 1 → +1, so base 1 + extra 1 = 2
  });

  it('INT +4 grants 1 bonus slot for levels 1-4', () => {
    for (let sl = 1; sl <= 4; sl++) {
      expect(bonusSlotsForMod(4, sl)).toBeGreaterThan(0);
    }
    // INT +4 can't grant 5th level bonus
    expect(bonusSlotsForMod(4, 5)).toBe(0);
  });
});

describe('calculateSpellSlots (Wizard)', () => {
  it('Wizard 1, INT 10 has the correct 0th and 1st level slots', () => {
    const slots = calculateSpellSlots(levels(['Wizard']), BASE_SCORES);
    // Wizard 1: 3 cantrips, 1 first-level
    expect(slots['0']).toBe(3);
    expect(slots['1']).toBe(1);
    expect(slots['2']).toBeUndefined(); // no 2nd-level at level 1
  });

  it('Wizard 1, INT 16 (+3) adds bonus slots at levels 1-3', () => {
    const scores: Scores = { ...BASE_SCORES, int: 16 };
    const slots = calculateSpellSlots(levels(['Wizard']), scores);
    // Base 3 cantrips (no INT bonus for 0th), 1 + 1(bonus) for 1st
    expect(slots['0']).toBe(3);
    expect(slots['1']).toBe(2); // 1 base + 1 bonus (INT 3 ≥ level 1)
  });

  it('Wizard 3, INT 10 unlocks 2nd-level slots', () => {
    const slots = calculateSpellSlots(levels(Array(3).fill('Wizard')), BASE_SCORES);
    expect(slots['2']).toBeGreaterThan(0);
  });

  it('non-caster has no spell slots', () => {
    const slots = calculateSpellSlots(levels(['Fighter', 'Fighter']), BASE_SCORES);
    expect(Object.keys(slots)).toHaveLength(0);
  });
});

describe('calculateSpellSlots (Paladin, a partial caster)', () => {
  it('has no spell slots at levels 1-3 (casting starts at level 4)', () => {
    const slots = calculateSpellSlots(levels(Array(3).fill('Paladin')), BASE_SCORES);
    expect(Object.keys(slots)).toHaveLength(0);
  });

  it('level 4 with WIS 12 (+1) grants a bonus 1st-level slot with 0 base', () => {
    const scores: Scores = { ...BASE_SCORES, wis: 12 };
    const slots = calculateSpellSlots(levels(Array(4).fill('Paladin')), scores);
    // Paladin level-4 row: 0 base 1st-level slots; bonus for mod=1 at spell level 1 is 1
    expect(slots['1']).toBe(1);
    expect(slots['0']).toBeUndefined(); // cantrips are inaccessible for Paladin
  });
});

describe('calculateSpellSlots (Wizard + Tainted Scholar)', () => {
  it('Wizard 5 / Tainted Scholar 3 gives effective level 8 slots', () => {
    const wizard8 = calculateSpellSlots(levels(Array(8).fill('Wizard')), BASE_SCORES);
    const mixed = calculateSpellSlots(
      levels([...Array(5).fill('Wizard'), ...Array(3).fill('Tainted Scholar')]),
      BASE_SCORES,
    );
    // Tainted Scholar folds into Wizard, so slots should be identical to pure Wizard 8
    expect(mixed['0']).toBe(wizard8['0']);
    expect(mixed['3']).toBe(wizard8['3']); // 4th level spells at caster level 8
    expect(mixed['4']).toBe(wizard8['4']); // 5th level available at CL 9+, so should be same
  });
});

describe('calculateEffectiveSlots (specialist bonus)', () => {
  it('no specialty: identical to base slots', () => {
    const base = calculateSpellSlots(levels(Array(5).fill('Wizard')), BASE_SCORES);
    const effective = calculateEffectiveSlots(
      levels(Array(5).fill('Wizard')),
      BASE_SCORES,
      undefined,
    );
    expect(effective).toEqual(base);
  });

  it('with specialty: each accessible slot level gets +1', () => {
    const lvls = levels(Array(5).fill('Wizard'));
    const base = calculateSpellSlots(lvls, BASE_SCORES);
    const effective = calculateEffectiveSlots(lvls, BASE_SCORES, 'Evocation');
    for (const [k, v] of Object.entries(base)) {
      expect(effective[k]).toBe(v + 1);
    }
  });
});
