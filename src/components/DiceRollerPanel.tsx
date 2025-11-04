import { useState } from 'react';

import { type DetailedGroup, formatPool, rollManyDetailed, SUPPORTED_DICE } from '../lib/dice';

export function DiceRollerPanel() {
  const [pool, setPool] = useState<number[]>([]);
  const [last, setLast] = useState<DetailedGroup[] | null>(null);

  function addDie(sides: number) {
    setPool((p) => [...p, sides]);
  }

  function clearAll() {
    setPool([]);
    setLast(null);
  }

  function roll() {
    setLast(rollManyDetailed(pool));
  }

  return (
    <div>
      <div className="btn-row mb-12">
        {SUPPORTED_DICE.map((s) => (
          <button
            key={s}
            type="button"
            className="btn btn-outline"
            onClick={() => addDie(s)}
            aria-label={`Add d${s}`}
          >
            d{s}
          </button>
        ))}
        <button type="button" className="btn btn--danger" onClick={clearAll}>
          Clear
        </button>
      </div>

      <div className="dice__pool">
        <strong>Pool:</strong> {formatPool(pool)}
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={roll}>
          Roll
        </button>
      </div>

      {last && (
        <div className="dice__result">
          {/* No summation — show rolls split by die */}
          {last.length === 0 ? (
            <div>No dice in pool.</div>
          ) : (
            last.map((g) => (
              <div key={g.sides}>
                <strong>d{g.sides}</strong>: {g.rolls.join(', ')}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
