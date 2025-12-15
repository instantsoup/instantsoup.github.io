import { useMemo } from 'react';

import { classes } from '../data/classes';
import { skills } from '../data/skills';
import {
  calculateCumulativeSkillRanks,
  calculateMaxRanks,
  calculateSkillPointsAvailableAtLevel,
  calculateSkillPointsSpentAtLevel,
} from '../lib/progressions';
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

  // Calculate available and spent points
  const available = calculateSkillPointsAvailableAtLevel(levelIndex, allLevels, intModifier);
  const spent = calculateSkillPointsSpentAtLevel(level, allLevels);
  const remaining = available - spent;
  const carryover = levelIndex === 0 ? 0 : (allLevels[levelIndex - 1].unspentSkillPoints ?? 0);

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

  const handleAdjustRank = (skillName: string, delta: number) => {
    const currentRanks = levelSkillRanks[skillName] ?? 0;
    const newRanks = Math.max(0, currentRanks + delta);
    updateLevelSkillRanks(level.level, skillName, newRanks);
    onBlur?.();
  };

  // Group skills by ability for better organization
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
      grouped[skill.ability].push(skill);
    });
    return grouped;
  }, []);

  const abilityLabels: Record<string, string> = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma',
  };

  return (
    <div className="skill-spending-panel">
      <div className="skill-spending-summary">
        <div className="skill-spending-summary__available">
          Available: {available - carryover}
          {carryover > 0 && <span className="skill-spending-summary__carryover"> + {carryover} carryover</span>}
          {' = '}
          <strong>{available} points</strong>
        </div>
        <div className="skill-spending-summary__status">
          <span>Spent: {spent} points</span>
          <span className={remaining < 0 ? 'skill-spending-summary__remaining--negative' : ''}>
            Remaining: {remaining} points
          </span>
        </div>
      </div>

      {remaining < 0 && (
        <div className="skill-spending-warning">
          ⚠️ You have overspent skill points! Remove some ranks to continue.
        </div>
      )}

      <div className="skill-spending-list">
        {Object.entries(skillsByAbility).map(([abilityKey, abilitySkills]) => (
          <div key={abilityKey} className="skill-spending-ability-group">
            <div className="skill-spending-ability-group__header">{abilityLabels[abilityKey]}</div>
            {abilitySkills.map((skill) => {
              const isClassSkill = classSkillsSet.has(skill.name);
              const ranksAtThisLevel = levelSkillRanks[skill.name] ?? 0;
              const cumulativeTotal = cumulativeRanks[skill.name] ?? 0;
              const maxRanks = calculateMaxRanks(characterLevel, isClassSkill);
              const costPerRank = isClassSkill ? 1 : 2;

              // Can only add if we have enough points and haven't hit max
              const canAdd = remaining >= costPerRank && cumulativeTotal < maxRanks;
              const canRemove = ranksAtThisLevel > 0;

              return (
                <div
                  key={skill.name}
                  className={`skill-spending-item ${isClassSkill ? 'skill-spending-item--class' : 'skill-spending-item--cross-class'}`}
                >
                  <div className="skill-spending-item__header">
                    <span className="skill-spending-item__name">
                      {skill.name}
                      {isClassSkill && <span className="skill-spending-item__badge">Class</span>}
                      {skill.trainedOnly && <span className="skill-spending-item__badge--trained">Trained Only</span>}
                    </span>
                    <div className="skill-spending-item__controls">
                      <button
                        type="button"
                        className="skill-spending-item__button"
                        onClick={() => handleAdjustRank(skill.name, -1)}
                        disabled={!canRemove}
                        aria-label={`Remove 1 rank from ${skill.name}`}
                      >
                        −
                      </button>
                      <span className="skill-spending-item__ranks">
                        {ranksAtThisLevel > 0 ? ranksAtThisLevel : '0'}
                      </span>
                      <button
                        type="button"
                        className="skill-spending-item__button"
                        onClick={() => handleAdjustRank(skill.name, 1)}
                        disabled={!canAdd}
                        aria-label={`Add 1 rank to ${skill.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="skill-spending-item__info">
                    Cost: {costPerRank} pt{costPerRank !== 1 ? 's' : ''}/rank | Total ranks: {cumulativeTotal}/
                    {maxRanks}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
