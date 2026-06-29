import { useMemo, useState } from 'react';

import { computeConditionPenalties } from '../lib/conditions';
import { type Character, type SpellbookEntry, VERSION } from '../schema/schema';
import { loadLocal } from '../store/local';
import { useCharacterCombat } from './useCharacterCombat';
import { useCharacterExtras } from './useCharacterExtras';
import { useCharacterIdentity } from './useCharacterIdentity';
import { useCharacterLevels } from './useCharacterLevels';
import { useCharacterPersistence } from './useCharacterPersistence';
import { useCharacterScores } from './useCharacterScores';

/**
 * Composes all character sub-hooks and wires persistence.
 * Each sub-hook owns a single concern; this hook assembles the full public API.
 */
export function useCharacter() {
  const initial = loadLocal();

  const [spellbook, setSpellbook] = useState<SpellbookEntry[]>(initial.spellbook ?? []);
  const [wizardSpecialty, setWizardSpecialty] = useState<string | undefined>(
    initial.wizardSpecialty,
  );
  const [wizardForbiddenSchools, setWizardForbiddenSchools] = useState<string[]>(
    initial.wizardForbiddenSchools ?? [],
  );

  const addSpellbookEntry = (entry: SpellbookEntry) => {
    setSpellbook((prev) => [...prev, entry]);
  };

  const removeSpellbookEntry = (spellName: string) => {
    setSpellbook((prev) => prev.filter((e) => e.spellName !== spellName));
  };

  const identity = useCharacterIdentity(initial);
  // extras must be initialized before scoring so abilityDamage/conditionPenalties can flow into mods
  const extras = useCharacterExtras(initial);
  const conditionPenalties = useMemo(
    () => computeConditionPenalties(extras.statusEffects),
    [extras.statusEffects],
  );
  const scoring = useCharacterScores(
    initial,
    extras.abilityDamage,
    conditionPenalties,
    identity.race,
  );
  const leveling = useCharacterLevels(initial, scoring.mods.int);
  const combat = useCharacterCombat(initial);

  const getCurrent = (): Character => ({
    version: VERSION,
    name: identity.name,
    scores: scoring.scores,
    race: identity.race,
    levels: leveling.levels,
    alignment: identity.alignment,
    saveBonuses: combat.saveBonuses,
    combatStats: {
      ...combat.combatStats,
      memorizedSpells: combat.memorizedSpells,
      memorizedSpellsUsed: combat.memorizedSpellsUsed,
    },
    flaws: extras.flaws,
    languages: extras.languages,
    taint: extras.taint,
    customResources: extras.customResources,
    notes: extras.notes || undefined,
    statusEffects: extras.statusEffects,
    abilityDamage: extras.abilityDamage,
    equipment: extras.equipment,
    weapons: combat.weapons,
    skillMiscBonuses: extras.skillMiscBonuses,
    age: identity.age,
    height: identity.height || undefined,
    weight: identity.weight || undefined,
    deity: identity.deity || undefined,
    homeland: identity.homeland || undefined,
    xp: extras.xp,
    currency: extras.currency,
    spellbook,
    wizardSpecialty,
    wizardForbiddenSchools,
  });

  const loadAll = (char: Character) => {
    identity.loadFrom(char);
    scoring.loadFrom(char);
    leveling.loadFrom(char);
    combat.loadFrom(char);
    extras.loadFrom(char);
    setSpellbook(char.spellbook ?? []);
    setWizardSpecialty(char.wizardSpecialty);
    setWizardForbiddenSchools(char.wizardForbiddenSchools ?? []);
  };

  const resetAll = () => {
    identity.reset();
    scoring.reset();
    leveling.reset();
    combat.reset();
    extras.reset();
    setSpellbook([]);
    setWizardSpecialty(undefined);
    setWizardForbiddenSchools([]);
  };

  const persistence = useCharacterPersistence(getCurrent, loadAll, resetAll);

  return {
    // Identity
    name: identity.name,
    setName: identity.setName,
    race: identity.race,
    setRace: identity.setRace,
    alignment: identity.alignment,
    setAlignment: identity.setAlignment,
    age: identity.age,
    setAge: identity.setAge,
    height: identity.height,
    setHeight: identity.setHeight,
    weight: identity.weight,
    setWeight: identity.setWeight,
    deity: identity.deity,
    setDeity: identity.setDeity,
    homeland: identity.homeland,
    setHomeland: identity.setHomeland,

    // Scores
    scores: scoring.scores,
    setScores: scoring.setScores,
    mods: scoring.mods,
    effectiveScores: scoring.effectiveScores,
    onNum: scoring.onNum,

    // Levels
    levels: leveling.levels,
    addLevel: leveling.addLevel,
    removeLevel: leveling.removeLevel,
    updateLevelClass: leveling.updateLevelClass,
    addFeatToLevel: leveling.addFeatToLevel,
    removeFeatFromLevel: leveling.removeFeatFromLevel,
    addSpellToLevel: leveling.addSpellToLevel,
    removeSpellFromLevel: leveling.removeSpellFromLevel,
    updateLevelSkillRanks: leveling.updateLevelSkillRanks,

    // Combat
    combatStats: combat.combatStats,
    updateCombatStat: combat.updateCombatStat,
    updateSpellSlotsMax: combat.updateSpellSlotsMax,
    updateSpellSlotsUsed: combat.updateSpellSlotsUsed,
    resetSpellSlots: combat.resetSpellSlots,
    setMovementType: combat.setMovementType,
    startCombat: combat.startCombat,
    endCombat: combat.endCombat,
    setCombatInitiative: combat.setCombatInitiative,
    onAdvanceRound: () => {
      combat.advanceRound();
      extras.decrementStatusRounds();
    },
    saveBonuses: combat.saveBonuses,
    setSaveBonus: combat.setSaveBonus,
    memorizedSpells: combat.memorizedSpells,
    memorizedSpellsUsed: combat.memorizedSpellsUsed,
    addMemorizedSpell: combat.addMemorizedSpell,
    removeMemorizedSpell: combat.removeMemorizedSpell,
    clearMemorizedSpells: combat.clearMemorizedSpells,
    castMemorizedSpell: combat.castMemorizedSpell,
    uncastMemorizedSpell: combat.uncastMemorizedSpell,
    newDaySpells: combat.newDaySpells,
    spellbook,
    addSpellbookEntry,
    removeSpellbookEntry,
    wizardSpecialty,
    setWizardSpecialty,
    wizardForbiddenSchools,
    setWizardForbiddenSchools,

    // Extras
    flaws: extras.flaws,
    addFlaw: extras.addFlaw,
    removeFlaw: extras.removeFlaw,
    languages: extras.languages,
    addLanguage: extras.addLanguage,
    removeLanguage: extras.removeLanguage,
    taint: extras.taint,
    enableTaint: extras.enableTaint,
    disableTaint: extras.disableTaint,
    updateTaint: extras.updateTaint,
    customResources: extras.customResources,
    addCustomResource: extras.addCustomResource,
    removeCustomResource: extras.removeCustomResource,
    updateCustomResourceUsed: extras.updateCustomResourceUsed,
    resetCustomResource: extras.resetCustomResource,
    resetAllCustomResources: extras.resetAllCustomResources,
    notes: extras.notes,
    setNotes: extras.setNotes,
    statusEffects: extras.statusEffects,
    toggleStatusEffect: extras.toggleStatusEffect,
    setStatusEffectRounds: extras.setStatusEffectRounds,
    clearAllStatusEffects: extras.clearAllStatusEffects,
    conditionPenalties,
    abilityDamage: extras.abilityDamage,
    setAbilityDamage: extras.setAbilityDamage,
    equipment: extras.equipment,
    addEquipment: extras.addEquipment,
    removeEquipment: extras.removeEquipment,
    toggleEquipped: extras.toggleEquipped,
    setEquipmentNotes: extras.setEquipmentNotes,
    setEquipmentWeight: extras.setEquipmentWeight,
    skillMiscBonuses: extras.skillMiscBonuses,
    setSkillMiscBonus: extras.setSkillMiscBonus,
    xp: extras.xp,
    setXP: extras.setXP,
    currency: extras.currency,
    setCurrencyField: extras.setCurrencyField,
    weapons: combat.weapons,
    addWeapon: combat.addWeapon,
    removeWeapon: combat.removeWeapon,
    updateWeapon: combat.updateWeapon,

    // Persistence
    error: persistence.error,
    setError: persistence.setError,
    persistLocal: persistence.persistLocal,
    exportJson: persistence.exportJson,
    importFromFile: persistence.importFromFile,
    onPickFile: persistence.onPickFile,
    onFileChange: persistence.onFileChange,
    fileInputRef: persistence.fileInputRef,
    resetAll: persistence.resetAll,
  };
}
