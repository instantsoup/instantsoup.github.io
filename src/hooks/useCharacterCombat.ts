import { useState } from 'react';

import type { Character, CombatStats, Weapon } from '../schema/schema';

export function useCharacterCombat(initial: Character) {
  const [combatStats, setCombatStats] = useState<CombatStats>(initial.combatStats ?? {});
  const [saveBonuses, setSaveBonuses] = useState<Record<string, number>>(initial.saveBonuses ?? {});
  const [weapons, setWeapons] = useState<Weapon[]>(initial.weapons ?? []);
  const [memorizedSpells, setMemorizedSpells] = useState<Record<string, string[]>>(
    initial.combatStats?.memorizedSpells ?? {},
  );

  const updateCombatStat = (field: keyof CombatStats, value: number | undefined) => {
    setCombatStats((prev) => ({ ...prev, [field]: value }));
  };

  const updateSpellSlotsMax = (spellLevel: string, max: number) => {
    setCombatStats((prev) => ({
      ...prev,
      spellSlotsMax: { ...(prev.spellSlotsMax ?? {}), [spellLevel]: Math.max(0, max) },
    }));
  };

  const updateSpellSlotsUsed = (spellLevel: string, used: number) => {
    setCombatStats((prev) => {
      const max = prev.spellSlotsMax?.[spellLevel] ?? 99;
      return {
        ...prev,
        spellSlotsUsed: {
          ...(prev.spellSlotsUsed ?? {}),
          [spellLevel]: Math.max(0, Math.min(max, used)),
        },
      };
    });
  };

  const resetSpellSlots = () => {
    setCombatStats((prev) => ({ ...prev, spellSlotsUsed: {} }));
  };

  const setMovementType = (type: string) => {
    setCombatStats((prev) => ({ ...prev, movementType: type || undefined }));
  };

  const startCombat = () => {
    setCombatStats((prev) => ({ ...prev, inCombat: true, combatRound: 1 }));
  };

  const endCombat = () => {
    setCombatStats((prev) => ({
      ...prev,
      inCombat: false,
      combatRound: 1,
      combatInitiative: undefined,
    }));
  };

  const setCombatInitiative = (n: number) => {
    setCombatStats((prev) => ({ ...prev, combatInitiative: n }));
  };

  const advanceRound = () => {
    setCombatStats((prev) => ({ ...prev, combatRound: (prev.combatRound ?? 1) + 1 }));
  };

  const setSaveBonus = (saveName: string, bonus: number) => {
    setSaveBonuses((prev) => ({ ...prev, [saveName]: Math.max(0, Math.min(99, bonus)) }));
  };

  const addWeapon = (w: Weapon) => setWeapons((prev) => [...prev, w]);
  const removeWeapon = (index: number) => setWeapons((prev) => prev.filter((_, i) => i !== index));
  const updateWeapon = (index: number, w: Weapon) =>
    setWeapons((prev) => prev.map((existing, i) => (i === index ? w : existing)));

  const addMemorizedSpell = (spellLevel: string, spellName: string) => {
    setMemorizedSpells((prev) => ({
      ...prev,
      [spellLevel]: [...(prev[spellLevel] ?? []), spellName],
    }));
  };

  const removeMemorizedSpell = (spellLevel: string, index: number) => {
    setMemorizedSpells((prev) => ({
      ...prev,
      [spellLevel]: (prev[spellLevel] ?? []).filter((_, i) => i !== index),
    }));
  };

  const clearMemorizedSpells = (spellLevel?: string) => {
    if (spellLevel !== undefined) {
      setMemorizedSpells((prev) => ({ ...prev, [spellLevel]: [] }));
    } else {
      setMemorizedSpells({});
    }
  };

  const loadFrom = (char: Character) => {
    setCombatStats(char.combatStats ?? {});
    setSaveBonuses(char.saveBonuses ?? {});
    setWeapons(char.weapons ?? []);
    setMemorizedSpells(char.combatStats?.memorizedSpells ?? {});
  };

  const reset = () => {
    setCombatStats({});
    setSaveBonuses({});
    setWeapons([]);
    setMemorizedSpells({});
  };

  return {
    combatStats,
    updateCombatStat,
    updateSpellSlotsMax,
    updateSpellSlotsUsed,
    resetSpellSlots,
    setMovementType,
    startCombat,
    endCombat,
    setCombatInitiative,
    advanceRound,
    saveBonuses,
    setSaveBonus,
    weapons,
    addWeapon,
    removeWeapon,
    updateWeapon,
    memorizedSpells,
    addMemorizedSpell,
    removeMemorizedSpell,
    clearMemorizedSpells,
    loadFrom,
    reset,
  };
}
