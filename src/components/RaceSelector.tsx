import { races } from '../data/races';
import type { RaceName } from '../schema/schema';

interface RaceSelectorProps {
  race: RaceName | undefined;
  setRace: (race: RaceName | undefined) => void;
  onBlur: () => void;
}

export function RaceSelector({ race, setRace, onBlur }: RaceSelectorProps) {
  const handleSelect = (name: RaceName) => {
    setRace(race === name ? undefined : name);
    onBlur();
  };

  return (
    <div className="race-selector">
      <h3 className="race-selector__title">Race</h3>
      <div className="race-grid">
        {races.map(({ name, description }) => (
          <button
            key={name}
            type="button"
            className={`race-button ${race === name ? 'race-button--selected' : ''}`}
            onClick={() => handleSelect(name as RaceName)}
            title={description || name}
          >
            <span className="race-button__label">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
