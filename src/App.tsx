import { AbilityGrid } from './components/AbilityGrid';
import { CharacterInfoPanel } from './components/CharacterInfoPanel';
import { CombatStatsPanel } from './components/CombatStats';
import { LeftSidebar } from './components/LeftSidebar';
import { LevelsPanel } from './components/LevelsPanel';
import { SavesPanel } from './components/SavesPanel';
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

        {/* Core statistics */}
        <AbilityGrid scores={scores} mods={mods} onNum={onNum} />

        <CombatStatsPanel
          mods={mods}
          combatStats={combatStats}
          levels={levels}
          updateCombatStat={updateCombatStat}
          onBlur={persistLocal}
        />

        <SavesPanel
          mods={mods}
          saveBonuses={saveBonuses}
          levels={levels}
          setSaveBonus={setSaveBonus}
          onBlur={persistLocal}
        />

        <SkillsPanel
          mods={mods}
          skillRanks={skillRanks}
          setSkillRank={setSkillRank}
          onBlur={persistLocal}
        />

        {error && <p className="text-error mt-12">{error}</p>}
      </main>
    </div>
  );
}
