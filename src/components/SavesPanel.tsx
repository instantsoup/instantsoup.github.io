import { saves } from '../data/saves';
import type { Scores } from '../types';

interface SavesPanelProps {
  mods: Scores;
  saveBonuses: Record<string, number>;
  setSaveBonus: (saveName: string, bonus: number) => void;
  onBlur: () => void;
}

export function SavesPanel({ mods, saveBonuses, setSaveBonus, onBlur }: SavesPanelProps) {
  const calculateTotal = (saveName: string, abilityKey: string): number => {
    const bonus = saveBonuses[saveName] || 0;
    const abilityMod = mods[abilityKey as keyof Scores] || 0;
    return abilityMod + bonus;
  };

  return (
    <div className="saves-panel">
      <h2 className="panel-title">Saving Throws</h2>
      <div className="saves-grid">
        {saves.map((save) => {
          const bonus = saveBonuses[save.name] || 0;
          const total = calculateTotal(save.name, save.ability);
          const totalDisplay = total >= 0 ? `+${total}` : `${total}`;

          return (
            <div key={save.name} className="save-item">
              <div className="save-item__header">
                <h3 className="save-item__name">{save.name}</h3>
                <span className="save-item__ability">({save.ability.toUpperCase()})</span>
              </div>
              <div className="save-item__body">
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
              </div>
              {save.description && <p className="save-item__description">{save.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
