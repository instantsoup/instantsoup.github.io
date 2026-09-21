import { describe, expect, it } from 'vitest';

import type { RulesSpell, WizardContext } from '../types';
import {
  buildWizardContext,
  canAddToSpellbook,
  getLearnableSpells,
  getPreparableSpells,
  isSpellForbidden,
} from '../wizard/eligibility';

function makeSpell(name: string, school: string, wizLevel: number): RulesSpell {
  return { name, school, levels: { 'Sor/Wiz': wizLevel } };
}

const BASE_CTX: WizardContext = {
  wizardClassLevels: 5,
  effectiveWizardLevels: 5,
  wizardSpecialty: undefined,
  wizardForbiddenSchools: [],
  intMod: 0,
  spellbookNames: new Set(),
};

describe('isSpellForbidden', () => {
  it('returns false when no schools are forbidden', () => {
    expect(isSpellForbidden(makeSpell('Fireball', 'Evocation', 3), [])).toBe(false);
  });

  it('returns true when spell school is forbidden', () => {
    expect(isSpellForbidden(makeSpell('Fireball', 'Evocation', 3), ['Evocation'])).toBe(true);
  });

  it('returns false when a different school is forbidden', () => {
    expect(isSpellForbidden(makeSpell('Fireball', 'Evocation', 3), ['Necromancy'])).toBe(false);
  });
});

describe('canAddToSpellbook', () => {
  it('eligible for a valid, in-range, unforbidden spell', () => {
    const spell = makeSpell('Magic Missile', 'Evocation', 1);
    const result = canAddToSpellbook(spell, BASE_CTX);
    expect(result.eligible).toBe(true);
  });

  it('ineligible for non-wizard spells (missing Sor/Wiz level key)', () => {
    const spell: RulesSpell = {
      name: 'Cure Light Wounds',
      school: 'Conjuration',
      levels: { Cleric: 1 },
    };
    const result = canAddToSpellbook(spell, BASE_CTX);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/Not a wizard spell/);
  });

  it('ineligible when spell school is forbidden', () => {
    const spell = makeSpell('Fireball', 'Evocation', 3);
    const ctx: WizardContext = { ...BASE_CTX, wizardForbiddenSchools: ['Evocation'] };
    const result = canAddToSpellbook(spell, ctx);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/forbidden school/);
  });

  it('ineligible when spell level exceeds max learnable level', () => {
    // CL 1 wizard (max level 1) trying to learn a 5th-level spell
    const spell = makeSpell('Teleport', 'Conjuration', 5);
    const ctx: WizardContext = { ...BASE_CTX, effectiveWizardLevels: 1 };
    const result = canAddToSpellbook(spell, ctx);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/Requires caster level 9/);
  });

  describe('by acquisition route', () => {
    const teleport = makeSpell('Teleport', 'Conjuration', 5);
    const lowLevel: WizardContext = { ...BASE_CTX, effectiveWizardLevels: 1 };

    it('free spells must be of a castable level, even with the override', () => {
      const result = canAddToSpellbook(teleport, lowLevel, {
        source: 'free-levelup',
        freeRemaining: 2,
        allowAboveLevelCap: true,
      });
      expect(result.eligible).toBe(false);
    });

    it('researched spells must be of a castable level', () => {
      const result = canAddToSpellbook(teleport, lowLevel, {
        source: 'researched',
        allowAboveLevelCap: true,
      });
      expect(result.eligible).toBe(false);
    });

    it('copied and found spells may exceed the cap only when asked', () => {
      for (const source of ['purchased', 'found'] as const) {
        expect(canAddToSpellbook(teleport, lowLevel, { source }).eligible).toBe(false);
        expect(
          canAddToSpellbook(teleport, lowLevel, { source, allowAboveLevelCap: true }).eligible,
        ).toBe(true);
      }
    });

    it('forbidden schools can never be learned, whatever the route', () => {
      const ctx: WizardContext = { ...lowLevel, wizardForbiddenSchools: ['Conjuration'] };
      const result = canAddToSpellbook(teleport, ctx, {
        source: 'purchased',
        allowAboveLevelCap: true,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toMatch(/forbidden school/);
    });

    it('free spells are refused once the budget is spent', () => {
      const spell = makeSpell('Magic Missile', 'Evocation', 1);
      const spent = canAddToSpellbook(spell, BASE_CTX, {
        source: 'free-levelup',
        freeRemaining: 0,
      });
      expect(spent.eligible).toBe(false);
      expect(spent.reason).toMatch(/No free spells/);
      expect(
        canAddToSpellbook(spell, BASE_CTX, { source: 'free-levelup', freeRemaining: 1 }).eligible,
      ).toBe(true);
    });

    it('copying is still allowed when the free budget is spent', () => {
      const spell = makeSpell('Magic Missile', 'Evocation', 1);
      expect(
        canAddToSpellbook(spell, BASE_CTX, { source: 'purchased', freeRemaining: 0 }).eligible,
      ).toBe(true);
    });
  });

  it('cantrips are never learnable by a wizard — every one is already in the book', () => {
    const result = canAddToSpellbook(makeSpell('Light', 'Evocation', 0), BASE_CTX);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/0-level/);
  });

  it('ineligible when spell is already in spellbook', () => {
    const spell = makeSpell('Magic Missile', 'Evocation', 1);
    const ctx: WizardContext = { ...BASE_CTX, spellbookNames: new Set(['magic missile']) };
    const result = canAddToSpellbook(spell, ctx);
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/Already in spellbook/);
  });
});

