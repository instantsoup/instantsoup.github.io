import { alignments } from '../data/alignments';
import { calculateTotalBAB, calculateTotalSave } from '../lib/progressions';
import type { CombatStats, CustomResource } from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';
import { HPTracker } from './HPTracker';
import { ResourceTracker } from './ResourceTracker';

type PlaySheetProps = {
  name: string;
  race: string | undefined;
  alignment: string | undefined;
  mods: Scores;
  combatStats: CombatStats;
  levels: Level[];
  saveBonuses: Record<string, number>;
  customResources: CustomResource[];
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  addCustomResource: (resource: CustomResource) => void;
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
  addCustomResource,
  removeCustomResource,
  updateCustomResourceUsed,
  resetCustomResource,
  resetAllCustomResources,
  onBlur,
}: PlaySheetProps) {
  const alignmentLabel = alignment
    ? (alignments.find((a) => a.code === alignment)?.label ?? alignment)
    : undefined;

  const armorBonus = combatStats.armorBonus ?? 0;
  const shieldBonus = combatStats.shieldBonus ?? 0;
  const miscACBonus = combatStats.miscACBonus ?? 0;
  const totalAC = 10 + mods.dex + armorBonus + shieldBonus + miscACBonus;
  const acTooltip = [
    '10 base',
    `DEX: ${mods.dex >= 0 ? '+' : ''}${mods.dex}`,
    armorBonus !== 0 ? `Armor: +${armorBonus}` : null,
    shieldBonus !== 0 ? `Shield: +${shieldBonus}` : null,
    miscACBonus !== 0 ? `Misc: +${miscACBonus}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const initiativeBonus = combatStats.initiativeBonus ?? 0;
  const initiative = mods.dex + initiativeBonus;
  const initTooltip = [
    `DEX: ${mods.dex >= 0 ? '+' : ''}${mods.dex}`,
    initiativeBonus !== 0 ? `Misc: +${initiativeBonus}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const babResult = calculateTotalBAB(levels);
  const bab = babResult.total;
  const babTooltip = babResult.components.map((c) => `${c.label}: +${c.value}`).join('\n');

  const fortResult = calculateTotalSave(levels, 'fortitude');
  const fortBase = fortResult.total;
  const fortBonus = saveBonuses['Fortitude'] ?? 0;
  const fort = fortBase + mods.con + fortBonus;
  const fortTooltip = [
    ...fortResult.components.map((c) => `${c.label}: +${c.value}`),
    `CON: ${mods.con >= 0 ? '+' : ''}${mods.con}`,
    fortBonus !== 0 ? `Bonus: +${fortBonus}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const refResult = calculateTotalSave(levels, 'reflex');
  const refBase = refResult.total;
  const refBonus = saveBonuses['Reflex'] ?? 0;
  const ref = refBase + mods.dex + refBonus;
  const refTooltip = [
    ...refResult.components.map((c) => `${c.label}: +${c.value}`),
    `DEX: ${mods.dex >= 0 ? '+' : ''}${mods.dex}`,
    refBonus !== 0 ? `Bonus: +${refBonus}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const willResult = calculateTotalSave(levels, 'will');
  const willBase = willResult.total;
  const willBonus = saveBonuses['Will'] ?? 0;
  const will = willBase + mods.wis + willBonus;
  const willTooltip = [
    ...willResult.components.map((c) => `${c.label}: +${c.value}`),
    `WIS: ${mods.wis >= 0 ? '+' : ''}${mods.wis}`,
    willBonus !== 0 ? `Bonus: +${willBonus}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

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
        <div className="play-sheet__stat" title={acTooltip}>
          <span className="play-sheet__stat-label">AC</span>
          <span className="play-sheet__stat-value">{totalAC}</span>
        </div>
        <div className="play-sheet__stat" title={initTooltip}>
          <span className="play-sheet__stat-label">Init</span>
          <span className="play-sheet__stat-value">{fmt(initiative)}</span>
        </div>
        <div className="play-sheet__stat" title={babTooltip || undefined}>
          <span className="play-sheet__stat-label">BAB</span>
          <span className="play-sheet__stat-value">{fmt(bab)}</span>
        </div>
        {(combatStats.spellResistance ?? 0) > 0 && (
          <div className="play-sheet__stat">
            <span className="play-sheet__stat-label">SR</span>
            <span className="play-sheet__stat-value">{combatStats.spellResistance}</span>
          </div>
        )}
        <div className="play-sheet__stat play-sheet__stat--wide">
          <span className="play-sheet__stat-label">Move</span>
          <span className="play-sheet__stat-value play-sheet__stat-value--movement">
            {combatStats.movementSpeed ?? 30} ft.
            {combatStats.movementType ? ` (${combatStats.movementType})` : ''}
          </span>
        </div>
      </div>

      {/* Saves Row */}
      <div className="play-sheet__stats-row">
        <div className="play-sheet__stat" title={fortTooltip}>
          <span className="play-sheet__stat-label">Fort</span>
          <span className="play-sheet__stat-value">{fmt(fort)}</span>
        </div>
        <div className="play-sheet__stat" title={refTooltip}>
          <span className="play-sheet__stat-label">Ref</span>
          <span className="play-sheet__stat-value">{fmt(ref)}</span>
        </div>
        <div className="play-sheet__stat" title={willTooltip}>
          <span className="play-sheet__stat-label">Will</span>
          <span className="play-sheet__stat-value">{fmt(will)}</span>
        </div>
      </div>

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
