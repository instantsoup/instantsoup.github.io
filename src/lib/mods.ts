export const mod = (score: number) => Math.floor((score - 10) / 2);
export const computeMods = (s: {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}) => ({
  str: mod(s.str),
  dex: mod(s.dex),
  con: mod(s.con),
  int: mod(s.int),
  wis: mod(s.wis),
  cha: mod(s.cha),
});
