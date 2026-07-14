import { alignments } from '../data/alignments';
import type { ConditionPenalties } from '../data/conditions';
import {
  calculateTotalBAB,
  calculateTotalSave,
  formatAttacks,
  getEncumbranceSummary,
  getIterativeAttacks,
  getPrimarySpellcastingAbility,
  heavyLoad as getHeavyLoad,
  lightLoad as getLightLoad,
  mediumLoad as getMediumLoad,
  spellDC,
  xpForLevel,
} from '../rules';
import type {
  AbilityDamage,
  CombatStats,
  Currency,
  CustomResource,
  EquipmentItem,
  StatusEffect,
  Weapon,
} from '../schema/schema';
import type { Scores } from '../types';
import type { Level } from '../types/level';
import { AbilityDamagePanel } from './AbilityDamagePanel';
import { CombatTracker } from './CombatTracker';
import { EquipmentPanel } from './EquipmentPanel';
import { HPTracker } from './HPTracker';
import { NotesPanel } from './NotesPanel';
import { ResourceTracker } from './ResourceTracker';
import { StatusEffectsPanel } from './StatusEffectsPanel';
import { WeaponsPanel } from './WeaponsPanel';

type PlaySheetProps = {
  name: string;
  race: string | undefined;
  alignment: string | undefined;
  deity?: string;
  homeland?: string;
  xp: number;
  setXP: (value: number) => void;
  currency: Currency;
  setCurrencyField: (field: keyof Currency, value: number) => void;
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
  str: number;
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
  setEquipmentWeight: (index: number, weight: number) => void;
  weapons: Weapon[];
  addWeapon: (w: Weapon) => void;
  removeWeapon: (index: number) => void;
  updateWeapon: (index: number, w: Weapon) => void;
  notes: string;
  setNotes: (v: string) => void;
  onBlur: () => void;
  startCombat: () => void;
  endCombat: () => void;
  setCombatInitiative: (n: number) => void;
  onAdvanceRound: () => void;
};

