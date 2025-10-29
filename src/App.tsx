import React from 'react'
import { useCharacter } from './hooks/useCharacter'
import { AbilityGrid } from './components/AbilityGrid'
import { ImportExportBar } from './components/ImportExportBar'
import { DropZone } from './components/DropZone'

export default function App() {
  const {
    name, setName,
    scores, mods, onNum,
    persistLocal, exportJson, importFromFile,
    onPickFile, onFileChange, fileInputRef,
    resetAll, error,
  } = useCharacter()

  return (
    <main style={{ fontFamily:'ui-sans-serif, system-ui', padding:16, maxWidth:760, margin:'0 auto' }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'end', marginBottom:16, gap:8, flexWrap:'wrap' }}>
        <h1 style={{ fontSize:24, margin:0 }}>D&D 3.5e Character (v0)</h1>
        <ImportExportBar
          persistLocal={persistLocal}
          exportJson={exportJson}
          onPickFile={onPickFile}
          fileInputRef={fileInputRef}
          resetAll={resetAll}
        />
        {/* hidden file input is inside ImportExportBar */}
      </header>

      <label style={{ display:'block', marginBottom:12 }}>
        <span style={{ display:'block', fontWeight:600, marginBottom:4 }}>Name</span>
        <input
          value={name} onChange={e => setName(e.target.value)} placeholder="Mialee"
          style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #ccc' }}
          onBlur={persistLocal}
        />
      </label>

      <DropZone onFile={importFromFile} />

      <AbilityGrid scores={scores} mods={mods} onNum={onNum} />

      {error && <p style={{ marginTop:12, color:'#b00' }}>{error}</p>}

      <p style={{ marginTop:16, color:'#666' }}>
        Persistence: Export/Import JSON. Local Save is optional convenience for this device only.
      </p>
    </main>
  )
}
