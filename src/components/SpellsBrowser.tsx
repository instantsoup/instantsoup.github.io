import { useState } from 'react';

import { spells } from '../data/spells';

function formatLevels(levels: Record<string, number>): string {
  return Object.entries(levels)
    .sort((a, b) => a[1] - b[1])
    .map(([cls, lvl]) => `${cls} ${lvl}`)
    .join(', ');
}

export function SpellsBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | ''>('');
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  // Get unique schools
  const allSchools = [...new Set(spells.map((s) => s.school))].sort();

  const filtered = spells.filter((spell) => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = !schoolFilter || spell.school === schoolFilter;
    const matchesClass = !classFilter || spell.levels[classFilter] !== undefined;
    const matchesLevel =
      levelFilter === '' ||
      (classFilter
        ? spell.levels[classFilter] === levelFilter
        : Object.values(spell.levels).includes(levelFilter));
    return matchesSearch && matchesSchool && matchesClass && matchesLevel;
  });

  // Limit display for performance
  const displaySpells = filtered.slice(0, 100);

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search spells..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="browser__filters">
          <select
            className="browser__filter"
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
          >
            <option value="">School</option>
            {allSchools.map((school) => (
              <option key={school} value={school}>
                {school.slice(0, 4)}
              </option>
            ))}
          </select>
          <select
            className="browser__filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">Class</option>
            <option value="Brd">Brd</option>
            <option value="Clr">Clr</option>
            <option value="Drd">Drd</option>
            <option value="Pal">Pal</option>
            <option value="Rgr">Rgr</option>
            <option value="Sor/Wiz">Wiz</option>
          </select>
          <select
            className="browser__filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Lvl</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="browser__count">
        {filtered.length > 100 ? `100 of ${filtered.length}` : filtered.length} of {spells.length}{' '}
        spells
        {filtered.length > 100 && ' (filter to narrow)'}
      </div>

      <ul className="browser__list">
        {displaySpells.map((spell, idx) => {
          const key = `${spell.name}-${spell.source.abbr}-${idx}`;
          const isExpanded = expandedSpell === key;
          return (
            <li
              key={key}
              className={`browser__item ${isExpanded ? 'browser__item--expanded' : ''}`}
              onClick={() => setExpandedSpell(isExpanded ? null : key)}
            >
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{spell.name}</span>
                  <div className="browser__item-meta">{formatLevels(spell.levels)}</div>
                </div>
                <span className="browser__item-badge browser__item-badge--school">
                  {spell.school.slice(0, 4)}
                </span>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  <div className="browser__details-row">
                    <span className="browser__details-label">School: </span>
                    {spell.school}
                    {spell.subschool && ` (${spell.subschool})`}
                  </div>
                  {spell.descriptor.length > 0 && (
                    <div className="browser__details-row">
                      <span className="browser__details-label">Descriptor: </span>
                      {spell.descriptor.join(', ')}
                    </div>
                  )}
                  <div className="browser__details-row">
                    <span className="browser__details-label">Components: </span>
                    {spell.components}
                  </div>
                  <div className="browser__details-row">
                    <span className="browser__details-label">Casting: </span>
                    {spell.castingTime}
                  </div>
                  <div className="browser__details-row">
                    <span className="browser__details-label">Range: </span>
                    {spell.range}
                  </div>
                  <div className="browser__details-row">
                    <span className="browser__details-label">Duration: </span>
                    {spell.duration}
                  </div>
                  {spell.savingThrow && (
                    <div className="browser__details-row">
                      <span className="browser__details-label">Save: </span>
                      {spell.savingThrow}
                    </div>
                  )}
                  {spell.spellResistance && (
                    <div className="browser__details-row">
                      <span className="browser__details-label">SR: </span>
                      {spell.spellResistance}
                    </div>
                  )}
                  {spell.description && (
                    <div className="browser__details-row browser__details-row--description">
                      {spell.description}
                    </div>
                  )}
                  <div className="browser__details-source">
                    {spell.source.abbr}
                    {spell.source.page ? ` p.${spell.source.page}` : ''}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No spells found</div>}
    </div>
  );
}
