import { useState } from 'react';

import { findSpell, spells } from '../data/spells';

interface SpellsPanelProps {
  selectedSpells: string[];
  onAddSpell: (spellName: string) => void;
  onRemoveSpell: (spellName: string) => void;
  onBlur: () => void;
}

function formatLevels(levels: Record<string, number>): string {
  return Object.entries(levels)
    .sort((a, b) => a[1] - b[1])
    .map(([cls, lvl]) => `${cls} ${lvl}`)
    .join(', ');
}

export function SpellsPanel({
  selectedSpells,
  onAddSpell,
  onRemoveSpell,
  onBlur,
}: SpellsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | ''>('');

  const filteredSpells = searchTerm.trim()
    ? spells
        .filter((spell) => {
          const matchesName = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesClass = !classFilter || spell.levels[classFilter] !== undefined;
          const matchesLevel =
            levelFilter === '' ||
            (classFilter
              ? spell.levels[classFilter] === levelFilter
              : Object.values(spell.levels).includes(levelFilter));
          return matchesName && matchesClass && matchesLevel;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 20)
    : [];

  const handleAddSpell = (spellName: string) => {
    if (!selectedSpells.includes(spellName)) {
      onAddSpell(spellName);
      onBlur();
    }
  };

  const handleRemoveSpell = (spellName: string) => {
    onRemoveSpell(spellName);
    onBlur();
  };

  return (
    <div className="spells-panel">
      <h3 className="panel-title">Spells</h3>

      {/* Search input */}
      <div className="spells-search">
        <label htmlFor="spell-search" className="spells-search__label">
          Search spells ({spells.length} total)
        </label>
        <div className="spells-search__row">
          <input
            id="spell-search"
            type="text"
            className="spells-search__input"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="spells-search__filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="Brd">Bard</option>
            <option value="Clr">Cleric</option>
            <option value="Drd">Druid</option>
            <option value="Pal">Paladin</option>
            <option value="Rgr">Ranger</option>
            <option value="Sor/Wiz">Sor/Wiz</option>
          </select>
          <select
            className="spells-search__filter spells-search__filter--level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">All Levels</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
              <option key={lvl} value={lvl}>
                Level {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search results */}
      {searchTerm.trim() && (
        <div className="spells-results">
          {filteredSpells.length > 0 ? (
            <>
              <div className="spells-results__header">
                Showing {filteredSpells.length} result{filteredSpells.length !== 1 ? 's' : ''}
              </div>
              <ul className="spells-results__list">
                {filteredSpells.map((spell, idx) => {
                  const isSelected = selectedSpells.includes(spell.name);
                  return (
                    <li
                      key={`${spell.name}-${spell.source.abbr}-${spell.source.page}-${idx}`}
                      className="spell-result"
                    >
                      <div className="spell-result__header">
                        <span className="spell-result__name">{spell.name}</span>
                        <button
                          type="button"
                          className={`spell-result__button ${isSelected ? 'spell-result__button--selected' : ''}`}
                          onClick={() =>
                            isSelected ? handleRemoveSpell(spell.name) : handleAddSpell(spell.name)
                          }
                          disabled={isSelected}
                        >
                          {isSelected ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                      <div className="spell-result__meta">
                        <span className="spell-result__school">{spell.school}</span>
                        {spell.subschool && (
                          <span className="spell-result__subschool">({spell.subschool})</span>
                        )}
                        {spell.descriptor.length > 0 && (
                          <span className="spell-result__descriptor">
                            [{spell.descriptor.join(', ')}]
                          </span>
                        )}
                      </div>
                      <div className="spell-result__levels">{formatLevels(spell.levels)}</div>
                      <div className="spell-result__description">{spell.description}</div>
                      <div className="spell-result__details">
                        <span>
                          <strong>Components:</strong> {spell.components}
                        </span>
                        <span>
                          <strong>Casting:</strong> {spell.castingTime}
                        </span>
                        <span>
                          <strong>Range:</strong> {spell.range}
                        </span>
                        <span>
                          <strong>Duration:</strong> {spell.duration}
                        </span>
                      </div>
                      <div className="spell-result__source">
                        {spell.source.abbr}
                        {spell.source.page ? ` p.${spell.source.page}` : ''}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="spells-results__empty">No spells found matching "{searchTerm}"</div>
          )}
        </div>
      )}

      {/* Selected spells */}
      {selectedSpells.length > 0 && (
        <div className="spells-selected">
          <div className="spells-selected__header">Selected Spells ({selectedSpells.length})</div>
          <ul className="spells-selected__list">
            {selectedSpells.map((spellName) => {
              const spell = findSpell(spellName);
              return (
                <li key={spellName} className="spell-selected">
                  <div className="spell-selected__content">
                    <span className="spell-selected__name">{spellName}</span>
                    {spell && (
                      <span className="spell-selected__info">
                        {spell.school} - {formatLevels(spell.levels)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="spell-selected__remove"
                    onClick={() => handleRemoveSpell(spellName)}
                    aria-label={`Remove ${spellName}`}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedSpells.length === 0 && !searchTerm.trim() && (
        <div className="spells-empty">
          No spells selected. Use the search above to find and add spells.
        </div>
      )}
    </div>
  );
}
