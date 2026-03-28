import { calculateTotalBAB } from '../lib/progressions';
import type { CombatStats } from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';

interface CombatStatsProps {
  mods: Scores;
  combatStats: CombatStats;
  levels: Level[];
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  setMovementType: (type: string) => void;
  onBlur: () => void;
  readOnly?: boolean;
}

export function CombatStatsPanel({
  mods,
  combatStats,
  levels,
  updateCombatStat,
  setMovementType,
  onBlur,
  readOnly,
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

  // Calculate BAB from class progressions
  const babCalculation = calculateTotalBAB(levels);
  const calculatedBAB = babCalculation.total;

  // Calculate total AC: 10 + DEX mod + armor bonus + shield bonus + natural armor + misc
  const totalAC =
    10 +
    mods.dex +
    (combatStats.armorBonus ?? 0) +
    (combatStats.shieldBonus ?? 0) +
    (combatStats.naturalArmorBonus ?? 0) +
    (combatStats.miscACBonus ?? 0);

  // Calculate total Initiative: DEX mod + bonus
  const totalInitiative = mods.dex + (combatStats.initiativeBonus ?? 0);

  return (
    <section className="combat-stats">
      <div className="combat-stats__grid">
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
                {readOnly ? (
                  <span className="combat-stat-breakdown__value">
                    {combatStats.armorBonus ?? 0}
                  </span>
                ) : (
                  <input
                    type="number"
                    className="combat-stat-input combat-stat-input--small"
                    value={combatStats.armorBonus ?? ''}
                    onChange={handleNumInput('armorBonus')}
                    onBlur={onBlur}
                    placeholder="0"
                  />
                )}
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">Shield:</span>
                {readOnly ? (
                  <span className="combat-stat-breakdown__value">
                    {combatStats.shieldBonus ?? 0}
                  </span>
                ) : (
                  <input
                    type="number"
                    className="combat-stat-input combat-stat-input--small"
                    value={combatStats.shieldBonus ?? ''}
                    onChange={handleNumInput('shieldBonus')}
                    onBlur={onBlur}
                    placeholder="0"
                  />
                )}
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">Natural:</span>
                {readOnly ? (
                  <span className="combat-stat-breakdown__value">
                    {combatStats.naturalArmorBonus ?? 0}
                  </span>
                ) : (
                  <input
                    type="number"
                    className="combat-stat-input combat-stat-input--small"
                    value={combatStats.naturalArmorBonus ?? ''}
                    onChange={handleNumInput('naturalArmorBonus')}
                    onBlur={onBlur}
                    placeholder="0"
                    min="0"
                  />
                )}
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
                {readOnly ? (
                  <span className="combat-stat-breakdown__value">
                    {combatStats.miscACBonus ?? 0}
                  </span>
                ) : (
                  <input
                    type="number"
                    className="combat-stat-input combat-stat-input--small"
                    value={combatStats.miscACBonus ?? ''}
                    onChange={handleNumInput('miscACBonus')}
                    onBlur={onBlur}
                    placeholder="0"
                  />
                )}
              </div>
              <div className="combat-stat-breakdown__row">
                <span className="combat-stat-breakdown__label">ACP:</span>
                {readOnly ? (
                  <span className="combat-stat-breakdown__value">
                    {combatStats.armorCheckPenalty ? `−${combatStats.armorCheckPenalty}` : '0'}
                  </span>
                ) : (
                  <input
                    type="number"
                    className="combat-stat-input combat-stat-input--small"
                    value={combatStats.armorCheckPenalty ?? ''}
                    onChange={handleNumInput('armorCheckPenalty')}
                    onBlur={onBlur}
                    placeholder="0"
                    min="0"
                    title="Armor check penalty from armor and shield"
                  />
                )}
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
                {readOnly ? (
                  <span className="combat-stat-breakdown__value">
                    {combatStats.initiativeBonus ?? 0}
                  </span>
                ) : (
                  <input
                    type="number"
                    className="combat-stat-input combat-stat-input--small"
                    value={combatStats.initiativeBonus ?? ''}
                    onChange={handleNumInput('initiativeBonus')}
                    onBlur={onBlur}
                    placeholder="0"
                  />
                )}
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
            {levels.length > 0 ? (
              <div
                className="combat-stat-display combat-stat-display--with-tooltip"
                title={babCalculation.components.map((c) => `${c.label}: +${c.value}`).join('\n')}
              >
                +{calculatedBAB}
              </div>
            ) : readOnly ? (
              <div className="combat-stat-display">{combatStats.baseAttackBonus ?? 0}</div>
            ) : (
              <input
                type="number"
                className="combat-stat-input combat-stat-input--centered"
                value={combatStats.baseAttackBonus ?? ''}
                onChange={handleNumInput('baseAttackBonus')}
                onBlur={onBlur}
                placeholder="0"
              />
            )}
          </div>
        </div>

        {/* Spell Resistance */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Spell Resistance</span>
          </div>
          <div className="combat-stat-card__content">
            {readOnly ? (
              <div className="combat-stat-display">{combatStats.spellResistance ?? 0}</div>
            ) : (
              <input
                type="number"
                className="combat-stat-input combat-stat-input--centered"
                value={combatStats.spellResistance ?? ''}
                onChange={handleNumInput('spellResistance')}
                onBlur={onBlur}
                placeholder="0"
                min="0"
              />
            )}
          </div>
        </div>

        {/* Movement */}
        <div className="combat-stat-card">
          <div className="combat-stat-card__header">
            <span className="combat-stat-card__label">Movement</span>
          </div>
          <div className="combat-stat-card__content">
            {readOnly ? (
              <div className="combat-stat-display combat-stat-display--movement">
                {combatStats.movementSpeed ?? 30} ft.
                {combatStats.movementType ? ` (${combatStats.movementType})` : ''}
              </div>
            ) : (
              <div className="combat-stat-movement">
                <input
                  type="number"
                  className="combat-stat-input combat-stat-input--small"
                  value={combatStats.movementSpeed ?? ''}
                  onChange={handleNumInput('movementSpeed')}
                  onBlur={onBlur}
                  placeholder="30"
                  min="0"
                  step="5"
                />
                <span className="combat-stat-movement__unit">ft.</span>
                <input
                  type="text"
                  className="combat-stat-input combat-stat-input--type"
                  value={combatStats.movementType ?? ''}
                  onChange={(e) => setMovementType(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Land"
                  maxLength={20}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