describe('buildWizardContext', () => {
  const lvl = (n: number, cls: string) =>
    ({
      level: n,
      class: cls,
      feats: [],
      spells: [],
      skillRanks: {},
      unspentSkillPoints: 0,
    }) as never;
  const levels = [lvl(1, 'Wizard'), lvl(2, 'Fighter'), lvl(3, 'Wizard'), lvl(4, 'Wizard')];
  const opts = {
    intMod: 2,
    specialty: 'Evocation',
    forbiddenSchools: ['Necromancy'],
    spellbookNames: new Set(['sleep']),
  };

  it('counts wizard levels only up to the chosen character level', () => {
    expect(buildWizardContext(levels, 1, opts).wizardClassLevels).toBe(1);
    expect(buildWizardContext(levels, 2, opts).wizardClassLevels).toBe(1);
    expect(buildWizardContext(levels, 3, opts).wizardClassLevels).toBe(2);
    expect(buildWizardContext(levels, 4, opts).effectiveWizardLevels).toBe(3);
  });

  it('passes the specialist and spellbook details through', () => {
    const ctx = buildWizardContext(levels, 4, opts);
    expect(ctx.wizardSpecialty).toBe('Evocation');
    expect(ctx.wizardForbiddenSchools).toEqual(['Necromancy']);
    expect(ctx.intMod).toBe(2);
    expect(ctx.spellbookNames.has('sleep')).toBe(true);
  });
});

describe('getLearnableSpells', () => {
  const spells: RulesSpell[] = [
    makeSpell('Magic Missile', 'Evocation', 1),
    makeSpell('Fireball', 'Evocation', 3),
    makeSpell('Animate Dead', 'Necromancy', 3),
    makeSpell('Teleport', 'Conjuration', 5),
    { name: 'Cure Light Wounds', school: 'Conjuration', levels: { Cleric: 1 } },
  ];

  it('filters to wizard spells within level cap', () => {
    // CL 5: max level ceil(5/2) = 3
    const learnable = getLearnableSpells(spells, BASE_CTX);
    const names = learnable.map((s) => s.name);
    expect(names).toContain('Magic Missile');
    expect(names).toContain('Fireball');
    expect(names).toContain('Animate Dead');
    expect(names).not.toContain('Teleport'); // too high
    expect(names).not.toContain('Cure Light Wounds'); // not a wizard spell
  });

  it('excludes forbidden school spells', () => {
    const ctx: WizardContext = { ...BASE_CTX, wizardForbiddenSchools: ['Evocation'] };
    const learnable = getLearnableSpells(spells, ctx);
    const names = learnable.map((s) => s.name);
    expect(names).not.toContain('Magic Missile');
    expect(names).not.toContain('Fireball');
    expect(names).toContain('Animate Dead');
  });

  it('showAllLevels bypasses the caster-level cap', () => {
    const learnable = getLearnableSpells(
      spells,
      { ...BASE_CTX, effectiveWizardLevels: 1 },
      { showAllLevels: true },
    );
    const names = learnable.map((s) => s.name);
    expect(names).toContain('Teleport'); // CL 1 but cap bypassed
  });

  it('filters by search query', () => {
    const learnable = getLearnableSpells(spells, BASE_CTX, { search: 'magic' });
    expect(learnable.map((s) => s.name)).toEqual(['Magic Missile']);
  });

  it('filters by school', () => {
    const learnable = getLearnableSpells(spells, BASE_CTX, { schoolFilter: 'Necromancy' });
    expect(learnable.map((s) => s.name)).toEqual(['Animate Dead']);
  });

  it('filters by spell level', () => {
    const learnable = getLearnableSpells(spells, BASE_CTX, { levelFilter: '3' });
    const names = learnable.map((s) => s.name);
    expect(names).toContain('Fireball');
    expect(names).toContain('Animate Dead');
    expect(names).not.toContain('Magic Missile');
  });

  it('excludes spells already in the spellbook', () => {
    const ctx: WizardContext = { ...BASE_CTX, spellbookNames: new Set(['fireball']) };
    const learnable = getLearnableSpells(spells, ctx);
    expect(learnable.map((s) => s.name)).not.toContain('Fireball');
  });
});

describe('getPreparableSpells', () => {
  const spellbookEntries = [
    { spellName: 'Fireball', school: 'Evocation' },
    { spellName: 'Animate Dead', school: 'Necromancy' },
    { spellName: 'Detect Magic', school: 'Divination' },
  ];

  it('returns all entries when nothing is forbidden', () => {
    expect(getPreparableSpells(spellbookEntries, [])).toHaveLength(3);
  });

  it('excludes entries from forbidden schools', () => {
    const preparable = getPreparableSpells(spellbookEntries, ['Evocation', 'Necromancy']);
    expect(preparable).toHaveLength(1);
    expect(preparable[0].spellName).toBe('Detect Magic');
  });
});
