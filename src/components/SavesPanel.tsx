import { saves } from '../data/saves';
import { calculateTotalSave } from '../lib/progressions';
import type { Scores } from '../types';
import type { Level } from '../types/level';

interface SavesPanelProps {
  mods: Scores;
  saveBonuses: Record<string, number>;
  levels: Level[];
  setSaveBonus: (saveName: string, bonus: number) => void;
  onBlur: () => void;
  readOnly?: boolean;
}

export function SavesPanel({
  mods,
  saveBonuses,
  levels,
  setSaveBonus,
  onBlur,
  readOnly,
}: SavesPanelProps) {
  const calculateTotal = (saveName: string, abilityKey: string): number => {
    const bonus = saveBonuses[saveName] || 0;
    const abilityMod = mods[abilityKey as keyof Scores] || 0;
    return abilityMod + bonus;
  };

  return (
    <div className="saves-panel">
      <div className="saves-grid">
        {saves.map((save) => {
          const bonus = saveBonuses[save.name] || 0;
          const total = calculateTotal(save.name, save.ability);
          const totalDisplay = total >= 0 ? `+${total}` : `${total}`;

          // Calculate save from class progressions
          let saveType: 'fortitude' | 'reflex' | 'will';
          if (save.name === 'Fortitude') saveType = 'fortitude';
          else if (save.name === 'Reflex') saveType = 'reflex';
          else if (save.name === 'Will') saveType = 'will';
          else saveType = 'fortitude'; // fallback

          const calculation = calculateTotalSave(levels, saveType);
          const abilityMod = mods[save.ability as keyof Scores] || 0;
          const calculatedTotal = calculation.total + abilityMod;
          const calculatedDisplay =
            calculatedTotal >= 0 ? `+${calculatedTotal}` : `${calculatedTotal}`;

          return (
            <div key={save.name} className="save-item">
              <div className="save-item__header">
                <h3 className="save-item__name">{save.name}</h3>
                <span className="save-item__ability">({save.ability.toUpperCase()})</span>
              </div>
              <div className="save-item__body">
                {levels.length > 0 ? (
                  <div
                    className="save-item__calculated"
                    title={[
                      ...calculation.components.map((c) => `${c.label}: +${c.value}`),
                      `${save.ability.toUpperCase()} modifier: ${abilityMod >= 0 ? '+' : ''}${abilityMod}`,
                    ].join('\n')}
                  >
                    <span className="save-item__calculated-label">Total</span>
                    <span className="save-item__calculated-value">{calculatedDisplay}</span>
                  </div>
                ) : readOnly ? (
                  <div className="save-item__total">
                    <span className="save-item__total-label">Total</span>
                    <span className="save-item__total-value">{totalDisplay}</span>
                  </div>
                ) : (
                  <>
                    <div className="save-item__input-group">
                      <label className="save-item__label" htmlFor={`save-${save.name}`}>
                        Base Bonus
                      </label>
                      <input
                        id={`save-${save.name}`}
                        type="number"
                        min="0"
                        max="99"
                        className="save-input"
                        value={bonus}
                        onChange={(e) => {
                          const val = parseInt(e.target.value || '0', 10);
                          setSaveBonus(save.name, val);
                        }}
                        onBlur={onBlur}
                      />
                    </div>
                    <div className="save-item__total">
                      <span className="save-item__total-label">Total</span>
                      <span className="save-item__total-value">{totalDisplay}</span>
                    </div>
                  </>
                )}
              </div>
              {save.description && <p className="save-item__description">{save.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
