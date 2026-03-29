import { useState } from 'react';

import type { AlignmentCode, Character, RaceName } from '../schema/schema';

export function useCharacterIdentity(initial: Character) {
  const [name, setName] = useState<string>(initial.name);
  const [race, setRace] = useState<RaceName | undefined>(initial.race);
  const [alignment, setAlignment] = useState<AlignmentCode | undefined>(initial.alignment);
  const [age, setAge] = useState<number | undefined>(initial.age);
  const [height, setHeight] = useState<string>(initial.height ?? '');
  const [weight, setWeight] = useState<string>(initial.weight ?? '');
  const [deity, setDeity] = useState<string>(initial.deity ?? '');
  const [homeland, setHomeland] = useState<string>(initial.homeland ?? '');

  const loadFrom = (char: Character) => {
    setName(char.name);
    setRace(char.race);
    setAlignment(char.alignment);
    setAge(char.age);
    setHeight(char.height ?? '');
    setWeight(char.weight ?? '');
    setDeity(char.deity ?? '');
    setHomeland(char.homeland ?? '');
  };

  const reset = () => {
    setName('');
    setRace(undefined);
    setAlignment(undefined);
    setAge(undefined);
    setHeight('');
    setWeight('');
    setDeity('');
    setHomeland('');
  };

  return {
    name,
    setName,
    race,
    setRace,
    alignment,
    setAlignment,
    age,
    setAge,
    height,
    setHeight,
    weight,
    setWeight,
    deity,
    setDeity,
    homeland,
    setHomeland,
    loadFrom,
    reset,
  };
}
