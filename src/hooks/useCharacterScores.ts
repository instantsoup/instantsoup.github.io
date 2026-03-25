import { useMemo, useState } from 'react';

import { computeMods } from '../lib/mods';
import type { Character } from '../schema/schema';
import { emptyScores, type Scores } from '../types';

export function useCharacterScores(initial: Character) {
  const [scores, setScores] = useState<Scores>(initial.scores);

  const mods = useMemo(() => computeMods(scores), [scores]);

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

  return { scores, setScores, mods, onNum, loadFrom, reset };
}
