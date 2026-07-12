/** XP threshold to reach a given level (3.5e PHB: level*(level-1)*500) */
export function xpForLevel(level: number): number {
  return level * (level - 1) * 500;
}

/** Character level that a given XP total corresponds to (1-based, max 20) */
export function levelForXP(xp: number): number {
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= xpForLevel(lvl)) return lvl;
  }
  return 1;
}

/** XP needed to advance from current level to next */
export function xpToNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1) - xpForLevel(currentLevel);
}
