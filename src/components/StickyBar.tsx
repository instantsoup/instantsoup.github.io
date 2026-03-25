import { calculateTotalBAB, calculateTotalSave } from '../lib/progressions';
import type { CombatStats } from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';

type StickyBarProps = {
  name: string;
  mods: Scores;
  combatStats: CombatStats;
  levels: Level[];
  saveBonuses: Record<string, number>;
  mode: 'build' | 'play';
  onModeToggle: () => void;
};

export function StickyBar({
  name,
  mods,
  combatStats,
  levels,
  saveBonuses,
  mode,
  onModeToggle,
}: StickyBarProps) {
  const currentHP = combatStats.currentHP ?? 0;
  const maxHP = combatStats.maxHP ?? 0;

  const totalAC =
    10 +
    mods.dex +
    (combatStats.armorBonus ?? 0) +
    (combatStats.shieldBonus ?? 0) +
    (combatStats.miscACBonus ?? 0);

  const initiative = mods.dex + (combatStats.initiativeBonus ?? 0);
  const bab = calculateTotalBAB(levels).total;

  const fort =
    calculateTotalSave(levels, 'fortitude').total + mods.con + (saveBonuses['Fortitude'] ?? 0);
  const ref = calculateTotalSave(levels, 'reflex').total + mods.dex + (saveBonuses['Reflex'] ?? 0);
  const will = calculateTotalSave(levels, 'will').total + mods.wis + (saveBonuses['Will'] ?? 0);

  const isBloodied = maxHP > 0 && currentHP <= Math.floor(maxHP / 2);
  const isDying = currentHP <= 0 && maxHP > 0;

  const hpClass = isDying
    ? 'sticky-stat sticky-stat--hp sticky-stat--dying'
    : isBloodied
      ? 'sticky-stat sticky-stat--hp sticky-stat--bloodied'
      : 'sticky-stat sticky-stat--hp';

  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  return (
    <div className="sticky-bar">
      <span className="sticky-bar__name" title={name || 'Unnamed Character'}>
        {name || 'Character'}
      </span>

      <div className={hpClass}>
        <span className="sticky-stat__label">HP</span>
        <span className="sticky-stat__value">
          {currentHP}
          <span className="sticky-stat__sep">/</span>
          {maxHP}
        </span>
      </div>

      <div className="sticky-stat">
        <span className="sticky-stat__label">AC</span>
        <span className="sticky-stat__value">{totalAC}</span>
      </div>

      <div className="sticky-stat">
        <span className="sticky-stat__label">Init</span>
        <span className="sticky-stat__value">{fmt(initiative)}</span>
      </div>

      <div className="sticky-stat">
        <span className="sticky-stat__label">BAB</span>
        <span className="sticky-stat__value">{fmt(bab)}</span>
      </div>

      <div className="sticky-stat">
        <span className="sticky-stat__label">Fort</span>
        <span className="sticky-stat__value">{fmt(fort)}</span>
      </div>

      <div className="sticky-stat">
        <span className="sticky-stat__label">Ref</span>
        <span className="sticky-stat__value">{fmt(ref)}</span>
      </div>

      <div className="sticky-stat">
        <span className="sticky-stat__label">Will</span>
        <span className="sticky-stat__value">{fmt(will)}</span>
      </div>

      <button
        className={`sticky-bar__mode-btn${mode === 'play' ? ' sticky-bar__mode-btn--active' : ''}`}
        onClick={onModeToggle}
        title={mode === 'play' ? 'Switch to Build mode' : 'Switch to Play mode'}
      >
        {mode === 'play' ? 'Build' : 'Play'}
      </button>
    </div>
  );
}
