import { findClassProgression } from '../../data/class-progressions';
import type { Level } from '../types';
import type { CalculationBreakdown } from './bab';

/** Max HP across all character levels (max die per level + CON modifier per level) */
export function calculateMaxHP(levels: Level[], conModifier: number): CalculationBreakdown {
  const classCounts = new Map<string, number>();
  for (const level of levels) {
    classCounts.set(level.class, (classCounts.get(level.class) ?? 0) + 1);
  }

  const components: Array<{ label: string; value: number }> = [];
  let hpFromHitDice = 0;

  for (const [className, count] of classCounts) {
    const prog = findClassProgression(className);
    if (!prog) continue;
    const hp = count * prog.hitDie;
    components.push({ label: `${className} (${count}d${prog.hitDie})`, value: hp });
    hpFromHitDice += hp;
  }

  const totalLevels = levels.length;
  const conBonus = totalLevels * conModifier;
  if (conBonus !== 0) {
    components.push({
      label: `CON modifier (${totalLevels} × ${conModifier >= 0 ? '+' : ''}${conModifier})`,
      value: conBonus,
    });
  }

  return { total: hpFromHitDice + conBonus, components };
}
