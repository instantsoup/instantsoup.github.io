import type { Alignment } from '../schema/schema';

interface AlignmentSelectorProps {
  alignment: Alignment | undefined;
  setAlignment: (alignment: Alignment | undefined) => void;
  onBlur: () => void;
}

const ALIGNMENTS: Array<{ code: Alignment; label: string }> = [
  { code: 'LG', label: 'Lawful Good' },
  { code: 'NG', label: 'Neutral Good' },
  { code: 'CG', label: 'Chaotic Good' },
  { code: 'LN', label: 'Lawful Neutral' },
  { code: 'N', label: 'True Neutral' },
  { code: 'CN', label: 'Chaotic Neutral' },
  { code: 'LE', label: 'Lawful Evil' },
  { code: 'NE', label: 'Neutral Evil' },
  { code: 'CE', label: 'Chaotic Evil' },
];

export function AlignmentSelector({ alignment, setAlignment, onBlur }: AlignmentSelectorProps) {
  const handleSelect = (code: Alignment) => {
    setAlignment(alignment === code ? undefined : code);
    onBlur();
  };

  return (
    <div className="alignment-selector">
      <h3 className="alignment-selector__title">Alignment</h3>
      <div className="alignment-grid">
        {ALIGNMENTS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            className={`alignment-button ${alignment === code ? 'alignment-button--selected' : ''}`}
            onClick={() => handleSelect(code)}
            title={label}
          >
            <span className="alignment-button__code">{code}</span>
            <span className="alignment-button__label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
