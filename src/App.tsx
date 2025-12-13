import { CharacterInfoPanel } from './components/CharacterInfoPanel';
import { CharacterStatsPanel } from './components/CharacterStatsPanel';
import { LeftSidebar } from './components/LeftSidebar';
import { LevelsPanel } from './components/LevelsPanel';
import { PanelSection } from './components/PanelSection';
import { SkillsPanel } from './components/SkillsPanel';
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
    alignment,
    setAlignment,
    skillRanks,
    setSkillRank,
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

        {/* Character Identity - metadata set at level 1 */}
        <CharacterInfoPanel
          name={name}
          setName={setName}
          race={race}
          setRace={setRace}
          alignment={alignment}
          setAlignment={setAlignment}
          onBlur={persistLocal}
        />

        {/* Level-dependent character building */}
        <LevelsPanel
          levels={levels}
          addLevel={addLevel}
          removeLevel={removeLevel}
          updateLevelClass={updateLevelClass}
          addFeatToLevel={addFeatToLevel}
          removeFeatFromLevel={removeFeatFromLevel}
          onBlur={persistLocal}
        />

        {/* Character Stats - Abilities, Combat, Saves */}
        <CharacterStatsPanel
          scores={scores}
          mods={mods}
          onNum={onNum}
          combatStats={combatStats}
          levels={levels}
          updateCombatStat={updateCombatStat}
          saveBonuses={saveBonuses}
          setSaveBonus={setSaveBonus}
          onBlur={persistLocal}
        />

        {/* Skills - Collapsible */}
        <PanelSection title="Skills" defaultOpen={false}>
          <SkillsPanel
            mods={mods}
            skillRanks={skillRanks}
            setSkillRank={setSkillRank}
            onBlur={persistLocal}
          />
        </PanelSection>

        {error && <p className="text-error mt-12">{error}</p>}
      </main>
    </div>
  );
}
