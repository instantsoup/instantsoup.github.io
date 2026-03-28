import { describe, expect, it } from 'vitest';

import { computeMods, mod } from './mods';

describe('mod', () => {
  it('returns 0 for score 10', () => expect(mod(10)).toBe(0));
  it('returns 0 for score 11', () => expect(mod(11)).toBe(0));
  it('returns +1 for score 12', () => expect(mod(12)).toBe(1));
  it('returns +1 for score 13', () => expect(mod(13)).toBe(1));
  it('returns +4 for score 18', () => expect(mod(18)).toBe(4));
  it('returns +5 for score 20', () => expect(mod(20)).toBe(5));
  it('returns −1 for score 8', () => expect(mod(8)).toBe(-1));
  it('returns −1 for score 9', () => expect(mod(9)).toBe(-1));
  it('returns −5 for score 1', () => expect(mod(1)).toBe(-5));
  it('returns −5 for score 0', () => expect(mod(0)).toBe(-5));
});

describe('computeMods', () => {
  it('computes all six ability modifiers from a scores object', () => {
    const result = computeMods({ str: 18, dex: 14, con: 12, int: 10, wis: 8, cha: 16 });
    expect(result.str).toBe(4);
    expect(result.dex).toBe(2);
    expect(result.con).toBe(1);
    expect(result.int).toBe(0);
    expect(result.wis).toBe(-1);
    expect(result.cha).toBe(3);
  });

  it('handles all-10 scores as all-zero mods', () => {
    const result = computeMods({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    expect(result).toEqual({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
  });
});
