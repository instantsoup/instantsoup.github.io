import { useState } from 'react';

import { AbilityGrid } from './components/AbilityGrid';
import { AlignmentSelector } from './components/AlignmentSelector';
import { CombatStatsPanel } from './components/CombatStats';
import { FeatsSummary } from './components/FeatsSummary';
import { FlawsPanel } from './components/FlawsPanel';
import { LanguagesPanel } from './components/LanguagesPanel';
import { LeftSidebar } from './components/LeftSidebar';
import { LevelsPanel } from './components/LevelsPanel';
import { NotesPanel } from './components/NotesPanel';
import { PanelSection } from './components/PanelSection';
import { PlaySheet } from './components/PlaySheet';
import { RaceSelector } from './components/RaceSelector';
import { SavesPanel } from './components/SavesPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { SpellSlotsPanel } from './components/SpellSlotsPanel';
import { SpellsSummary } from './components/SpellsSummary';
import { type Tab, TabNav } from './components/TabNav';
import { TaintPanel } from './components/TaintPanel';
import { WeaponsPanel } from './components/WeaponsPanel';
import { useCharacter } from './hooks/useCharacter';
import { getEncumbranceSummary } from './lib/encumbrance';
import { calculateTotalBAB, getRacialMods, xpForLevel } from './lib/progressions';

