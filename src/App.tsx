import { useEffect, useMemo, useState } from 'react';

import { AbilityGrid } from './components/AbilityGrid';
import { AlignmentSelector } from './components/AlignmentSelector';
import { CombatStatsPanel } from './components/CombatStats';
import { FeatsSummary } from './components/FeatsSummary';
import { FlawsPanel } from './components/FlawsPanel';
import { LanguagesPanel } from './components/LanguagesPanel';
import { LeftSidebar } from './components/LeftSidebar';
import { LevelsPanel } from './components/LevelsPanel';
import { MemorizedSpellsPanel } from './components/MemorizedSpellsPanel';
import { NotesPanel } from './components/NotesPanel';
import { PanelSection } from './components/PanelSection';
import { PlaySheet } from './components/PlaySheet';
import { PreparedSpellsPanel } from './components/PreparedSpellsPanel';
import { RaceSelector } from './components/RaceSelector';
import { SkillsPanel } from './components/SkillsPanel';
import { SpellbookPanel } from './components/SpellbookPanel';
import { SpellSlotsPanel } from './components/SpellSlotsPanel';
import { SpellsSummary } from './components/SpellsSummary';
import { type Tab, TabNav } from './components/TabNav';
import { TaintPanel } from './components/TaintPanel';
import { WeaponsPanel } from './components/WeaponsPanel';
import { findClassProgression } from './data/class-progressions';
import { allSpells } from './data/spells';
import { useCharacter } from './hooks/useCharacter';
import { getEncumbranceSummary } from './lib/encumbrance';
import {
  calculateSpellSlots,
  calculateTotalBAB,
  getCasterSummary,
  getRacialMods,
  xpForLevel,
} from './lib/progressions';

