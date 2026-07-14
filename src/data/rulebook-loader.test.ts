import { describe, expect, it } from 'vitest';

import { parseRulebookModules } from './rulebook-loader';

const validSpell = {
  name: 'Test Bolt',
  source: { abbr: 'PHB', page: 42 },
  school: 'Evocation',
  subschool: null,
  descriptor: ['Fire'],
  levels: { 'Sor/Wiz': 1 },
  components: 'V, S',
  castingTime: '1 standard action',
  range: '100 ft.',
  duration: 'Instantaneous',
  savingThrow: 'None',
  spellResistance: 'Yes',
  description: 'A bolt of fire.',
};

const validBook = {
  name: 'Test Sourcebook',
  abbreviation: 'PHB',
  slug: 'test-sourcebook',
  spells: [validSpell],
  classes: [],
  feats: [],
  races: [],
  items: [],
};

describe('parseRulebookModules', () => {
  it('loads a valid rulebook file', () => {
    const result = parseRulebookModules({
      './rulebooks/test-sourcebook.json': { default: validBook },
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test Sourcebook');
    expect(result[0].spells).toHaveLength(1);
  });

  it('skips a malformed rulebook file (missing required field) instead of throwing', () => {
    const malformed = { ...validBook, abbreviation: undefined };
    expect(() =>
      parseRulebookModules({ './rulebooks/malformed.json': { default: malformed } }),
    ).not.toThrow();
    const result = parseRulebookModules({
      './rulebooks/malformed.json': { default: malformed },
    });
    expect(result).toHaveLength(0);
  });

  it('skips a book containing a spell that fails schema validation, without dropping other valid books', () => {
    const badSpell = { ...validSpell, source: { abbr: 'NOT_REAL', page: 1 } };
    const badBook = { ...validBook, spells: [badSpell] };
    const result = parseRulebookModules({
      './rulebooks/good.json': { default: validBook },
      './rulebooks/bad.json': { default: badBook },
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Test Sourcebook');
  });

  it('returns an empty array for an empty modules record', () => {
    expect(parseRulebookModules({})).toEqual([]);
  });

  it('defaults missing optional collections to empty arrays', () => {
    const minimal = { name: 'Minimal', abbreviation: 'PHB', slug: 'minimal' };
    const result = parseRulebookModules({ './rulebooks/minimal.json': { default: minimal } });
    expect(result[0].spells).toEqual([]);
    expect(result[0].classes).toEqual([]);
  });
});
