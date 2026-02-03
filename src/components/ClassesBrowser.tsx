import { useState } from 'react';

import { classes } from '../data/classes';

export function ClassesBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const filtered = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="browser__count">
        {filtered.length} of {classes.length} classes
      </div>

      <ul className="browser__list">
        {filtered.map((cls) => {
          const isExpanded = expandedClass === cls.name;
          return (
            <li
              key={cls.name}
              className={`browser__item ${isExpanded ? 'browser__item--expanded' : ''}`}
              onClick={() => setExpandedClass(isExpanded ? null : cls.name)}
            >
              <div className="browser__item-header">
                <span className="browser__item-name">{cls.name}</span>
                <span className="browser__item-badge">{cls.classSkills.length} skills</span>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  {cls.description && (
                    <div className="browser__details-row">{cls.description}</div>
                  )}
                  <div className="browser__details-row">
                    <span className="browser__details-label">Class Skills:</span>
                  </div>
                  <div className="browser__skill-list">
                    {cls.classSkills.map((skill) => (
                      <span key={skill} className="browser__skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No classes found</div>}
    </div>
  );
}
