import React, { useMemo, useRef, useState } from 'react'
import { mod } from './lib/mods'
import { CharacterSchemaV1, VERSION, migrateToLatest, type CharacterV1 } from './schema'

// v0 scope remains: single character, ability scores -> modifiers, optional localStorage cache
type Scores = { str: number; dex: number; con: number; int: number; wis: number; cha: number }
const empty: Scores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }

const load = (): { name: string; scores: Scores } => {
  try {
    const raw = localStorage.getItem('v0-char')
    if (!raw) return { name: '', scores: empty }
    const parsed = JSON.parse(raw)
    // best-effort local validation (non-fatal)
    const safe = CharacterSchemaV1.safeParse(parsed)
    if (safe.success) return { name: safe.data.name, scores: safe.data.scores }
    return { name: parsed?.name ?? '', scores: parsed?.scores ?? empty }
  } catch {
    return { name: '', scores: empty }
  }
}

const saveLocal = (data: CharacterV1) => localStorage.setItem('v0-char', JSON.stringify(data))

function download(filename: string, data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const initial = load()
  const [name, setName] = useState<string>(initial?.name ?? '')
  const [scores, setScores] = useState<Scores>(initial?.scores ?? empty)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mods = useMemo(() => ({
    str: mod(scores.str),
    dex: mod(scores.dex),
    con: mod(scores.con),
    int: mod(scores.int),
    wis: mod(scores.wis),
    cha: mod(scores.cha),
  }), [scores])

  const onNum = (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10)
    setScores(s => ({ ...s, [k]: Number.isFinite(v) ? v : 0 }))
  }

  const currentPayload: CharacterV1 = { version: VERSION, name, scores }

  const persistLocal = () => {
    saveLocal(currentPayload)
    setError(null)
  }

  const exportJson = () => {
    try {
      const parsed = CharacterSchemaV1.parse(currentPayload)
      const safeName = (parsed.name || 'character').replace(/[^\w\-]+/g, '_').slice(0, 40)
      const filename = `${safeName || 'character'}_v${parsed.version}.json`
      download(filename, parsed)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to export JSON.')
    }
  }

  const importFromFile = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const migrated = migrateToLatest(json) // throws on failure
      setName(migrated.name)
      setScores(migrated.scores)
      saveLocal(migrated)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to import file.')
    }
  }

  const onPickFile = () => fileInputRef.current?.click()
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await importFromFile(f)
    e.target.value = '' // reset so picking the same file again re-triggers
  }

  // Optional: drag-and-drop import
  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) await importFromFile(f)
  }
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault()

  return (
    <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 16, maxWidth: 760, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>D&D 3.5e Character (v0)</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={persistLocal} title="Save to localStorage"
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#f8f8f8', cursor: 'pointer' }}>
            Save (local)
          </button>
          <button onClick={exportJson} title="Download character.json"
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#f8f8f8', cursor: 'pointer' }}>
            Export JSON
          </button>
          <button onClick={onPickFile} title="Upload a character JSON"
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#f8f8f8', cursor: 'pointer' }}>
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChange} hidden />
        </div>
      </header>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Name</span>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Mialee"
               style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc' }} />
      </label>

      {/* Drag-and-drop zone for importing */}
      <div onDrop={onDrop} onDragOver={onDragOver}
           style={{ border: '1px dashed #bbb', borderRadius: 12, padding: 12, marginBottom: 12, background: '#fafafa' }}>
        Drop a character JSON here to import
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        {(['str','dex','con','int','wis','cha'] as (keyof Scores)[]).map((k) => (
          <div key={k} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ textTransform: 'uppercase' }}>{k}</strong>
              <span title="modifier" style={{ fontVariantNumeric: 'tabular-nums' }}>
                mod <b>{mods[k] >= 0 ? `+${mods[k]}` : mods[k]}</b>
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={30}
              value={scores[k]}
              onChange={onNum(k)}
              style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
            />
          </div>
        ))}
      </div>

      {error && <p style={{ marginTop: 12, color: '#b00' }}>{error}</p>}

      <p style={{ marginTop: 16, color: '#666' }}>
        Persistence: Export/Import JSON. Local Save is optional convenience for this device only.
      </p>
    </main>
  )
}
