import { describe, expect, it } from 'vitest';

import {
  copySpellCost,
  freeSpellbookSlots,
  maxCastableSpellLevel,
  maxLearnableSpellLevel,
  researchSpellCost,
} from '../wizard/spellbook';

describe('freeSpellbookSlots', () => {
  it('0 wizard levels → 0 slots', () => {
    expect(freeSpellbookSlots(0, 3)).toBe(0);
  });

  it('level 1, INT 10 (+0) → 3 free slots', () => {
    expect(freeSpellbookSlots(1, 0)).toBe(3);
  });

  it('level 1, INT 16 (+3) → 3 + 3 = 6 free slots', () => {
    expect(freeSpellbookSlots(1, 3)).toBe(6);
  });

  it('level 2, INT 10 → 3 + 2 = 5 free slots', () => {
    expect(freeSpellbookSlots(2, 0)).toBe(5);
  });

  it('level 5, INT 14 (+2) → 3 + 2 + (4 × 2) = 13 free slots', () => {
    expect(freeSpellbookSlots(5, 2)).toBe(13);
  });

  it('negative INT mod is treated as 0 for bonus', () => {
    expect(freeSpellbookSlots(1, -2)).toBe(3);
  });
});

describe('maxLearnableSpellLevel', () => {
  it('0 effective levels → max level 0', () => {
    expect(maxLearnableSpellLevel(0)).toBe(0);
  });

  it('level 1 → max spell level 1', () => {
    expect(maxLearnableSpellLevel(1)).toBe(1);
  });

  it('level 2 → max spell level 1', () => {
    expect(maxLearnableSpellLevel(2)).toBe(1);
  });

  it('level 3 → max spell level 2', () => {
    expect(maxLearnableSpellLevel(3)).toBe(2);
  });

  it('level 17 → max spell level 9', () => {
    expect(maxLearnableSpellLevel(17)).toBe(9);
  });

  it('level 20 → max spell level 9 (capped)', () => {
    expect(maxLearnableSpellLevel(20)).toBe(9);
  });
});

describe('maxCastableSpellLevel', () => {
  it('equals maxLearnableSpellLevel', () => {
    for (let i = 0; i <= 20; i++) {
      expect(maxCastableSpellLevel(i)).toBe(maxLearnableSpellLevel(i));
    }
  });
});

describe('copySpellCost', () => {
  it('cantrip (level 0) costs 100 gp', () => {
    expect(copySpellCost(0)).toBe(100);
  });

  it('1st level spell costs 100 gp', () => {
    expect(copySpellCost(1)).toBe(100);
  });

  it('5th level spell costs 500 gp', () => {
    expect(copySpellCost(5)).toBe(500);
  });

  it('9th level spell costs 900 gp', () => {
    expect(copySpellCost(9)).toBe(900);
  });
});

describe('researchSpellCost', () => {
  it('1st level spell costs 1000 gp', () => {
    expect(researchSpellCost(1)).toBe(1000);
  });

  it('5th level spell costs 5000 gp', () => {
    expect(researchSpellCost(5)).toBe(5000);
  });

  it('cantrip (level 0) costs at least 1000 gp', () => {
    expect(researchSpellCost(0)).toBe(1000);
  });
});
