// src/data/skills.ts
import { z } from 'zod';

import { AbilityKey, type Skill, SkillsFileSchema } from '../types/skill';
import rawSkills from './skills.json' with { type: 'json' };

const parsed = SkillsFileSchema.parse(rawSkills);
export const skills: Skill[] = parsed;

export function skillsByAbility(key: z.infer<typeof AbilityKey>): Skill[] {
  return skills.filter((s) => s.ability === key);
}

export function findSkill(name: string): Skill | undefined {
  const needle = name.trim().toLowerCase();
  return skills.find((s) => s.name.toLowerCase() === needle);
}
