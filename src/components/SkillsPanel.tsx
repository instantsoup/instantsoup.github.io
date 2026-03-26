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

export function SkillsPanel({ mods, levels, readOnly }: SkillsPanelProps) {
  const [showUntrained, setShowUntrained] = useState(false);

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
        if (showUntrained) return true;
        const ranks = cumulativeRanks[skill.name] || 0;
        return !skill.trainedOnly || ranks > 0;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cumulativeRanks, showUntrained]);

  return (
    <div className="skills-panel">
      {levels.length === 0 && (
        <div className="skills-panel__empty">
          Add at least one level to see your skills. Manage skill ranks in the Build tab.
        </div>
      )}

      {levels.length > 0 && (
        <>
          <label className="skills-filter__toggle">
            <input
              type="checkbox"
              checked={showUntrained}
              onChange={(e) => setShowUntrained(e.target.checked)}
            />
            Show trained-only skills without ranks
          </label>

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
              {!readOnly ? 'Add skill ranks in the Build tab.' : 'No skills to display.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
