import { getCorruptionEffect, getDepravityEffect } from '../data/taint';
import type { Taint } from '../schema/schema';

type TaintPanelProps = {
  taint: Taint | undefined;
  onEnable: () => void;
  onDisable: () => void;
  onUpdate: (field: keyof Taint, value: number) => void;
  onBlur?: () => void;
  readOnly?: boolean;
};

export function TaintPanel({
  taint,
  onEnable,
  onDisable,
  onUpdate,
  onBlur,
  readOnly,
}: TaintPanelProps) {
  if (!taint) {
    if (readOnly) {
      return (
        <div className="panel-body">
          <p className="text-muted">Taint tracking not enabled.</p>
        </div>
      );
    }
    return (
      <div className="panel-body">
        <p className="text-muted mb-8">
          Taint tracking is disabled. Enable it to track depravity and corruption scores from the
          Heroes of Horror rules.
        </p>
        <button className="btn btn--sm btn--secondary" onClick={onEnable}>
          Enable Taint Tracking
        </button>
      </div>
    );
  }

  const depravityEffect = getDepravityEffect(taint.depravity ?? 0);
  const corruptionEffect = getCorruptionEffect(taint.corruption ?? 0);

  const handleChange = (field: keyof Taint) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10);
    onUpdate(field, Number.isFinite(v) ? v : 0);
  };

  const handleBlur = () => onBlur?.();

  const handleStep = (field: keyof Taint, delta: number) => {
    const current = taint[field] ?? 0;
    onUpdate(field, current + delta);
    onBlur?.();
  };

  if (readOnly) {
    return (
      <div className="panel-body">
        <div className="taint-grid">
          <div className="taint-tracker">
            <div className="taint-tracker__header">
              <span className="taint-tracker__label">Depravity</span>
              <span className="taint-tracker__value">{taint.depravity ?? 0}</span>
            </div>
            {depravityEffect && (
              <div className="taint-tracker__effect">
                <span className="taint-tracker__effect-label">{depravityEffect.label}:</span>{' '}
                {depravityEffect.effect}
              </div>
            )}
          </div>
          <div className="taint-tracker">
            <div className="taint-tracker__header">
              <span className="taint-tracker__label">Corruption</span>
              <span className="taint-tracker__value">{taint.corruption ?? 0}</span>
            </div>
            {corruptionEffect && (
              <div className="taint-tracker__effect">
                <span className="taint-tracker__effect-label">{corruptionEffect.label}:</span>{' '}
                {corruptionEffect.effect}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-body">
      <div className="taint-grid">
        <div className="taint-tracker">
          <div className="taint-tracker__header">
            <span className="taint-tracker__label">Depravity</span>
            <div className="taint-tracker__controls">
              <button
                className="btn btn--xs btn--secondary"
                onClick={() => handleStep('depravity', -1)}
                disabled={(taint.depravity ?? 0) <= 0}
              >
                −
              </button>
              <input
                type="number"
                className="taint-tracker__input"
                min={0}
                max={9}
                value={taint.depravity ?? 0}
                onChange={handleChange('depravity')}
                onBlur={handleBlur}
              />
              <button
                className="btn btn--xs btn--secondary"
                onClick={() => handleStep('depravity', 1)}
                disabled={(taint.depravity ?? 0) >= 9}
              >
                +
              </button>
            </div>
          </div>
          {depravityEffect && (
            <div className="taint-tracker__effect">
              <span className="taint-tracker__effect-label">{depravityEffect.label}:</span>{' '}
              {depravityEffect.effect}
            </div>
          )}
        </div>

        <div className="taint-tracker">
          <div className="taint-tracker__header">
            <span className="taint-tracker__label">Corruption</span>
            <div className="taint-tracker__controls">
              <button
                className="btn btn--xs btn--secondary"
                onClick={() => handleStep('corruption', -1)}
                disabled={(taint.corruption ?? 0) <= 0}
              >
                −
              </button>
              <input
                type="number"
                className="taint-tracker__input"
                min={0}
                max={9}
                value={taint.corruption ?? 0}
                onChange={handleChange('corruption')}
                onBlur={handleBlur}
              />
              <button
                className="btn btn--xs btn--secondary"
                onClick={() => handleStep('corruption', 1)}
                disabled={(taint.corruption ?? 0) >= 9}
              >
                +
              </button>
            </div>
          </div>
          {corruptionEffect && (
            <div className="taint-tracker__effect">
              <span className="taint-tracker__effect-label">{corruptionEffect.label}:</span>{' '}
              {corruptionEffect.effect}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <button className="btn btn--xs btn--danger" onClick={onDisable}>
          Disable Taint Tracking
        </button>
      </div>
    </div>
  );
}
