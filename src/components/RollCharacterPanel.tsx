import React, { useMemo, useState } from 'react';

import { adjustTo28, rollStatLine, type StatLine, totalCost } from '../lib/statline';

const sortDesc = (arr: number[]) => [...arr].sort((a, b) => b - a);

export function RollCharacterPanel() {
  const [raw, setRaw] = useState<StatLine | null>(null);
  const [adj, setAdj] = useState<StatLine | null>(null);

  const onRoll = () => {
    const r = rollStatLine();
    const a = adjustTo28(r);
    setRaw(r);
    setAdj(a);
  };

  const rawSorted = useMemo(() => (raw ? sortDesc(raw) : null), [raw]);
  const adjSorted = useMemo(() => (adj ? sortDesc(adj) : null), [adj]);

  const rawCost = raw ? totalCost(raw) : null;
  const adjCost = adj ? totalCost(adj) : null;

  return (
    <div>
      <div className="flex-row justify-between items-center gap-2 wrap">
        <button
          onClick={onRoll}
          title="Roll 3d6 six times and normalize toward 28 points"
          className="btn btn-outline"
        >
          Roll (3d6×6 → normalize)
        </button>
      </div>

      <div className="mt-10 fs-12 text-muted">
        {raw && (
          <>
            Raw cost: <b>{rawCost}</b>&nbsp;&nbsp;
          </>
        )}
        {adj && (
          <>
            Adjusted cost: <b>{adjCost}</b>
          </>
        )}
      </div>

      {/* Table-style display with arrows */}
      <div className="grid-rawadj mt-12">
        <strong className="text-right">Raw</strong>
        <div></div>
        <strong>Adjusted</strong>

        {rawSorted && adjSorted ? (
          rawSorted.map((val, i) => (
            <React.Fragment key={i}>
              <div className="stat-cell text-right">{val}</div>
              <div className="arrow-sep">→</div>
              <div className="stat-cell">{adjSorted[i] ?? ''}</div>
            </React.Fragment>
          ))
        ) : (
          <em className="col-span-3 text-center text-muted">Roll to generate stats</em>
        )}
      </div>

      <p className="mt-12 text-muted">
        Use these numbers to fill your character sheet manually. Adjustments are step-by-step,
        lowest-first when reducing and highest-first when raising, evenly distributed and never
        crossing 28 total points.
      </p>
    </div>
  );
}
