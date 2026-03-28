export type ConditionPenalties = {
  str?: number;
  dex?: number;
  attack?: number;
  save?: number;
  ac?: number;
  initiative?: number;
  loseDexToAC?: boolean;
};

export type Condition = {
  name: string;
  description: string;
  penalties?: ConditionPenalties;
};

export const CONDITIONS: Condition[] = [
  {
    name: 'Blinded',
    description: '-2 AC, lose Dex bonus, −4 to most Str/Dex checks, opponents 50% miss chance',
    penalties: { ac: -2, loseDexToAC: true },
  },
  { name: 'Confused', description: 'Acts randomly; roll d% each round to determine action' },
  { name: 'Dazed', description: 'Can take no actions; no AC penalty' },
  {
    name: 'Deafened',
    description: '-4 initiative; 20% spell failure for spells with verbal components',
    penalties: { initiative: -4 },
  },
  {
    name: 'Entangled',
    description: '-2 attack, -4 Dex; must make Concentration check to cast',
    penalties: { dex: -4, attack: -2 },
  },
  {
    name: 'Exhausted',
    description: 'Half speed; -6 Str, -6 Dex; after 1 hour rest becomes fatigued',
    penalties: { str: -6, dex: -6 },
  },
  {
    name: 'Fatigued',
    description: 'No running or charging; -2 Str, -2 Dex; after 8 hours rest no longer fatigued',
    penalties: { str: -2, dex: -2 },
  },
  {
    name: 'Frightened',
    description: 'Flees if possible; -2 attack, saves, skill/ability checks',
    penalties: { attack: -2, save: -2 },
  },
  {
    name: 'Grappled',
    description: 'No movement; -4 Dex; −2 attack and opposed checks except to escape grapple',
    penalties: { dex: -4, attack: -2 },
  },
  {
    name: 'Incorporeal',
    description: '50% chance to ignore any damage from corporeal source; can pass through walls',
  },
  {
    name: 'Nauseated',
    description: 'Can only take a move action; cannot attack, cast spells, or concentrate',
  },
  {
    name: 'Panicked',
    description:
      'Drops held items, flees; -2 attack, saves, skill/ability checks; cowering if cornered',
    penalties: { attack: -2, save: -2 },
  },
  {
    name: 'Prone',
    description: '-4 melee attack; +4 AC vs ranged, -4 AC vs melee',
    penalties: { attack: -4, ac: -4 },
  },
  {
    name: 'Shaken',
    description: '-2 attack, saving throws, skill checks, and ability checks',
    penalties: { attack: -2, save: -2 },
  },
  {
    name: 'Sickened',
    description: '-2 attack, damage, saving throws, skill checks, and ability checks',
    penalties: { attack: -2, save: -2 },
  },
  {
    name: 'Stunned',
    description: 'Drops held items; can take no actions; -2 AC, lose Dex bonus to AC',
    penalties: { ac: -2, loseDexToAC: true },
  },
];
