// src/data/races.ts
import { type Race, RacesFileSchema } from '../types/race';
import rawRaces from './races.json' assert { type: 'json' };

const parsed = RacesFileSchema.parse(rawRaces);
export const races: Race[] = parsed;

// Extract valid race names for validation
export const RACE_NAMES = races.map((r) => r.name) as [string, ...string[]];

export function findRace(name: string): Race | undefined {
  const needle = name.trim().toLowerCase();
  return races.find((r) => r.name.toLowerCase() === needle);
}

/** Ability score modifiers granted by a race, or {} for an unknown/undefined race. */
export function getRacialMods(raceName: string | undefined): Record<string, number> {
  if (!raceName) return {};
  return races.find((r) => r.name === raceName)?.modifiers ?? {};
}
