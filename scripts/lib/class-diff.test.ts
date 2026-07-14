import { describe, expect, it } from 'vitest';

import type { ClassProgression } from '../../src/types/class-progression';
import { diffClassProgression, findExistingClass, reviewClassMerge } from './class-diff';

function mkClass(overrides: Partial<ClassProgression> = {}): ClassProgression {
  return {
    name: 'Test Class',
    hitDie: 8,
    babProgression: 'medium',
    fortitudeProgression: 'good',
    reflexProgression: 'poor',
    willProgression: 'poor',
    skillPointsPerLevel: 4,
    spellcastingAbility: null,
    castingType: null,
    spellSlotsPerDay: null,
    spellListKey: null,
    hasDomains: false,
    advancesSpellcastingOf: null,
    ...overrides,
  };
}

describe('findExistingClass', () => {
  it('finds a class by exact name', () => {
    const existing = [mkClass({ name: 'Wizard' }), mkClass({ name: 'Fighter' })];
    expect(findExistingClass(existing, 'Wizard')?.name).toBe('Wizard');
  });

  it('is case-insensitive and trims whitespace', () => {
    const existing = [mkClass({ name: 'Wizard' })];
    expect(findExistingClass(existing, '  WIZARD  ')?.name).toBe('Wizard');
  });

  it('returns undefined for an unknown class', () => {
    expect(findExistingClass([mkClass({ name: 'Wizard' })], 'Artificer')).toBeUndefined();
  });
});

describe('diffClassProgression', () => {
  it('returns no changes for identical classes', () => {
    const a = mkClass();
    const b = mkClass();
    expect(diffClassProgression(a, b)).toEqual([]);
  });

  it('reports each changed field', () => {
    const a = mkClass({ hitDie: 8, babProgression: 'medium' });
    const b = mkClass({ hitDie: 10, babProgression: 'high' });
    const changes = diffClassProgression(a, b);
    expect(changes).toContain('hitDie: 8 -> 10');
    expect(changes).toContain('babProgression: "medium" -> "high"');
    expect(changes).toHaveLength(2);
  });

  it('reports the sanctioned rule-variant extension fields when they change', () => {
    const a = mkClass({ advancesSpellcastingOf: null, hasDomains: false, spellListKey: null });
    const b = mkClass({
      advancesSpellcastingOf: 'Wizard',
      hasDomains: true,
      spellListKey: 'Sor/Wiz',
    });
    const changes = diffClassProgression(a, b);
    expect(changes).toContain('advancesSpellcastingOf: null -> "Wizard"');
    expect(changes).toContain('hasDomains: false -> true');
    expect(changes).toContain('spellListKey: null -> "Sor/Wiz"');
  });
});

describe('reviewClassMerge', () => {
  it('classifies a brand-new class as an addition', () => {
    const existing = [mkClass({ name: 'Wizard' })];
    const incoming = [mkClass({ name: 'Tainted Scholar', advancesSpellcastingOf: 'Wizard' })];
    const review = reviewClassMerge(existing, incoming);
    expect(review.additions).toHaveLength(1);
    expect(review.additions[0].name).toBe('Tainted Scholar');
    expect(review.updates).toHaveLength(0);
    expect(review.unchanged).toHaveLength(0);
  });

  it('classifies a matching-but-changed class as an update', () => {
    const existing = [mkClass({ name: 'Wizard', hitDie: 4 })];
    const incoming = [mkClass({ name: 'Wizard', hitDie: 6 })];
    const review = reviewClassMerge(existing, incoming);
    expect(review.additions).toHaveLength(0);
    expect(review.updates).toHaveLength(1);
    expect(review.updates[0].name).toBe('Wizard');
    expect(review.updates[0].changes).toContain('hitDie: 4 -> 6');
  });

  it('classifies an identical class as unchanged', () => {
    const cls = mkClass({ name: 'Fighter' });
    const review = reviewClassMerge([cls], [mkClass({ name: 'Fighter' })]);
    expect(review.additions).toHaveLength(0);
    expect(review.updates).toHaveLength(0);
    expect(review.unchanged).toEqual(['Fighter']);
  });

  it('handles a mix of additions, updates, and unchanged classes in one pass', () => {
    const existing = [mkClass({ name: 'Wizard', hitDie: 4 }), mkClass({ name: 'Fighter' })];
    const incoming = [
      mkClass({ name: 'Wizard', hitDie: 6 }), // update
      mkClass({ name: 'Fighter' }), // unchanged
      mkClass({ name: 'New Prestige Class' }), // addition
    ];
    const review = reviewClassMerge(existing, incoming);
    expect(review.additions.map((c) => c.name)).toEqual(['New Prestige Class']);
    expect(review.updates.map((u) => u.name)).toEqual(['Wizard']);
    expect(review.unchanged).toEqual(['Fighter']);
  });
});
