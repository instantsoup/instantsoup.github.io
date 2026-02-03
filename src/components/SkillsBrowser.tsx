import { useState } from 'react';

import { skills } from '../data/skills';

const ABILITY_LABELS: Record<string, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

export function SkillsBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [abilityFilter, setAbilityFilter] = useState('');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const filtered = skills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAbility = !abilityFilter || skill.ability === abilityFilter;
    return matchesSearch && matchesAbility;
  });

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="browser__filters">
          <select
            className="browser__filter"
            value={abilityFilter}
            onChange={(e) => setAbilityFilter(e.target.value)}
          >
            <option value="">All Abilities</option>
            <option value="str">STR</option>
            <option value="dex">DEX</option>
            <option value="con">CON</option>
            <option value="int">INT</option>
            <option value="wis">WIS</option>
            <option value="cha">CHA</option>
          </select>
        </div>
      </div>

      <div className="browser__count">
        {filtered.length} of {skills.length} skills
      </div>

      <ul className="browser__list">
        {filtered.map((skill) => {
          const isExpanded = expandedSkill === skill.name;
          return (
            <li
              key={skill.name}
              className={`browser__item ${isExpanded ? 'browser__item--expanded' : ''}`}
              onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
            >
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{skill.name}</span>
                  <div className="browser__item-meta">
                    {skill.trainedOnly && <span>Trained Only</span>}
                    {skill.armorCheckPenalty && (
                      <span>{skill.trainedOnly ? ' · ' : ''}Armor Check Penalty</span>
                    )}
                  </div>
                </div>
                <span className="browser__item-badge browser__item-badge--ability">
                  {ABILITY_LABELS[skill.ability]}
                </span>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  <div className="browser__details-row">
                    <span className="browser__details-label">Key Ability: </span>
                    {ABILITY_LABELS[skill.ability]}
                  </div>
                  {skill.trainedOnly && (
                    <div className="browser__details-row browser__details-prereq">
                      Requires training (cannot use untrained)
                    </div>
                  )}
                  {skill.armorCheckPenalty && (
                    <div className="browser__details-row">
                      <span className="browser__details-label">Note: </span>
                      Armor check penalty applies
                    </div>
                  )}
                  {skill.description && (
                    <div className="browser__details-row">{skill.description}</div>
                  )}
                  {skill.source && (
                    <div className="browser__details-source">
                      {skill.source.abbr}
                      {skill.source.page ? ` p.${skill.source.page}` : ''}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No skills found</div>}
    </div>
  );
}