export function App() {
  const [tab, setTab] = useState<Tab>('character');
  const [mode, setMode] = useState<'build' | 'play'>('build');

  const {
    name,
    setName,
    race,
    setRace,
    alignment,
    setAlignment,
    age,
    setAge,
    height,
    setHeight,
    weight,
    setWeight,
    deity,
    setDeity,
    homeland,
    setHomeland,
    scores,
    mods,
    effectiveScores,
    levels,
    addLevel,
    removeLevel,
    updateLevelClass,
    addFeatToLevel,
    removeFeatFromLevel,
    addSpellToLevel,
    removeSpellFromLevel,
    updateLevelSkillRanks,
    saveBonuses,
    setSaveBonus,
    combatStats,
    updateCombatStat,
    updateSpellSlotsMax,
    updateSpellSlotsUsed,
    resetSpellSlots,
    setMovementType,
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
    conditionPenalties,
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
    weapons,
    addWeapon,
    removeWeapon,
    updateWeapon,
    onNum,
    persistLocal,
    exportJson,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
    error,
  } = useCharacter();

  const toggleMode = () => {
    setMode((m) => {
      setTab('character');
      return m === 'build' ? 'play' : 'build';
    });
  };

  return (
    <div className="app-grid">
      <LeftSidebar
        exportJson={exportJson}
        onPickFile={() => {
          onPickFile?.();
        }}
        onFileChange={onFileChange}
        fileInputRef={fileInputRef}
        resetAll={resetAll}
      />

      <div className="app-content">
        <header className="app-header">
          <h1 className="app-title">D&amp;D 3.5e Character Sheet</h1>
        </header>

        <TabNav active={tab} onSelect={setTab} mode={mode} onModeToggle={toggleMode} />

        <main className="app-main">
          {/* ── CHARACTER ────────────────────────────── */}
          {tab === 'character' && mode === 'play' && (
            <div className="tab-content">
              <PlaySheet
                name={name}
                race={race}
                alignment={alignment}
                deity={deity}
                homeland={homeland}
                xp={xp}
                setXP={setXP}
                currency={currency}
                setCurrencyField={setCurrencyField}
                scores={scores}
                effectiveScores={effectiveScores}
                mods={mods}
                combatStats={combatStats}
                levels={levels}
                saveBonuses={saveBonuses}
                customResources={customResources}
                statusEffects={statusEffects}
                conditionPenalties={conditionPenalties}
                abilityDamage={abilityDamage}
                equipment={equipment}
                notes={notes}
                updateCombatStat={updateCombatStat}
                addCustomResource={addCustomResource}
                removeCustomResource={removeCustomResource}
                updateCustomResourceUsed={updateCustomResourceUsed}
                resetCustomResource={resetCustomResource}
                resetAllCustomResources={resetAllCustomResources}
                toggleStatusEffect={toggleStatusEffect}
                setStatusEffectRounds={setStatusEffectRounds}
                clearAllStatusEffects={clearAllStatusEffects}
                setAbilityDamage={setAbilityDamage}
                addEquipment={addEquipment}
                removeEquipment={removeEquipment}
                toggleEquipped={toggleEquipped}
                setEquipmentNotes={setEquipmentNotes}
                setEquipmentWeight={setEquipmentWeight}
                str={scores.str}
                skillMiscBonuses={skillMiscBonuses}
                setSkillMiscBonus={setSkillMiscBonus}
                weapons={weapons}
                addWeapon={addWeapon}
                removeWeapon={removeWeapon}
                updateWeapon={updateWeapon}
                setNotes={setNotes}
                onBlur={persistLocal}
              />
            </div>
          )}

          {tab === 'character' && mode === 'build' && (
            <div className="tab-content">
              <PanelSection title="Name" defaultOpen>
                <div className="selector">
                  <input
                    className="selector-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={persistLocal}
                    placeholder="Enter character name..."
                  />
                </div>
              </PanelSection>

              <PanelSection title="Race" defaultOpen>
                <RaceSelector race={race} setRace={setRace} onBlur={persistLocal} />
              </PanelSection>

              <PanelSection title="Alignment" defaultOpen>
                <AlignmentSelector
                  alignment={alignment}
                  setAlignment={setAlignment}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Character Details" defaultOpen>
                <div className="selector">
                  <h3 className="panel-title">Age</h3>
                  <input
                    type="number"
                    className="selector-input"
                    value={age ?? ''}
                    onChange={(e) =>
                      setAge(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    onBlur={persistLocal}
                    placeholder="e.g. 34"
                    min="0"
                  />
                </div>
                <div className="selector">
                  <h3 className="panel-title">Height</h3>
                  <input
                    type="text"
                    className="selector-input"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    onBlur={persistLocal}
                    placeholder='e.g. 5&apos;8"'
                  />
                </div>
                <div className="selector">
                  <h3 className="panel-title">Weight</h3>
                  <input
                    type="text"
                    className="selector-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onBlur={persistLocal}
                    placeholder="e.g. 160 lbs"
                  />
                </div>
                <div className="selector">
                  <h3 className="panel-title">Deity</h3>
                  <input
                    type="text"
                    className="selector-input"
                    value={deity}
                    onChange={(e) => setDeity(e.target.value)}
                    onBlur={persistLocal}
                    placeholder="e.g. Pelor"
                  />
                </div>
                <div className="selector">
                  <h3 className="panel-title">Homeland</h3>
                  <input
                    type="text"
                    className="selector-input"
                    value={homeland}
                    onChange={(e) => setHomeland(e.target.value)}
                    onBlur={persistLocal}
                    placeholder="e.g. Waterdeep"
                  />
                </div>
              </PanelSection>

              <PanelSection title="Flaws" defaultOpen>
                <FlawsPanel
                  selected={flaws}
                  onAdd={addFlaw}
                  onRemove={removeFlaw}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Languages" defaultOpen>
                <LanguagesPanel
                  selected={languages}
                  onAdd={addLanguage}
                  onRemove={removeLanguage}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Taint / Corruption" defaultOpen>
                <TaintPanel
                  taint={taint}
                  onEnable={enableTaint}
                  onDisable={disableTaint}
                  onUpdate={updateTaint}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Notes" defaultOpen>
                <NotesPanel notes={notes} setNotes={setNotes} onBlur={persistLocal} />
              </PanelSection>

              <PanelSection title="Experience & Currency" defaultOpen>
                <div className="selector">
                  <h3 className="panel-title">
                    XP (next level: {xpForLevel(levels.length + 1).toLocaleString()})
                  </h3>
                  <input
                    type="number"
                    className="selector-input"
                    value={xp}
                    onChange={(e) => setXP(parseInt(e.target.value) || 0)}
                    onBlur={persistLocal}
                    min="0"
                  />
                </div>
                <div className="selector">
                  <h3 className="panel-title">Currency</h3>
                  <div className="currency-inputs">
                    {(['pp', 'gp', 'sp', 'cp'] as const).map((coin) => (
                      <label key={coin} className="currency-inputs__field">
                        <span className="currency-inputs__label">{coin.toUpperCase()}</span>
                        <input
                          type="number"
                          className="currency-inputs__input"
                          value={currency[coin]}
                          onChange={(e) =>
                            setCurrencyField(coin, parseInt(e.target.value) || 0)
                          }
                          onBlur={persistLocal}
                          min="0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </PanelSection>
            </div>
          )}

          {/* ── BUILD (build mode only) ───────────────── */}
          {tab === 'build' && (
            <div className="tab-content">
              <PanelSection title="Abilities" defaultOpen>
                <AbilityGrid
                  scores={scores}
                  mods={mods}
                  onNum={onNum}
                  racialMods={getRacialMods(race)}
                />
              </PanelSection>

              <PanelSection title="Levels" defaultOpen>
                <LevelsPanel
                  levels={levels}
                  addLevel={addLevel}
                  removeLevel={removeLevel}
                  updateLevelClass={updateLevelClass}
                  addFeatToLevel={addFeatToLevel}
                  removeFeatFromLevel={removeFeatFromLevel}
                  addSpellToLevel={addSpellToLevel}
                  removeSpellFromLevel={removeSpellFromLevel}
                  updateLevelSkillRanks={updateLevelSkillRanks}
                  intModifier={mods.int}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Armor Class, Initiative & BAB" defaultOpen>
                <CombatStatsPanel
                  mods={mods}
                  combatStats={combatStats}
                  levels={levels}
                  updateCombatStat={updateCombatStat}
                  setMovementType={setMovementType}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Saving Throws" defaultOpen>
                <SavesPanel
                  mods={mods}
                  saveBonuses={saveBonuses}
                  levels={levels}
                  setSaveBonus={setSaveBonus}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Spell Slots" defaultOpen={false}>
                <SpellSlotsPanel
                  combatStats={combatStats}
                  updateSpellSlotsMax={updateSpellSlotsMax}
                  updateSpellSlotsUsed={updateSpellSlotsUsed}
                  resetSpellSlots={resetSpellSlots}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Feats" defaultOpen={false}>
                <FeatsSummary levels={levels} />
              </PanelSection>

              <PanelSection title="Known Spells" defaultOpen={false}>
                <SpellsSummary levels={levels} />
              </PanelSection>

              <PanelSection title="Weapons" defaultOpen={false}>
                <WeaponsPanel
                  weapons={weapons}
                  mods={mods}
                  bab={calculateTotalBAB(levels).total}
                  conditionAttackPenalty={conditionPenalties.attack ?? 0}
                  onAdd={addWeapon}
                  onRemove={removeWeapon}
                  onUpdate={updateWeapon}
                  onBlur={persistLocal}
                />
              </PanelSection>
            </div>
          )}

          {/* ── SKILLS (play mode only) ──────────────── */}
          {tab === 'skills' && (
            <div className="tab-content">
              <SkillsPanel
                mods={mods}
                levels={levels}
                acp={
                  getEncumbranceSummary(
                    equipment,
                    scores.str,
                    combatStats.armorCheckPenalty ?? 0,
                    combatStats.movementSpeed ?? 30,
                  ).totalACP
                }
                miscBonuses={skillMiscBonuses}
                onSetMiscBonus={setSkillMiscBonus}
                onBlur={persistLocal}
                readOnly
              />
            </div>
          )}

          {/* ── SPELLS (play mode only) ──────────────── */}
          {tab === 'spells' && (
            <div className="tab-content">
              <PanelSection title="Spell Slots" defaultOpen>
                <SpellSlotsPanel
                  combatStats={combatStats}
                  updateSpellSlotsMax={updateSpellSlotsMax}
                  updateSpellSlotsUsed={updateSpellSlotsUsed}
                  resetSpellSlots={resetSpellSlots}
                  onBlur={persistLocal}
                  readOnly={true}
                />
              </PanelSection>

              <PanelSection title="Known Spells" defaultOpen={false}>
                <SpellsSummary levels={levels} />
              </PanelSection>
            </div>
          )}

          {error && <p className="text-error mt-12">{error}</p>}
        </main>
      </div>
    </div>
  );
}
