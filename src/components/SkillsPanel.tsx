import skillsData from '../data/skills.json';
import type { Scores } from '../types';

interface SkillsPanelProps {
  mods: Scores;
  skillRanks: Record<string, number>;
  setSkillRank: (skillName: string, ranks: number) => void;
  onBlur: () => void;
}

export function SkillsPanel({ mods, skillRanks, setSkillRank, onBlur }: SkillsPanelProps) {
  const calculateTotal = (skillName: string, abilityKey: string): number => {
    const ranks = skillRanks[skillName] || 0;
    const abilityMod = mods[abilityKey as keyof Scores] || 0;
    return abilityMod + ranks;
  };

  return (
    <div className="skills-panel">
      <h2 className="skills-panel__title">Skills</h2>
      <div className="skills-table">
        <div className="skills-table__header">
          <div className="skills-table__cell skills-table__cell--skill">Skill</div>
          <div className="skills-table__cell skills-table__cell--ability">Ability</div>
          <div className="skills-table__cell skills-table__cell--ranks">Ranks</div>
          <div className="skills-table__cell skills-table__cell--total">Total</div>
        </div>
        {skillsData.map((skill) => {
          const ranks = skillRanks[skill.name] || 0;
          const total = calculateTotal(skill.name, skill.ability);
          const totalDisplay = total >= 0 ? `+${total}` : `${total}`;

          return (
            <div key={skill.name} className="skills-table__row">
              <div className="skills-table__cell skills-table__cell--skill">
                <span className="skill-name">{skill.name}</span>
                {skill.trainedOnly && (
                  <span className="skill-badge skill-badge--trained" title="Trained Only">
                    T
                  </span>
                )}
                {skill.armorCheckPenalty && (
                  <span className="skill-badge skill-badge--armor" title="Armor Check Penalty">
                    ACP
                  </span>
                )}
              </div>
              <div className="skills-table__cell skills-table__cell--ability">
                {skill.ability.toUpperCase()}
              </div>
              <div className="skills-table__cell skills-table__cell--ranks">
                <input
                  type="number"
                  min="0"
                  max="99"
                  className="skill-input"
                  value={ranks}
                  onChange={(e) => {
                    const val = parseInt(e.target.value || '0', 10);
                    setSkillRank(skill.name, val);
                  }}
                  onBlur={onBlur}
                />
              </div>
              <div className="skills-table__cell skills-table__cell--total">{totalDisplay}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
