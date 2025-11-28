import { describe, expect, it } from 'vitest';

import { feats, findFeat } from './feats';

describe('feats data', () => {
  it('should load all feats from JSON', () => {
    expect(feats).toBeDefined();
    expect(feats.length).toBeGreaterThan(0);
  });

  it('should have no exact duplicates (same name + source + page)', () => {
    const seen = new Map<string, number>();
    const duplicates: string[] = [];

    feats.forEach((feat, idx) => {
      const key = `${feat.name}|${feat.source.abbr}|${feat.source.page || ''}`;
      if (seen.has(key)) {
        duplicates.push(`${feat.name} (${feat.source.abbr} p.${feat.source.page}) at indices ${seen.get(key)} and ${idx}`);
      } else {
        seen.set(key, idx);
      }
    });

    expect(duplicates).toEqual([]);
  });

  it('should allow legitimate reprints (same name, different source)', () => {
    // "Improved Toughness" is reprinted in CWar, LM, and MM3
    const improvedToughness = feats.filter((f) => f.name === 'Improved Toughness');
    expect(improvedToughness.length).toBeGreaterThan(1);

    // Verify they have different sources
    const sources = improvedToughness.map((f) => f.source.abbr);
    const uniqueSources = new Set(sources);
    expect(uniqueSources.size).toBe(improvedToughness.length);
  });

  it('should have all required feat fields', () => {
    feats.forEach((feat) => {
      expect(feat).toHaveProperty('name');
      expect(feat).toHaveProperty('source');
      expect(feat.source).toHaveProperty('abbr');
      expect(feat).toHaveProperty('types');
      expect(feat).toHaveProperty('description');
      expect(feat.name).toBeTruthy();
    });
  });
});

describe('findFeat', () => {
  it('should find a feat by exact name', () => {
    const feat = findFeat('Toughness');
    expect(feat).toBeDefined();
    expect(feat?.name).toBe('Toughness');
  });

  it('should find a feat by name (case insensitive)', () => {
    const feat = findFeat('TOUGHNESS');
    expect(feat).toBeDefined();
    expect(feat?.name).toBe('Toughness');
  });

  it('should handle leading/trailing whitespace', () => {
    const feat = findFeat('  Toughness  ');
    expect(feat).toBeDefined();
    expect(feat?.name).toBe('Toughness');
  });

  it('should return undefined for non-existent feat', () => {
    const feat = findFeat('This Feat Does Not Exist');
    expect(feat).toBeUndefined();
  });

  it('should return the first occurrence when multiple reprints exist', () => {
    // "Toughness" exists in both Kan and PHB
    const feat = findFeat('Toughness');
    expect(feat).toBeDefined();

    // Should return first occurrence
    const allToughness = feats.filter((f) => f.name === 'Toughness');
    expect(allToughness.length).toBeGreaterThan(0);
    expect(feat).toEqual(allToughness[0]);
  });
});
