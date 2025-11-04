import React, { useState } from 'react'
import { RollCharacter } from './RollCharacter'

export function UtilitiesPanel() {
  const [open, setOpen] = useState(false)
  return (
    <section style={{ marginTop:16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Show or hide utilities"
        style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #ccc', background:'#f8f8f8', cursor:'pointer' }}
      >
        {open ? '▾ Hide Utilities' : '▸ Show Utilities'}
      </button>

      {open && (
        <div style={{ marginTop:12 }}>
          <RollCharacter />
        </div>
      )}
    </section>
  )
}
