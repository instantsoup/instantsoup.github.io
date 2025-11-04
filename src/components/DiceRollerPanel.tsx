import { useState } from 'react';

import { formatPool, rollMany } from '../lib/dice';

const COMMON = [4, 6, 8, 10, 12, 20] as const;

export function DiceRollerPanel() {
  const [pool, setPool] = useState<number[]>([]);
  const [last, setLast] = useState<{ total: number; rolls: number[] } | null>(null);

  function addDie(sides: number) {
    setPool((p) => [...p, sides]);
  }

  function clearAll() {
    setPool([]);
    setLast(null);
  }

  function roll() {
    if (pool.length === 0) {
      setLast({ total: 0, rolls: [] });
      return;
    }
    setLast(rollMany(pool));
  }

  return (
    <div>
      <div className="btn-row mb-8">
        {COMMON.map((s) => (
          <button
            key={s}
            type="button"
            className="btn"
            onClick={() => addDie(s)}
            aria-label={`Add d${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="dice__pool">
        <strong>Pool:</strong> {formatPool(pool)}
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={roll}>
          Roll
        </button>
        <button type="button" className="btn btn--danger" onClick={clearAll}>
          Clear
        </button>
      </div>

      {last && (
        <div className="dice__result">
          <div>
            <strong>Total:</strong> {last.total}
          </div>
          {last.rolls.length > 0 && (
            <div>
              <strong>Rolls:</strong> {last.rolls.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
