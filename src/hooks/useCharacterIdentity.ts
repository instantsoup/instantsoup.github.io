import { useState } from 'react';

import type { AlignmentCode, Character, RaceName } from '../schema/schema';

export function useCharacterIdentity(initial: Character) {
  const [name, setName] = useState<string>(initial.name);
  const [race, setRace] = useState<RaceName | undefined>(initial.race);
  const [alignment, setAlignment] = useState<AlignmentCode | undefined>(initial.alignment);

  const loadFrom = (char: Character) => {
    setName(char.name);
    setRace(char.race);
    setAlignment(char.alignment);
  };

  const reset = () => {
    setName('');
    setRace(undefined);
    setAlignment(undefined);
  };

  return { name, setName, race, setRace, alignment, setAlignment, loadFrom, reset };
}
