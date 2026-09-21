import { describe, expect, it } from 'vitest';

import type { SpellbookEntry } from '../../types/spellbook';
import type { RulesSpell } from '../types';
import {
  acquisitionCost,
  copySpellCost,
  copySpellcraftDC,
  copySpellHours,
  decipherSpellcraftDC,
  freeSourceForWizardLevel,
  freeSpellbookSlots,
  freeSpellsAtWizardLevel,
  getSpellbookItems,
  isFreeSource,
  maxCastableSpellLevel,
  maxLearnableSpellLevel,
  minWizardLevelForSpell,
  researchSpellCost,
  researchSpellHours,
  specialistCopyBonus,
  summarizeSpellbook,
} from '../wizard/spellbook';

describe('freeSpellbookSlots', () => {
  it('0 wizard levels → 0 slots', () => {
    expect(freeSpellbookSlots(0, 3)).toBe(0);
  });

  it('level 1, INT 10 (+0) → 3 free slots', () => {
    expect(freeSpellbookSlots(1, 0)).toBe(3);
  });

  it('level 1, INT 16 (+3) → 3 + 3 = 6 free slots', () => {
    expect(freeSpellbookSlots(1, 3)).toBe(6);
  });

  it('level 2, INT 10 → 3 + 2 = 5 free slots', () => {
    expect(freeSpellbookSlots(2, 0)).toBe(5);
  });

  it('level 5, INT 14 (+2) → 3 + 2 + (4 × 2) = 13 free slots', () => {
    expect(freeSpellbookSlots(5, 2)).toBe(13);
  });

  it('negative INT mod is treated as 0 for bonus', () => {
    expect(freeSpellbookSlots(1, -2)).toBe(3);
  });
});

describe('maxLearnableSpellLevel', () => {
  it('0 effective levels → max level 0', () => {
    expect(maxLearnableSpellLevel(0)).toBe(0);
  });

  it('level 1 → max spell level 1', () => {
    expect(maxLearnableSpellLevel(1)).toBe(1);
  });

  it('level 2 → max spell level 1', () => {
    expect(maxLearnableSpellLevel(2)).toBe(1);
  });

  it('level 3 → max spell level 2', () => {
    expect(maxLearnableSpellLevel(3)).toBe(2);
  });

  it('level 17 → max spell level 9', () => {
    expect(maxLearnableSpellLevel(17)).toBe(9);
  });

  it('level 20 → max spell level 9 (capped)', () => {
    expect(maxLearnableSpellLevel(20)).toBe(9);
  });
});

describe('maxCastableSpellLevel', () => {
  it('equals maxLearnableSpellLevel', () => {
    for (let i = 0; i <= 20; i++) {
      expect(maxCastableSpellLevel(i)).toBe(maxLearnableSpellLevel(i));
    }
  });
});

describe('copySpellCost', () => {
  it('cantrip (level 0) costs 100 gp', () => {
    expect(copySpellCost(0)).toBe(100);
  });

  it('1st level spell costs 100 gp', () => {
    expect(copySpellCost(1)).toBe(100);
  });

  it('5th level spell costs 500 gp', () => {
    expect(copySpellCost(5)).toBe(500);
  });

  it('9th level spell costs 900 gp', () => {
    expect(copySpellCost(9)).toBe(900);
  });
});

describe('researchSpellCost', () => {
  it('1st level spell costs 1000 gp', () => {
    expect(researchSpellCost(1)).toBe(1000);
  });

  it('5th level spell costs 5000 gp', () => {
    expect(researchSpellCost(5)).toBe(5000);
  });

  it('cantrip (level 0) costs at least 1000 gp', () => {
    expect(researchSpellCost(0)).toBe(1000);
  });
});

describe('freeSpellsAtWizardLevel', () => {
  it('level 1 grants 3 + Int mod (never reduced by a penalty)', () => {
    expect(freeSpellsAtWizardLevel(1, 0)).toBe(3);
    expect(freeSpellsAtWizardLevel(1, 3)).toBe(6);
    expect(freeSpellsAtWizardLevel(1, -1)).toBe(3);
  });

  it('every later level grants exactly 2', () => {
    expect(freeSpellsAtWizardLevel(2, 4)).toBe(2);
    expect(freeSpellsAtWizardLevel(9, 0)).toBe(2);
  });

  it('no wizard levels grants nothing', () => {
    expect(freeSpellsAtWizardLevel(0, 4)).toBe(0);
  });

  it('per-level grants add up to the total budget', () => {
    for (const int of [-1, 0, 3]) {
      let sum = 0;
      for (let lvl = 1; lvl <= 8; lvl++) {
        sum += freeSpellsAtWizardLevel(lvl, int);
        expect(freeSpellbookSlots(lvl, int)).toBe(sum);
      }
    }
  });
});

