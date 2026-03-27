import { alignments } from '../data/alignments';
import type { ConditionPenalties } from '../data/conditions';
import { calculateTotalBAB, calculateTotalSave } from '../lib/progressions';
import type {
  AbilityDamage,
  CombatStats,
  CustomResource,
  EquipmentItem,
  StatusEffect,
} from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';
import { AbilityDamagePanel } from './AbilityDamagePanel';
import { EquipmentPanel } from './EquipmentPanel';
import { HPTracker } from './HPTracker';
import { NotesPanel } from './NotesPanel';
import { ResourceTracker } from './ResourceTracker';
import { StatusEffectsPanel } from './StatusEffectsPanel';

type PlaySheetProps = {
  name: string;
  race: string | undefined;
  alignment: string | undefined;
  scores: Scores;
  effectiveScores: Scores;
  mods: Scores;
  combatStats: CombatStats;
  levels: Level[];
  saveBonuses: Record<string, number>;
  customResources: CustomResource[];
  statusEffects: Record<string, StatusEffect>;
  conditionPenalties: ConditionPenalties;
  abilityDamage: AbilityDamage;
  equipment: EquipmentItem[];
  updateCombatStat: (field: keyof CombatStats, value: number | undefined) => void;
  addCustomResource: (resource: CustomResource) => void;
  removeCustomResource: (index: number) => void;
  updateCustomResourceUsed: (index: number, used: number) => void;
  resetCustomResource: (index: number) => void;
  resetAllCustomResources: () => void;
  toggleStatusEffect: (name: string) => void;
  setStatusEffectRounds: (name: string, rounds: number) => void;
  clearAllStatusEffects: () => void;
  setAbilityDamage: (key: keyof AbilityDamage, value: number) => void;
  addEquipment: (item: EquipmentItem) => void;
  removeEquipment: (index: number) => void;
  toggleEquipped: (index: number) => void;
  setEquipmentNotes: (index: number, notes: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  onBlur: () => void;
};

export function PlaySheet({
  name,
  race,
  alignment,
  scores,
  effectiveScores,
  mods,
  combatStats,
  levels,
  saveBonuses,
  customResources,
  statusEffects,
  conditionPenalties,
  abilityDamage,
  equipment,
  updateCombatStat,
  addCustomResource,
  removeCustomResource,
  updateCustomResourceUsed,
  resetCustomResource,
  resetAllCustomResources,
  toggleStatusEffect,
  setStatusEffectRounds,
  clearAllStatusEffects,
  setAbilityDamage,
  addEquipment,
  removeEquipment,
  toggleEquipped,
  setEquipmentNotes,
  notes,
  setNotes,
  onBlur,
}: PlaySheetProps) {
  const alignmentLabel = alignment
    ? (alignments.find((a) => a.code === alignment)?.label ?? alignment)
    : undefined;

  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  const condAC = conditionPenalties.ac ?? 0;
  const condInit = conditionPenalties.initiative ?? 0;
  const condSave = conditionPenalties.save ?? 0;
  const loseDex = conditionPenalties.loseDexToAC ?? false;

  const armorBonus = combatStats.armorBonus ?? 0;
  const shieldBonus = combatStats.shieldBonus ?? 0;
  const miscACBonus = combatStats.miscACBonus ?? 0;
  const dexToAC = loseDex ? 0 : mods.dex;
  const totalAC = 10 + dexToAC + armorBonus + shieldBonus + miscACBonus + condAC;
  const acTooltip = [
    '10 base',
    loseDex ? 'DEX: +0 (condition)' : `DEX: ${fmt(mods.dex)}`,
    armorBonus !== 0 ? `Armor: +${armorBonus}` : null,
    shieldBonus !== 0 ? `Shield: +${shieldBonus}` : null,
    miscACBonus !== 0 ? `Misc: +${miscACBonus}` : null,
    condAC !== 0 ? `Conditions: ${condAC}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const initiativeBonus = combatStats.initiativeBonus ?? 0;
  const initiative = mods.dex + initiativeBonus + condInit;
  const initTooltip = [
    `DEX: ${fmt(mods.dex)}`,
    initiativeBonus !== 0 ? `Misc: +${initiativeBonus}` : null,
    condInit !== 0 ? `Conditions: ${condInit}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const babResult = calculateTotalBAB(levels);
  const bab = babResult.total;
  const babTooltip = babResult.components.map((c) => `${c.label}: +${c.value}`).join('\n');

  const fortResult = calculateTotalSave(levels, 'fortitude');
  const fortBase = fortResult.total;
  const fortBonus = saveBonuses['Fortitude'] ?? 0;
  const fort = fortBase + mods.con + fortBonus + condSave;
  const fortTooltip = [
    ...fortResult.components.map((c) => `${c.label}: +${c.value}`),
    `CON: ${fmt(mods.con)}`,
    fortBonus !== 0 ? `Bonus: +${fortBonus}` : null,
    condSave !== 0 ? `Conditions: ${condSave}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const refResult = calculateTotalSave(levels, 'reflex');
  const refBase = refResult.total;
  const refBonus = saveBonuses['Reflex'] ?? 0;
  const ref = refBase + mods.dex + refBonus + condSave;
  const refTooltip = [
    ...refResult.components.map((c) => `${c.label}: +${c.value}`),
    `DEX: ${fmt(mods.dex)}`,
    refBonus !== 0 ? `Bonus: +${refBonus}` : null,
    condSave !== 0 ? `Conditions: ${condSave}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const willResult = calculateTotalSave(levels, 'will');
  const willBase = willResult.total;
  const willBonus = saveBonuses['Will'] ?? 0;
  const will = willBase + mods.wis + willBonus + condSave;
  const willTooltip = [
    ...willResult.components.map((c) => `${c.label}: +${c.value}`),
    `WIS: ${fmt(mods.wis)}`,
    willBonus !== 0 ? `Bonus: +${willBonus}` : null,
    condSave !== 0 ? `Conditions: ${condSave}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const activeConditionCount = Object.values(statusEffects).filter((e) => e.active).length;

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

      {/* Conditions */}
      <div className="play-sheet__section">
        <div className="play-sheet__section-label">
          Conditions{activeConditionCount > 0 ? ` (${activeConditionCount} active)` : ''}
        </div>
        <StatusEffectsPanel
          statusEffects={statusEffects}
          onToggle={toggleStatusEffect}
          onSetRounds={setStatusEffectRounds}
          onClearAll={clearAllStatusEffects}
          onBlur={onBlur}
        />
      </div>

      {/* Ability Damage */}
      <div className="play-sheet__section">
        <div className="play-sheet__section-label">Ability Score Damage</div>
        <AbilityDamagePanel
          scores={scores}
          effectiveScores={effectiveScores}
          abilityDamage={abilityDamage}
          onSetDamage={setAbilityDamage}
          onBlur={onBlur}
        />
      </div>

      {/* Resources */}
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

      {/* Equipment */}
      <div className="play-sheet__section">
        <div className="play-sheet__section-label">Equipment</div>
        <EquipmentPanel
          equipment={equipment}
          onAdd={addEquipment}
          onRemove={removeEquipment}
          onToggleEquipped={toggleEquipped}
          onSetNotes={setEquipmentNotes}
          onBlur={onBlur}
        />
      </div>

      {/* Notes */}
      <div className="play-sheet__section">
        <div className="play-sheet__section-label">Notes</div>
        <NotesPanel notes={notes} setNotes={setNotes} onBlur={onBlur} />
      </div>
    </div>
  );
}
