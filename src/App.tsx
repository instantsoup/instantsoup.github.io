import { AbilityGrid } from './components/AbilityGrid';
import { CharacterInfoPanel } from './components/CharacterInfoPanel';
import { ClassSelector } from './components/ClassSelector';
import { CombatStatsPanel } from './components/CombatStats';
import { DropZone } from './components/DropZone';
import { FeatsPanel } from './components/FeatsPanel';
import { LeftSidebar } from './components/LeftSidebar';
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
    className,
    setClassName,
    alignment,
    setAlignment,
    feats,
    addFeat,
    removeFeat,
    skillRanks,
    setSkillRank,
    saveBonuses,
    setSaveBonus,
    combatStats,
    updateCombatStat,
    onNum,
    persistLocal,
    exportJson,
    importFromFile,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
    error,
  } = useCharacter();

  return (
    <div className="app-grid">
      <LeftSidebar
        persistLocal={persistLocal}
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

        <DropZone onFile={importFromFile} />

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
        <ClassSelector className={className} setClassName={setClassName} onBlur={persistLocal} />

        <FeatsPanel
          selectedFeats={feats}
          onAddFeat={addFeat}
          onRemoveFeat={removeFeat}
          onBlur={persistLocal}
        />

        {/* Core statistics */}
        <AbilityGrid scores={scores} mods={mods} onNum={onNum} />

        <CombatStatsPanel
          mods={mods}
          combatStats={combatStats}
          updateCombatStat={updateCombatStat}
          onBlur={persistLocal}
        />

        <SavesPanel
          mods={mods}
          saveBonuses={saveBonuses}
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
