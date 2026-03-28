import { CONDITIONS } from '../data/conditions';
import type { StatusEffect } from '../schema/schema';

type StatusEffectsPanelProps = {
  statusEffects: Record<string, StatusEffect>;
  onToggle: (name: string) => void;
  onSetRounds: (name: string, rounds: number) => void;
  onClearAll: () => void;
  onBlur: () => void;
};

export function StatusEffectsPanel({
  statusEffects,
  onToggle,
  onSetRounds,
  onClearAll,
  onBlur,
}: StatusEffectsPanelProps) {
  const activeCount = Object.values(statusEffects).filter((e) => e.active).length;

  return (
    <div className="status-effects">
      <div className="status-effects__list">
        {CONDITIONS.map((condition) => {
          const effect = statusEffects[condition.name];
          const active = effect?.active ?? false;
          return (
            <div
              key={condition.name}
              className={`status-effect-row${active ? ' status-effect-row--active' : ''}`}
              title={condition.description}
            >
              <label className="status-effect-row__label">
                <input
                  type="checkbox"
                  className="status-effect-row__check"
                  checked={active}
                  onChange={() => {
                    onToggle(condition.name);
                    onBlur();
                  }}
                />
                <span className="status-effect-row__name">{condition.name}</span>
              </label>
              {active && (
                <div className="status-effect-row__rounds">
                  <input
                    type="number"
                    className="status-effect-row__rounds-input"
                    value={effect?.rounds ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!Number.isNaN(val)) onSetRounds(condition.name, val);
                    }}
                    onBlur={onBlur}
                    placeholder="∞"
                    min="0"
                  />
                  <span className="status-effect-row__rounds-label">rd</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {activeCount > 0 && (
        <div className="status-effects__footer">
          <button
            className="btn btn--sm btn--danger"
            onClick={() => {
              onClearAll();
              onBlur();
            }}
          >
            Clear all conditions
          </button>
        </div>
      )}
    </div>
  );
}
