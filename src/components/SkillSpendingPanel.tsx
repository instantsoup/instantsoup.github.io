import { useMemo, useState } from 'react';

import { classes } from '../data/classes';
import { skills } from '../data/skills';
import {
  cumulativeSkillRanks as calculateCumulativeSkillRanks,
  maxSkillRanks as calculateMaxRanks,
  skillPointsAvailableAtLevel as calculateSkillPointsAvailableAtLevel,
  skillPointsSpentAtLevel as calculateSkillPointsSpentAtLevel,
} from '../rules/character';
import type { Level } from '../types/level';

interface SkillSpendingPanelProps {
  levelIndex: number;
  level: Level;
  allLevels: Level[];
  intModifier: number;
  updateLevelSkillRanks: (levelNumber: number, skillName: string, ranks: number) => void;
  onBlur?: () => void;
}

export function SkillSpendingPanel({
  levelIndex,
  level,
  allLevels,
  intModifier,
  updateLevelSkillRanks,
  onBlur,
}: SkillSpendingPanelProps) {
  const characterLevel = level.level;
  const levelSkillRanks = level.skillRanks ?? {};
  const [classSkillsExpanded, setClassSkillsExpanded] = useState(true);
  const [crossClassExpanded, setCrossClassExpanded] = useState(false);

  // Calculate available and spent points
  const available = calculateSkillPointsAvailableAtLevel(levelIndex, allLevels, intModifier);
  const spent = calculateSkillPointsSpentAtLevel(level, allLevels);
  const remaining = available - spent;

  // Get cumulative skill ranks up to this level
  const cumulativeRanks = useMemo(
    () => calculateCumulativeSkillRanks(allLevels.slice(0, levelIndex + 1)),
    [allLevels, levelIndex],
  );

  // Determine which skills are class skills
  const relevantLevels = allLevels.slice(0, levelIndex + 1);
  const classSkillsSet = useMemo(() => {
    const set = new Set<string>();
    for (const lvl of relevantLevels) {
      const classData = classes.find((c) => c.name === lvl.class);
      if (classData?.classSkills) {
        classData.classSkills.forEach((skill) => set.add(skill));
      }
    }
    return set;
  }, [relevantLevels]);

  const handleAdjustRank = (skillName: string, isClassSkill: boolean) => {
    const currentRanks = levelSkillRanks[skillName] ?? 0;
    const increment = isClassSkill ? 1 : 0.5; // Class: 1 rank, Cross-class: 0.5 ranks
    const newRanks = Math.max(0, currentRanks + increment);
    updateLevelSkillRanks(level.level, skillName, newRanks);
    onBlur?.();
  };

  const handleRemoveRank = (skillName: string, isClassSkill: boolean) => {
    const currentRanks = levelSkillRanks[skillName] ?? 0;
    const decrement = isClassSkill ? 1 : 0.5; // Class: 1 rank, Cross-class: 0.5 ranks
    const newRanks = Math.max(0, currentRanks - decrement);
    updateLevelSkillRanks(level.level, skillName, newRanks);
    onBlur?.();
  };

  // Group skills by class/cross-class
  const { classSkills, crossClassSkills } = useMemo(() => {
    const classSkillsList: typeof skills = [];
    const crossClassSkillsList: typeof skills = [];

    skills.forEach((skill) => {
      if (classSkillsSet.has(skill.name)) {
        classSkillsList.push(skill);
      } else {
        crossClassSkillsList.push(skill);
      }
    });

    return {
      classSkills: classSkillsList,
      crossClassSkills: crossClassSkillsList,
    };
  }, [classSkillsSet]);

  const renderSkill = (skill: (typeof skills)[0], isClassSkill: boolean) => {
    const ranksAtThisLevel = levelSkillRanks[skill.name] ?? 0;
    const cumulativeTotal = cumulativeRanks[skill.name] ?? 0;
    const maxRanks = calculateMaxRanks(characterLevel, isClassSkill);
    const costPerIncrement = 1; // Always 1 point per click (class: 1 rank, cross-class: 0.5 ranks)

    // Can only add if we have enough points and haven't hit max
    const canAdd = remaining >= costPerIncrement && cumulativeTotal < maxRanks;
    const canRemove = ranksAtThisLevel > 0;

    return (
      <div
        key={skill.name}
        className={`skill-spending-item ${isClassSkill ? 'skill-spending-item--class' : 'skill-spending-item--cross-class'}`}
      >
        <div className="skill-spending-item__header">
          <span className="skill-spending-item__name">
            {skill.name}
            <span className="skill-spending-item__ability">({skill.ability.toUpperCase()})</span>
            {skill.trainedOnly && (
              <span className="skill-spending-item__badge--trained">Trained Only</span>
            )}
          </span>
          <div className="skill-spending-item__controls">
            <button
              type="button"
              className="skill-spending-item__button"
              onClick={() => handleRemoveRank(skill.name, isClassSkill)}
              disabled={!canRemove}
              aria-label={`Remove ${isClassSkill ? '1' : '0.5'} rank from ${skill.name}`}
            >
              −
            </button>
            <span className="skill-spending-item__ranks">
              {ranksAtThisLevel > 0 ? ranksAtThisLevel : '0'}
            </span>
            <button
              type="button"
              className="skill-spending-item__button"
              onClick={() => handleAdjustRank(skill.name, isClassSkill)}
              disabled={!canAdd}
              aria-label={`Add ${isClassSkill ? '1' : '0.5'} rank to ${skill.name}`}
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="skill-spending-panel">
      {remaining < 0 && (
        <div className="skill-spending-warning">
          ⚠️ You have overspent skill points! Remove some ranks to continue.
        </div>
      )}

      <div className="skill-spending-list">
        {/* Class Skills */}
        <div className="skill-spending-group">
          <button
            type="button"
            className="skill-spending-group__header skill-spending-group__header--collapsible"
            onClick={() => setClassSkillsExpanded(!classSkillsExpanded)}
          >
            Class Skills {classSkillsExpanded ? '▼' : '▶'}
          </button>
          {classSkillsExpanded && (
            <div className="skill-spending-group__skills">
              {classSkills.map((skill) => renderSkill(skill, true))}
            </div>
          )}
        </div>

        {/* Cross-Class Skills */}
        <div className="skill-spending-group">
          <button
            type="button"
            className="skill-spending-group__header skill-spending-group__header--collapsible"
            onClick={() => setCrossClassExpanded(!crossClassExpanded)}
          >
            Cross-Class Skills {crossClassExpanded ? '▼' : '▶'}
          </button>
          {crossClassExpanded && (
            <div className="skill-spending-group__skills">
              {crossClassSkills.map((skill) => renderSkill(skill, false))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
