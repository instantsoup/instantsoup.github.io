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
  3: -5,
  4: -4,
  5: -3,
  6: -2,
  7: -1,
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 6,
  15: 8,
  16: 10,
  17: 13,
  18: 16,
};

export function pointBuyCost(score: number): number {
  const clamped = Math.max(3, Math.min(18, score));
  return POINT_BUY_COST[clamped] ?? 0;
}

export function totalPointBuyCost(scores: Scores): number {
  return Object.values(scores).reduce((sum, s) => sum + pointBuyCost(s), 0);
}

// -- 28-point-buy stat-line adjustment and 3d6 rolling, folded in from
// -- src/lib/statline.ts. Names kept as-is so RollCharacterPanel's migration
// -- (Phase 2.6) is a pure import-path swap.

export type StatLine = number[];

/** Alias of pointBuyCost, kept for statline-derived call sites. */
export const costOf = pointBuyCost;

export function totalCost(stats: StatLine): number {
  return stats.reduce((t, s) => t + costOf(s), 0);
}

/**
 * Adjusts a 6-score stat line to exactly 28 point-buy points, decreasing the
 * lowest scores first when over budget and increasing the highest scores
 * first when under budget, one step at a time, without ever crossing 28.
 */
export function adjustTo28(stats: StatLine): StatLine {
  if (stats.length !== 6) throw new Error('Stat line must have 6 scores');
  const arr = [...stats];
  let total = totalCost(arr);

  // -------- Decrease toward 28: LOWEST → HIGHEST, one step per stat per pass
  while (total > 28) {
    const startTotal = total;
    const order = [...arr.keys()].sort((a, b) => arr[a] - arr[b] || a - b);

    for (const i of order) {
      if (total <= 28) break;
      const s = arr[i];
      if (s <= 3) continue;
      const stepDelta = costOf(s) - costOf(s - 1);
      const remaining = total - 28;
      if (stepDelta <= remaining) {
        const before = costOf(s);
        arr[i] = s - 1;
        total += costOf(arr[i]) - before;
      }
    }

    if (total === startTotal) break;
  }

  // -------- Increase toward 28: HIGHEST → LOWEST, one step per stat per pass
  while (total < 28) {
    const startTotal = total;
    const order = [...arr.keys()].sort((a, b) => arr[b] - arr[a] || a - b);

    for (const i of order) {
      if (total >= 28) break;
      const s = arr[i];
      if (s >= 18) continue;
      const stepDelta = costOf(s + 1) - costOf(s);
      const remaining = 28 - total;
      if (stepDelta <= remaining) {
        const before = costOf(s);
        arr[i] = s + 1;
        total += costOf(arr[i]) - before;
      }
    }

    if (total === startTotal) break;
  }

  return arr;
}

export function roll3d6(): number {
  const d6 = () => Math.floor(Math.random() * 6) + 1;
  return d6() + d6() + d6();
}

export function rollStatLine(): StatLine {
  return Array.from({ length: 6 }, roll3d6);
}
