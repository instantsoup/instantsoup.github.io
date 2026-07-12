import { useState } from 'react';

import type {
  AbilityDamage,
  Character,
  Currency,
  CustomResource,
  EquipmentItem,
  StatusEffect,
  Taint,
} from '../schema/schema';
import { AbilityDamageSchema } from '../schema/schema';

type SkillMiscBonuses = Record<string, number>;

export function useCharacterExtras(initial: Character) {
  const [flaws, setFlaws] = useState<string[]>(initial.flaws ?? []);
  const [languages, setLanguages] = useState<string[]>(initial.languages ?? []);
  const [taint, setTaint] = useState<Taint | undefined>(initial.taint);
  const [customResources, setCustomResources] = useState<CustomResource[]>(
    initial.customResources ?? [],
  );
  const [notes, setNotes] = useState<string>(initial.notes ?? '');
  const [statusEffects, setStatusEffects] = useState<Record<string, StatusEffect>>(
    initial.statusEffects ?? {},
  );
  const [abilityDamage, setAbilityDamageState] = useState<AbilityDamage>(
    initial.abilityDamage ?? {},
  );
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initial.equipment ?? []);
  const [skillMiscBonuses, setSkillMiscBonusesState] = useState<SkillMiscBonuses>(
    initial.skillMiscBonuses ?? {},
  );
  const [xp, setXPState] = useState<number>(initial.xp ?? 0);
  const [currency, setCurrencyState] = useState<Currency>(
    initial.currency ?? { pp: 0, gp: 0, sp: 0, cp: 0 },
  );

  // Flaws
  const addFlaw = (flawName: string) =>
    setFlaws((prev) => (prev.includes(flawName) ? prev : [...prev, flawName]));
  const removeFlaw = (flawName: string) => setFlaws((prev) => prev.filter((f) => f !== flawName));

  // Languages
  const addLanguage = (lang: string) =>
    setLanguages((prev) => (prev.includes(lang) ? prev : [...prev, lang]));
  const removeLanguage = (lang: string) => setLanguages((prev) => prev.filter((l) => l !== lang));

  // Taint
  const enableTaint = () => setTaint({ depravity: 0, corruption: 0 });
  const disableTaint = () => setTaint(undefined);
  const updateTaint = (field: keyof Taint, value: number) =>
    setTaint((prev) => ({
      depravity: 0,
      corruption: 0,
      ...prev,
      [field]: Math.max(0, Math.min(9, value)),
    }));

  // Custom resources
  const addCustomResource = (resource: CustomResource) =>
    setCustomResources((prev) => [...prev, resource]);

  const removeCustomResource = (index: number) =>
    setCustomResources((prev) => prev.filter((_, i) => i !== index));

  const updateCustomResourceUsed = (index: number, used: number) =>
    setCustomResources((prev) =>
      prev.map((r, i) => (i === index ? { ...r, used: Math.max(0, Math.min(r.max, used)) } : r)),
    );

  const resetCustomResource = (index: number) =>
    setCustomResources((prev) => prev.map((r, i) => (i === index ? { ...r, used: 0 } : r)));

  const resetAllCustomResources = () =>
    setCustomResources((prev) => prev.map((r) => ({ ...r, used: 0 })));

  // Status effects
  const toggleStatusEffect = (name: string) =>
    setStatusEffects((prev) => {
      const current = prev[name];
      if (current?.active) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: { active: true } };
    });

  const setStatusEffectRounds = (name: string, rounds: number) =>
    setStatusEffects((prev) => ({
      ...prev,
      [name]: { ...prev[name], active: true, rounds: Math.max(0, rounds) },
    }));

  const clearAllStatusEffects = () => setStatusEffects({});

  const decrementStatusRounds = () =>
    setStatusEffects((prev) => {
      const next = { ...prev };
      for (const name of Object.keys(next)) {
        const effect = next[name];
        if (effect.active && effect.rounds !== undefined && effect.rounds > 0) {
          next[name] = { ...effect, rounds: effect.rounds - 1 };
        }
      }
      return next;
    });

  // Ability damage
  const setAbilityDamage = (key: keyof AbilityDamage, value: number) =>
    setAbilityDamageState((prev) => ({ ...prev, [key]: Math.max(0, value) }));

  // Equipment
  const addEquipment = (item: EquipmentItem) => setEquipment((prev) => [...prev, item]);

  const removeEquipment = (index: number) =>
    setEquipment((prev) => prev.filter((_, i) => i !== index));

  const toggleEquipped = (index: number) =>
    setEquipment((prev) =>
      prev.map((item, i) => (i === index ? { ...item, equipped: !item.equipped } : item)),
    );

  const setEquipmentNotes = (index: number, notes: string) =>
    setEquipment((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes: notes || undefined } : item)),
    );

  const setEquipmentWeight = (index: number, weight: number) =>
    setEquipment((prev) =>
      prev.map((item, i) => (i === index ? { ...item, weight: Math.max(0, weight) } : item)),
    );

  const setXP = (value: number) => setXPState(Math.max(0, value));

  const setCurrencyField = (field: keyof Currency, value: number) =>
    setCurrencyState((prev) => ({ ...prev, [field]: Math.max(0, value) }));

  const setSkillMiscBonus = (name: string, bonus: number) =>
    setSkillMiscBonusesState((prev) =>
      bonus === 0
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name))
        : { ...prev, [name]: bonus },
    );

  const loadFrom = (char: Character) => {
    setFlaws(char.flaws ?? []);
    setLanguages(char.languages ?? []);
    setTaint(char.taint);
    setCustomResources(char.customResources ?? []);
    setNotes(char.notes ?? '');
    setStatusEffects(char.statusEffects ?? {});
    setAbilityDamageState(char.abilityDamage ?? {});
    setEquipment(char.equipment ?? []);
    setSkillMiscBonusesState(char.skillMiscBonuses ?? {});
    setXPState(char.xp ?? 0);
    setCurrencyState(char.currency ?? { pp: 0, gp: 0, sp: 0, cp: 0 });
  };

  const reset = () => {
    setFlaws([]);
    setLanguages([]);
    setTaint(undefined);
    setCustomResources([]);
    setNotes('');
    setStatusEffects({});
    setAbilityDamageState(AbilityDamageSchema.parse({}));
    setEquipment([]);
    setSkillMiscBonusesState({});
    setXPState(0);
    setCurrencyState({ pp: 0, gp: 0, sp: 0, cp: 0 });
  };

  return {
    flaws,
    addFlaw,
    removeFlaw,
    languages,
    addLanguage,
    removeLanguage,
    taint,
    enableTaint,
    disableTaint,
    updateTaint,
    customResources,
    addCustomResource,
    removeCustomResource,
    updateCustomResourceUsed,
    resetCustomResource,
    resetAllCustomResources,
    notes,
    setNotes,
    statusEffects,
    toggleStatusEffect,
    setStatusEffectRounds,
    clearAllStatusEffects,
    decrementStatusRounds,
    abilityDamage,
    setAbilityDamage,
    equipment,
    addEquipment,
    removeEquipment,
    toggleEquipped,
    setEquipmentNotes,
    setEquipmentWeight,
    skillMiscBonuses,
    setSkillMiscBonus,
    xp,
    setXP,
    currency,
    setCurrencyField,
    loadFrom,
    reset,
  };
}
