import { useMemo, useState } from 'react';

import { computeMods } from '../lib/mods';
import type { AbilityDamage, Character } from '../schema/schema';
import { emptyScores, type Scores } from '../types';

export function useCharacterScores(initial: Character, abilityDamage?: AbilityDamage) {
  const [scores, setScores] = useState<Scores>(initial.scores);

  const effectiveScores = useMemo(
    () => ({
      str: Math.max(1, scores.str - (abilityDamage?.str ?? 0)),
      dex: Math.max(1, scores.dex - (abilityDamage?.dex ?? 0)),
      con: Math.max(1, scores.con - (abilityDamage?.con ?? 0)),
      int: Math.max(1, scores.int - (abilityDamage?.int ?? 0)),
      wis: Math.max(1, scores.wis - (abilityDamage?.wis ?? 0)),
      cha: Math.max(1, scores.cha - (abilityDamage?.cha ?? 0)),
    }),
    [scores, abilityDamage],
  );

  const mods = useMemo(() => computeMods(effectiveScores), [effectiveScores]);

  const onNum = (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10);
    setScores((s) => ({ ...s, [k]: Number.isFinite(v) ? v : 0 }));
  };

  const loadFrom = (char: Character) => {
    setScores(char.scores);
  };

  const reset = () => {
    setScores(emptyScores);
  };

  return { scores, setScores, effectiveScores, mods, onNum, loadFrom, reset };
}
