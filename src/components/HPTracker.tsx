import { useState } from 'react';

import { calculateMaxHP } from '../lib/progressions';
import type { CombatStats } from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';

type HPTrackerProps = {
  mods: Scores;
  combatStats: CombatStats;
  levels: Level[];
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  onBlur: () => void;
};

export function HPTracker({ mods, combatStats, levels, updateCombatStat, onBlur }: HPTrackerProps) {
  const [delta, setDelta] = useState('');

  const currentHP = combatStats.currentHP ?? 0;
  const maxHP = combatStats.maxHP ?? 0;
  const tempHP = combatStats.tempHP ?? 0;

  const maxHPCalc = calculateMaxHP(levels, mods.con);
  const calculatedMax = maxHPCalc.total;

  const isBloodied = maxHP > 0 && currentHP <= Math.floor(maxHP / 2);
  const isDying = currentHP <= 0;

  const applyDamage = () => {
    const amount = parseInt(delta, 10);
    if (!Number.isFinite(amount) || amount <= 0) return;
    updateCombatStat('currentHP', currentHP - amount);
    onBlur();
    setDelta('');
  };

  const applyHeal = () => {
    const amount = parseInt(delta, 10);
    if (!Number.isFinite(amount) || amount <= 0) return;
    updateCombatStat('currentHP', Math.min(currentHP + amount, maxHP));
    onBlur();
    setDelta('');
  };

  const handleMaxHPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10);
    updateCombatStat('maxHP', Number.isFinite(v) ? Math.max(0, v) : 0);
  };

  const handleTempHPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10);
    updateCombatStat('tempHP', Number.isFinite(v) ? Math.max(0, v) : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  const hpClass = isDying
    ? 'hp-display hp-display--dying'
    : isBloodied
      ? 'hp-display hp-display--bloodied'
      : 'hp-display';

  return (
    <div className="hp-tracker">
      <div className={hpClass}>
        <button
          className="hp-display__current"
          onClick={() => {
            const v = prompt('Set current HP:', String(currentHP));
            if (v !== null) {
              const n = parseInt(v, 10);
              if (Number.isFinite(n)) {
                updateCombatStat('currentHP', n);
                onBlur();
              }
            }
          }}
          title="Click to set current HP"
        >
          {currentHP}
        </button>
        <span className="hp-display__separator">/</span>
        <input
          type="number"
          className="hp-display__max"
          value={combatStats.maxHP ?? ''}
          onChange={handleMaxHPChange}
          onBlur={onBlur}
          placeholder="max"
          min={0}
          title="Max HP"
        />
        {isDying && <span className="hp-display__status">DYING</span>}
        {isBloodied && !isDying && <span className="hp-display__status">BLOODIED</span>}
      </div>

      {tempHP > 0 && <div className="hp-tracker__temp">+{tempHP} temp HP</div>}

      <div className="hp-tracker__controls">
        <input
          type="number"
          className="hp-tracker__delta"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, applyDamage)}
          placeholder="Amount"
          min={1}
        />
        <button className="btn btn--sm btn--danger" onClick={applyDamage}>
          Damage
        </button>
        <button className="btn btn--sm btn--success" onClick={applyHeal}>
          Heal
        </button>
      </div>

      <div className="hp-tracker__meta">
        <div className="hp-tracker__meta-row">
          <label className="hp-tracker__meta-label">Temp HP</label>
          <input
            type="number"
            className="combat-stat-input combat-stat-input--small"
            value={combatStats.tempHP ?? ''}
            onChange={handleTempHPChange}
            onBlur={onBlur}
            placeholder="0"
            min={0}
          />
        </div>
        {levels.length > 0 && (
          <div
            className="combat-stat-calculated"
            title={maxHPCalc.components.map((c) => `${c.label}: ${c.value}`).join('\n')}
          >
            Calculated max: {calculatedMax}
          </div>
        )}
      </div>
    </div>
  );
}
