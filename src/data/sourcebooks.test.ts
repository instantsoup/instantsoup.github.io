import { describe, expect, it } from 'vitest';

import {
  ALL_SOURCE_ABBREVS,
  SOURCEBOOK_NAMES,
  coerceSourceAbbrev,
  getSourceFullName,
  isCheckWithGM,
  listAllAbbrevs,
} from './sourcebooks';

describe('sourcebooks data', () => {
  it('has a non-empty list of abbreviations', () => {
    expect(ALL_SOURCE_ABBREVS.length).toBeGreaterThan(0);
  });

  it('includes core books', () => {
    expect(ALL_SOURCE_ABBREVS).toContain('PHB');
    expect(ALL_SOURCE_ABBREVS).toContain('DMG1');
    expect(ALL_SOURCE_ABBREVS).toContain('SC');
  });

  it('SOURCEBOOK_NAMES has an entry for every abbreviation in ALL_SOURCE_ABBREVS that has a name', () => {
    // Every key in SOURCEBOOK_NAMES should be a non-empty string
    Object.entries(SOURCEBOOK_NAMES).forEach(([abbr, name]) => {
      expect(abbr.length).toBeGreaterThan(0);
      expect(name.length).toBeGreaterThan(0);
    });
  });

  it('has no duplicate abbreviations in ALL_SOURCE_ABBREVS', () => {
    expect(new Set(ALL_SOURCE_ABBREVS).size).toBe(ALL_SOURCE_ABBREVS.length);
  });
});

describe('getSourceFullName', () => {
  it('returns the full name for a known abbreviation', () => {
    expect(getSourceFullName('PHB')).toBe("Player's Handbook I");
    expect(getSourceFullName('SC')).toBe('Spell Compendium');
  });

  it('returns undefined for an unknown abbreviation', () => {
    expect(getSourceFullName('XYZ')).toBeUndefined();
  });
});

describe('isCheckWithGM', () => {
  it('returns true for GM-approval sources', () => {
    expect(isCheckWithGM('FF')).toBe(true);
    expect(isCheckWithGM('SBG')).toBe(true);
    expect(isCheckWithGM('UA')).toBe(true);
  });

  it('returns false for standard sources', () => {
    expect(isCheckWithGM('PHB')).toBe(false);
    expect(isCheckWithGM('SC')).toBe(false);
    expect(isCheckWithGM('DMG1')).toBe(false);
  });

  it('returns false for unknown abbreviations', () => {
    expect(isCheckWithGM('XYZ')).toBe(false);
  });
});

describe('coerceSourceAbbrev', () => {
  it('returns the abbreviation when recognized', () => {
    expect(coerceSourceAbbrev('PHB')).toBe('PHB');
    expect(coerceSourceAbbrev('SC')).toBe('SC');
  });

  it('trims whitespace', () => {
    expect(coerceSourceAbbrev('  PHB  ')).toBe('PHB');
  });

  it('returns undefined for unrecognized input', () => {
    expect(coerceSourceAbbrev('XYZ')).toBeUndefined();
  });
});

describe('listAllAbbrevs', () => {
  it('returns all abbreviations', () => {
    const list = listAllAbbrevs();
    expect(list.length).toBe(ALL_SOURCE_ABBREVS.length);
  });

  it('returns a new array each call (not the original reference)', () => {
    const a = listAllAbbrevs();
    const b = listAllAbbrevs();
    expect(a).not.toBe(b);
  });
});
