import { CONDITIONS } from '../../data/conditions';

export interface ConditionPenalties {
  str: number;
  dex: number;
  attack: number;
  save: number;
  ac: number;
  initiative: number;
  loseDexToAC: boolean;
}

/** Aggregate all active status-effect penalties into a single penalty object */
export function computeConditionPenalties(
  statusEffects: Record<string, { active: boolean }>,
): ConditionPenalties {
  const penalties: ConditionPenalties = {
    str: 0,
    dex: 0,
    attack: 0,
    save: 0,
    ac: 0,
    initiative: 0,
    loseDexToAC: false,
  };

  for (const condition of CONDITIONS) {
    const effect = statusEffects[condition.name];
    if (!effect?.active) continue;
    const p = condition.penalties;
    if (!p) continue;
    if (p.str) penalties.str += p.str;
    if (p.dex) penalties.dex += p.dex;
    if (p.attack) penalties.attack += p.attack;
    if (p.save) penalties.save += p.save;
    if (p.ac) penalties.ac += p.ac;
    if (p.initiative) penalties.initiative += p.initiative;
    if (p.loseDexToAC) penalties.loseDexToAC = true;
  }

  return penalties;
}
