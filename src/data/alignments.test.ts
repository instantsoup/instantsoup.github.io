import { describe, expect, it } from 'vitest';

import { ALIGNMENT_CODES, alignments, findAlignment } from './alignments';

describe('alignments data', () => {
  it('loads all 9 alignments from JSON', () => {
    expect(alignments).toHaveLength(9);
  });

  it('has all required fields on every alignment', () => {
    alignments.forEach((a) => {
      expect(a).toHaveProperty('code');
      expect(a).toHaveProperty('label');
      expect(a).toHaveProperty('description');
      expect(a.code.length).toBeGreaterThan(0);
      expect(a.label.length).toBeGreaterThan(0);
      expect(a.description!.length).toBeGreaterThan(0);
    });
  });

  it('includes all 9 standard alignment codes', () => {
    expect(ALIGNMENT_CODES).toEqual(
      expect.arrayContaining(['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE']),
    );
  });

  it('has no duplicate codes', () => {
    const codes = alignments.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('ALIGNMENT_CODES matches alignments array', () => {
    expect(ALIGNMENT_CODES).toHaveLength(alignments.length);
    alignments.forEach((a) => expect(ALIGNMENT_CODES).toContain(a.code));
  });
});

describe('findAlignment', () => {
  it('finds an alignment by exact code', () => {
    const result = findAlignment('LG');
    expect(result).toBeDefined();
    expect(result?.label).toBe('Lawful Good');
  });

  it('is case-insensitive', () => {
    const result = findAlignment('lg');
    expect(result).toBeDefined();
    expect(result?.code).toBe('LG');
  });

  it('trims whitespace', () => {
    const result = findAlignment('  NG  ');
    expect(result?.label).toBe('Neutral Good');
  });

  it('returns undefined for an unknown code', () => {
    expect(findAlignment('XY')).toBeUndefined();
  });
});
