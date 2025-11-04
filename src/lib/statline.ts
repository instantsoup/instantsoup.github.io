// src/lib/statline.ts
export type StatLine = number[];

const pointCost: Record<number, number> = {
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

export function costOf(s: number): number {
  if (s < 3) return pointCost[3];
  if (s > 18) return pointCost[18];
  return pointCost[s];
}

export function totalCost(stats: StatLine): number {
  return stats.reduce((t, s) => t + costOf(s), 0);
}

export function adjustTo28(stats: StatLine): StatLine {
  if (stats.length !== 6) throw new Error('Stat line must have 6 scores');
  const arr = [...stats];
  let total = totalCost(arr);

  // -------- Decrease toward 28: LOWEST → HIGHEST, one step per stat per pass
  while (total > 28) {
    const startTotal = total;
    // order low→high (lowest first)
    const order = [...arr.keys()].sort((a, b) => arr[a] - arr[b] || a - b);

    for (const i of order) {
      if (total <= 28) break;
      const s = arr[i];
      if (s <= 3) continue;
      const stepDelta = costOf(s) - costOf(s - 1); // positive reduction in total (1,2,3)
      const remaining = total - 28;
      if (stepDelta <= remaining) {
        const before = costOf(s);
        arr[i] = s - 1;
        total += costOf(arr[i]) - before; // subtracts stepDelta
      }
    }

    // no change in a full pass → can’t reduce further without crossing 28
    if (total === startTotal) break;
  }

  // -------- Increase toward 28: HIGHEST → LOWEST, one step per stat per pass
  while (total < 28) {
    const startTotal = total;
    // order high→low (highest first)
    const order = [...arr.keys()].sort((a, b) => arr[b] - arr[a] || a - b);

    for (const i of order) {
      if (total >= 28) break;
      const s = arr[i];
      if (s >= 18) continue;
      const stepDelta = costOf(s + 1) - costOf(s); // positive increase in total (1,2,3)
      const remaining = 28 - total;
      if (stepDelta <= remaining) {
        const before = costOf(s);
        arr[i] = s + 1;
        total += costOf(arr[i]) - before; // adds stepDelta
      }
    }

    // no change in a full pass → can’t increase further without crossing 28
    if (total === startTotal) break;
  }

  return arr;
}

// 3d6 roller helpers
export function roll3d6(): number {
  const d6 = () => Math.floor(Math.random() * 6) + 1;
  return d6() + d6() + d6();
}
export function rollStatLine(): StatLine {
  return Array.from({ length: 6 }, roll3d6);
}
