import { useState } from 'react';

import { flaws } from '../data/flaws';

type FlawsPanelProps = {
  selected: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
};

export function FlawsPanel({ selected, onAdd, onRemove, onBlur, readOnly }: FlawsPanelProps) {
  const [search, setSearch] = useState('');
  const [expandedFlaw, setExpandedFlaw] = useState<string | null>(null);

  const filtered = flaws.filter(
    (f) => !selected.includes(f.name) && f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (name: string) => {
    onAdd(name);
    onBlur?.();
  };

  const handleRemove = (name: string) => {
    onRemove(name);
    onBlur?.();
  };

  if (readOnly) {
    return (
      <div className="panel-body">
        {selected.length > 0 ? (
          <div className="tag-list">
            {selected.map((name) => {
              const flaw = flaws.find((f) => f.name === name);
              return (
                <span key={name} className="tag" title={flaw?.effect}>
                  {name}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-muted">No flaws.</p>
        )}
      </div>
    );
  }

  return (
    <div className="panel-body">
      {selected.length > 0 && (
        <div className="tag-list mb-8">
          {selected.map((name) => {
            const flaw = flaws.find((f) => f.name === name);
            return (
              <span key={name} className="tag tag--removable" title={flaw?.effect}>
                {name}
                <button
                  className="tag__remove"
                  onClick={() => handleRemove(name)}
                  aria-label={`Remove flaw ${name}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search flaws to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <ul className="browser__list browser__list--compact">
          {filtered.slice(0, 20).map((flaw) => {
            const key = flaw.name;
            const isExpanded = expandedFlaw === key;
            return (
              <li
                key={key}
                className={`browser__item ${isExpanded ? 'browser__item--expanded' : ''}`}
              >
                <div className="browser__item-header">
                  <button
                    className="browser__item-name browser__item-name--btn"
                    onClick={() => setExpandedFlaw(isExpanded ? null : key)}
                  >
                    {flaw.name}
                  </button>
                  <button className="btn btn--xs btn--primary" onClick={() => handleAdd(flaw.name)}>
                    Add
                  </button>
                </div>
                {isExpanded && (
                  <div className="browser__details">
                    <div className="browser__details-row">{flaw.effect}</div>
                    <div className="browser__details-row browser__details-prereq">
                      {flaw.description}
                    </div>
                    <div className="browser__details-source">
                      {flaw.source.abbr}
                      {flaw.source.page ? ` p.${flaw.source.page}` : ''}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && search && <li className="browser__empty">No matching flaws</li>}
        </ul>
      )}

      {selected.length === 0 && !search && (
        <p className="text-muted">No flaws selected. Search above to add a flaw.</p>
      )}
    </div>
  );
}
