// src/lib/dice.ts

export type RNG = () => number;

function defaultRng(): number {
  return Math.random();
}

export function rollOnce(sides: number, rng: RNG = defaultRng): number {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new Error(`Invalid die sides: ${sides}`);
  }
  return Math.floor(rng() * sides) + 1;
}

/** Central list of supported dice (includes d100) */
export const SUPPORTED_DICE = [4, 6, 8, 10, 12, 20, 100] as const;

/**
 * Legacy flat roller (kept for backward compatibility).
 * Returns a simple list of rolls plus their total.
 */
export function rollMany(
  pool: number[],
  rng: RNG = defaultRng,
): { total: number; rolls: number[] } {
  const rolls = pool.map((s) => rollOnce(s, rng));
  const total = rolls.reduce((a, b) => a + b, 0);
  return { total, rolls };
}

/**
 * New: roll a pool and return results grouped by die.
 * Example for pool [6,6,8,100] → [
 *   { sides: 6, rolls: [4, 2] },
 *   { sides: 8, rolls: [7] },
 *   { sides: 100, rolls: [87] }
 * ]
 */
export type DetailedGroup = { sides: number; rolls: number[] };

export function rollManyDetailed(pool: number[], rng: RNG = defaultRng): DetailedGroup[] {
  if (pool.length === 0) return [];

  // Count dice per side
  const counts = new Map<number, number>();
  for (const s of pool) counts.set(s, (counts.get(s) ?? 0) + 1);

  // Roll each group; sort ascending by die size for stable UI
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([sides, count]) => {
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) rolls.push(rollOnce(sides, rng));
      return { sides, rolls };
    });
}

/** Pretty-print the pool like "d6×2 + d8 + d100". */
export function formatPool(pool: number[]): string {
  if (pool.length === 0) return '—';
  const counts = new Map<number, number>();
  for (const s of pool) counts.set(s, (counts.get(s) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([s, c]) => (c === 1 ? `d${s}` : `d${s}×${c}`))
    .join(' + ');
}

/** Optional helper: render grouped results as lines like "d6: 4, 2" */
export function formatDetailed(groups: DetailedGroup[]): string[] {
  return groups.map((g) => `d${g.sides}: ${g.rolls.join(', ')}`);
}