export function PlaySheet({
  name,
  race,
  alignment,
  deity,
  homeland,
  xp,
  setXP,
  currency,
  setCurrencyField,
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
  str,
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
  setEquipmentWeight,
  weapons,
  addWeapon,
  removeWeapon,
  updateWeapon,
  notes,
  setNotes,
  onBlur,
  startCombat,
  endCombat,
  setCombatInitiative,
  onAdvanceRound,
}: PlaySheetProps) {
  const alignmentLabel = alignment
    ? (alignments.find((a) => a.code === alignment)?.label ?? alignment)
    : undefined;

  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  const condAC = conditionPenalties.ac ?? 0;
  const condInit = conditionPenalties.initiative ?? 0;
  const condSave = conditionPenalties.save ?? 0;
  const loseDex = conditionPenalties.loseDexToAC ?? false;

  // Encumbrance
  const baseSpeed = combatStats.movementSpeed ?? 30;
  const { loadCategory, encMaxDex, effectiveSpeed } = getEncumbranceSummary(
    equipment,
    effectiveScores.str,
    combatStats.armorCheckPenalty ?? 0,
    baseSpeed,
  );
  const speedEncumbered = loadCategory !== 'light' && loadCategory !== 'overloaded';

  const armorBonus = combatStats.armorBonus ?? 0;
  const shieldBonus = combatStats.shieldBonus ?? 0;
  const naturalArmorBonus = combatStats.naturalArmorBonus ?? 0;
  const miscACBonus = combatStats.miscACBonus ?? 0;
  const rawDexToAC = loseDex ? 0 : Math.min(mods.dex, encMaxDex);
  const dexToAC = rawDexToAC;
  const totalAC =
    10 + dexToAC + armorBonus + shieldBonus + naturalArmorBonus + miscACBonus + condAC;
  const acTooltip = [
    '10 base',
    loseDex
      ? 'DEX: +0 (condition)'
      : encMaxDex < mods.dex
        ? `DEX: +${encMaxDex} (enc. cap ${encMaxDex})`
        : `DEX: ${fmt(mods.dex)}`,
    armorBonus !== 0 ? `Armor: +${armorBonus}` : null,
    shieldBonus !== 0 ? `Shield: +${shieldBonus}` : null,
    naturalArmorBonus !== 0 ? `Natural: +${naturalArmorBonus}` : null,
    miscACBonus !== 0 ? `Misc: +${miscACBonus}` : null,
    condAC !== 0 ? `Conditions: ${condAC}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const touchAC = 10 + dexToAC + miscACBonus + condAC;
  const touchACTooltip = [
    '10 base',
    loseDex
      ? 'DEX: +0 (condition)'
      : encMaxDex < mods.dex
        ? `DEX: +${encMaxDex} (enc. cap ${encMaxDex})`
        : `DEX: ${fmt(mods.dex)}`,
    miscACBonus !== 0 ? `Misc: +${miscACBonus}` : null,
    condAC !== 0 ? `Conditions: ${condAC}` : null,
    '(no armor/shield/natural)',
  ]
    .filter(Boolean)
    .join('\n');

  const flatFootedAC = 10 + armorBonus + shieldBonus + naturalArmorBonus + miscACBonus + condAC;
  const flatFootedACTooltip = [
    '10 base',
    armorBonus !== 0 ? `Armor: +${armorBonus}` : null,
    shieldBonus !== 0 ? `Shield: +${shieldBonus}` : null,
    naturalArmorBonus !== 0 ? `Natural: +${naturalArmorBonus}` : null,
    miscACBonus !== 0 ? `Misc: +${miscACBonus}` : null,
    condAC !== 0 ? `Conditions: ${condAC}` : null,
    '(no DEX)',
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
  const iterativeBABStr = formatAttacks(getIterativeAttacks(bab, bab));

  const spellAbility = getPrimarySpellcastingAbility(levels);
  const baseSpellDC = spellAbility !== null ? spellDC(0, mods[spellAbility as keyof Scores]) : null;
  const spellDCTooltip =
    spellAbility !== null
      ? `10 base\n${spellAbility.toUpperCase()}: ${fmt(mods[spellAbility as keyof Scores])}\n(add spell level for per-spell DC)`
      : undefined;

  const totalCarriedWeight = equipment.reduce((s, i) => s + (i.weight ?? 0), 0);
  const lightLimit = getLightLoad(effectiveScores.str);
  const medLimit = getMediumLoad(effectiveScores.str);
  const heavyLimit = getHeavyLoad(effectiveScores.str);
  const loadLabel = loadCategory.charAt(0).toUpperCase() + loadCategory.slice(1);
  const encTooltip = `${totalCarriedWeight} lb carried\nLight ≤${lightLimit} / Med ≤${medLimit} / Heavy ≤${heavyLimit} lb`;

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
        {deity && <span className="play-sheet__identity-detail">{deity}</span>}
        {homeland && <span className="play-sheet__identity-detail">{homeland}</span>}
      </div>

      {/* Combat Tracker */}
      <CombatTracker
        inCombat={combatStats.inCombat ?? false}
        combatRound={combatStats.combatRound ?? 1}
        combatInitiative={combatStats.combatInitiative}
        initiativeBonus={mods.dex + (combatStats.initiativeBonus ?? 0)}
        onStart={startCombat}
        onEnd={endCombat}
        onSetInitiative={setCombatInitiative}
        onAdvanceRound={onAdvanceRound}
      />

      {/* HP */}
      <div className="play-sheet__section">
        <HPTracker
          mods={mods}
          combatStats={combatStats}
          levels={levels}
          conScore={effectiveScores.con}
          updateCombatStat={updateCombatStat}
          onBlur={onBlur}
        />
      </div>

      {/* XP */}
      <div className="play-sheet__xp">
        <span className="play-sheet__xp-label">XP</span>
        <input
          type="number"
          className="play-sheet__xp-input"
          value={xp}
          onChange={(e) => setXP(parseInt(e.target.value) || 0)}
          onBlur={onBlur}
          min="0"
        />
        <span className="play-sheet__xp-threshold">
          / {xpForLevel(levels.length + 1).toLocaleString()} → Level {levels.length + 1}
        </span>
      </div>

      {/* Currency */}
      {(currency.pp > 0 || currency.gp > 0 || currency.sp > 0 || currency.cp > 0) && (
        <div className="play-sheet__currency">
          {(['pp', 'gp', 'sp', 'cp'] as const).map((coin) => (
            <label key={coin} className="play-sheet__coin">
              <span className="play-sheet__coin-label">{coin.toUpperCase()}</span>
              <input
                type="number"
                className="play-sheet__coin-input"
                value={currency[coin]}
                onChange={(e) => setCurrencyField(coin, parseInt(e.target.value) || 0)}
                onBlur={onBlur}
                min="0"
              />
            </label>
          ))}
        </div>
      )}

      {/* Combat Stats Row */}
      <div className="play-sheet__stats-row">
        <div className="play-sheet__stat" title={acTooltip}>
          <span className="play-sheet__stat-label">AC</span>
          <span className="play-sheet__stat-value">{totalAC}</span>
        </div>
        <div className="play-sheet__stat" title={touchACTooltip}>
          <span className="play-sheet__stat-label">Touch</span>
          <span className="play-sheet__stat-value">{touchAC}</span>
        </div>
        <div className="play-sheet__stat" title={flatFootedACTooltip}>
          <span className="play-sheet__stat-label">FF AC</span>
          <span className="play-sheet__stat-value">{flatFootedAC}</span>
        </div>
        <div className="play-sheet__stat" title={initTooltip}>
          <span className="play-sheet__stat-label">Init</span>
          <span className="play-sheet__stat-value">{fmt(initiative)}</span>
        </div>
        <div className="play-sheet__stat play-sheet__stat--wide" title={babTooltip || undefined}>
          <span className="play-sheet__stat-label">BAB</span>
          <span className="play-sheet__stat-value play-sheet__stat-value--movement">
            {iterativeBABStr}
          </span>
        </div>
        {(combatStats.spellResistance ?? 0) > 0 && (
          <div className="play-sheet__stat">
            <span className="play-sheet__stat-label">SR</span>
            <span className="play-sheet__stat-value">{combatStats.spellResistance}</span>
          </div>
        )}
        {baseSpellDC !== null && (
          <div className="play-sheet__stat" title={spellDCTooltip}>
            <span className="play-sheet__stat-label">Spell DC</span>
            <span className="play-sheet__stat-value">{baseSpellDC}+</span>
          </div>
        )}
        <div
          className="play-sheet__stat play-sheet__stat--wide"
          title={speedEncumbered ? `Base: ${baseSpeed} ft. (enc. reduced)` : undefined}
        >
          <span className="play-sheet__stat-label">Move</span>
          <span className="play-sheet__stat-value play-sheet__stat-value--movement">
            {speedEncumbered ? effectiveSpeed : baseSpeed} ft.
            {combatStats.movementType ? ` (${combatStats.movementType})` : ''}
            {speedEncumbered ? ' *' : ''}
          </span>
        </div>
        <div className="play-sheet__stat play-sheet__stat--wide" title={encTooltip}>
          <span className="play-sheet__stat-label">Enc</span>
          <span className="play-sheet__stat-value play-sheet__stat-value--movement">
            {totalCarriedWeight} lb · {loadLabel}
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

      {/* Weapons */}
      <div className="play-sheet__section">
        <div className="play-sheet__section-label">Weapons</div>
        <WeaponsPanel
          weapons={weapons}
          mods={mods}
          bab={bab}
          conditionAttackPenalty={conditionPenalties.attack ?? 0}
          onAdd={addWeapon}
          onRemove={removeWeapon}
          onUpdate={updateWeapon}
          onBlur={onBlur}
          readOnly
        />
      </div>

      {/* Equipment */}
      <div className="play-sheet__section">
        <div className="play-sheet__section-label">Equipment</div>
        <EquipmentPanel
          equipment={equipment}
          str={str}
          onAdd={addEquipment}
          onRemove={removeEquipment}
          onToggleEquipped={toggleEquipped}
          onSetNotes={setEquipmentNotes}
          onSetWeight={setEquipmentWeight}
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
