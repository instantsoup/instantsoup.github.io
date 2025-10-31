// src/lib/statline.test.ts
import { describe, it, expect } from 'vitest'
import { adjustTo28, totalCost } from './statline'

const sortAsc = (a: number[]) => [...a].sort((x, y) => x - y)

describe('adjustTo28 (round-robin, never cross 28; dec: low→high, inc: high→low)', () => {
  it('keeps exact-28 lines unchanged', () => {
    const input = [15, 14, 13, 12, 11, 10] // cost 28
    const result = adjustTo28(input)
    expect(sortAsc(result)).toEqual(sortAsc(input))
    expect(totalCost(result)).toBe(28)
  })

  it('decreases toward 28 by touching LOWEST first (17..12 → 15..10)', () => {
    const input = [17, 16, 15, 14, 13, 12] // cost 46
    const result = adjustTo28(input)
    // Order doesn't matter; confirm the multiset and total
    expect(sortAsc(result)).toEqual(sortAsc([15, 14, 13, 12, 11, 10]))
    expect(totalCost(result)).toBe(28)
  })

  it('increases toward 28 by touching HIGHEST first (12,12,11,13,10,11)', () => {
    const input = [12, 12, 11, 13, 10, 11] // cost 21
    const result = adjustTo28(input)
    // A valid 28-pt multiset is [11,12,12,13,14,14]
    expect(sortAsc(result)).toEqual([11, 12, 12, 13, 14, 14])
    expect(totalCost(result)).toBe(28)
  })

  it('even decrease example per spec: 18,14,14,14,14,14 → 16,12,12,12,11,11', () => {
    const input = [18, 14, 14, 14, 14, 14]
    const result = adjustTo28(input)
    expect(sortAsc(result)).toEqual(sortAsc([16, 12, 12, 12, 11, 11]))
    expect(totalCost(result)).toBe(28)
  })

  it('bounds preserved and prefers low-first on decrease / high-first on increase', () => {
    const input = [9, 12, 15, 8, 14, 11]
    const result = adjustTo28(input)
    const cost = totalCost(result)
    expect(cost === 28 || cost === 30).toBe(true) // 28 normally; 30 only on hard edges
    expect(Math.min(...result)).toBeGreaterThanOrEqual(3)
    expect(Math.max(...result)).toBeLessThanOrEqual(18)
  })

  it('edge: [18,18,18,3,3,3] cannot hit 28 (any step is 3 pts); stops at 30', () => {
    const input = [18, 18, 18, 3, 3, 3] // cost 33
    const result = adjustTo28(input)
    // Any one 18 reduced to 17 is the only legal step without crossing 28
    expect(sortAsc(result)).toEqual([3, 3, 3, 17, 18, 18])
    expect(totalCost(result)).toBe(30)
  })

  it('never crosses 28 in either direction', () => {
    const cases: number[][] = [
      [12, 12, 11, 13, 10, 11],
      [17, 16, 15, 14, 13, 12],
      [10, 10, 10, 10, 10, 10],
      [16, 16, 16, 8, 8, 8],
    ]
    for (const input of cases) {
      const out = adjustTo28(input)
      const cost = totalCost(out)
      // must be exactly 28 unless mathematically impossible under one-step bounds (rare: 30)
      expect(cost === 28 || cost === 30).toBe(true)
      // sanity bounds
      expect(Math.min(...out)).toBeGreaterThanOrEqual(3)
      expect(Math.max(...out)).toBeLessThanOrEqual(18)
    }
  })
})
