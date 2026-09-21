/** Presentation helpers shared by the spellbook and spell-preparation panels. */

export const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export const WIZARD_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
  'Universal',
] as const;

const SCHOOL_CLASS: Record<string, string> = {
  Abjuration: 'school--abj',
  Conjuration: 'school--con',
  Divination: 'school--div',
  Enchantment: 'school--enc',
  Evocation: 'school--evo',
  Illusion: 'school--ill',
  Necromancy: 'school--nec',
  Transmutation: 'school--tra',
  Universal: 'school--uni',
};

export function schoolClass(school: string): string {
  return SCHOOL_CLASS[school] ?? 'school--other';
}

export function levelLabel(level: string, zeroLabel = 'Cantrips'): string {
  return level === '0' ? zeroLabel : `Level ${level}`;
}

/** "8 h", "1 d 8 h", "2 wk 3 d" — spellbook study/scribing/research time. */
export function formatDuration(hours: number): string {
  if (hours <= 0) return '—';
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  if (days === 0) return `${rem} h`;
  if (days < 14) return rem ? `${days} d ${rem} h` : `${days} d`;
  const weeks = Math.floor(days / 7);
  const restDays = days % 7;
  return restDays ? `${weeks} wk ${restDays} d` : `${weeks} wk`;
}

export function formatGold(gp: number): string {
  return gp > 0 ? `${gp.toLocaleString('en-US')} gp` : '—';
}
