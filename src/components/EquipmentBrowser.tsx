import { useState } from 'react';

import { equipmentRefs } from '../data/equipment';
import { type EquipmentItem } from '../schema/schema';
import { type EquipmentRef } from '../types/equipment-ref';

function toEquipmentItem(ref: EquipmentRef): EquipmentItem {
  return {
    name: ref.name,
    equipped: false,
    weight: ref.weightLb ?? 0,
    notes: ref.description,
  };
}

function formatCost(gp?: number): string {
  if (gp === undefined || gp === 0) return '—';
  if (gp < 1) {
    const sp = Math.round(gp * 10);
    const cp = Math.round(gp * 100);
    return sp * 10 === cp ? `${sp} sp` : `${cp} cp`;
  }
  return Number.isInteger(gp) ? `${gp} gp` : `${gp} gp`;
}

type EquipmentBrowserProps = {
  onAdd?: (item: EquipmentItem) => void;
};

export function EquipmentBrowser({ onAdd }: EquipmentBrowserProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = [...new Set(equipmentRefs.map((e) => e.category))].sort();

  const filtered = equipmentRefs.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="browser">
      <div className="browser__search">
        <input
          type="text"
          className="browser__input"
          placeholder="Search equipment..."
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="browser__count">
        {filtered.length} of {equipmentRefs.length} items
      </div>

      <ul className="browser__list">
        {filtered.map((e) => {
          const isExpanded = expanded === e.name;
          return (
            <li
              key={e.name}
              className={`browser__item${isExpanded ? ' browser__item--expanded' : ''}`}
              onClick={() => setExpanded(isExpanded ? null : e.name)}
            >
              <div className="browser__item-header">
                <div>
                  <span className="browser__item-name">{e.name}</span>
                  <div className="browser__stats-row">
                    <span className="browser__stat">{formatCost(e.costGp)}</span>
                    {e.weightLb !== undefined && e.weightLb > 0 && (
                      <span className="browser__stat">{e.weightLb} lb</span>
                    )}
                  </div>
                </div>
                <div className="browser__item-actions">
                  <span className="browser__item-badge browser__item-meta">{e.category}</span>
                  {onAdd && (
                    <button
                      className="browser__item-add"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onAdd(toEquipmentItem(e));
                      }}
                      title="Add to gear list"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="browser__details">
                  {e.description && <div className="browser__details-row">{e.description}</div>}
                  <div className="browser__details-row">
                    <span className="browser__details-label">Cost:</span> {formatCost(e.costGp)}
                    {e.weightLb !== undefined && (
                      <>
                        {' · '}
                        <span className="browser__details-label">Weight:</span> {e.weightLb} lb
                      </>
                    )}
                  </div>
                  <div className="browser__details-source">
                    {e.category} · {e.source.abbr}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && <div className="browser__empty">No items found</div>}
    </div>
  );
}
