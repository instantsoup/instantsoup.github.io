import { useMemo, useRef, useState } from 'react'
import { computeMods } from '../lib/mods'
import { CharacterSchemaV1, VERSION, migrateToLatest, type CharacterV1 } from '../schema/schema'
import { emptyScores, type Scores } from '../types'
import { downloadJson } from '../lib/download'
import { loadLocal, saveLocal, clearLocal } from '../store/local'

export function useCharacter() {
  const initial = loadLocal()
  const [name, setName] = useState<string>(initial.name)
  const [scores, setScores] = useState<Scores>(initial.scores)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mods = useMemo(() => computeMods(scores), [scores])
  const current: CharacterV1 = { version: VERSION, name, scores }

  const onNum = (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10)
    setScores(s => ({ ...s, [k]: Number.isFinite(v) ? v : 0 }))
  }

  const persistLocal = () => { saveLocal(current); setError(null) }

  const exportJson = () => {
    try {
      const parsed = CharacterSchemaV1.parse(current)
      const safeName = (parsed.name || 'character').replace(/[^\w\-]+/g, '_').slice(0, 40)
      downloadJson(`${safeName || 'character'}_v${parsed.version}.json`, parsed)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to export JSON.')
    }
  }

  const importFromFile = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const migrated = migrateToLatest(json)
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
    e.target.value = ''
  }

  const resetAll = () => {
    if (!window.confirm('Clear this character and local saved copy?')) return
    setName('')
    setScores(emptyScores)
    setError(null)
    clearLocal()
  }

  return {
    name, setName,
    scores, setScores,
    mods,
    error, setError,
    onNum,
    persistLocal,
    exportJson,
    importFromFile,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
  }
}
