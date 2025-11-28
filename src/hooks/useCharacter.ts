import { useMemo, useRef, useState } from 'react';
import { ZodError } from 'zod';

import { downloadJson } from '../lib/download';
import { computeMods } from '../lib/mods';
import {
  type AlignmentCode,
  CharacterSchemaV1,
  type CharacterV1,
  type CombatStats,
  migrateToLatest,
  type RaceName,
  VERSION,
} from '../schema/schema';
import { clearLocal, loadLocal, saveLocal } from '../store/local';
import { emptyScores, type Scores } from '../types';

export function useCharacter() {
  const initial = loadLocal();
  const [name, setName] = useState<string>(initial.name);
  const [scores, setScores] = useState<Scores>(initial.scores);
  const [race, setRace] = useState<RaceName | undefined>(initial.race);
  const [alignment, setAlignment] = useState<AlignmentCode | undefined>(initial.alignment);
  const [skillRanks, setSkillRanks] = useState<Record<string, number>>(initial.skillRanks ?? {});
  const [saveBonuses, setSaveBonuses] = useState<Record<string, number>>(initial.saveBonuses ?? {});
  const [combatStats, setCombatStats] = useState<CombatStats>(initial.combatStats ?? {});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mods = useMemo(() => computeMods(scores), [scores]);
  const current: CharacterV1 = {
    version: VERSION,
    name,
    scores,
    race,
    alignment,
    skillRanks,
    saveBonuses,
    combatStats,
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
      const parsed = CharacterSchemaV1.parse(current);
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
      const migrated = migrateToLatest(json);
      setName(migrated.name);
      setScores(migrated.scores);
      setRace(migrated.race);
      setAlignment(migrated.alignment);
      setSkillRanks(migrated.skillRanks ?? {});
      setSaveBonuses(migrated.saveBonuses ?? {});
      setCombatStats(migrated.combatStats ?? {});
      saveLocal(migrated);
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
    setAlignment(undefined);
    setSkillRanks({});
    setSaveBonuses({});
    setCombatStats({});
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

  return {
    name,
    setName,
    scores,
    setScores,
    mods,
    race,
    setRace,
    alignment,
    setAlignment,
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
