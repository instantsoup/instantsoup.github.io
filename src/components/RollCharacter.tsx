import React, { useMemo, useState } from 'react'
import { adjustTo28, rollStatLine, totalCost, type StatLine } from '../lib/statline'

const sortDesc = (arr: number[]) => [...arr].sort((a, b) => b - a)

export default function RollCharacter() {
  const [raw, setRaw] = useState<StatLine | null>(null)
  const [adj, setAdj] = useState<StatLine | null>(null)

  const onRoll = () => {
    const r = rollStatLine()
    const a = adjustTo28(r)
    setRaw(r)
    setAdj(a)
  }

  const rawSorted = useMemo(() => (raw ? sortDesc(raw) : null), [raw])
  const adjSorted = useMemo(() => (adj ? sortDesc(adj) : null), [adj])

  const rawCost = raw ? totalCost(raw) : null
  const adjCost = adj ? totalCost(adj) : null

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>Roll Character</h3>
        <button
          onClick={onRoll}
          title="Roll 3d6 six times and normalize toward 28 points"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#f8f8f8',
            cursor: 'pointer',
          }}
        >
          Roll (3d6×6 → normalize)
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
        {raw && <>Raw cost: <b>{rawCost}</b>&nbsp;&nbsp;</>}
        {adj && <>Adjusted cost: <b>{adjCost}</b></>}
      </div>

      {/* Table-style display with arrows */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '8px 16px',
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <strong style={{ textAlign: 'right' }}>Raw</strong>
        <div></div>
        <strong>Adjusted</strong>

        {rawSorted && adjSorted
          ? rawSorted.map((val, i) => (
              <React.Fragment key={i}>
                <div
                  style={{
                    textAlign: 'right',
                    padding: '4px 8px',
                    border: '1px solid #eee',
                    borderRadius: 6,
                  }}
                >
                  {val}
                </div>
                <div style={{ textAlign: 'center', color: '#999' }}>→</div>
                <div
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #eee',
                    borderRadius: 6,
                  }}
                >
                  {adjSorted[i] ?? ''}
                </div>
              </React.Fragment>
            ))
          : (
              <>
                <em style={{ gridColumn: '1 / span 3', textAlign: 'center', color: '#666' }}>
                  Roll to generate stats
                </em>
              </>
            )}
      </div>

      <p style={{ marginTop: 12, color: '#666' }}>
        Use these numbers to fill your character sheet manually.  
        Adjustments are step-by-step, lowest-first when reducing and highest-first when raising,  
        evenly distributed and never crossing 28 total points.
      </p>
    </section>
  )
}
