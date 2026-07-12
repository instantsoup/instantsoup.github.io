import { useState } from 'react';

import { findClassProgression } from '../data/class-progressions';
import { classes } from '../data/classes';
import { feats } from '../data/feats';
import { spells } from '../data/spells';
import {
  calculateSkillPointsAvailableAtLevel,
  calculateSkillPointsSpentAtLevel,
} from '../lib/progressions';
import type { ClassName } from '../schema/schema';
import type { Level } from '../types/level';
import { SkillSpendingPanel } from './SkillSpendingPanel';

type LevelTab = 'feats' | 'spells' | 'skills';

type LevelsPanelProps = {
  levels: Level[];
  addLevel: () => void;
  removeLevel: () => void;
  updateLevelClass: (levelNumber: number, className: ClassName) => void;
  addFeatToLevel: (levelNumber: number, featName: string) => void;
  removeFeatFromLevel: (levelNumber: number, featName: string) => void;
  addSpellToLevel: (levelNumber: number, spellName: string) => void;
  removeSpellFromLevel: (levelNumber: number, spellName: string) => void;
  updateLevelSkillRanks: (levelNumber: number, skillName: string, ranks: number) => void;
  intModifier: number;
  wizardForbiddenSchools: string[];
  onBlur?: () => void;
};

