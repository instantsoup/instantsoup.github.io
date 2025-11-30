import { classes } from '../data/classes';
import type { ClassName } from '../schema/schema';

interface ClassSelectorProps {
  className: ClassName | undefined;
  setClassName: (className: ClassName | undefined) => void;
  onBlur: () => void;
}

export function ClassSelector({ className, setClassName, onBlur }: ClassSelectorProps) {
  const handleSelect = (name: ClassName) => {
    setClassName(className === name ? undefined : name);
    onBlur();
  };

  return (
    <div className="selector">
      <h3 className="panel-title">Class</h3>
      <div className="selector-grid">
        {classes.map(({ name, description }) => (
          <button
            key={name}
            type="button"
            className={`selector-button ${className === name ? 'selector-button--selected' : ''}`}
            onClick={() => handleSelect(name as ClassName)}
            title={description || name}
          >
            <span className="selector-button__label">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
