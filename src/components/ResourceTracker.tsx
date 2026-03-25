import { useState } from 'react';

import type { CustomResource } from '../schema/schema';

type ResourceTrackerProps = {
  resources: CustomResource[];
  onAdd: (resource: CustomResource) => void;
  onRemove: (index: number) => void;
  onUse: (index: number, used: number) => void;
  onReset: (index: number) => void;
  onResetAll: () => void;
  onBlur?: () => void;
};

export function ResourceTracker({
  resources,
  onAdd,
  onRemove,
  onUse,
  onReset,
  onResetAll,
  onBlur,
}: ResourceTrackerProps) {
  const [newName, setNewName] = useState('');
  const [newMax, setNewMax] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    const max = parseInt(newMax, 10);
    if (!name || !Number.isFinite(max) || max < 1) return;
    onAdd({ name, max, used: 0 });
    onBlur?.();
    setNewName('');
    setNewMax('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const use = (index: number, resource: CustomResource) => {
    if (resource.used < resource.max) {
      onUse(index, resource.used + 1);
      onBlur?.();
    }
  };

  const recover = (index: number, resource: CustomResource) => {
    if (resource.used > 0) {
      onUse(index, resource.used - 1);
      onBlur?.();
    }
  };

  const handleReset = (index: number) => {
    onReset(index);
    onBlur?.();
  };

  const handleResetAll = () => {
    onResetAll();
    onBlur?.();
  };

  return (
    <div className="resource-tracker">
      {resources.length > 0 && (
        <>
          {resources.map((r, i) => {
            const remaining = r.max - r.used;
            const isExhausted = remaining === 0;
            return (
              <div
                key={`${r.name}-${i}`}
                className={`resource-row${isExhausted ? ' resource-row--exhausted' : ''}`}
              >
                <div className="resource-row__info">
                  <span className="resource-row__name">{r.name}</span>
                  <span className="resource-row__count">
                    {remaining}/{r.max}
                  </span>
                </div>
                <div className="resource-row__pips">
                  {Array.from({ length: r.max }).map((_, pip) => (
                    <span
                      key={pip}
                      className={`resource-pip${pip < remaining ? ' resource-pip--available' : ' resource-pip--used'}`}
                    />
                  ))}
                </div>
                <div className="resource-row__actions">
                  <button
                    className="btn btn--xs btn--danger"
                    onClick={() => use(i, r)}
                    disabled={isExhausted}
                    title="Use one"
                  >
                    Use
                  </button>
                  <button
                    className="btn btn--xs btn--secondary"
                    onClick={() => recover(i, r)}
                    disabled={r.used === 0}
                    title="Recover one"
                  >
                    +1
                  </button>
                  <button
                    className="btn btn--xs btn--secondary"
                    onClick={() => handleReset(i)}
                    title="Reset to full"
                  >
                    Reset
                  </button>
                  <button
                    className="btn btn--xs btn--ghost"
                    onClick={() => {
                      onRemove(i);
                      onBlur?.();
                    }}
                    title="Remove resource"
                    aria-label={`Remove ${r.name}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}

          <div className="resource-tracker__reset-all">
            <button className="btn btn--sm btn--secondary" onClick={handleResetAll}>
              New Day (reset all)
            </button>
          </div>
        </>
      )}

      <div className="resource-add">
        <input
          type="text"
          className="resource-add__name"
          placeholder="Resource name (e.g. Rage)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="number"
          className="resource-add__max"
          placeholder="Max"
          value={newMax}
          onChange={(e) => setNewMax(e.target.value)}
          onKeyDown={handleKeyDown}
          min={1}
        />
        <button
          className="btn btn--sm btn--primary"
          onClick={handleAdd}
          disabled={!newName.trim() || !newMax}
        >
          Add
        </button>
      </div>
    </div>
  );
}
