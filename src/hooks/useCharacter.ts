import { useMemo, useRef, useState } from 'react';
import { ZodError } from 'zod';

import { downloadJson } from '../lib/download';
import { computeMods } from '../lib/mods';
import { recalculateSkillPointsFromLevel } from '../lib/progressions';
import {
  type AlignmentCode,
  type Character,
  CharacterSchema,
  type ClassName,
  type CombatStats,
  type RaceName,
  VERSION,
} from '../schema/schema';
import { clearLocal, loadLocal, saveLocal } from '../store/local';
import { emptyScores, type Scores } from '../types';
import type { Level } from '../types/level';

export function useCharacter() {
  const initial = loadLocal();
  const [name, setName] = useState<string>(initial.name);
  const [scores, setScores] = useState<Scores>(initial.scores);
  const [race, setRace] = useState<RaceName | undefined>(initial.race);
  const [className, setClassName] = useState<ClassName | undefined>(initial.class);
  const [levels, setLevels] = useState<Level[]>(initial.levels ?? []);
  const [alignment, setAlignment] = useState<AlignmentCode | undefined>(initial.alignment);
  const [feats, setFeats] = useState<string[]>(initial.feats ?? []);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>(initial.skillRanks ?? {});
  const [saveBonuses, setSaveBonuses] = useState<Record<string, number>>(initial.saveBonuses ?? {});
  const [combatStats, setCombatStats] = useState<CombatStats>(initial.combatStats ?? {});
  const [spells, setSpells] = useState<string[]>(initial.spells ?? []);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mods = useMemo(() => computeMods(scores), [scores]);
  const current: Character = {
    version: VERSION,
    name,
    scores,
    race,
    class: className,
    levels,
    alignment,
    feats,
    skillRanks,
    saveBonuses,
    combatStats,
    spells,
  };

  const onNum = (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10);
    setScores((s) => ({ ...s, [k]: Number.isFinite(v) ? v : 0 }));
  };

  const persistLocal = () => {
    saveLocal(current);
    setError(null);
  };

  const exportJson = () => {
    try {
      const parsed = CharacterSchema.parse(current);
      const safeName = (parsed.name || 'character').replace(/[^\w-]+/g, '_').slice(0, 40);
      downloadJson(`${safeName || 'character'}_v${parsed.version}.json`, parsed);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        const msg = e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        setError(msg || 'Validation failed while exporting JSON.');
      } else if (e instanceof Error) {
        setError(e.message || 'Unable to export JSON.');
      } else {
        setError('Unable to export JSON.');
      }
    }
  };

  const importFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = CharacterSchema.parse(json);
      setName(parsed.name);
      setScores(parsed.scores);
      setRace(parsed.race);
      setClassName(parsed.class);
      setLevels(parsed.levels ?? []);
      setAlignment(parsed.alignment);
      setFeats(parsed.feats ?? []);
      setSkillRanks(parsed.skillRanks ?? {});
      setSaveBonuses(parsed.saveBonuses ?? {});
      setCombatStats(parsed.combatStats ?? {});
      setSpells(parsed.spells ?? []);
      saveLocal(parsed);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        const msg = e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        setError(msg || 'Validation failed while importing file.');
      } else if (e instanceof Error) {
        setError(e.message || 'Unable to import file.');
      } else {
        setError('Unable to import file.');
      }
    }
  };

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await importFromFile(f);
    e.target.value = '';
  };

  const resetAll = () => {
    if (!window.confirm('Clear this character and local saved copy?')) return;
    setName('');
    setScores(emptyScores);
    setRace(undefined);
    setClassName(undefined);
    setLevels([]);
    setAlignment(undefined);
    setFeats([]);
    setSkillRanks({});
    setSaveBonuses({});
    setCombatStats({});
    setSpells([]);
    setError(null);
    clearLocal();
  };

  const setSkillRank = (skillName: string, ranks: number) => {
    setSkillRanks((prev) => ({ ...prev, [skillName]: Math.max(0, Math.min(99, ranks)) }));
  };

  const setSaveBonus = (saveName: string, bonus: number) => {
    setSaveBonuses((prev) => ({ ...prev, [saveName]: Math.max(0, Math.min(99, bonus)) }));
  };

  const updateCombatStat = (field: keyof CombatStats, value: number | undefined) => {
    setCombatStats((prev) => ({ ...prev, [field]: value }));
  };

  const addFeat = (featName: string) => {
    if (!feats.includes(featName)) {
      setFeats((prev) => [...prev, featName]);
    }
  };

  const removeFeat = (featName: string) => {
    setFeats((prev) => prev.filter((name) => name !== featName));
  };

  const addSpell = (spellName: string) => {
    if (!spells.includes(spellName)) {
      setSpells((prev) => [...prev, spellName]);
    }
  };

  const removeSpell = (spellName: string) => {
    setSpells((prev) => prev.filter((name) => name !== spellName));
  };

  const addLevel = () => {
    const nextLevel = levels.length + 1;
    if (nextLevel > 20) return; // Max level 20
    setLevels((prev) => [
      ...prev,
      { level: nextLevel, class: 'Fighter', feats: [], skillRanks: {}, unspentSkillPoints: 0 },
    ]);
  };

  const removeLevel = () => {
    if (levels.length === 0) return;
    setLevels((prev) => {
      const updated = prev.slice(0, -1);
      // Recalculate skill points from the removed level's previous level
      if (updated.length > 0) {
        return recalculateSkillPointsFromLevel(updated.length - 1, updated, mods.int);
      }
      return updated;
    });
  };

  const updateLevelClass = (levelNumber: number, className: ClassName) => {
    setLevels((prev) => {
      const updated = prev.map((lvl) =>
        lvl.level === levelNumber ? { ...lvl, class: className } : lvl,
      );
      // Recalculate from this level forward (class change affects class skills)
      return recalculateSkillPointsFromLevel(levelNumber - 1, updated, mods.int);
    });
  };

  const addFeatToLevel = (levelNumber: number, featName: string) => {
    setLevels((prev) =>
      prev.map((lvl) => {
        if (lvl.level === levelNumber) {
          const currentFeats = lvl.feats ?? [];
          if (!currentFeats.includes(featName)) {
            return { ...lvl, feats: [...currentFeats, featName] };
          }
        }
        return lvl;
      }),
    );
  };

  const removeFeatFromLevel = (levelNumber: number, featName: string) => {
    setLevels((prev) =>
      prev.map((lvl) =>
        lvl.level === levelNumber
          ? { ...lvl, feats: (lvl.feats ?? []).filter((name) => name !== featName) }
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
      // Recalculate skill points from this level forward
      return recalculateSkillPointsFromLevel(levelNumber - 1, updated, mods.int);
    });
  };

  return {
    name,
    setName,
    scores,
    setScores,
    mods,
    race,
    setRace,
    className,
    setClassName,
    levels,
    addLevel,
    removeLevel,
    updateLevelClass,
    addFeatToLevel,
    removeFeatFromLevel,
    updateLevelSkillRanks,
    alignment,
    setAlignment,
    feats,
    addFeat,
    removeFeat,
    spells,
    addSpell,
    removeSpell,
    skillRanks,
    setSkillRank,
    saveBonuses,
    setSaveBonus,
    combatStats,
    updateCombatStat,
    error,
    setError,
    onNum,
    persistLocal,
    exportJson,
    importFromFile,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
  };
}
