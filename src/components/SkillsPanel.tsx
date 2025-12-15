import { useMemo, useState } from 'react';

import { classes } from '../data/classes';
import { skills } from '../data/skills';
import { calculateCumulativeSkillRanks } from '../lib/progressions';
import type { Scores } from '../types';
import type { Level } from '../types/level';

interface SkillsPanelProps {
  mods: Scores;
  levels: Level[];
}

type FilterOption = 'all' | 'trained' | 'class' | 'cross-class';

export function SkillsPanel({ mods, levels }: SkillsPanelProps) {
  const [filter, setFilter] = useState<FilterOption>('trained');

  // Calculate cumulative skill ranks from all levels
  const cumulativeRanks = useMemo(() => calculateCumulativeSkillRanks(levels), [levels]);

  // Determine which skills are class skills
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

  // Filter and group skills by ability
  const skillsByAbility = useMemo(() => {
    const grouped: Record<string, typeof skills> = {
      str: [],
      dex: [],
      con: [],
      int: [],
      wis: [],
      cha: [],
    };

    skills.forEach((skill) => {
      const ranks = cumulativeRanks[skill.name] || 0;
      const isClassSkill = classSkillsSet.has(skill.name);

      // Apply filter
      if (filter === 'trained' && ranks === 0) return;
      if (filter === 'class' && !isClassSkill) return;
      if (filter === 'cross-class' && isClassSkill) return;

      grouped[skill.ability].push(skill);
    });

    return grouped;
  }, [cumulativeRanks, classSkillsSet, filter]);

  const abilityLabels: Record<string, string> = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma',
  };

  const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div className="skills-panel">
      {levels.length === 0 && (
        <div className="skills-panel__empty">
          Add at least one level to see your skills. Manage skill ranks in the Levels section above.
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
              className={`skills-filter__btn ${filter === 'trained' ? 'skills-filter__btn--active' : ''}`}
              onClick={() => setFilter('trained')}
            >
              Trained Only
            </button>
            <button
              type="button"
              className={`skills-filter__btn ${filter === 'class' ? 'skills-filter__btn--active' : ''}`}
              onClick={() => setFilter('class')}
            >
              Class Skills
            </button>
            <button
              type="button"
              className={`skills-filter__btn ${filter === 'cross-class' ? 'skills-filter__btn--active' : ''}`}
              onClick={() => setFilter('cross-class')}
            >
              Cross-Class Skills
            </button>
          </div>

          <div className="skills-list">
            {abilityKeys.map((abilityKey) => {
              const abilitySkills = skillsByAbility[abilityKey];
              if (abilitySkills.length === 0) return null;

              return (
                <div key={abilityKey} className="skills-ability-group">
                  <div className="skills-ability-group__header">{abilityLabels[abilityKey]}</div>
                  <div className="skills-ability-group__skills">
                    {abilitySkills.map((skill) => {
                      const ranks = cumulativeRanks[skill.name] || 0;
                      const abilityMod = mods[abilityKey as keyof Scores] || 0;
                      const total = ranks + abilityMod;
                      const totalDisplay = total >= 0 ? `+${total}` : `${total}`;
                      const isClassSkill = classSkillsSet.has(skill.name);

                      return (
                        <div
                          key={skill.name}
                          className={`skill-card ${isClassSkill ? 'skill-card--class' : 'skill-card--cross-class'}`}
                        >
                          <div className="skill-card__header">
                            <div className="skill-card__name-row">
                              <span className="skill-card__name">{skill.name}</span>
                              <div className="skill-card__badges">
                                {isClassSkill && <span className="skill-badge skill-badge--class">Class</span>}
                                {skill.trainedOnly && (
                                  <span className="skill-badge skill-badge--trained">Trained Only</span>
                                )}
                                {skill.armorCheckPenalty && <span className="skill-badge skill-badge--armor">ACP</span>}
                              </div>
                            </div>
                            <div className="skill-card__total">{totalDisplay}</div>
                          </div>
                          <div className="skill-card__breakdown">
                            {ranks} rank{ranks !== 1 ? 's' : ''} + {abilityMod >= 0 ? '+' : ''}
                            {abilityMod} {skill.ability.toUpperCase()} = {totalDisplay}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {Object.values(skillsByAbility).every((skills) => skills.length === 0) && (
            <div className="skills-panel__empty">
              No skills match the current filter. Try a different filter or add skill ranks in the Levels section
              above.
            </div>
          )}
        </>
      )}
    </div>
  );
}
