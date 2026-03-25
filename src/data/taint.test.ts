import { describe, expect, it } from 'vitest';

import { getCorruptionEffect, getDepravityEffect, taintData } from './taint';

describe('taint data', () => {
  it('loads taint data from JSON', () => {
    expect(taintData).toBeDefined();
    expect(taintData.depravityEffects).toHaveLength(10);
    expect(taintData.corruptionEffects).toHaveLength(10);
  });

  it('has scores 0–9 for depravity effects', () => {
    const scores = taintData.depravityEffects.map((e) => e.score);
    expect(scores).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('has scores 0–9 for corruption effects', () => {
    const scores = taintData.corruptionEffects.map((e) => e.score);
    expect(scores).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('all effects have required fields', () => {
    [...taintData.depravityEffects, ...taintData.corruptionEffects].forEach((e) => {
      expect(e).toHaveProperty('score');
      expect(e).toHaveProperty('label');
      expect(e).toHaveProperty('effect');
      expect(e.label.length).toBeGreaterThan(0);
    });
  });
});

describe('getDepravityEffect', () => {
  it('returns effect for score 0', () => {
    const e = getDepravityEffect(0);
    expect(e?.score).toBe(0);
    expect(e?.label).toBe('Untainted');
  });

  it('returns effect for score 5', () => {
    const e = getDepravityEffect(5);
    expect(e?.score).toBe(5);
  });

  it('returns effect for score 9', () => {
    const e = getDepravityEffect(9);
    expect(e?.score).toBe(9);
    expect(e?.label).toBe('Lost');
  });

  it('clamps values above 9 to 9', () => {
    const e = getDepravityEffect(99);
    expect(e?.score).toBe(9);
  });

  it('clamps negative values to 0', () => {
    const e = getDepravityEffect(-1);
    expect(e?.score).toBe(0);
  });
});

describe('getCorruptionEffect', () => {
  it('returns effect for score 0', () => {
    const e = getCorruptionEffect(0);
    expect(e?.score).toBe(0);
    expect(e?.label).toBe('Untainted');
  });

  it('returns effect for score 9', () => {
    const e = getCorruptionEffect(9);
    expect(e?.score).toBe(9);
    expect(e?.label).toBe('Destroyed');
  });

  it('clamps values above 9 to 9', () => {
    expect(getCorruptionEffect(100)?.score).toBe(9);
  });
});
