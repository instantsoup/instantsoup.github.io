import { describe, expect, it } from 'vitest';

import { CONDITIONS } from './conditions';
import type { Condition } from './conditions';

describe('CONDITIONS', () => {
  it('exports a non-empty array', () => {
    expect(CONDITIONS.length).toBeGreaterThan(0);
  });

  it('every condition has a name and description', () => {
    for (const c of CONDITIONS) {
      expect(c.name, `condition missing name`).toBeTruthy();
      expect(c.description, `${c.name} missing description`).toBeTruthy();
    }
  });

  it('condition names are unique', () => {
    const names = CONDITIONS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('penalty values are negative numbers when present', () => {
    const numericFields: Array<keyof Omit<Condition['penalties'] & object, 'loseDexToAC'>> = [
      'str', 'dex', 'attack', 'save', 'ac', 'initiative',
    ];
    for (const c of CONDITIONS) {
      if (!c.penalties) continue;
      for (const field of numericFields) {
        const val = (c.penalties as Record<string, unknown>)[field];
        if (val !== undefined) {
          expect(typeof val, `${c.name}.penalties.${field} should be number`).toBe('number');
          expect(val as number, `${c.name}.penalties.${field} should be negative`).toBeLessThan(0);
        }
      }
    }
  });

  it('known conditions are present', () => {
    const names = CONDITIONS.map((c) => c.name);
    for (const expected of [
      'Blinded', 'Exhausted', 'Fatigued', 'Shaken', 'Stunned',
      'Deafened', 'Entangled', 'Grappled', 'Prone', 'Frightened',
    ]) {
      expect(names, `missing condition: ${expected}`).toContain(expected);
    }
  });

  it('Exhausted has -6 STR and -6 DEX', () => {
    const c = CONDITIONS.find((x) => x.name === 'Exhausted')!;
    expect(c.penalties?.str).toBe(-6);
    expect(c.penalties?.dex).toBe(-6);
  });

  it('Blinded sets loseDexToAC', () => {
    const c = CONDITIONS.find((x) => x.name === 'Blinded')!;
    expect(c.penalties?.loseDexToAC).toBe(true);
  });
});
