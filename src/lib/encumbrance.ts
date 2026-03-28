// PHB Table 9-1: Heavy load by STR score (in pounds)
const HEAVY_LOAD: Record<number, number> = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
  7: 70,
  8: 80,
  9: 90,
  10: 100,
  11: 115,
  12: 130,
  13: 150,
  14: 175,
  15: 200,
  16: 230,
  17: 260,
  18: 300,
  19: 350,
  20: 400,
  21: 460,
  22: 520,
  23: 600,
  24: 700,
  25: 800,
  26: 920,
  27: 1040,
  28: 1200,
  29: 1400,
};

export function getHeavyLoad(str: number): number {
  if (str <= 0) return 0;
  if (str <= 29) return HEAVY_LOAD[str] ?? 0;
  // For STR ≥ 30: multiply by 4 for every 10 points above 29
  const base = getHeavyLoad(str - 10);
  return base * 4;
}

export function getLightLoad(str: number): number {
  return Math.floor(getHeavyLoad(str) / 3);
}

export function getMediumLoad(str: number): number {
  return Math.floor((getHeavyLoad(str) * 2) / 3);
}

export type LoadCategory = 'light' | 'medium' | 'heavy' | 'overloaded';

export function getLoadCategory(totalWeight: number, str: number): LoadCategory {
  const heavy = getHeavyLoad(str);
  const medium = getMediumLoad(str);
  const light = getLightLoad(str);
  if (totalWeight <= light) return 'light';
  if (totalWeight <= medium) return 'medium';
  if (totalWeight <= heavy) return 'heavy';
  return 'overloaded';
}

// PHB: medium → max DEX +3, heavy/overloaded → max DEX +1, light → no cap
export function getEncumbranceMaxDex(cat: LoadCategory): number {
  if (cat === 'medium') return 3;
  if (cat === 'heavy' || cat === 'overloaded') return 1;
  return Infinity;
}

// PHB: medium → ACP 3, heavy/overloaded → ACP 6, light → 0 (positive magnitude)
export function getEncumbranceACP(cat: LoadCategory): number {
  if (cat === 'medium') return 3;
  if (cat === 'heavy' || cat === 'overloaded') return 6;
  return 0;
}

// PHB: medium/heavy → floor(base * 3/4 / 5) * 5, light/overloaded unchanged
export function getEncumbranceSpeed(baseSpeed: number, cat: LoadCategory): number {
  if (cat === 'light' || cat === 'overloaded') return baseSpeed;
  return Math.floor((baseSpeed * 3) / 4 / 5) * 5;
}