export function LevelsPanel({
  levels,
  addLevel,
  removeLevel,
  updateLevelClass,
  addFeatToLevel,
  removeFeatFromLevel,
  addSpellToLevel,
  removeSpellFromLevel,
  updateLevelSkillRanks,
  intModifier,
  wizardForbiddenSchools,
  onBlur,
}: LevelsPanelProps) {
  const canAddLevel = levels.length < 20;
  const [activeLevelTab, setActiveLevelTab] = useState<Record<number, LevelTab | null>>({});
  const [featSearchTerms, setFeatSearchTerms] = useState<Record<number, string>>({});
  const [spellSearchTerms, setSpellSearchTerms] = useState<Record<number, string>>({});

  const handleAddLevel = () => {
    addLevel();
    onBlur?.();
  };

  const handleRemoveLevel = () => {
    removeLevel();
    onBlur?.();
  };

  const handleUpdateClass = (levelNumber: number, className: ClassName) => {
    updateLevelClass(levelNumber, className);
    onBlur?.();
  };

  const handleAddFeat = (levelNumber: number, featName: string) => {
    addFeatToLevel(levelNumber, featName);
    onBlur?.();
  };

  const handleRemoveFeat = (levelNumber: number, featName: string) => {
    removeFeatFromLevel(levelNumber, featName);
    onBlur?.();
  };

  const handleAddSpell = (levelNumber: number, spellName: string) => {
    addSpellToLevel(levelNumber, spellName);
    onBlur?.();
  };

  const handleRemoveSpell = (levelNumber: number, spellName: string) => {
    removeSpellFromLevel(levelNumber, spellName);
    onBlur?.();
  };

  const toggleTab = (levelNumber: number, tab: LevelTab) => {
    setActiveLevelTab((prev) => ({
      ...prev,
      [levelNumber]: prev[levelNumber] === tab ? null : tab,
    }));
  };

  const getFeatSearchResults = (levelNumber: number) => {
    const searchTerm = featSearchTerms[levelNumber] ?? '';
    if (!searchTerm.trim()) return [];
    return feats
      .filter((feat) => feat.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10);
  };

  const getSpellSearchResults = (
    levelNumber: number,
    spellListKey: string | null,
    maxLevel: number | null,
  ) => {
    const searchTerm = spellSearchTerms[levelNumber] ?? '';
    if (!searchTerm.trim()) return [];
    return spells
      .filter((spell) => {
        if (!spell.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (wizardForbiddenSchools.includes(spell.school)) return false;
        if (spellListKey) {
          const spellLevel = spell.levels[spellListKey];
          if (spellLevel === undefined) return false;
          if (maxLevel !== null && spellLevel > maxLevel) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10);
  };

  return (
    <section className="levels-panel">
      {levels.length === 0 && (
        <p className="levels-empty">No levels added yet. Add your first level to begin.</p>
      )}

      {levels.length > 0 && (
        <div className="levels-list">
          {levels.map((lvl, levelIndex) => {
            const activeTab = activeLevelTab[lvl.level] ?? null;
            const levelFeats = lvl.feats ?? [];
            const levelSpells = lvl.spells ?? [];
            const featSearchResults = getFeatSearchResults(lvl.level);

            // Per-level spell context — currently implemented for Wizard only.
            // TODO: add per-level spells-known rules for spontaneous casters (Sorcerer, Bard)
            // who choose spells from a fixed table and can replace one spell per level.
            const prog = findClassProgression(lvl.class);
            const spellListKey = prog?.spellListKey ?? null;
            const classLevelAtThisPoint = levels
              .slice(0, levelIndex + 1)
              .filter((l) => l.class === lvl.class).length;
            const isWizard = lvl.class === 'Wizard';
            const maxCastableSpellLevel = isWizard ? Math.ceil(classLevelAtThisPoint / 2) : null;
            // Level 1: 3 + Int modifier 1st-level spells; each subsequent level: 2 spells
            const spellsToLearn = isWizard
              ? classLevelAtThisPoint === 1
                ? Math.max(1, 3 + intModifier)
                : 2
              : null;

            const spellSearchResults = getSpellSearchResults(
              lvl.level,
              spellListKey,
              maxCastableSpellLevel,
            );

            const available = calculateSkillPointsAvailableAtLevel(levelIndex, levels, intModifier);
            const spent = calculateSkillPointsSpentAtLevel(lvl, levels);
            const remaining = available - spent;

            return (
              <div key={lvl.level} className="level-card">
                <div className="level-card__header">
                  <div className="level-card__info">
                    <span className="level-card__number">Level {lvl.level}</span>
                    <select
                      value={lvl.class}
                      onChange={(e) => handleUpdateClass(lvl.level, e.target.value as ClassName)}
                      className="level-card__class-select"
                    >
                      {classes.map((cls) => (
                        <option key={cls.name} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {levelFeats.length > 0 && (
                      <span className="level-card__feat-count">
                        {levelFeats.length} feat{levelFeats.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {levelSpells.length > 0 && (
                      <span className="level-card__spell-count">
                        {levelSpells.length} spell{levelSpells.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span
                      className={`level-card__skill-points ${remaining < 0 ? 'level-card__skill-points--negative' : ''}`}
                    >
                      {available} / {remaining}
                    </span>
                  </div>
                  <div className="level-card__tabs">
                    <button
                      type="button"
                      onClick={() => toggleTab(lvl.level, 'feats')}
                      className={`level-card__tab${activeTab === 'feats' ? ' level-card__tab--active' : ''}`}
                    >
                      Feats
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTab(lvl.level, 'spells')}
                      className={`level-card__tab level-card__tab--spells${activeTab === 'spells' ? ' level-card__tab--active' : ''}`}
                    >
                      Spells
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTab(lvl.level, 'skills')}
                      className={`level-card__tab level-card__tab--skills${activeTab === 'skills' ? ' level-card__tab--active' : ''}`}
                    >
                      Skills
                    </button>
                  </div>
                </div>

                {/* Feats Tab */}
                {activeTab === 'feats' && (
                  <div className="level-card__feats">
                    <div className="level-feats-search">
                      <input
                        type="text"
                        placeholder="Search feats..."
                        value={featSearchTerms[lvl.level] ?? ''}
                        onChange={(e) =>
                          setFeatSearchTerms((prev) => ({ ...prev, [lvl.level]: e.target.value }))
                        }
                        className="level-feats-search__input"
                      />
                    </div>

                    {featSearchResults.length > 0 && (
                      <div className="level-feats-results">
                        {featSearchResults.map((feat, idx) => {
                          const isSelected = levelFeats.includes(feat.name);
                          return (
                            <div
                              key={`${feat.name}-${feat.source.abbr}-${feat.source.page}-${idx}`}
                              className="level-feat-result"
                            >
                              <div className="level-feat-result__header">
                                <span className="level-feat-result__name">{feat.name}</span>
                                <button
                                  type="button"
                                  className={`level-feat-result__button ${isSelected ? 'level-feat-result__button--selected' : ''}`}
                                  onClick={() =>
                                    isSelected
                                      ? handleRemoveFeat(lvl.level, feat.name)
                                      : handleAddFeat(lvl.level, feat.name)
                                  }
                                  disabled={isSelected}
                                >
                                  {isSelected ? '✓ Added' : '+ Add'}
                                </button>
                              </div>
                              {feat.prerequisites && (
                                <div className="level-feat-result__prereq">
                                  Prerequisites: {feat.prerequisites}
                                </div>
                              )}
                              <div className="level-feat-result__description">
                                {feat.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {levelFeats.length > 0 && (
                      <div className="level-feats-selected">
                        <div className="level-feats-selected__header">Selected Feats</div>
                        <ul className="level-feats-selected__list">
                          {levelFeats.map((featName) => (
                            <li key={featName} className="level-feat-selected">
                              <span className="level-feat-selected__name">{featName}</span>
                              <button
                                type="button"
                                className="level-feat-selected__remove"
                                onClick={() => handleRemoveFeat(lvl.level, featName)}
                                aria-label={`Remove ${featName}`}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {levelFeats.length === 0 && featSearchResults.length === 0 && (
                      <div className="level-feats-empty">
                        {featSearchTerms[lvl.level]?.trim()
                          ? 'No feats found. Try a different search.'
                          : 'Search above to add feats for this level.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Spells Tab */}
                {activeTab === 'spells' && (
                  <div className="level-card__spells">
                    {isWizard && spellsToLearn !== null && (
                      <div className="level-spells-header">
                        <span
                          className={`level-spells-quota${levelSpells.length > spellsToLearn ? ' level-spells-quota--over' : levelSpells.length === spellsToLearn ? ' level-spells-quota--met' : ''}`}
                        >
                          {levelSpells.length} / {spellsToLearn} spells
                        </span>
                        <span className="level-spells-hint">
                          {classLevelAtThisPoint === 1
                            ? `Starting spellbook — up to level ${maxCastableSpellLevel} spells (3 + Int mod)`
                            : `Spells added to spellbook this level — up to level ${maxCastableSpellLevel}`}
                        </span>
                      </div>
                    )}
                    <div className="level-spells-search">
                      <input
                        type="text"
                        placeholder={
                          isWizard
                            ? `Search Sor/Wiz spells (level 0–${maxCastableSpellLevel})…`
                            : 'Search spells...'
                        }
                        value={spellSearchTerms[lvl.level] ?? ''}
                        onChange={(e) =>
                          setSpellSearchTerms((prev) => ({ ...prev, [lvl.level]: e.target.value }))
                        }
                        className="level-spells-search__input"
                      />
                    </div>

                    {spellSearchResults.length > 0 && (
                      <div className="level-spells-results">
                        {spellSearchResults.map((spell, idx) => {
                          const isSelected = levelSpells.includes(spell.name);
                          return (
                            <div
                              key={`${spell.name}-${spell.source.abbr}-${spell.source.page}-${idx}`}
                              className="level-spell-result"
                            >
                              <div className="level-spell-result__header">
                                <span className="level-spell-result__name">{spell.name}</span>
                                <button
                                  type="button"
                                  className={`level-spell-result__button ${isSelected ? 'level-spell-result__button--selected' : ''}`}
                                  onClick={() =>
                                    isSelected
                                      ? handleRemoveSpell(lvl.level, spell.name)
                                      : handleAddSpell(lvl.level, spell.name)
                                  }
                                  disabled={isSelected}
                                >
                                  {isSelected ? '✓ Added' : '+ Add'}
                                </button>
                              </div>
                              <div className="level-spell-result__meta">
                                {spell.school}
                                {spell.subschool && ` (${spell.subschool})`}
                              </div>
                              <div className="level-spell-result__description">
                                {spell.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {levelSpells.length > 0 && (
                      <div className="level-spells-selected">
                        <div className="level-spells-selected__header">Selected Spells</div>
                        <ul className="level-spells-selected__list">
                          {levelSpells.map((spellName) => (
                            <li key={spellName} className="level-spell-selected">
                              <span className="level-spell-selected__name">{spellName}</span>
                              <button
                                type="button"
                                className="level-spell-selected__remove"
                                onClick={() => handleRemoveSpell(lvl.level, spellName)}
                                aria-label={`Remove ${spellName}`}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {levelSpells.length === 0 && spellSearchResults.length === 0 && (
                      <div className="level-spells-empty">
                        {spellSearchTerms[lvl.level]?.trim()
                          ? 'No spells found. Try a different search.'
                          : isWizard
                            ? classLevelAtThisPoint === 1
                              ? `Search to choose your starting ${spellsToLearn} spells (Sor/Wiz level 1).`
                              : `Search to choose ${spellsToLearn} spells learned this wizard level (up to spell level ${maxCastableSpellLevel}).`
                            : 'Search above to add spells for this level.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="level-card__skills">
                    <SkillSpendingPanel
                      levelIndex={levelIndex}
                      level={lvl}
                      allLevels={levels}
                      intModifier={intModifier}
                      updateLevelSkillRanks={updateLevelSkillRanks}
                      onBlur={onBlur}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="levels-actions">
        <button onClick={handleAddLevel} disabled={!canAddLevel} className="btn btn--primary">
          {canAddLevel ? 'Add Level' : 'Max Level (20)'}
        </button>
        {levels.length > 0 && (
          <button onClick={handleRemoveLevel} className="btn btn--danger">
            Remove Last Level
          </button>
        )}
      </div>
    </section>
  );
}
