import { type ConditionPenalties, CONDITIONS } from '../data/conditions';
import type { StatusEffect } from '../schema/schema';

export function computeConditionPenalties(
  statusEffects: Record<string, StatusEffect>,
): ConditionPenalties {
  return CONDITIONS.reduce((acc, cond) => {
    if (!statusEffects[cond.name]?.active || !cond.penalties) return acc;
    const p = cond.penalties;
    return {
      str: (acc.str ?? 0) + (p.str ?? 0),
      dex: (acc.dex ?? 0) + (p.dex ?? 0),
      attack: (acc.attack ?? 0) + (p.attack ?? 0),
      save: (acc.save ?? 0) + (p.save ?? 0),
      ac: (acc.ac ?? 0) + (p.ac ?? 0),
      initiative: (acc.initiative ?? 0) + (p.initiative ?? 0),
      loseDexToAC: acc.loseDexToAC || p.loseDexToAC || false,
    };
  }, {} as ConditionPenalties);
}
