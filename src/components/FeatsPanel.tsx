import { useState } from 'react';

import { feats, findFeat } from '../data/feats';

interface FeatsPanelProps {
  selectedFeats: string[];
  onAddFeat: (featName: string) => void;
  onRemoveFeat: (featName: string) => void;
  onBlur: () => void;
}

export function FeatsPanel({ selectedFeats, onAddFeat, onRemoveFeat, onBlur }: FeatsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeats = searchTerm.trim()
    ? feats
        .filter((feat) => feat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 20) // Show max 20 results
    : [];

  const handleAddFeat = (featName: string) => {
    if (!selectedFeats.includes(featName)) {
      onAddFeat(featName);
      onBlur();
    }
  };

  const handleRemoveFeat = (featName: string) => {
    onRemoveFeat(featName);
    onBlur();
  };

  return (
    <div className="feats-panel">
      <h3 className="feats-panel__title">Feats</h3>

      {/* Search input */}
      <div className="feats-search">
        <label htmlFor="feat-search" className="feats-search__label">
          Search feats ({feats.length} total)
        </label>
        <input
          id="feat-search"
          type="text"
          className="feats-search__input"
          placeholder="Type to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Search results */}
      {searchTerm.trim() && (
        <div className="feats-results">
          {filteredFeats.length > 0 ? (
            <>
              <div className="feats-results__header">
                Showing {filteredFeats.length} result{filteredFeats.length !== 1 ? 's' : ''}
              </div>
              <ul className="feats-results__list">
                {filteredFeats.map((feat) => {
                  const isSelected = selectedFeats.includes(feat.name);
                  return (
                    <li key={feat.name} className="feat-result">
                      <div className="feat-result__header">
                        <span className="feat-result__name">{feat.name}</span>
                        <button
                          type="button"
                          className={`feat-result__button ${isSelected ? 'feat-result__button--selected' : ''}`}
                          onClick={() =>
                            isSelected ? handleRemoveFeat(feat.name) : handleAddFeat(feat.name)
                          }
                          disabled={isSelected}
                        >
                          {isSelected ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                      {feat.prerequisites && (
                        <div className="feat-result__prereq">
                          Prerequisites: {feat.prerequisites}
                        </div>
                      )}
                      <div className="feat-result__description">{feat.description}</div>
                      <div className="feat-result__source">
                        {feat.source.abbr}
                        {feat.source.page ? ` p.${feat.source.page}` : ''}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="feats-results__empty">No feats found matching "{searchTerm}"</div>
          )}
        </div>
      )}

      {/* Selected feats */}
      {selectedFeats.length > 0 && (
        <div className="feats-selected">
          <div className="feats-selected__header">Selected Feats ({selectedFeats.length})</div>
          <ul className="feats-selected__list">
            {selectedFeats.map((featName) => {
              const feat = findFeat(featName);
              return (
                <li key={featName} className="feat-selected">
                  <div className="feat-selected__content">
                    <span className="feat-selected__name">{featName}</span>
                    {feat?.description && (
                      <span className="feat-selected__description">{feat.description}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="feat-selected__remove"
                    onClick={() => handleRemoveFeat(featName)}
                    aria-label={`Remove ${featName}`}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedFeats.length === 0 && !searchTerm.trim() && (
        <div className="feats-empty">
          No feats selected. Use the search above to find and add feats.
        </div>
      )}
    </div>
  );
}
