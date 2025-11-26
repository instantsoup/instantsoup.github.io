import { alignments } from '../data/alignments';
import type { AlignmentCode } from '../schema/schema';

interface AlignmentSelectorProps {
  alignment: AlignmentCode | undefined;
  setAlignment: (alignment: AlignmentCode | undefined) => void;
  onBlur: () => void;
}

export function AlignmentSelector({ alignment, setAlignment, onBlur }: AlignmentSelectorProps) {
  const handleSelect = (code: AlignmentCode) => {
    setAlignment(alignment === code ? undefined : code);
    onBlur();
  };

  return (
    <div className="alignment-selector">
      <h3 className="alignment-selector__title">Alignment</h3>
      <div className="alignment-grid">
        {alignments.map(({ code, label, description }) => (
          <button
            key={code}
            type="button"
            className={`alignment-button ${alignment === code ? 'alignment-button--selected' : ''}`}
            onClick={() => handleSelect(code as AlignmentCode)}
            title={description || label}
          >
            <span className="alignment-button__code">{code}</span>
            <span className="alignment-button__label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
