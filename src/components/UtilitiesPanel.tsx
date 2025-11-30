interface UtilitiesPanelProps {
  exportJson: () => void;
  onPickFile: () => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  resetAll: () => void;
}

export function UtilitiesPanel({
  exportJson,
  onPickFile,
  onFileChange,
  fileInputRef,
  resetAll,
}: UtilitiesPanelProps) {
  return (
    <div className="utilities-panel">
      <button type="button" className="btn btn--primary" onClick={exportJson}>
        Export JSON
      </button>

      <button type="button" className="btn btn--primary" onClick={onPickFile}>
        Import JSON
      </button>

      <button type="button" className="btn btn--danger" onClick={resetAll}>
        Clear Character
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept="application/json"
        className="input--hidden"
        ref={fileInputRef}
        aria-label="Import character JSON"
        onChange={onFileChange}
      />
    </div>
  );
}
