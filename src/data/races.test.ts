import { describe, expect, it } from 'vitest';

import { findRace, RACE_NAMES, races } from './races';

describe('races data', () => {
  it('loads all 7 core races from JSON', () => {
    expect(races).toHaveLength(7);
  });

  it('has all required fields on every race', () => {
    races.forEach((r) => {
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('description');
      expect(r).toHaveProperty('modifiers');
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.description!.length).toBeGreaterThan(0);
      expect(typeof r.modifiers).toBe('object');
    });
  });

  it('has correct PHB ability modifiers', () => {
    const dwarf = races.find((r) => r.name === 'Dwarf')!;
    expect(dwarf.modifiers).toEqual({ con: 2, cha: -2 });

    const elf = races.find((r) => r.name === 'Elf')!;
    expect(elf.modifiers).toEqual({ dex: 2, con: -2 });

    const gnome = races.find((r) => r.name === 'Gnome')!;
    expect(gnome.modifiers).toEqual({ con: 2, str: -2 });

    const halfOrc = races.find((r) => r.name === 'Half-Orc')!;
    expect(halfOrc.modifiers).toEqual({ str: 2, int: -2, cha: -2 });

    const halfling = races.find((r) => r.name === 'Halfling')!;
    expect(halfling.modifiers).toEqual({ dex: 2, str: -2 });

    const human = races.find((r) => r.name === 'Human')!;
    expect(human.modifiers).toEqual({});

    const halfElf = races.find((r) => r.name === 'Half-Elf')!;
    expect(halfElf.modifiers).toEqual({});
  });

  it('includes all PHB core races', () => {
    expect(RACE_NAMES).toEqual(
      expect.arrayContaining([
        'Human',
        'Dwarf',
        'Elf',
        'Gnome',
        'Half-Elf',
        'Half-Orc',
        'Halfling',
      ]),
    );
  });

  it('has no duplicate race names', () => {
    const names = races.map((r) => r.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('RACE_NAMES matches races array', () => {
    expect(RACE_NAMES).toHaveLength(races.length);
    races.forEach((r) => expect(RACE_NAMES).toContain(r.name));
  });
});

describe('findRace', () => {
  it('finds a race by exact name', () => {
    const result = findRace('Human');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Human');
  });

  it('is case-insensitive', () => {
    const result = findRace('ELF');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Elf');
  });

  it('trims whitespace', () => {
    const result = findRace('  Dwarf  ');
    expect(result?.name).toBe('Dwarf');
  });

  it('handles hyphenated names', () => {
    expect(findRace('Half-Elf')?.name).toBe('Half-Elf');
    expect(findRace('half-orc')?.name).toBe('Half-Orc');
  });

  it('returns undefined for an unknown race', () => {
    expect(findRace('Tiefling')).toBeUndefined();
  });
});
