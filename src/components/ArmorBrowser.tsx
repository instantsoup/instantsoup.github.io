import { useState } from 'react';

import { armorRefs } from '../data/armor';

export function ArmorBrowser() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = armorRefs.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search armor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="browser__filters">
          <select
            className="browser__filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
            <option value="shield">Shield</option>
          </select>
        </div>
      </div>

      <div className="browser__count">
        {filtered.length} of {armorRefs.length} entries
      </div>

      <ul className="browser__list">
        {filtered.map((a) => {
          const isExpanded = expanded === a.name;
          return (
            <li
              key={a.name}
              className={`browser__item${isExpanded ? ' browser__item--expanded' : ''}`}
              onClick={() => setExpanded(isExpanded ? null : a.name)}
            >
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{a.name}</span>
                  <div className="browser__stats-row">
                    <span className="browser__stat browser__stat--damage">+{a.acBonus} AC</span>
                    {a.maxDexBonus !== null && (
                      <span className="browser__stat browser__stat--crit">
                        Dex +{a.maxDexBonus}
                      </span>
                    )}
                    {a.armorCheckPenalty > 0 && (
                      <span className="browser__stat">−{a.armorCheckPenalty} ACP</span>
                    )}
                    <span className="browser__stat">{a.arcaneSpellFailure}% ASF</span>
                  </div>
                </div>
                <span className={`browser__item-badge browser__item-badge--${a.category}`}>
                  {a.category}
                </span>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  <div className="browser__details-row">
                    <span className="browser__details-label">AC Bonus:</span> +{a.acBonus}
                    {a.maxDexBonus !== null && (
                      <>
                        {' · '}
                        <span className="browser__details-label">Max Dex:</span> +{a.maxDexBonus}
                      </>
                    )}
                  </div>
                  <div className="browser__details-row">
                    <span className="browser__details-label">Check Penalty:</span>{' '}
                    {a.armorCheckPenalty > 0 ? `−${a.armorCheckPenalty}` : '—'}
                    {' · '}
                    <span className="browser__details-label">Spell Failure:</span>{' '}
                    {a.arcaneSpellFailure}%
                  </div>
                  {(a.speed30 !== undefined || a.speed20 !== undefined) && (
                    <div className="browser__details-row">
                      <span className="browser__details-label">Speed:</span> {a.speed30 ?? 30} ft.
                      (30 base) / {a.speed20 ?? 20} ft. (20 base)
                    </div>
                  )}
                  <div className="browser__details-row">
                    <span className="browser__details-label">Weight:</span>{' '}
                    {a.weightLb !== undefined ? `${a.weightLb} lb` : '—'}
                    {' · '}
                    <span className="browser__details-label">Cost:</span>{' '}
                    {a.costGp !== undefined ? `${a.costGp} gp` : '—'}
                  </div>
                  <div className="browser__details-source">{a.source.abbr}</div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No armor found</div>}
    </div>
  );
}
