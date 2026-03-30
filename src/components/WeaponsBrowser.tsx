import { useState } from 'react';

import { weaponRefs } from '../data/weapons';
import { type Weapon } from '../schema/schema';
import { type WeaponRef } from '../types/weapon-ref';

function toWeapon(ref: WeaponRef): Weapon {
  return {
    name: ref.name,
    damage: ref.damageMd,
    critRange: ref.critRange,
    critMult: ref.critMult,
    attackType: ref.handedness === 'ranged' ? 'ranged' : 'melee',
    attackBonus: 0,
    damageBonus: 0,
    damageType: ref.damageType !== '—' ? ref.damageType : undefined,
    rangeIncrement: ref.rangeIncrement,
  };
}

function formatCrit(range: number, mult: number): string {
  return (range < 20 ? `${range}–20` : '20') + `/×${mult}`;
}

function formatCost(gp?: number): string {
  if (gp === undefined || gp === 0) return '—';
  if (gp < 1) {
    const sp = Math.round(gp * 10);
    const cp = Math.round(gp * 100);
    return sp * 10 === cp ? `${sp} sp` : `${cp} cp`;
  }
  return `${gp} gp`;
}

type WeaponsBrowserProps = {
  onAdd?: (weapon: Weapon) => void;
};

export function WeaponsBrowser({ onAdd }: WeaponsBrowserProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [handedness, setHandedness] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = weaponRefs.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || w.category === category;
    const matchHand = !handedness || w.handedness === handedness;
    return matchSearch && matchCat && matchHand;
  });

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search weapons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="browser__filters">
          <select
            className="browser__filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="simple">Simple</option>
            <option value="martial">Martial</option>
            <option value="exotic">Exotic</option>
          </select>
          <select
            className="browser__filter"
            value={handedness}
            onChange={(e) => setHandedness(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="unarmed">Unarmed</option>
            <option value="light">Light</option>
            <option value="one-handed">One-Handed</option>
            <option value="two-handed">Two-Handed</option>
            <option value="ranged">Ranged</option>
          </select>
        </div>
      </div>

      <div className="browser__count">
        {filtered.length} of {weaponRefs.length} weapons
      </div>

      <ul className="browser__list">
        {filtered.map((w) => {
          const isExpanded = expanded === w.name;
          const critStr = formatCrit(w.critRange, w.critMult);
          return (
            <li
              key={w.name}
              className={`browser__item${isExpanded ? ' browser__item--expanded' : ''}`}
              onClick={() => setExpanded(isExpanded ? null : w.name)}
            >
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{w.name}</span>
                  <div className="browser__stats-row">
                    <span className="browser__stat browser__stat--damage">{w.damageMd}</span>
                    <span className="browser__stat browser__stat--crit">{critStr}</span>
                    <span className="browser__stat">{w.damageType}</span>
                    {w.rangeIncrement && (
                      <span className="browser__stat">{w.rangeIncrement} ft.</span>
                    )}
                  </div>
                </div>
                <div className="browser__item-actions">
                  <span
                    className={`browser__item-badge browser__item-badge--${w.category}`}
                  >
                    {w.category}
                  </span>
                  {onAdd && (
                    <button
                      className="browser__item-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd(toWeapon(w));
                      }}
                      title="Add to character"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  <div className="browser__details-row">
                    <span className="browser__details-label">Sm / Md:</span> {w.damageSm} /{' '}
                    {w.damageMd}
                  </div>
                  <div className="browser__details-row">
                    <span className="browser__details-label">Crit:</span> {critStr}
                    {' · '}
                    <span className="browser__details-label">Type:</span> {w.damageType}
                  </div>
                  {w.rangeIncrement && (
                    <div className="browser__details-row">
                      <span className="browser__details-label">Range increment:</span>{' '}
                      {w.rangeIncrement} ft.
                    </div>
                  )}
                  <div className="browser__details-row">
                    <span className="browser__details-label">Weight:</span>{' '}
                    {w.weightLb !== undefined ? `${w.weightLb} lb` : '—'}
                    {' · '}
                    <span className="browser__details-label">Cost:</span> {formatCost(w.costGp)}
                  </div>
                  {w.special && w.special.length > 0 && (
                    <div className="browser__details-tags">
                      {w.special.map((s) => (
                        <span key={s} className="browser__details-tag">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="browser__details-source">
                    {w.category} · {w.handedness} · {w.source.abbr}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No weapons found</div>}
    </div>
  );
}
