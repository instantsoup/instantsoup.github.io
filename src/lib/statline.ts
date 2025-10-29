// Roll + point-buy cost + adjust-to-28 (3–18 inclusive)
export type StatLine = number[]

const pointCost: Record<number, number> = {
  3:-5, 4:-4, 5:-3, 6:-2, 7:-1,
  8:0, 9:1, 10:2, 11:3, 12:4, 13:5,
  14:6, 15:8, 16:10, 17:13, 18:16,
}

export function costOf(score: number): number {
  if (score < 3) return pointCost[3]
  if (score > 18) return pointCost[18]
  return pointCost[score]
}

export function totalCost(stats: StatLine): number {
  return stats.reduce((t, s) => t + costOf(s), 0)
}

export function roll3d6(): number {
  const d6 = () => Math.floor(Math.random() * 6) + 1
  return d6() + d6() + d6()
}

export function rollStatLine(): StatLine {
  return Array.from({ length: 6 }, roll3d6)
}

/**
 * Adjust a 6-number stat line to exactly 28 points:
 * - If total > 28: decrement the current LOWEST stat by 1 (min 3), repeat.
 * - If total < 28: increment the current HIGHEST stat by 1 (max 18), repeat.
 * Always returns 6 stats, each 3..18.
 */
export function adjustTo28(stats: StatLine): StatLine {
  let arr = [...stats]
  if (arr.length !== 6) throw new Error("Stat line must have 6 scores")

  let total = totalCost(arr)

  // Reduce: lower the lowest by 1 each step (≥3) until exactly 28
  while (total > 28) {
    let minIdx = 0
    for (let i = 1; i < arr.length; i++) if (arr[i] < arr[minIdx]) minIdx = i
    if (arr[minIdx] <= 3) {
      // if all mins are 3 and still >28, next mins will be >3 eventually; just skip safeguard
      const nextIdx = arr.findIndex(v => v > 3)
      if (nextIdx === -1) break
      minIdx = nextIdx
    }
    arr[minIdx] = Math.max(3, arr[minIdx] - 1)
    total = totalCost(arr)
  }

  // Increase: raise the highest by 1 each step (≤18) until exactly 28
  while (total < 28) {
    let maxIdx = 0
    for (let i = 1; i < arr.length; i++) if (arr[i] > arr[maxIdx]) maxIdx = i
    if (arr[maxIdx] >= 18) {
      const nextIdx = arr.findIndex(v => v < 18)
      if (nextIdx === -1) break
      maxIdx = nextIdx
    }
    arr[maxIdx] = Math.min(18, arr[maxIdx] + 1)
    total = totalCost(arr)
  }

  return arr
}
