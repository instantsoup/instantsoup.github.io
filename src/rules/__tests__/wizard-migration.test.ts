import { describe, expect, it } from 'vitest';

import type { SpellbookEntry } from '../../types/spellbook';
import type { Level } from '../types';
import { foldWizardLevelSpellsIntoSpellbook } from '../wizard/migration';

function lvl(n: number, cls: string, spells: string[] = []): Level {
  return {
    level: n,
    class: cls as never,
    feats: [],
    spells,
    skillRanks: {},
    unspentSkillPoints: 0,
  };
}

const book = (spellName: string): SpellbookEntry => ({
  spellName,
  source: 'found',
  goldPaid: 0,
  addedAtCharLevel: 1,
  borrowed: false,
});

describe('foldWizardLevelSpellsIntoSpellbook', () => {
  it('moves wizard level spells into the spellbook and empties the level', () => {
    const result = foldWizardLevelSpellsIntoSpellbook(
      [lvl(1, 'Wizard', ['Sleep', 'Shield']), lvl(2, 'Wizard', ['Web'])],
      [],
    );
    expect(result.levels.map((l) => l.spells)).toEqual([[], []]);
    expect(result.spellbook.map((e) => [e.spellName, e.source, e.addedAtCharLevel])).toEqual([
      ['Sleep', 'starting', 1],
      ['Shield', 'starting', 1],
      ['Web', 'free-levelup', 2],
    ]);
    expect(result.spellbook.every((e) => e.goldPaid === 0)).toBe(true);
  });

  it('treats the first Wizard class level as the starting spellbook even when multiclassed', () => {
    const result = foldWizardLevelSpellsIntoSpellbook(
      [lvl(1, 'Fighter'), lvl(2, 'Wizard', ['Sleep']), lvl(3, 'Wizard', ['Web'])],
      [],
    );
    expect(result.spellbook.map((e) => [e.spellName, e.source, e.addedAtCharLevel])).toEqual([
      ['Sleep', 'starting', 2],
      ['Web', 'free-levelup', 3],
    ]);
  });

  it('does not duplicate spells already in the spellbook (case-insensitive)', () => {
    const result = foldWizardLevelSpellsIntoSpellbook(
      [lvl(1, 'Wizard', ['sleep', 'Shield'])],
      [book('Sleep')],
    );
    expect(result.spellbook.map((e) => e.spellName)).toEqual(['Sleep', 'Shield']);
    expect(result.spellbook[0].source).toBe('found'); // existing entry untouched
  });

  it('leaves non-wizard levels alone', () => {
    const levels = [lvl(1, 'Sorcerer', ['Sleep']), lvl(2, 'Cleric', ['Bless'])];
    const result = foldWizardLevelSpellsIntoSpellbook(levels, []);
    expect(result.levels).toBe(levels);
    expect(result.spellbook).toEqual([]);
  });

  it('is idempotent', () => {
    const once = foldWizardLevelSpellsIntoSpellbook([lvl(1, 'Wizard', ['Sleep'])], []);
    const twice = foldWizardLevelSpellsIntoSpellbook(once.levels, once.spellbook);
    expect(twice.spellbook).toEqual(once.spellbook);
    expect(twice.levels).toEqual(once.levels);
  });

  it('deduplicates the same spell listed on two wizard levels', () => {
    const result = foldWizardLevelSpellsIntoSpellbook(
      [lvl(1, 'Wizard', ['Sleep']), lvl(2, 'Wizard', ['Sleep'])],
      [],
    );
    expect(result.spellbook).toHaveLength(1);
  });
});
