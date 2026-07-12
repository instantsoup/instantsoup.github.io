/** PHB Table 9-1: Heavy load (lbs) by STR score */
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

export function heavyLoad(str: number): number {
  if (str <= 0) return 0;
  if (str <= 29) return HEAVY_LOAD[str] ?? 0;
  return heavyLoad(str - 10) * 4;
}

export function lightLoad(str: number): number {
  return Math.floor(heavyLoad(str) / 3);
}
export function mediumLoad(str: number): number {
  return Math.floor((heavyLoad(str) * 2) / 3);
}

export type LoadCategory = 'light' | 'medium' | 'heavy' | 'overloaded';

export function loadCategory(totalWeight: number, str: number): LoadCategory {
  if (totalWeight <= lightLoad(str)) return 'light';
  if (totalWeight <= mediumLoad(str)) return 'medium';
  if (totalWeight <= heavyLoad(str)) return 'heavy';
  return 'overloaded';
}

/** Maximum DEX bonus to AC by load (PHB) */
export function encumbranceMaxDex(cat: LoadCategory): number {
  if (cat === 'medium') return 3;
  if (cat === 'heavy' || cat === 'overloaded') return 1;
  return Infinity;
}

/** Armor check penalty from encumbrance (PHB) */
export function encumbranceACP(cat: LoadCategory): number {
  if (cat === 'medium') return 3;
  if (cat === 'heavy' || cat === 'overloaded') return 6;
  return 0;
}

/** Effective speed under encumbrance (PHB: medium/heavy → ×3/4, rounded to 5-ft step) */
export function encumbranceSpeed(baseSpeed: number, cat: LoadCategory): number {
  if (cat === 'light' || cat === 'overloaded') return baseSpeed;
  return Math.floor((baseSpeed * 3) / 4 / 5) * 5;
}

export interface EncumbranceSummary {
  loadCategory: LoadCategory;
  totalACP: number;
  encMaxDex: number;
  effectiveSpeed: number;
}

export function getEncumbranceSummary(
  equipment: Array<{ weight?: number }>,
  strScore: number,
  armorCheckPenalty: number,
  baseSpeed: number,
): EncumbranceSummary {
  const totalWeight = equipment.reduce((s, i) => s + (i.weight ?? 0), 0);
  const cat = loadCategory(totalWeight, strScore);
  return {
    loadCategory: cat,
    totalACP: armorCheckPenalty + encumbranceACP(cat),
    encMaxDex: encumbranceMaxDex(cat),
    effectiveSpeed: encumbranceSpeed(baseSpeed, cat),
  };
}
