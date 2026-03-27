import { useMemo } from 'react';

import { computeConditionPenalties } from '../lib/conditions';
import { type Character, VERSION } from '../schema/schema';
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

  const identity = useCharacterIdentity(initial);
  // extras must be initialized before scoring so abilityDamage/conditionPenalties can flow into mods
  const extras = useCharacterExtras(initial);
  const conditionPenalties = useMemo(
    () => computeConditionPenalties(extras.statusEffects),
    [extras.statusEffects],
  );
  const scoring = useCharacterScores(initial, extras.abilityDamage, conditionPenalties);
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
    combatStats: combat.combatStats,
    flaws: extras.flaws,
    languages: extras.languages,
    taint: extras.taint,
    customResources: extras.customResources,
    notes: extras.notes || undefined,
    statusEffects: extras.statusEffects,
    abilityDamage: extras.abilityDamage,
    equipment: extras.equipment,
  });

  const loadAll = (char: Character) => {
    identity.loadFrom(char);
    scoring.loadFrom(char);
    leveling.loadFrom(char);
    combat.loadFrom(char);
    extras.loadFrom(char);
  };

  const resetAll = () => {
    identity.reset();
    scoring.reset();
    leveling.reset();
    combat.reset();
    extras.reset();
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
    saveBonuses: combat.saveBonuses,
    setSaveBonus: combat.setSaveBonus,

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
