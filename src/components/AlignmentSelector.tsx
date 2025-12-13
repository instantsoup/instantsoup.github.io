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
    <div className="selector">
      <div className="selector-grid--3col">
        {alignments.map(({ code, label, description }) => (
          <button
            key={code}
            type="button"
            className={`selector-button selector-button--stacked ${alignment === code ? 'selector-button--selected' : ''}`}
            onClick={() => handleSelect(code as AlignmentCode)}
            title={description || label}
          >
            <span className="selector-button__code">{code}</span>
            <span className="selector-button__sublabel">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
