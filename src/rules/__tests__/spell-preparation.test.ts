import { describe, expect, it } from 'vitest';

import {
  canPrepareSpell,
  classListCandidates,
  resolveSlotMaximums,
  slotMax,
  spellbookCandidates,
} from '../caster/preparation';
import type { RulesSpell } from '../types';
import type { SpellbookItem } from '../wizard/spellbook';

describe('slotMax', () => {
  it('a manual override wins over the calculated value', () => {
    expect(slotMax('1', { '1': 5 }, { '1': 3 })).toBe(5);
  });

  it('an explicit manual 0 is respected (the player turned the level off)', () => {
    expect(slotMax('1', { '1': 0 }, { '1': 3 })).toBe(0);
  });

  it('falls back to the calculated value, then to 0', () => {
    expect(slotMax('1', {}, { '1': 3 })).toBe(3);
    expect(slotMax('1', undefined, { '1': 3 })).toBe(3);
    expect(slotMax('4', {}, { '1': 3 })).toBe(0);
  });
});

describe('resolveSlotMaximums', () => {
  it('returns every spell level 0-9', () => {
    const result = resolveSlotMaximums({ '2': 1 }, { '0': 4, '1': 3, '2': 0 });
    expect(Object.keys(result)).toHaveLength(10);
    expect(result['0']).toBe(4);
    expect(result['1']).toBe(3);
    expect(result['2']).toBe(1);
    expect(result['9']).toBe(0);
  });
});

describe('canPrepareSpell', () => {
  const base = { max: 3, preparedSchools: [], forbiddenSchools: [] };

  it('allows a spell when a slot is free', () => {
    expect(canPrepareSpell('Evocation', base).eligible).toBe(true);
  });

  it('refuses when every slot is filled', () => {
    const result = canPrepareSpell('Evocation', {
      ...base,
      preparedSchools: ['Evocation', 'Evocation', 'Evocation'],
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/No slots left/);
  });

  it('refuses forbidden schools', () => {
    const result = canPrepareSpell('Necromancy', { ...base, forbiddenSchools: ['Necromancy'] });
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/forbidden/);
  });

  describe('specialist bonus slot', () => {
    const spec = { ...base, specialty: 'Evocation' };

    it('other schools may fill every slot but the last', () => {
      expect(canPrepareSpell('Enchantment', { ...spec, preparedSchools: [] }).eligible).toBe(true);
      expect(
        canPrepareSpell('Enchantment', { ...spec, preparedSchools: ['Enchantment'] }).eligible,
      ).toBe(true);
    });

    it('reserves the last slot for the specialty school', () => {
      const prepared = ['Enchantment', 'Divination'];
      const other = canPrepareSpell('Enchantment', { ...spec, preparedSchools: prepared });
      expect(other.eligible).toBe(false);
      expect(other.reason).toMatch(/reserved for a Evocation spell/);
      expect(canPrepareSpell('Evocation', { ...spec, preparedSchools: prepared }).eligible).toBe(
        true,
      );
    });

    it('specialty spells in ordinary slots do not free up the reserved one', () => {
      // Evocation already fills one normal slot; two more non-specialty spells fit, no more.
      const prepared = ['Evocation', 'Enchantment'];
      expect(canPrepareSpell('Enchantment', { ...spec, preparedSchools: prepared }).eligible).toBe(
        true,
      );
      expect(
        canPrepareSpell('Enchantment', {
          ...spec,
          preparedSchools: [...prepared, 'Enchantment'],
        }).eligible,
      ).toBe(false);
    });

    it('a single slot at a level is the specialty slot itself', () => {
      const one = { ...spec, max: 1 };
      expect(canPrepareSpell('Enchantment', one).eligible).toBe(false);
      expect(canPrepareSpell('Evocation', one).eligible).toBe(true);
    });
  });
});

describe('candidate builders', () => {
  const spells: RulesSpell[] = [
    { name: 'Bless', school: 'Enchantment', levels: { Clr: 1 } },
    {
      name: 'Cure Light Wounds',
      school: 'Conjuration',
      levels: { Clr: 1, Brd: 1 },
      description: 'Heals.',
    },
    { name: 'Fireball', school: 'Evocation', levels: { 'Sor/Wiz': 3 } },
  ];

  it('classListCandidates groups the class list by level, sorted by name', () => {
    const byLevel = classListCandidates(spells, 'Clr');
    expect(byLevel['1'].map((c) => c.name)).toEqual(['Bless', 'Cure Light Wounds']);
    expect(byLevel['1'][1].description).toBe('Heals.');
    expect(byLevel['3']).toBeUndefined();
  });

  it('spellbookCandidates groups by level and drops forbidden schools', () => {
    const item = (name: string, level: number, forbidden: boolean): SpellbookItem => ({
      name,
      school: 'Evocation',
      level,
      forbidden,
    });
    const byLevel = spellbookCandidates([
      item('Light', 0, false),
      item('Magic Missile', 1, false),
      item('Shocking Grasp', 1, true),
    ]);
    expect(byLevel['0'].map((c) => c.name)).toEqual(['Light']);
    expect(byLevel['1'].map((c) => c.name)).toEqual(['Magic Missile']);
  });
});
