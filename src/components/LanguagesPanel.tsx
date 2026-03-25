import { useState } from 'react';

import { languages } from '../data/languages';

type LanguagesPanelProps = {
  selected: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
};

export function LanguagesPanel({
  selected,
  onAdd,
  onRemove,
  onBlur,
  readOnly,
}: LanguagesPanelProps) {
  const [search, setSearch] = useState('');

  const filtered = languages.filter(
    (l) => !selected.includes(l.name) && l.name.toLowerCase().includes(search.toLowerCase()),
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
              const lang = languages.find((l) => l.name === name);
              return (
                <span key={name} className="tag" title={lang?.speakers}>
                  {name}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-muted">No languages.</p>
        )}
      </div>
    );
  }

  return (
    <div className="panel-body">
      {selected.length > 0 && (
        <div className="tag-list mb-8">
          {selected.map((name) => {
            const lang = languages.find((l) => l.name === name);
            return (
              <span key={name} className="tag tag--removable" title={lang?.speakers}>
                {name}
                <button
                  className="tag__remove"
                  onClick={() => handleRemove(name)}
                  aria-label={`Remove language ${name}`}
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
          placeholder="Search languages to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search && (
        <ul className="browser__list browser__list--compact">
          {filtered.slice(0, 20).map((lang) => (
            <li key={lang.name} className="browser__item">
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{lang.name}</span>
                  <div className="browser__item-meta">{lang.speakers}</div>
                </div>
                <button className="btn btn--xs btn--primary" onClick={() => handleAdd(lang.name)}>
                  Add
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && search && (
            <li className="browser__empty">No matching languages</li>
          )}
        </ul>
      )}

      {selected.length === 0 && !search && (
        <p className="text-muted">No languages selected. Search above to add a language.</p>
      )}
    </div>
  );
}