describe('free sources', () => {
  it('starting and free-levelup consume the free budget; the rest do not', () => {
    expect(isFreeSource('starting')).toBe(true);
    expect(isFreeSource('free-levelup')).toBe(true);
    expect(isFreeSource('purchased')).toBe(false);
    expect(isFreeSource('researched')).toBe(false);
    expect(isFreeSource('found')).toBe(false);
  });

  it('wizard level 1 is the starting spellbook, later levels are level-up spells', () => {
    expect(freeSourceForWizardLevel(1)).toBe('starting');
    expect(freeSourceForWizardLevel(2)).toBe('free-levelup');
  });
});

describe('minWizardLevelForSpell', () => {
  it('is the lowest caster level that can cast a spell of that level', () => {
    expect(minWizardLevelForSpell(0)).toBe(1);
    expect(minWizardLevelForSpell(1)).toBe(1);
    expect(minWizardLevelForSpell(2)).toBe(3);
    expect(minWizardLevelForSpell(5)).toBe(9);
    expect(minWizardLevelForSpell(9)).toBe(17);
  });

  it('agrees with maxLearnableSpellLevel', () => {
    for (let spell = 1; spell <= 9; spell++) {
      const need = minWizardLevelForSpell(spell);
      expect(maxLearnableSpellLevel(need)).toBeGreaterThanOrEqual(spell);
      expect(maxLearnableSpellLevel(need - 1)).toBeLessThan(spell);
    }
  });
});

describe('copy costs', () => {
  it('takes 8 hours of study plus 24 hours of scribing regardless of level', () => {
    expect(copySpellHours()).toBe(32);
  });

  it('borrowing from a living wizard adds 50 gp per spell level', () => {
    expect(copySpellCost(3)).toBe(300);
    expect(copySpellCost(3, true)).toBe(450);
    expect(copySpellCost(1, true)).toBe(150);
  });

  it('Spellcraft DCs: copy is 15 + level, deciphering is 20 + level', () => {
    expect(copySpellcraftDC(4)).toBe(19);
    expect(decipherSpellcraftDC(4)).toBe(24);
  });

  it('specialists get +2 only for their own school', () => {
    expect(specialistCopyBonus('Evocation', 'Evocation')).toBe(2);
    expect(specialistCopyBonus('Necromancy', 'Evocation')).toBe(0);
    expect(specialistCopyBonus('Evocation', undefined)).toBe(0);
  });
});

describe('research costs', () => {
  it('takes a week per spell level (minimum one week)', () => {
    expect(researchSpellHours(1)).toBe(168);
    expect(researchSpellHours(3)).toBe(504);
    expect(researchSpellHours(0)).toBe(168);
  });
});

describe('acquisitionCost', () => {
  it('free and found spells cost nothing', () => {
    for (const src of ['starting', 'free-levelup', 'found'] as const) {
      expect(acquisitionCost(src, 4)).toEqual({ gold: 0, hours: 0 });
    }
  });

  it('copied spells cost gold per page and 32 hours', () => {
    expect(acquisitionCost('purchased', 3)).toEqual({ gold: 300, hours: 32 });
    expect(acquisitionCost('purchased', 3, { borrowed: true })).toEqual({ gold: 450, hours: 32 });
  });

  it('researched spells cost 1,000 gp and a week per level', () => {
    expect(acquisitionCost('researched', 2)).toEqual({ gold: 2000, hours: 336 });
  });
});

function entry(
  spellName: string,
  source: SpellbookEntry['source'],
  extra: Partial<SpellbookEntry> = {},
): SpellbookEntry {
  return { spellName, source, goldPaid: 0, addedAtCharLevel: 1, borrowed: false, ...extra };
}

