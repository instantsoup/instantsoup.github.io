import { useState } from 'react';

import type { Character, CombatStats, Weapon } from '../schema/schema';

export function useCharacterCombat(initial: Character) {
  const [combatStats, setCombatStats] = useState<CombatStats>(initial.combatStats ?? {});
  const [saveBonuses, setSaveBonuses] = useState<Record<string, number>>(initial.saveBonuses ?? {});
  const [weapons, setWeapons] = useState<Weapon[]>(initial.weapons ?? []);

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

  const setSaveBonus = (saveName: string, bonus: number) => {
    setSaveBonuses((prev) => ({ ...prev, [saveName]: Math.max(0, Math.min(99, bonus)) }));
  };

  const addWeapon = (w: Weapon) => setWeapons((prev) => [...prev, w]);
  const removeWeapon = (index: number) => setWeapons((prev) => prev.filter((_, i) => i !== index));
  const updateWeapon = (index: number, w: Weapon) =>
    setWeapons((prev) => prev.map((existing, i) => (i === index ? w : existing)));

  const loadFrom = (char: Character) => {
    setCombatStats(char.combatStats ?? {});
    setSaveBonuses(char.saveBonuses ?? {});
    setWeapons(char.weapons ?? []);
  };

  const reset = () => {
    setCombatStats({});
    setSaveBonuses({});
    setWeapons([]);
  };

  return {
    combatStats,
    updateCombatStat,
    updateSpellSlotsMax,
    updateSpellSlotsUsed,
    resetSpellSlots,
    setMovementType,
    saveBonuses,
    setSaveBonus,
    weapons,
    addWeapon,
    removeWeapon,
    updateWeapon,
    loadFrom,
    reset,
  };
}
