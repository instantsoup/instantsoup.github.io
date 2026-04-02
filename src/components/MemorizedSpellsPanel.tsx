import { useState } from 'react';

const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

type MemorizedSpellsPanelProps = {
  memorizedSpells: Record<string, string[]>;
  /** Only show levels that have max > 0 (or calculated slots) */
  accessibleLevels: string[];
  onAdd: (spellLevel: string, spellName: string) => void;
  onRemove: (spellLevel: string, index: number) => void;
  onClearLevel: (spellLevel: string) => void;
  onBlur: () => void;
};

export function MemorizedSpellsPanel({
  memorizedSpells,
  accessibleLevels,
  onAdd,
  onRemove,
  onClearLevel,
  onBlur,
}: MemorizedSpellsPanelProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const activeLevels = SPELL_LEVELS.filter((lvl) => accessibleLevels.includes(lvl));

  if (activeLevels.length === 0) {
    return <p className="panel-empty">No spell levels available. Set spell slot maximums first.</p>;
  }

  const setDraft = (lvl: string, val: string) => setDrafts((prev) => ({ ...prev, [lvl]: val }));

  const commit = (lvl: string) => {
    const name = (drafts[lvl] ?? '').trim();
    if (!name) return;
    onAdd(lvl, name);
    setDraft(lvl, '');
    onBlur();
  };

  return (
    <div className="memorized-spells">
      {activeLevels.map((lvl) => {
        const spells = memorizedSpells[lvl] ?? [];
        const label = lvl === '0' ? 'Cantrips' : `Level ${lvl}`;

        return (
          <div key={lvl} className="memorized-spells__level">
            <div className="memorized-spells__level-header">
              <span className="memorized-spells__level-label">{label}</span>
              {spells.length > 0 && (
                <button
                  className="btn btn--xs btn--ghost"
                  onClick={() => {
                    onClearLevel(lvl);
                    onBlur();
                  }}
                  title={`Clear all ${label}`}
                >
                  Clear
                </button>
              )}
            </div>

            <ul className="memorized-spells__list">
              {spells.map((spell, i) => (
                <li key={i} className="memorized-spells__item">
                  <span className="memorized-spells__spell-name">{spell}</span>
                  <button
                    className="btn btn--xs btn--ghost memorized-spells__remove"
                    onClick={() => {
                      onRemove(lvl, i);
                      onBlur();
                    }}
                    title="Remove"
                    aria-label={`Remove ${spell}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <div className="memorized-spells__add">
              <input
                type="text"
                className="memorized-spells__input"
                value={drafts[lvl] ?? ''}
                onChange={(e) => setDraft(lvl, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit(lvl);
                }}
                placeholder={`Add ${label === 'Cantrips' ? 'cantrip' : 'spell'}…`}
              />
              <button
                className="btn btn--xs btn--primary"
                onClick={() => commit(lvl)}
                disabled={!(drafts[lvl] ?? '').trim()}
              >
                Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