describe('summarizeSpellbook', () => {
  const levelOf = (name: string) => ({ Alpha: 1, Bravo: 3, Charlie: 2 })[name];

  it('an empty book has cost nothing and all free spells remaining', () => {
    const s = summarizeSpellbook([], levelOf, 5);
    expect(s).toMatchObject({ freeTotal: 5, freeUsed: 0, freeRemaining: 5 });
    expect(s.totalGold).toBe(0);
    expect(s.totalHours).toBe(0);
  });

  it('counts starting and level-up spells against the free budget', () => {
    const s = summarizeSpellbook(
      [entry('Alpha', 'starting'), entry('Bravo', 'free-levelup')],
      levelOf,
      5,
    );
    expect(s.freeUsed).toBe(2);
    expect(s.freeRemaining).toBe(3);
    expect(s.totalGold).toBe(0);
  });

  it('sums gold and time across copied and researched spells', () => {
    const s = summarizeSpellbook(
      [
        entry('Alpha', 'purchased'),
        entry('Bravo', 'purchased', { borrowed: true }),
        entry('Charlie', 'researched'),
      ],
      levelOf,
      3,
    );
    // copy L1: 100 gp / 32 h; copy L3 borrowed: 450 gp / 32 h; research L2: 2000 gp / 336 h
    expect(s.totalGold).toBe(100 + 450 + 2000);
    expect(s.totalHours).toBe(32 + 32 + 336);
    expect(s.counts.purchased).toBe(2);
    expect(s.counts.researched).toBe(1);
    expect(s.freeUsed).toBe(0);
  });

  it('reports a negative remainder when the free budget is overspent', () => {
    const s = summarizeSpellbook(
      [entry('Alpha', 'starting'), entry('Bravo', 'starting')],
      levelOf,
      1,
    );
    expect(s.freeRemaining).toBe(-1);
  });

  it('spells that cannot be resolved cost nothing', () => {
    const s = summarizeSpellbook([entry('Mystery', 'purchased')], levelOf, 0);
    expect(s.totalGold).toBe(0);
    expect(s.totalHours).toBe(0);
    expect(s.counts.purchased).toBe(1);
  });
});

describe('getSpellbookItems', () => {
  const spell = (name: string, school: string, level: number): RulesSpell => ({
    name,
    school,
    levels: { 'Sor/Wiz': level },
  });
  const catalog: RulesSpell[] = [
    spell('Light', 'Evocation', 0),
    spell('Ray of Frost', 'Evocation', 0),
    spell('Detect Magic', 'Divination', 0),
    spell('Magic Missile', 'Evocation', 1),
    spell('Sleep', 'Enchantment', 1),
    { name: 'Cure Light Wounds', school: 'Conjuration', levels: { Clr: 1 } },
  ];

  it('includes every cantrip automatically for a wizard', () => {
    const items = getSpellbookItems([], catalog, [], true);
    expect(items.map((i) => i.name)).toEqual(['Detect Magic', 'Light', 'Ray of Frost']);
    expect(items.every((i) => i.entry === undefined)).toBe(true);
  });

  it('omits automatic cantrips from forbidden schools', () => {
    const items = getSpellbookItems([], catalog, ['Evocation'], true);
    expect(items.map((i) => i.name)).toEqual(['Detect Magic']);
  });

  it('adds no cantrips when the character has no wizard levels', () => {
    expect(getSpellbookItems([], catalog, [], false)).toEqual([]);
  });

  it('lists learned spells with their entry, sorted by level then school then name', () => {
    const items = getSpellbookItems(
      [entry('Sleep', 'starting'), entry('magic missile', 'purchased')],
      catalog,
      [],
      false,
    );
    // both are level 1; Enchantment sorts before Evocation
    expect(items.map((i) => i.name)).toEqual(['Sleep', 'Magic Missile']);
    expect(items[0].entry?.source).toBe('starting');
    expect(items[1].entry?.source).toBe('purchased');
  });

  it('keeps a learned spell visible but flagged when its school becomes forbidden', () => {
    const items = getSpellbookItems([entry('Sleep', 'starting')], catalog, ['Enchantment'], false);
    expect(items).toHaveLength(1);
    expect(items[0].forbidden).toBe(true);
  });

  it('does not duplicate a cantrip that also has an explicit entry', () => {
    const items = getSpellbookItems([entry('Light', 'found')], catalog, [], true);
    expect(items.filter((i) => i.name === 'Light')).toHaveLength(1);
  });

  it('ignores entries for spells that are not on the wizard list or unknown', () => {
    const items = getSpellbookItems(
      [entry('Cure Light Wounds', 'found'), entry('Nonexistent', 'found')],
      catalog,
      [],
      false,
    );
    expect(items).toEqual([]);
  });
});
