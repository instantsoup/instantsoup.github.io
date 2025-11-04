// src/lib/skills.test.ts
import { describe, it, expect } from 'vitest'
import raw from './skills.json'
import { SkillsFileSchema, type Skill } from '../types/skill'

describe('skills.json', () => {
  const parsed = SkillsFileSchema.parse(raw)

  it('parses via SkillsFileSchema', () => {
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBeGreaterThan(0)
  })

  it('has unique names (case-insensitive)', () => {
    const seen = new Map<string, string>()
    for (const s of parsed) {
      const k = s.name.trim().toLowerCase()
      expect(k).toBeTruthy()
      if (seen.has(k)) {
        throw new Error(`Duplicate skill name: "${s.name}" (also seen as "${seen.get(k)}")`)
      }
      seen.set(k, s.name)
    }
  })

  it('contains no leading/trailing whitespace in names', () => {
    for (const s of parsed) {
      expect(s.name).toBe(s.name.trim())
    }
  })

  it('keeps the canonical spelling "Sleight of Hand"', () => {
    const bad = parsed.find(s => /slight of hand/i.test(s.name))
    expect(bad).toBeUndefined()
  })

  it('PHB armor-check-penalty skills are flagged (true)', () => {
    const mustBeACP = new Set([
      'Balance',
      'Climb',
      'Escape Artist',
      'Hide',
      'Jump',
      'Move Silently',
      'Sleight of Hand',
      'Swim',
      'Tumble',
    ])
    for (const name of mustBeACP) {
      const s = parsed.find(x => x.name.toLowerCase() === name.toLowerCase())
      expect(s, `Missing required ACP skill "${name}"`).toBeTruthy()
      expect((s as Skill).armorCheckPenalty, `"${name}" should have armorCheckPenalty: true`).toBe(true)
    }
  })

  it('All Knowledge skills are trained-only (3.5e rule)', () => {
    const knowledge = parsed.filter(s => /^Knowledge \(.+\)/i.test(s.name))
    expect(knowledge.length).toBeGreaterThan(0)
    for (const s of knowledge) {
      expect(s.trainedOnly).toBe(true)
    }
  })
})
