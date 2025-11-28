import type { CombatStats } from '../schema/schema';
import type { Scores } from '../types';

interface CombatStatsProps {
  mods: Scores;
  combatStats: CombatStats;
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  onBlur: () => void;
}

export function CombatStatsPanel({
  mods,
  combatStats,
  updateCombatStat,
  onBlur,
}: CombatStatsProps) {
  const handleNumInput = (field: keyof CombatStats) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      updateCombatStat(field, undefined);
    } else {
      const num = parseInt(val, 10);
      if (!Number.isNaN(num)) {
        updateCombatStat(field, num);
      }
    }
  };

  // Calculate total AC: 10 + DEX mod + armor bonus + shield bonus + misc
  const totalAC =
    10 +
    mods.dex +
    (combatStats.armorBonus ?? 0) +
    (combatStats.shieldBonus ?? 0) +
    (combatStats.miscACBonus ?? 0);

  // Calculate total Initiative: DEX mod + bonus
  const totalInitiative = mods.dex + (combatStats.initiativeBonus ?? 0);

  return (
    <section className="combat-stats mb-12">
      <h2 className="combat-stats__title mb-8">Combat Statistics</h2>

      <div className="combat-stats__grid">
        {/* Hit Points */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Hit Points</span>
          </div>
          <div className="combat-stat-card__content">
            <div className="combat-stat-hp">
              <input
                type="number"
                className="combat-stat-input combat-stat-input--hp"
                value={combatStats.currentHP ?? ''}
                onChange={handleNumInput('currentHP')}
                onBlur={onBlur}
                placeholder="0"
                min="0"
              />
              <span className="combat-stat-hp__separator">/</span>
              <input
                type="number"
                className="combat-stat-input combat-stat-input--hp"
                value={combatStats.maxHP ?? ''}
                onChange={handleNumInput('maxHP')}
                onBlur={onBlur}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="combat-stat-card__sublabel">Current / Max</div>
          </div>
        </div>

        {/* Armor Class */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Armor Class</span>
          </div>
          <div className="combat-stat-card__content">
            <div className="combat-stat-display">{totalAC}</div>
            <div className="combat-stat-breakdown">
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">Armor:</span>
                <input
                  type="number"
                  className="combat-stat-input combat-stat-input--small"
                  value={combatStats.armorBonus ?? ''}
                  onChange={handleNumInput('armorBonus')}
                  onBlur={onBlur}
                  placeholder="0"
                />
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">Shield:</span>
                <input
                  type="number"
                  className="combat-stat-input combat-stat-input--small"
                  value={combatStats.shieldBonus ?? ''}
                  onChange={handleNumInput('shieldBonus')}
                  onBlur={onBlur}
                  placeholder="0"
                />
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">DEX:</span>
                <span className="combat-stat-breakdown__value">
                  {mods.dex >= 0 ? '+' : ''}
                  {mods.dex}
                </span>
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">Misc:</span>
                <input
                  type="number"
                  className="combat-stat-input combat-stat-input--small"
                  value={combatStats.miscACBonus ?? ''}
                  onChange={handleNumInput('miscACBonus')}
                  onBlur={onBlur}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Initiative */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Initiative</span>
          </div>
          <div className="combat-stat-card__content">
            <div className="combat-stat-display">
              {totalInitiative >= 0 ? '+' : ''}
              {totalInitiative}
            </div>
            <div className="combat-stat-breakdown">
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">DEX:</span>
                <span className="combat-stat-breakdown__value">
                  {mods.dex >= 0 ? '+' : ''}
                  {mods.dex}
                </span>
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">Misc:</span>
                <input
                  type="number"
                  className="combat-stat-input combat-stat-input--small"
                  value={combatStats.initiativeBonus ?? ''}
                  onChange={handleNumInput('initiativeBonus')}
                  onBlur={onBlur}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Base Attack Bonus */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Base Attack Bonus</span>
          </div>
          <div className="combat-stat-card__content">
            <input
              type="number"
              className="combat-stat-input combat-stat-input--centered"
              value={combatStats.baseAttackBonus ?? ''}
              onChange={handleNumInput('baseAttackBonus')}
              onBlur={onBlur}
              placeholder="0"
            />
          </div>
        </div>

        {/* Spell Resistance */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Spell Resistance</span>
          </div>
          <div className="combat-stat-card__content">
            <input
              type="number"
              className="combat-stat-input combat-stat-input--centered"
              value={combatStats.spellResistance ?? ''}
              onChange={handleNumInput('spellResistance')}
              onBlur={onBlur}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
