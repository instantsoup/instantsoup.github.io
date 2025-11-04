import { AbilityGrid } from './components/AbilityGrid';
import { DropZone } from './components/DropZone';
import { ImportExportBar } from './components/ImportExportBar';
import { LeftSidebar } from './components/LeftSidebar';
import { useCharacter } from './hooks/useCharacter';

// NOTE: Global styles are imported in main.tsx via styles/index.css

export function App() {
  const {
    name,
    setName,
    scores,
    mods,
    onNum,
    persistLocal,
    exportJson,
    importFromFile,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
    error,
  } = useCharacter();

  return (
    <div className="app-grid">
      <LeftSidebar />

      <main className="app-main">
        <header className="app-header">
          <h1 className="app-title">D&D 3.5e Character</h1>

          <ImportExportBar
            persistLocal={persistLocal}
            exportJson={exportJson}
            onPickFile={() => {
              onPickFile?.();
            }} // ensure () => void
            onFileChange={onFileChange}
            fileInputRef={fileInputRef}
            resetAll={resetAll}
          />
        </header>

        <label className="field mb-12">
          <span className="field__label mb-4">Name</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={persistLocal}
            placeholder="Mialee"
          />
        </label>

        <DropZone onFile={importFromFile} />

        <AbilityGrid scores={scores} mods={mods} onNum={onNum} />

        {error && <p className="text-error mt-12">{error}</p>}

      </main>
    </div>
  );
}
