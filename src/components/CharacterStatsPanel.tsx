import { useState } from 'react';

import type { CombatStats } from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';
import { AbilityGrid } from './AbilityGrid';
import { CombatStatsPanel } from './CombatStats';
import { SavesPanel } from './SavesPanel';

type Props = {
  scores: Scores;
  mods: Scores;
  onNum: (k: keyof Scores) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  combatStats: CombatStats;
  levels: Level[];
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  setMovementType: (type: string) => void;
  saveBonuses: Record<string, number>;
  setSaveBonus: (saveName: string, bonus: number) => void;
  onBlur: () => void;
};

export function CharacterStatsPanel({
  scores,
  mods,
  onNum,
  combatStats,
  levels,
  updateCombatStat,
  setMovementType,
  saveBonuses,
  setSaveBonus,
  onBlur,
}: Props) {
  const [openSection, setOpenSection] = useState<string | null>('abilities');

  const toggleSection = (section: string) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <div className="character-stats-panel">
      <h2 className="section-title">Character Stats</h2>

      {/* Abilities Section */}
      <div className="panel">
        <button
          type="button"
          className={`panel__header ${openSection === 'abilities' ? 'panel__header--open' : ''}`}
          onClick={() => toggleSection('abilities')}
          aria-expanded={openSection === 'abilities'}
        >
          Abilities
        </button>
        {openSection === 'abilities' && (
          <div className="panel__content">
            <AbilityGrid scores={scores} mods={mods} onNum={onNum} />
          </div>
        )}
      </div>

      {/* Combat Stats Section */}
      <div className="panel">
        <button
          type="button"
          className={`panel__header ${openSection === 'combat' ? 'panel__header--open' : ''}`}
          onClick={() => toggleSection('combat')}
          aria-expanded={openSection === 'combat'}
        >
          Combat Stats
        </button>
        {openSection === 'combat' && (
          <div className="panel__content">
            <CombatStatsPanel
              mods={mods}
              combatStats={combatStats}
              levels={levels}
              updateCombatStat={updateCombatStat}
              setMovementType={setMovementType}
              onBlur={onBlur}
            />
          </div>
        )}
      </div>

      {/* Saving Throws Section */}
      <div className="panel">
        <button
          type="button"
          className={`panel__header ${openSection === 'saves' ? 'panel__header--open' : ''}`}
          onClick={() => toggleSection('saves')}
          aria-expanded={openSection === 'saves'}
        >
          Saving Throws
        </button>
        {openSection === 'saves' && (
          <div className="panel__content">
            <SavesPanel
              mods={mods}
              saveBonuses={saveBonuses}
              levels={levels}
              setSaveBonus={setSaveBonus}
              onBlur={onBlur}
            />
          </div>
        )}
      </div>
    </div>
  );
}