export function App() {
  const [tab, setTab] = useState<Tab>('character');
  const [mode, setMode] = useState<'build' | 'play'>('play');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    combatStats,
    updateCombatStat,
    updateSpellSlotsMax,
    updateSpellSlotsUsed,
    resetSpellSlots,
    setMovementType,
    startCombat,
    endCombat,
    setCombatInitiative,
    onAdvanceRound,
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
    memorizedSpells,
    memorizedSpellsUsed,
    addMemorizedSpell,
    removeMemorizedSpell,
    clearMemorizedSpells,
    castMemorizedSpell,
    uncastMemorizedSpell,
    newDaySpells,
    spellbook,
    addSpellbookEntry,
    removeSpellbookEntry,
    wizardSpecialty,
    setWizardSpecialty,
    wizardForbiddenSchools,
    setWizardForbiddenSchools,
    onNum,
    persistLocal,
    exportJson,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll,
    error,
  } = useCharacter();

  // Spell system derived values
  const calculatedSlots = calculateSpellSlots(levels, effectiveScores);
  // Specialist wizards get +1 slot per accessible spell level for their specialty school
  const effectiveSlots = wizardSpecialty
    ? Object.fromEntries(Object.entries(calculatedSlots).map(([k, v]) => [k, v + 1]))
    : calculatedSlots;
  const casterSummary = getCasterSummary(levels, effectiveScores);
  const primaryCaster = casterSummary[0] ?? null;
  const primaryCastingMod = primaryCaster?.castingMod;
  const isPreparedCaster = casterSummary.some((c) => c.castingType === 'prepared');
  const isWizardCharacter = levels.some(
    (l) => l.class === 'Wizard' || l.class === 'Tainted Scholar',
  );
  const accessibleSpellLevels = Object.keys(effectiveSlots);

  // For non-wizard prepared casters: build class spell list keyed by spell level
  const primaryPreparedClass = casterSummary.find((c) => c.castingType === 'prepared');
  const classSpellsByLevel = useMemo(() => {
    if (isWizardCharacter || !primaryPreparedClass) return {};
    const prog = findClassProgression(primaryPreparedClass.className);
    if (!prog?.spellListKey) return {};
    const key = prog.spellListKey;
    const byLevel: Record<string, { name: string; school: string }[]> = {};
    for (const spell of allSpells) {
      const lvl = spell.levels[key];
      if (lvl === undefined) continue;
      const k = String(lvl);
      (byLevel[k] ??= []).push({ name: spell.name, school: spell.school });
    }
    for (const arr of Object.values(byLevel)) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return byLevel;
  }, [isWizardCharacter, primaryPreparedClass, allSpells]);

  const hasDomains = useMemo(
    () =>
      levels.some((l) => {
        const prog = findClassProgression(l.class);
        return prog?.hasDomains === true;
      }),
    [levels],
  );

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
        onAddWeapon={(w) => {
          addWeapon(w);
          persistLocal();
        }}
        onAddEquipment={(item) => {
          addEquipment(item);
          persistLocal();
        }}
      />

      <div className="app-content">
        <header className="app-header">
          <div className="app-header__row">
            <h1 className="app-title">
              {mode === 'build' ? 'Character Builder' : 'Character Sheet'}
            </h1>
            <div className="app-header__controls">
              <button
                className="app-header__theme-btn"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
              <button className="app-header__mode-btn" onClick={toggleMode}>
                {mode === 'build' ? '▶ Play' : '◀ Build'}
              </button>
            </div>
          </div>
        </header>

        <TabNav active={tab} onSelect={setTab} mode={mode} />

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
                weapons={weapons}
                addWeapon={addWeapon}
                removeWeapon={removeWeapon}
                updateWeapon={updateWeapon}
                setNotes={setNotes}
                onBlur={persistLocal}
                startCombat={startCombat}
                endCombat={endCombat}
                setCombatInitiative={setCombatInitiative}
                onAdvanceRound={onAdvanceRound}
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
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
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
                    placeholder="e.g. 5'8&quot;"
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
                          onChange={(e) => setCurrencyField(coin, parseInt(e.target.value) || 0)}
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

              <PanelSection title="Spell Slots" defaultOpen={false}>
                <SpellSlotsPanel
                  combatStats={combatStats}
                  updateSpellSlotsMax={updateSpellSlotsMax}
                  updateSpellSlotsUsed={updateSpellSlotsUsed}
                  resetSpellSlots={resetSpellSlots}
                  onBlur={persistLocal}
                  calculatedSlots={effectiveSlots}
                  primaryCastingMod={primaryCastingMod}
                />
              </PanelSection>

              {isPreparedCaster && (
                <PanelSection title="Memorized Spells" defaultOpen={false}>
                  <MemorizedSpellsPanel
                    memorizedSpells={memorizedSpells}
                    accessibleLevels={accessibleSpellLevels}
                    onAdd={addMemorizedSpell}
                    onRemove={removeMemorizedSpell}
                    onClearLevel={clearMemorizedSpells}
                    onBlur={persistLocal}
                  />
                </PanelSection>
              )}

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
              {isWizardCharacter ? (
                <SpellbookPanel
                  levels={levels}
                  intMod={mods.int}
                  combatStats={combatStats}
                  calculatedSlots={calculatedSlots}
                  memorizedSpells={memorizedSpells}
                  memorizedSpellsUsed={memorizedSpellsUsed}
                  spellbook={spellbook}
                  wizardSpecialty={wizardSpecialty}
                  wizardForbiddenSchools={wizardForbiddenSchools}
                  primaryCastingMod={primaryCastingMod}
                  addMemorizedSpell={addMemorizedSpell}
                  removeMemorizedSpell={removeMemorizedSpell}
                  castMemorizedSpell={castMemorizedSpell}
                  uncastMemorizedSpell={uncastMemorizedSpell}
                  newDaySpells={newDaySpells}
                  addSpellbookEntry={addSpellbookEntry}
                  removeSpellbookEntry={removeSpellbookEntry}
                  setWizardSpecialty={setWizardSpecialty}
                  setWizardForbiddenSchools={setWizardForbiddenSchools}
                  onBlur={persistLocal}
                />
              ) : (
                <>
                  {isPreparedCaster ? (
                    <PanelSection title="Prepared Spells" defaultOpen>
                      <PreparedSpellsPanel
                        combatStats={combatStats}
                        effectiveSlots={effectiveSlots}
                        memorizedSpells={memorizedSpells}
                        memorizedSpellsUsed={memorizedSpellsUsed}
                        castingMod={primaryCastingMod}
                        classSpellsByLevel={classSpellsByLevel}
                        hasDomains={hasDomains}
                        addMemorizedSpell={addMemorizedSpell}
                        removeMemorizedSpell={removeMemorizedSpell}
                        castMemorizedSpell={castMemorizedSpell}
                        uncastMemorizedSpell={uncastMemorizedSpell}
                        newDaySpells={newDaySpells}
                        onBlur={persistLocal}
                      />
                    </PanelSection>
                  ) : (
                    <PanelSection title="Spell Slots" defaultOpen>
                      <SpellSlotsPanel
                        combatStats={combatStats}
                        updateSpellSlotsMax={updateSpellSlotsMax}
                        updateSpellSlotsUsed={updateSpellSlotsUsed}
                        resetSpellSlots={resetSpellSlots}
                        onBlur={persistLocal}
                        readOnly={true}
                        calculatedSlots={effectiveSlots}
                        primaryCastingMod={primaryCastingMod}
                      />
                    </PanelSection>
                  )}
                  <PanelSection title="Known Spells" defaultOpen={false}>
                    <SpellsSummary levels={levels} />
                  </PanelSection>
                </>
              )}
            </div>
          )}

          {error && <p className="text-error mt-12">{error}</p>}
        </main>
      </div>
    </div>
  );
}
