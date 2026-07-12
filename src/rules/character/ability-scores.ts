import type { Scores } from '../types';

/** Standard 3.5e ability modifier: floor((score - 10) / 2) */
export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Compute all six ability modifiers */
export function computeMods(scores: Scores): Scores {
  return {
    str: abilityMod(scores.str),
    dex: abilityMod(scores.dex),
    con: abilityMod(scores.con),
    int: abilityMod(scores.int),
    wis: abilityMod(scores.wis),
    cha: abilityMod(scores.cha),
  };
}

/**
 * PHB Table 6-1 standardised point-buy cost for a single ability score.
 * Scores outside 3–18 are clamped at the table boundary.
 */
const POINT_BUY_COST: Record<number, number> = {
  3: -6,
  4: -5,
  5: -4,
  6: -3,
  7: -2,
  8: -1,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
  16: 12,
  17: 15,
  18: 19,
};

export function pointBuyCost(score: number): number {
  const clamped = Math.max(3, Math.min(18, score));
  return POINT_BUY_COST[clamped] ?? 0;
}

export function totalPointBuyCost(scores: Scores): number {
  return Object.values(scores).reduce((sum, s) => sum + pointBuyCost(s), 0);
}
