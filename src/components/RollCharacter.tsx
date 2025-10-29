import React, { useState } from 'react'
import { adjustTo28, rollStatLine, totalCost, type StatLine } from '../lib/statline'

export default function RollCharacter() {
  const [raw, setRaw] = useState<StatLine | null>(null)
  const [adj, setAdj] = useState<StatLine | null>(null)

  const roll = () => {
    const r = rollStatLine()
    const a = adjustTo28(r)
    setRaw(r)
    setAdj(a)
  }

  const renderLine = (line: StatLine | null) =>
    line ? line.join(', ') : '—'

  const rawCost = raw ? totalCost(raw) : null
  const adjCost = adj ? totalCost(adj) : null

  return (
    <section style={{ border:'1px solid #ddd', borderRadius:12, padding:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <h3 style={{ margin:0, fontSize:18 }}>Roll Character</h3>
        <button
          onClick={roll}
          title="Roll 3d6 six times and adjust to a 28-point line"
          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ccc', background:'#f8f8f8', cursor:'pointer' }}
        >
          Roll (3d6×6 → 28-pt)
        </button>
      </div>

      <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr', gap:6 }}>
        <div>
          <strong>Raw roll:</strong> {renderLine(raw)}
          {raw && <span style={{ color:'#666' }}> &nbsp; (cost {rawCost})</span>}
        </div>
        <div>
          <strong>Adjusted to 28-pt:</strong> {renderLine(adj)}
          {adj && <span style={{ color:'#666' }}> &nbsp; (cost {adjCost})</span>}
        </div>
      </div>

      <p style={{ marginTop:12, color:'#666' }}>
        Copy these numbers into STR/DEX/CON/INT/WIS/CHA manually. Scores are adjusted by cycling
        the lowest (or highest) until the point total is exactly 28. All stats stay between 3–18.
      </p>
    </section>
  )
}
