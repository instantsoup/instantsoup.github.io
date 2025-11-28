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
    <div className="class-selector">
      <h3 className="class-selector__title">Class</h3>
      <div className="class-grid">
        {classes.map(({ name, description }) => (
          <button
            key={name}
            type="button"
            className={`class-button ${className === name ? 'class-button--selected' : ''}`}
            onClick={() => handleSelect(name as ClassName)}
            title={description || name}
          >
            <span className="class-button__label">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
