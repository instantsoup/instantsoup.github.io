import React from 'react';

import type { Scores } from '../types';

export function AbilityGrid({
  scores,
  mods,
  onNum,
  racialMods,
}: {
  scores: Scores;
  mods: Scores;
  onNum: (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  racialMods?: Record<string, number>;
}) {
  const keys: (keyof Scores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div className="grid-3 gap-3">
      {keys.map((k) => {
        const rm = racialMods?.[k] ?? 0;
        return (
          <div key={k} className="card">
            <div className="flex-row justify-between items-baseline">
              <strong className="tt-up">{k}</strong>
              <span className="tabular">
                mod <b>{mods[k] >= 0 ? `+${mods[k]}` : mods[k]}</b>
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={30}
              value={scores[k]}
              onChange={onNum(k)}
              className="ability-input mt-8"
            />
            {rm !== 0 && (
              <span className="ability-grid__racial">
                {rm > 0 ? '+' : ''}
                {rm} race
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
