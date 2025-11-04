// src/components/ImportExportBar.tsx
import React from 'react';

export type ImportExportBarProps = {
  persistLocal: () => void;
  exportJson: () => void;
  onPickFile: () => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  resetAll: () => void;
};

export function ImportExportBar({
  persistLocal,
  exportJson,
  onPickFile,
  onFileChange,
  fileInputRef,
  resetAll,
}: ImportExportBarProps) {
  return (
    <div className="btn-row">
      <button
        className="btn btn--danger"
        onClick={resetAll}
        title="Clear current character and local save"
      >
        Clear / Reset
      </button>

      <button className="btn" onClick={exportJson} title="Download character.json">
        Export JSON
      </button>

      <button className="btn" onClick={onPickFile} title="Upload a character JSON">
        Import JSON
      </button>

      <button className="btn" onClick={persistLocal} title="Save to localStorage">
        Save (local)
      </button>
      <p className="note mt-16">
        Persistence: Export/Import JSON. Local Save is optional convenience for this device only.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="input--hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
