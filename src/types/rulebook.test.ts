import { describe, expect, it } from 'vitest';

import {
  ChunkResultSchema,
  IngestedSpellSchema,
  RulebookFeatSchema,
  RulebookFileSchema,
  RulebookItemSchema,
  RulebookRaceSchema,
} from './rulebook';

const minimalSpellWithoutSource = {
  name: 'Test Bolt',
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

const minimalSpell = { ...minimalSpellWithoutSource, source: { abbr: 'PHB', page: 42 } };

const minimalClass = {
  name: 'Test Prestige Class',
  hitDie: 6,
  babProgression: 'medium',
  fortitudeProgression: 'poor',
  reflexProgression: 'poor',
  willProgression: 'good',
  skillPointsPerLevel: 2,
  spellcastingAbility: 'int',
  castingType: 'prepared',
  advancesSpellcastingOf: 'Wizard',
  hasDomains: false,
  spellListKey: 'Sor/Wiz',
};

describe('RulebookFileSchema', () => {
  it('parses a minimal valid rulebook file', () => {
    const fixture = {
      name: 'Test Sourcebook',
      abbreviation: 'PHB',
      slug: 'test-sourcebook',
      pageCount: 320,
      extractedAt: new Date().toISOString(),
      spells: [minimalSpell],
      classes: [minimalClass],
      feats: [{ name: 'Test Feat' }],
      races: [{ name: 'Test Race' }],
      items: [{ name: 'Test Item' }],
    };
    const result = RulebookFileSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  it('defaults optional collections to empty arrays', () => {
    const result = RulebookFileSchema.parse({
      name: 'Empty Book',
      abbreviation: 'PHB',
      slug: 'empty-book',
    });
    expect(result.spells).toEqual([]);
    expect(result.classes).toEqual([]);
    expect(result.feats).toEqual([]);
    expect(result.races).toEqual([]);
    expect(result.items).toEqual([]);
  });

  it('rejects a spell missing the required source.abbr (the app Spell contract)', () => {
    const badSpell = { ...minimalSpell, source: undefined };
    const result = RulebookFileSchema.safeParse({
      name: 'Bad Book',
      abbreviation: 'PHB',
      slug: 'bad-book',
      spells: [badSpell],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a spell whose source.abbr is not in sourcebook-abbrevs.json', () => {
    const badSpell = { ...minimalSpell, source: { abbr: 'NOT_A_REAL_BOOK', page: 1 } };
    const result = RulebookFileSchema.safeParse({
      name: 'Bad Book',
      abbreviation: 'PHB',
      slug: 'bad-book',
      spells: [badSpell],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a class missing required progression fields', () => {
    const result = RulebookFileSchema.safeParse({
      name: 'Bad Book',
      abbreviation: 'PHB',
      slug: 'bad-book',
      classes: [{ name: 'Incomplete Class' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('IngestedSpellSchema (chunk-level, pre-source-assignment)', () => {
  it('accepts a spell with a bare nullable page and no source object', () => {
    const result = IngestedSpellSchema.safeParse({ ...minimalSpellWithoutSource, page: 42 });
    expect(result.success).toBe(true);
  });

  it('defaults page to null when absent', () => {
    const result = IngestedSpellSchema.parse(minimalSpellWithoutSource);
    expect(result.page).toBeNull();
  });

  it('defaults missing descriptive-text fields to empty strings instead of failing', () => {
    const sparse: Partial<typeof minimalSpellWithoutSource> = { ...minimalSpellWithoutSource };
    delete sparse.components;
    delete sparse.castingTime;
    delete sparse.description;
    const result = IngestedSpellSchema.parse(sparse);
    expect(result.components).toBe('');
    expect(result.castingTime).toBe('');
    expect(result.description).toBe('');
  });
});

describe('ChunkResultSchema', () => {
  it('defaults every collection to an empty array', () => {
    const result = ChunkResultSchema.parse({});
    expect(result).toEqual({ spells: [], classes: [], feats: [], races: [], items: [] });
  });
});

describe('RulebookFeatSchema / RulebookRaceSchema / RulebookItemSchema', () => {
  it('only requires a name, defaulting the rest', () => {
    expect(RulebookFeatSchema.parse({ name: 'Power Attack' }).type).toBe('');
    expect(RulebookRaceSchema.parse({ name: 'Tiefling' }).racialTraits).toEqual([]);
    expect(RulebookItemSchema.parse({ name: 'Bag of Holding' }).cost).toBe('');
  });
});
