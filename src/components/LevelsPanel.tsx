import { useState } from 'react';

import { classes } from '../data/classes';
import { feats } from '../data/feats';
import type { ClassName } from '../schema/schema';
import type { Level } from '../types/level';

type LevelsPanelProps = {
  levels: Level[];
  addLevel: () => void;
  removeLevel: () => void;
  updateLevelClass: (levelNumber: number, className: ClassName) => void;
  addFeatToLevel: (levelNumber: number, featName: string) => void;
  removeFeatFromLevel: (levelNumber: number, featName: string) => void;
  onBlur?: () => void;
};

export function LevelsPanel({
  levels,
  addLevel,
  removeLevel,
  updateLevelClass,
  addFeatToLevel,
  removeFeatFromLevel,
  onBlur,
}: LevelsPanelProps) {
  const canAddLevel = levels.length < 20;
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});

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

  const toggleExpanded = (levelNumber: number) => {
    setExpandedLevel(expandedLevel === levelNumber ? null : levelNumber);
  };

  const getSearchResults = (levelNumber: number) => {
    const searchTerm = searchTerms[levelNumber] ?? '';
    if (!searchTerm.trim()) return [];
    return feats
      .filter((feat) => feat.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10); // Show max 10 results per level
  };

  return (
    <section className="levels-panel">
      {levels.length === 0 && (
        <p className="levels-empty">No levels added yet. Add your first level to begin.</p>
      )}

      {levels.length > 0 && (
        <div className="levels-list">
          {levels.map((lvl) => {
            const isExpanded = expandedLevel === lvl.level;
            const levelFeats = lvl.feats ?? [];
            const searchResults = getSearchResults(lvl.level);

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
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(lvl.level)}
                    className="level-card__toggle"
                  >
                    {isExpanded ? '▼ Hide Feats' : '▶ Manage Feats'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="level-card__feats">
                    <div className="level-feats-search">
                      <input
                        type="text"
                        placeholder="Search feats..."
                        value={searchTerms[lvl.level] ?? ''}
                        onChange={(e) =>
                          setSearchTerms((prev) => ({ ...prev, [lvl.level]: e.target.value }))
                        }
                        className="level-feats-search__input"
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="level-feats-results">
                        {searchResults.map((feat, idx) => {
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

                    {levelFeats.length === 0 && searchResults.length === 0 && (
                      <div className="level-feats-empty">
                        {searchTerms[lvl.level]?.trim()
                          ? 'No feats found. Try a different search.'
                          : 'Search above to add feats for this level.'}
                      </div>
                    )}
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
