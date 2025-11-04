import React from 'react'
import type { Scores } from '../types'

export function AbilityGrid({
  scores,
  mods,
  onNum,
}: {
  scores: Scores
  mods: Scores
  onNum: (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const keys: (keyof Scores)[] = ['str','dex','con','int','wis','cha']
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:12 }}>
      {keys.map(k => (
        <div key={k} style={{ border:'1px solid #ddd', borderRadius:12, padding:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <strong style={{ textTransform:'uppercase' }}>{k}</strong>
            <span style={{ fontVariantNumeric:'tabular-nums' }}>mod <b>{mods[k] >= 0 ? `+${mods[k]}` : mods[k]}</b></span>
          </div>
          <input
            type="number" min={1} max={30}
            value={scores[k]}
            onChange={onNum(k)}
            style={{ width:'100%', marginTop:8, padding:8, borderRadius:8, border:'1px solid #ccc' }}
          />
        </div>
      ))}
    </div>
  )
}
