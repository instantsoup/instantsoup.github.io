import { useState } from 'react';

import type { Scores } from '../types';
import type { Weapon } from '../schema/schema';

type WeaponsPanelProps = {
  weapons: Weapon[];
  mods: Scores;
  bab: number;
  conditionAttackPenalty: number;
  onAdd: (w: Weapon) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, w: Weapon) => void;
  onBlur: () => void;
  readOnly?: boolean;
};

function getIterativeAttacks(totalAttack: number, bab: number): number[] {
  const attacks = [totalAttack];
  if (bab >= 6) attacks.push(totalAttack - 5);
  if (bab >= 11) attacks.push(totalAttack - 10);
  if (bab >= 16) attacks.push(totalAttack - 15);
  return attacks;
}

function formatCrit(critRange: number, critMult: number): string {
  const range = critRange < 20 ? `${critRange}–20` : '20';
  return `${range}/×${critMult}`;
}

function formatAttacks(attacks: number[]): string {
  return attacks.map((n) => (n >= 0 ? `+${n}` : `${n}`)).join('/');
}

function WeaponCard({
  weapon,
  mods,
  bab,
  conditionAttackPenalty,
  index,
  onRemove,
  onUpdate,
  onBlur,
  readOnly,
}: {
  weapon: Weapon;
  mods: Scores;
  bab: number;
  conditionAttackPenalty: number;
  index: number;
  onRemove: (i: number) => void;
  onUpdate: (i: number, w: Weapon) => void;
  onBlur: () => void;
  readOnly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Weapon>(weapon);

  const abilityMod = weapon.attackType === 'ranged' ? mods.dex : mods.str;
  const damageMod = weapon.attackType === 'melee' ? mods.str : 0;
  const totalAttack = bab + abilityMod + weapon.attackBonus + conditionAttackPenalty;
  const attacks = getIterativeAttacks(totalAttack, bab);
  const totalDamageBonus = damageMod + weapon.damageBonus;
  const damageSuffix =
    totalDamageBonus > 0
      ? `+${totalDamageBonus}`
      : totalDamageBonus < 0
        ? `${totalDamageBonus}`
        : '';

  if (!readOnly && editing) {
    const set = (key: keyof Weapon, value: unknown) =>
      setDraft((prev) => ({ ...prev, [key]: value }));
    return (
      <div className="weapon-card weapon-card--editing">
        <div className="weapon-card__edit-row">
          <input
            className="weapon-card__edit-input weapon-card__edit-name"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Weapon name"
          />
          <select
            className="weapon-card__edit-select"
            value={draft.attackType}
            onChange={(e) => set('attackType', e.target.value)}
          >
            <option value="melee">Melee</option>
            <option value="ranged">Ranged</option>
            <option value="touch">Touch</option>
          </select>
        </div>
        <div className="weapon-card__edit-row">
          <label className="weapon-card__edit-label">
            Damage
            <input
              className="weapon-card__edit-input weapon-card__edit-damage"
              value={draft.damage}
              onChange={(e) => set('damage', e.target.value)}
              placeholder="1d6"
            />
          </label>
          <label className="weapon-card__edit-label">
            Atk bonus
            <input
              className="weapon-card__edit-input weapon-card__edit-num"
              type="number"
              value={draft.attackBonus}
              onChange={(e) => set('attackBonus', parseInt(e.target.value) || 0)}
            />
          </label>
          <label className="weapon-card__edit-label">
            Dmg bonus
            <input
              className="weapon-card__edit-input weapon-card__edit-num"
              type="number"
              value={draft.damageBonus}
              onChange={(e) => set('damageBonus', parseInt(e.target.value) || 0)}
            />
          </label>
        </div>
        <div className="weapon-card__edit-row">
          <label className="weapon-card__edit-label">
            Crit range
            <input
              className="weapon-card__edit-input weapon-card__edit-num"
              type="number"
              min="1"
              max="20"
              value={draft.critRange}
              onChange={(e) => set('critRange', parseInt(e.target.value) || 20)}
            />
          </label>
          <label className="weapon-card__edit-label">
            Crit mult
            <input
              className="weapon-card__edit-input weapon-card__edit-num"
              type="number"
              min="2"
              max="4"
              value={draft.critMult}
              onChange={(e) => set('critMult', parseInt(e.target.value) || 2)}
            />
          </label>
          <label className="weapon-card__edit-label">
            Dmg type
            <input
              className="weapon-card__edit-input weapon-card__edit-dmgtype"
              value={draft.damageType ?? ''}
              onChange={(e) => set('damageType', e.target.value || undefined)}
              placeholder="e.g. slashing"
            />
          </label>
        </div>
        <div className="weapon-card__edit-actions">
          <button
            className="btn btn--sm btn--primary"
            onClick={() => {
              onUpdate(index, draft);
              setEditing(false);
              onBlur();
            }}
            disabled={!draft.name.trim()}
          >
            Save
          </button>
          <button
            className="btn btn--sm btn--ghost"
            onClick={() => {
              setDraft(weapon);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="weapon-card">
      <div className="weapon-card__header">
        <span className="weapon-card__name">{weapon.name}</span>
        <span className="weapon-card__type">{weapon.attackType}</span>
        {!readOnly && (
          <div className="weapon-card__actions">
            <button
              className="btn btn--xs btn--ghost"
              onClick={() => setEditing(true)}
              title="Edit"
            >
              ✎
            </button>
            <button
              className="btn btn--xs btn--danger-ghost"
              onClick={() => {
                onRemove(index);
                onBlur();
              }}
              title="Remove"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <div className="weapon-card__stats">
        <span className="weapon-card__attack-line" title={`BAB ${bab >= 0 ? '+' : ''}${bab}, ability ${abilityMod >= 0 ? '+' : ''}${abilityMod}, bonus ${weapon.attackBonus >= 0 ? '+' : ''}${weapon.attackBonus}${conditionAttackPenalty !== 0 ? `, conditions ${conditionAttackPenalty}` : ''}`}>
          {formatAttacks(attacks)}
        </span>
        <span className="weapon-card__damage">
          {weapon.damage}
          {damageSuffix}
          {weapon.damageType ? ` ${weapon.damageType}` : ''}
        </span>
        <span className="weapon-card__crit">{formatCrit(weapon.critRange, weapon.critMult)}</span>
      </div>
    </div>
  );
}

const DEFAULT_WEAPON: Weapon = {
  name: '',
  damage: '1d6',
  critRange: 20,
  critMult: 2,
  attackType: 'melee',
  attackBonus: 0,
  damageBonus: 0,
};

export function WeaponsPanel({
  weapons,
  mods,
  bab,
  conditionAttackPenalty,
  onAdd,
  onRemove,
  onUpdate,
  onBlur,
  readOnly = false,
}: WeaponsPanelProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Weapon>(DEFAULT_WEAPON);

  const set = (key: keyof Weapon, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    onAdd(draft);
    setDraft(DEFAULT_WEAPON);
    setAdding(false);
    onBlur();
  };

  return (
    <div className="weapons">
      {weapons.length === 0 && !adding && (
        <p className="weapons__empty">No weapons added.</p>
      )}
      {weapons.map((w, i) => (
        <WeaponCard
          key={i}
          weapon={w}
          mods={mods}
          bab={bab}
          conditionAttackPenalty={conditionAttackPenalty}
          index={i}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onBlur={onBlur}
          readOnly={readOnly}
        />
      ))}

      {!readOnly && (
        <div className="weapons__add-area">
          {adding ? (
            <div className="weapon-card weapon-card--editing">
              <div className="weapon-card__edit-row">
                <input
                  className="weapon-card__edit-input weapon-card__edit-name"
                  value={draft.name}
                  onChange={(e) => set('name', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Weapon name"
                  autoFocus
                />
                <select
                  className="weapon-card__edit-select"
                  value={draft.attackType}
                  onChange={(e) => set('attackType', e.target.value)}
                >
                  <option value="melee">Melee</option>
                  <option value="ranged">Ranged</option>
                  <option value="touch">Touch</option>
                </select>
              </div>
              <div className="weapon-card__edit-row">
                <label className="weapon-card__edit-label">
                  Damage
                  <input
                    className="weapon-card__edit-input weapon-card__edit-damage"
                    value={draft.damage}
                    onChange={(e) => set('damage', e.target.value)}
                    placeholder="1d6"
                  />
                </label>
                <label className="weapon-card__edit-label">
                  Atk bonus
                  <input
                    className="weapon-card__edit-input weapon-card__edit-num"
                    type="number"
                    value={draft.attackBonus}
                    onChange={(e) => set('attackBonus', parseInt(e.target.value) || 0)}
                  />
                </label>
                <label className="weapon-card__edit-label">
                  Dmg bonus
                  <input
                    className="weapon-card__edit-input weapon-card__edit-num"
                    type="number"
                    value={draft.damageBonus}
                    onChange={(e) => set('damageBonus', parseInt(e.target.value) || 0)}
                  />
                </label>
              </div>
              <div className="weapon-card__edit-row">
                <label className="weapon-card__edit-label">
                  Crit range
                  <input
                    className="weapon-card__edit-input weapon-card__edit-num"
                    type="number"
                    min="1"
                    max="20"
                    value={draft.critRange}
                    onChange={(e) => set('critRange', parseInt(e.target.value) || 20)}
                  />
                </label>
                <label className="weapon-card__edit-label">
                  Crit mult
                  <input
                    className="weapon-card__edit-input weapon-card__edit-num"
                    type="number"
                    min="2"
                    max="4"
                    value={draft.critMult}
                    onChange={(e) => set('critMult', parseInt(e.target.value) || 2)}
                  />
                </label>
                <label className="weapon-card__edit-label">
                  Dmg type
                  <input
                    className="weapon-card__edit-input weapon-card__edit-dmgtype"
                    value={draft.damageType ?? ''}
                    onChange={(e) => set('damageType', e.target.value || undefined)}
                    placeholder="e.g. slashing"
                  />
                </label>
              </div>
              <div className="weapon-card__edit-actions">
                <button
                  className="btn btn--sm btn--primary"
                  onClick={handleAdd}
                  disabled={!draft.name.trim()}
                >
                  Add
                </button>
                <button
                  className="btn btn--sm btn--ghost"
                  onClick={() => {
                    setDraft(DEFAULT_WEAPON);
                    setAdding(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn--sm btn--outline" onClick={() => setAdding(true)}>
              + Add weapon
            </button>
          )}
        </div>
      )}
    </div>
  );
}
