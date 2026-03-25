import { useState } from 'react';

import { AbilityGrid } from './components/AbilityGrid';
import { AlignmentSelector } from './components/AlignmentSelector';
import { CombatStatsPanel } from './components/CombatStats';
import { FeatsSummary } from './components/FeatsSummary';
import { FlawsPanel } from './components/FlawsPanel';
import { HPTracker } from './components/HPTracker';
import { LanguagesPanel } from './components/LanguagesPanel';
import { LeftSidebar } from './components/LeftSidebar';
import { LevelsPanel } from './components/LevelsPanel';
import { NotesPanel } from './components/NotesPanel';
import { PanelSection } from './components/PanelSection';
import { PlaySheet } from './components/PlaySheet';
import { RaceSelector } from './components/RaceSelector';
import { ResourceTracker } from './components/ResourceTracker';
import { SavesPanel } from './components/SavesPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { SpellSlotsPanel } from './components/SpellSlotsPanel';
import { SpellsSummary } from './components/SpellsSummary';
import { StickyBar } from './components/StickyBar';
import { type Tab, TabNav } from './components/TabNav';
import { TaintPanel } from './components/TaintPanel';
import { useCharacter } from './hooks/useCharacter';

export function App() {
  const [tab, setTab] = useState<Tab>('character');
  const [mode, setMode] = useState<'build' | 'play'>('build');

  const {
    name,
    setName,
    scores,
    mods,
    race,
    setRace,
    levels,
    addLevel,
    removeLevel,
    updateLevelClass,
    addFeatToLevel,
    removeFeatFromLevel,
    addSpellToLevel,
    removeSpellFromLevel,
    updateLevelSkillRanks,
    alignment,
    setAlignment,
    saveBonuses,
    setSaveBonus,
    combatStats,
    updateCombatStat,
    updateSpellSlotsMax,
    updateSpellSlotsUsed,
    resetSpellSlots,
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
      if (m === 'build') {
        setTab('sheet');
        return 'play';
      } else {
        setTab('character');
        return 'build';
      }
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

        <StickyBar
          name={name}
          mods={mods}
          combatStats={combatStats}
          levels={levels}
          saveBonuses={saveBonuses}
          mode={mode}
          onModeToggle={toggleMode}
        />

        <TabNav active={tab} onSelect={setTab} mode={mode} />

        <main className="app-main">
          {/* ── CHARACTER (build mode only) ───────────── */}
          {tab === 'character' && (
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
            </div>
          )}

          {/* ── BUILD (build mode only) ───────────────── */}
          {tab === 'build' && (
            <div className="tab-content">
              <PanelSection title="Abilities" defaultOpen>
                <AbilityGrid scores={scores} mods={mods} onNum={onNum} />
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
            </div>
          )}

          {/* ── SHEET (play mode only) ───────────────── */}
          {tab === 'sheet' && (
            <div className="tab-content">
              <PlaySheet
                name={name}
                race={race}
                alignment={alignment}
                mods={mods}
                combatStats={combatStats}
                levels={levels}
                saveBonuses={saveBonuses}
                customResources={customResources}
                updateCombatStat={updateCombatStat}
                updateSpellSlotsMax={updateSpellSlotsMax}
                updateSpellSlotsUsed={updateSpellSlotsUsed}
                resetSpellSlots={resetSpellSlots}
                addCustomResource={addCustomResource}
                removeCustomResource={removeCustomResource}
                updateCustomResourceUsed={updateCustomResourceUsed}
                resetCustomResource={resetCustomResource}
                resetAllCustomResources={resetAllCustomResources}
                onBlur={persistLocal}
              />
            </div>
          )}

          {/* ── COMBAT (play mode only) ──────────────── */}
          {tab === 'combat' && (
            <div className="tab-content">
              <PanelSection title="Hit Points" defaultOpen>
                <HPTracker
                  mods={mods}
                  combatStats={combatStats}
                  levels={levels}
                  updateCombatStat={updateCombatStat}
                  onBlur={persistLocal}
                />
              </PanelSection>

              <PanelSection title="Resources" defaultOpen>
                <ResourceTracker
                  resources={customResources}
                  onAdd={addCustomResource}
                  onRemove={removeCustomResource}
                  onUse={updateCustomResourceUsed}
                  onReset={resetCustomResource}
                  onResetAll={resetAllCustomResources}
                  onBlur={persistLocal}
                />
              </PanelSection>
            </div>
          )}

          {/* ── SKILLS (play mode only) ──────────────── */}
          {tab === 'skills' && (
            <div className="tab-content">
              <SkillsPanel mods={mods} levels={levels} readOnly={true} />
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
