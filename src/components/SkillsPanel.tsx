import { useMemo, useState } from 'react';

import { classes } from '../data/classes';
import { skills } from '../data/skills';
import { calculateCumulativeSkillRanks } from '../lib/progressions';
import type { Scores } from '../types';
import type { Level } from '../types/level';

interface SkillsPanelProps {
  mods: Scores;
  levels: Level[];
  readOnly?: boolean;
}

type FilterOption = 'all' | 'trained-only' | 'has-ranks';

export function SkillsPanel({ mods, levels, readOnly }: SkillsPanelProps) {
  const [filter, setFilter] = useState<FilterOption>('has-ranks');

  const cumulativeRanks = useMemo(() => calculateCumulativeSkillRanks(levels), [levels]);

  const classSkillsSet = useMemo(() => {
    const set = new Set<string>();
    for (const level of levels) {
      const classData = classes.find((c) => c.name === level.class);
      if (classData?.classSkills) {
        classData.classSkills.forEach((skill) => set.add(skill));
      }
    }
    return set;
  }, [levels]);

  const filteredSkills = useMemo(() => {
    return skills
      .filter((skill) => {
        const ranks = cumulativeRanks[skill.name] || 0;
        if (filter === 'trained-only') return skill.trainedOnly;
        if (filter === 'has-ranks') return ranks > 0;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cumulativeRanks, filter]);

  return (
    <div className="skills-panel">
      {levels.length === 0 && (
        <div className="skills-panel__empty">
          Add at least one level to see your skills. Manage skill ranks in the Build tab.
        </div>
      )}

      {levels.length > 0 && (
        <>
          <div className="skills-filter">
            <button
              type="button"
              className={`skills-filter__btn ${filter === 'all' ? 'skills-filter__btn--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Skills
            </button>
            <button
              type="button"
              className={`skills-filter__btn ${filter === 'trained-only' ? 'skills-filter__btn--active' : ''}`}
              onClick={() => setFilter('trained-only')}
            >
              Trained Only
            </button>
            <button
              type="button"
              className={`skills-filter__btn ${filter === 'has-ranks' ? 'skills-filter__btn--active' : ''}`}
              onClick={() => setFilter('has-ranks')}
            >
              Has Ranks
            </button>
          </div>

          <div className="skills-list skills-list--flat">
            {filteredSkills.map((skill) => {
              const rawRanks = cumulativeRanks[skill.name] || 0;
              const ranks = Math.floor(rawRanks);
              const abilityMod = mods[skill.ability as keyof Scores] || 0;
              const total = ranks + abilityMod;
              const totalDisplay = total >= 0 ? `+${total}` : `${total}`;
              const modDisplay = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;
              const isClassSkill = classSkillsSet.has(skill.name);

              return (
                <div
                  key={skill.name}
                  className={`skill-item skill-item--flat ${isClassSkill ? 'skill-item--class' : ''}`}
                >
                  <div className="skill-item__stats">
                    <span className="skill-item__ranks" title="Ranks">
                      {rawRanks !== ranks ? rawRanks.toFixed(1) : rawRanks}
                    </span>
                    <span className="skill-item__total" title="Total bonus">
                      {totalDisplay}
                    </span>
                    <span className="skill-item__mod" title={`${skill.ability.toUpperCase()} mod`}>
                      {modDisplay}
                    </span>
                  </div>
                  <div className="skill-item__info">
                    <span className="skill-item__name">
                      {skill.name}
                      <span className="skill-item__ability"> ({skill.ability.toUpperCase()})</span>
                    </span>
                    <span className="skill-item__badges">
                      {isClassSkill && (
                        <span className="skill-badge skill-badge--class-inline" title="Class skill">
                          C
                        </span>
                      )}
                      {skill.trainedOnly && (
                        <span
                          className="skill-badge skill-badge--trained-inline"
                          title="Trained only"
                        >
                          T
                        </span>
                      )}
                      {skill.armorCheckPenalty && (
                        <span
                          className="skill-badge skill-badge--armor-inline"
                          title="Armor check penalty"
                        >
                          ACP
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSkills.length === 0 && (
            <div className="skills-panel__empty">
              No skills match the current filter.
              {!readOnly && ' Add skill ranks in the Build tab.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
