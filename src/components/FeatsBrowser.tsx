import { useState } from 'react';

import { feats } from '../data/feats';

export function FeatsBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

  // Get unique feat types for the filter
  const allTypes = [...new Set(feats.flatMap((f) => f.types))].sort();

  const filtered = feats.filter((feat) => {
    const matchesSearch = feat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || feat.types.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  // Limit display for performance
  const displayFeats = filtered.slice(0, 100);

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search feats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="browser__filters">
          <select
            className="browser__filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {allTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="browser__count">
        {filtered.length > 100 ? `100 of ${filtered.length}` : filtered.length} of {feats.length}{' '}
        feats
        {filtered.length > 100 && ' (use search to narrow)'}
      </div>

      <ul className="browser__list">
        {displayFeats.map((feat, idx) => {
          const key = `${feat.name}-${feat.source.abbr}-${idx}`;
          const isExpanded = expandedFeat === key;
          return (
            <li
              key={key}
              className={`browser__item ${isExpanded ? 'browser__item--expanded' : ''}`}
              onClick={() => setExpandedFeat(isExpanded ? null : key)}
            >
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{feat.name}</span>
                  {feat.types.length > 0 && (
                    <div className="browser__item-meta">{feat.types.join(', ')}</div>
                  )}
                </div>
                <span className="browser__item-badge">{feat.source.abbr}</span>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  {feat.prerequisites && (
                    <div className="browser__details-row browser__details-prereq">
                      Prerequisites: {feat.prerequisites}
                    </div>
                  )}
                  {feat.description && (
                    <div className="browser__details-row">{feat.description}</div>
                  )}
                  {feat.types.length > 0 && (
                    <div className="browser__details-tags">
                      {feat.types.map((type) => (
                        <span key={type} className="browser__details-tag">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="browser__details-source">
                    {feat.source.abbr}
                    {feat.source.page ? ` p.${feat.source.page}` : ''}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No feats found</div>}
    </div>
  );
}
