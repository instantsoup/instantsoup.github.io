import React from 'react'

export default function ImportExportBar({
  persistLocal, exportJson, onPickFile, fileInputRef, resetAll,
}: {
  persistLocal: () => void
  exportJson: () => void
  onPickFile: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  resetAll: () => void
}) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      <button onClick={resetAll} title="Clear current character and local save"
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ccc', background:'#fff5f5', cursor:'pointer' }}>
        Clear / Reset
      </button>
      <button onClick={persistLocal} title="Save to localStorage"
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ccc', background:'#f8f8f8', cursor:'pointer' }}>
        Save (local)
      </button>
      <button onClick={exportJson} title="Download character.json"
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ccc', background:'#f8f8f8', cursor:'pointer' }}>
        Export JSON
      </button>
      <button onClick={onPickFile} title="Upload a character JSON"
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ccc', background:'#f8f8f8', cursor:'pointer' }}>
        Import JSON
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" hidden />
    </div>
  )
}
