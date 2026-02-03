import { AbilityGrid } from './components/AbilityGrid';
import { AlignmentSelector } from './components/AlignmentSelector';
import { CombatStatsPanel } from './components/CombatStats';
import { LeftSidebar } from './components/LeftSidebar';
import { LevelsPanel } from './components/LevelsPanel';
import { PanelSection } from './components/PanelSection';
import { RaceSelector } from './components/RaceSelector';
import { SavesPanel } from './components/SavesPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { SpellsPanel } from './components/SpellsPanel';
import { useCharacter } from './hooks/useCharacter';

export function App() {
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
    updateLevelSkillRanks,
    alignment,
    setAlignment,
    spells,
    addSpell,
    removeSpell,
    saveBonuses,
    setSaveBonus,
    combatStats,
    updateCombatStat,
    onNum,
    persistLocal,
    exportJson,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
    error,
  } = useCharacter();

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

      <main className="app-main">
        <header className="app-header">
          <h1 className="app-title">D&D 3.5e Character Builder</h1>
        </header>

        {/* Name */}
        <PanelSection title="Name" defaultOpen={false}>
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

        {/* Race */}
        <PanelSection title="Race" defaultOpen={false}>
          <RaceSelector race={race} setRace={setRace} onBlur={persistLocal} />
        </PanelSection>

        {/* Alignment */}
        <PanelSection title="Alignment" defaultOpen={false}>
          <AlignmentSelector
            alignment={alignment}
            setAlignment={setAlignment}
            onBlur={persistLocal}
          />
        </PanelSection>

        {/* Abilities */}
        <PanelSection title="Abilities" defaultOpen={false}>
          <AbilityGrid scores={scores} mods={mods} onNum={onNum} />
        </PanelSection>

        {/* Combat Stats */}
        <PanelSection title="Combat" defaultOpen={false}>
          <CombatStatsPanel
            mods={mods}
            combatStats={combatStats}
            levels={levels}
            updateCombatStat={updateCombatStat}
            onBlur={persistLocal}
          />
        </PanelSection>

        {/* Saving Throws */}
        <PanelSection title="Saves" defaultOpen={false}>
          <SavesPanel
            mods={mods}
            saveBonuses={saveBonuses}
            levels={levels}
            setSaveBonus={setSaveBonus}
            onBlur={persistLocal}
          />
        </PanelSection>

        {/* Skills */}
        <PanelSection title="Skills" defaultOpen={false}>
          <SkillsPanel mods={mods} levels={levels} />
        </PanelSection>

        {/* Spells */}
        <PanelSection title="Spells" defaultOpen={false}>
          <SpellsPanel
            selectedSpells={spells}
            onAddSpell={addSpell}
            onRemoveSpell={removeSpell}
            onBlur={persistLocal}
          />
        </PanelSection>

        {/* Levels - at bottom */}
        <PanelSection title="Levels" defaultOpen={false}>
          <LevelsPanel
            levels={levels}
            addLevel={addLevel}
            removeLevel={removeLevel}
            updateLevelClass={updateLevelClass}
            addFeatToLevel={addFeatToLevel}
            removeFeatFromLevel={removeFeatFromLevel}
            updateLevelSkillRanks={updateLevelSkillRanks}
            intModifier={mods.int}
            onBlur={persistLocal}
          />
        </PanelSection>

        {error && <p className="text-error mt-12">{error}</p>}
      </main>
    </div>
  );
}
