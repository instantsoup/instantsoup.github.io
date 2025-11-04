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

export function rollMany(
  pool: number[],
  rng: RNG = defaultRng,
): { total: number; rolls: number[] } {
  const rolls = pool.map((s) => rollOnce(s, rng));
  const total = rolls.reduce((a, b) => a + b, 0);
  return { total, rolls };
}

export function formatPool(pool: number[]): string {
  if (pool.length === 0) return '—';
  const counts = new Map<number, number>();
  for (const s of pool) counts.set(s, (counts.get(s) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([s, c]) => (c === 1 ? `d${s}` : `d${s}×${c}`))
    .join(' + ');
}
