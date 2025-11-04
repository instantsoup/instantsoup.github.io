// src/data/skills.ts
import rawSkills from './skills.json' assert { type: 'json' }
import { SkillsFileSchema, type Skill, AbilityKey } from '../types/skill'

const parsed = SkillsFileSchema.parse(rawSkills)
export const skills: Skill[] = parsed

export function skillsByAbility(key: typeof AbilityKey._type): Skill[] {
  return skills.filter(s => s.ability === key)
}

export function findSkill(name: string): Skill | undefined {
  const needle = name.trim().toLowerCase()
  return skills.find(s => s.name.toLowerCase() === needle)
}
