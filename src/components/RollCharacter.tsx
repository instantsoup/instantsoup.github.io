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
    <section style={{ border:'1px solid #ddd', borderRadius:12, padding:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <h3 style={{ margin:0, fontSize:18 }}>Roll Character</h3>
        <button
          onClick={onRoll}
          title="Roll 3d6 six times and normalize toward 28 points (evenly, step-by-step)"
          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ccc', background:'#f8f8f8', cursor:'pointer' }}
        >
          Roll (3d6×6 → normalize)
        </button>
      </div>

      <div style={{ marginTop:10 }}>
        <div style={{ fontSize:12, color:'#666' }}>
          {raw && <>Raw cost: <b>{rawCost}</b>&nbsp;&nbsp;</>}
          {adj && <>Adjusted cost: <b>{adjCost}</b></>}
        </div>
      </div>

      {/* Two-column, row-aligned numbers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
        <div>
          <strong>Raw (high→low)</strong>
          <div style={{ marginTop:6, display:'grid', gridTemplateColumns:'1fr', rowGap:4 }}>
            {rawSorted ? rawSorted.map((v, i) => (
              <div key={`raw-${i}`} style={{ padding:'4px 8px', border:'1px solid #eee', borderRadius:6 }}>
                {v}
              </div>
            )) : <em>—</em>}
          </div>
        </div>
        <div>
          <strong>Adjusted (high→low)</strong>
          <div style={{ marginTop:6, display:'grid', gridTemplateColumns:'1fr', rowGap:4 }}>
            {adjSorted ? adjSorted.map((v, i) => (
              <div key={`adj-${i}`} style={{ padding:'4px 8px', border:'1px solid #eee', borderRadius:6 }}>
                {v}
              </div>
            )) : <em>—</em>}
          </div>
        </div>
      </div>

      <p style={{ marginTop:12, color:'#666' }}>
        Use these numbers to fill your sheet manually. Normalization is step-by-step, even across stats, and never crosses 28.
      </p>
    </section>
  )
}
