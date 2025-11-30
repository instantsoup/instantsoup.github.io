import { useState } from 'react';

import type { AlignmentCode, RaceName } from '../schema/schema';
import { AlignmentSelector } from './AlignmentSelector';
import { RaceSelector } from './RaceSelector';

interface CharacterInfoPanelProps {
  name: string;
  setName: (name: string) => void;
  race: RaceName | undefined;
  setRace: (race: RaceName | undefined) => void;
  alignment: AlignmentCode | undefined;
  setAlignment: (alignment: AlignmentCode | undefined) => void;
  onBlur: () => void;
}

export function CharacterInfoPanel({
  name,
  setName,
  race,
  setRace,
  alignment,
  setAlignment,
  onBlur,
}: CharacterInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="character-info-panel">
      <button
        type="button"
        className={`character-info-panel__header ${isOpen ? 'character-info-panel__header--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        Character Info
      </button>

      {isOpen && (
        <div className="character-info-panel__content">
          {/* Name selector styled like race/class/alignment */}
          <div className="selector">
            <h3 className="panel-title">Name</h3>
            <input
              className="selector-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={onBlur}
              placeholder="Enter character name..."
            />
          </div>

          <RaceSelector race={race} setRace={setRace} onBlur={onBlur} />

          <AlignmentSelector alignment={alignment} setAlignment={setAlignment} onBlur={onBlur} />
        </div>
      )}
    </div>
  );
}
