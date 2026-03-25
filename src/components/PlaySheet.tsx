import { alignments } from '../data/alignments';
import { calculateTotalBAB, calculateTotalSave } from '../lib/progressions';
import type { CombatStats } from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';
import { HPTracker } from './HPTracker';
import { ResourceTracker } from './ResourceTracker';
import { SavesPanel } from './SavesPanel';
import { SkillsPanel } from './SkillsPanel';
import { SpellSlotsPanel } from './SpellSlotsPanel';

type PlaySheetProps = {
  name: string;
  race: string | undefined;
  alignment: string | undefined;
  mods: Scores;
  combatStats: CombatStats;
  levels: Level[];
  saveBonuses: Record<string, number>;
  customResources: import('../schema/schema').CustomResource[];
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  updateSpellSlotsMax: (spellLevel: string, max: number) => void;
  updateSpellSlotsUsed: (spellLevel: string, used: number) => void;
  resetSpellSlots: () => void;
  addCustomResource: (resource: import('../schema/schema').CustomResource) => void;
  removeCustomResource: (index: number) => void;
  updateCustomResourceUsed: (index: number, used: number) => void;
  resetCustomResource: (index: number) => void;
  resetAllCustomResources: () => void;
  onBlur: () => void;
};

export function PlaySheet({
  name,
  race,
  alignment,
  mods,
  combatStats,
  levels,
  saveBonuses,
  customResources,
  updateCombatStat,
  updateSpellSlotsMax,
  updateSpellSlotsUsed,
  resetSpellSlots,
  addCustomResource,
  removeCustomResource,
  updateCustomResourceUsed,
  resetCustomResource,
  resetAllCustomResources,
  onBlur,
}: PlaySheetProps) {
  const alignmentLabel = alignment
    ? alignments.find((a) => a.code === alignment)?.label ?? alignment
    : undefined;

  const totalAC =
    10 +
    mods.dex +
    (combatStats.armorBonus ?? 0) +
    (combatStats.shieldBonus ?? 0) +
    (combatStats.miscACBonus ?? 0);

  const initiative = mods.dex + (combatStats.initiativeBonus ?? 0);
  const bab = calculateTotalBAB(levels).total;

  const fort = calculateTotalSave(levels, 'fortitude').total + mods.con + (saveBonuses['Fortitude'] ?? 0);
  const ref = calculateTotalSave(levels, 'reflex').total + mods.dex + (saveBonuses['Reflex'] ?? 0);
  const will = calculateTotalSave(levels, 'will').total + mods.wis + (saveBonuses['Will'] ?? 0);

  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  const spellSlotsMax = combatStats.spellSlotsMax ?? {};
  const hasSpells = Object.values(spellSlotsMax).some((v) => v > 0);

  return (
    <div className="play-sheet">
      {/* Identity */}
      <div className="play-sheet__identity">
        <span className="play-sheet__name">{name || 'Unnamed Character'}</span>
        {race && <span className="play-sheet__identity-detail">{race}</span>}
        {alignmentLabel && <span className="play-sheet__identity-detail">{alignmentLabel}</span>}
      </div>

      {/* HP */}
      <div className="play-sheet__section">
        <HPTracker
          mods={mods}
          combatStats={combatStats}
          levels={levels}
          updateCombatStat={updateCombatStat}
          onBlur={onBlur}
        />
      </div>

      {/* Combat Stats Row */}
      <div className="play-sheet__stats-row">
        <div className="play-sheet__stat">
          <span className="play-sheet__stat-label">AC</span>
          <span className="play-sheet__stat-value">{totalAC}</span>
        </div>
        <div className="play-sheet__stat">
          <span className="play-sheet__stat-label">Init</span>
          <span className="play-sheet__stat-value">{fmt(initiative)}</span>
        </div>
        <div className="play-sheet__stat">
          <span className="play-sheet__stat-label">BAB</span>
          <span className="play-sheet__stat-value">{fmt(bab)}</span>
        </div>
        {(combatStats.spellResistance ?? 0) > 0 && (
          <div className="play-sheet__stat">
            <span className="play-sheet__stat-label">SR</span>
            <span className="play-sheet__stat-value">{combatStats.spellResistance}</span>
          </div>
        )}
      </div>

      {/* Saves Row */}
      <div className="play-sheet__stats-row">
        <div className="play-sheet__stat">
          <span className="play-sheet__stat-label">Fort</span>
          <span className="play-sheet__stat-value">{fmt(fort)}</span>
        </div>
        <div className="play-sheet__stat">
          <span className="play-sheet__stat-label">Ref</span>
          <span className="play-sheet__stat-value">{fmt(ref)}</span>
        </div>
        <div className="play-sheet__stat">
          <span className="play-sheet__stat-label">Will</span>
          <span className="play-sheet__stat-value">{fmt(will)}</span>
        </div>
      </div>

      {/* Skills (has-ranks) */}
      {levels.length > 0 && (
        <div className="play-sheet__section">
          <div className="play-sheet__section-label">Skills</div>
          <SkillsPanel mods={mods} levels={levels} readOnly />
        </div>
      )}

      {/* Spell Slots */}
      {hasSpells && (
        <div className="play-sheet__section">
          <div className="play-sheet__section-label">Spell Slots</div>
          <SpellSlotsPanel
            combatStats={combatStats}
            updateSpellSlotsMax={updateSpellSlotsMax}
            updateSpellSlotsUsed={updateSpellSlotsUsed}
            resetSpellSlots={resetSpellSlots}
            onBlur={onBlur}
          />
        </div>
      )}

      {/* Resources */}
      {customResources.length > 0 && (
        <div className="play-sheet__section">
          <div className="play-sheet__section-label">Resources</div>
          <ResourceTracker
            resources={customResources}
            onAdd={addCustomResource}
            onRemove={removeCustomResource}
            onUse={updateCustomResourceUsed}
            onReset={resetCustomResource}
            onResetAll={resetAllCustomResources}
            onBlur={onBlur}
          />
        </div>
      )}
    </div>
  );
}
