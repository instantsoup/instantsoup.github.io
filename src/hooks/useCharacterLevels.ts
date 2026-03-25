import { useState } from 'react';

import { recalculateSkillPointsFromLevel } from '../lib/progressions';
import type { Character, ClassName } from '../schema/schema';
import type { Level } from '../types/level';

export function useCharacterLevels(initial: Character, intMod: number) {
  const [levels, setLevels] = useState<Level[]>(initial.levels ?? []);

  const addLevel = () => {
    const nextLevel = levels.length + 1;
    if (nextLevel > 20) return;
    setLevels((prev) => [
      ...prev,
      {
        level: nextLevel,
        class: 'Fighter' as ClassName,
        feats: [],
        spells: [],
        skillRanks: {},
        unspentSkillPoints: 0,
      },
    ]);
  };

  const removeLevel = () => {
    if (levels.length === 0) return;
    setLevels((prev) => {
      const updated = prev.slice(0, -1);
      if (updated.length > 0) {
        return recalculateSkillPointsFromLevel(updated.length - 1, updated, intMod);
      }
      return updated;
    });
  };

  const updateLevelClass = (levelNumber: number, className: ClassName) => {
    setLevels((prev) => {
      const updated = prev.map((lvl) =>
        lvl.level === levelNumber ? { ...lvl, class: className } : lvl,
      );
      return recalculateSkillPointsFromLevel(levelNumber - 1, updated, intMod);
    });
  };

  const addFeatToLevel = (levelNumber: number, featName: string) => {
    setLevels((prev) =>
      prev.map((lvl) => {
        if (lvl.level === levelNumber) {
          const current = lvl.feats ?? [];
          if (!current.includes(featName)) return { ...lvl, feats: [...current, featName] };
        }
        return lvl;
      }),
    );
  };

  const removeFeatFromLevel = (levelNumber: number, featName: string) => {
    setLevels((prev) =>
      prev.map((lvl) =>
        lvl.level === levelNumber
          ? { ...lvl, feats: (lvl.feats ?? []).filter((n) => n !== featName) }
          : lvl,
      ),
    );
  };

  const addSpellToLevel = (levelNumber: number, spellName: string) => {
    setLevels((prev) =>
      prev.map((lvl) => {
        if (lvl.level === levelNumber) {
          const current = lvl.spells ?? [];
          if (!current.includes(spellName)) return { ...lvl, spells: [...current, spellName] };
        }
        return lvl;
      }),
    );
  };

  const removeSpellFromLevel = (levelNumber: number, spellName: string) => {
    setLevels((prev) =>
      prev.map((lvl) =>
        lvl.level === levelNumber
          ? { ...lvl, spells: (lvl.spells ?? []).filter((n) => n !== spellName) }
          : lvl,
      ),
    );
  };

  const updateLevelSkillRanks = (levelNumber: number, skillName: string, ranks: number) => {
    setLevels((prev) => {
      const updated = prev.map((lvl) =>
        lvl.level === levelNumber
          ? {
              ...lvl,
              skillRanks: {
                ...(lvl.skillRanks ?? {}),
                [skillName]: Math.max(0, Math.min(99, ranks)),
              },
            }
          : lvl,
      );
      return recalculateSkillPointsFromLevel(levelNumber - 1, updated, intMod);
    });
  };

  const loadFrom = (char: Character) => {
    setLevels(char.levels ?? []);
  };

  const reset = () => setLevels([]);

  return {
    levels,
    addLevel,
    removeLevel,
    updateLevelClass,
    addFeatToLevel,
    removeFeatFromLevel,
    addSpellToLevel,
    removeSpellFromLevel,
    updateLevelSkillRanks,
    loadFrom,
    reset,
  };
}
