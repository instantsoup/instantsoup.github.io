export type Condition = {
  name: string;
  description: string;
};

export const CONDITIONS: Condition[] = [
  { name: 'Blinded', description: '-2 AC, lose Dex bonus, −4 to most Str/Dex checks, opponents 50% miss chance' },
  { name: 'Confused', description: 'Acts randomly; roll d% each round to determine action' },
  { name: 'Dazed', description: 'Can take no actions; no AC penalty' },
  { name: 'Deafened', description: '-4 initiative; 20% spell failure for spells with verbal components' },
  { name: 'Entangled', description: '-2 attack, -4 Dex; must make Concentration check to cast' },
  { name: 'Exhausted', description: 'Half speed; -6 Str, -6 Dex; after 1 hour rest becomes fatigued' },
  { name: 'Fatigued', description: 'No running or charging; -2 Str, -2 Dex; after 8 hours rest no longer fatigued' },
  { name: 'Frightened', description: 'Flees if possible; -2 attack, saves, skill/ability checks' },
  { name: 'Grappled', description: 'No movement; -4 Dex; −2 attack and opposed checks except to escape grapple' },
  { name: 'Incorporeal', description: '50% chance to ignore any damage from corporeal source; can pass through walls' },
  { name: 'Nauseated', description: 'Can only take a move action; cannot attack, cast spells, or concentrate' },
  { name: 'Panicked', description: 'Drops held items, flees; -2 attack, saves, skill/ability checks; cowering if cornered' },
  { name: 'Prone', description: '-4 melee attack; +4 AC vs ranged, -4 AC vs melee' },
  { name: 'Shaken', description: '-2 attack, saving throws, skill checks, and ability checks' },
  { name: 'Sickened', description: '-2 attack, damage, saving throws, skill checks, and ability checks' },
  { name: 'Stunned', description: 'Drops held items; can take no actions; -2 AC, lose Dex bonus to AC' },
];
