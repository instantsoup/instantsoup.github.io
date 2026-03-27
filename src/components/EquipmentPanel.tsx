import { useState } from 'react';

import { getHeavyLoad, getLightLoad, getLoadCategory, getMediumLoad } from '../lib/encumbrance';
import type { EquipmentItem } from '../schema/schema';

type EquipmentPanelProps = {
  equipment: EquipmentItem[];
  str: number;
  onAdd: (item: EquipmentItem) => void;
  onRemove: (index: number) => void;
  onToggleEquipped: (index: number) => void;
  onSetNotes: (index: number, notes: string) => void;
  onSetWeight: (index: number, weight: number) => void;
  onBlur: () => void;
};

export function EquipmentPanel({
  equipment,
  str,
  onAdd,
  onRemove,
  onToggleEquipped,
  onSetNotes,
  onSetWeight,
  onBlur,
}: EquipmentPanelProps) {
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const weight = parseFloat(newWeight) || 0;
    onAdd({ name: trimmed, equipped: false, weight: Math.max(0, weight) });
    setNewName('');
    setNewWeight('');
    onBlur();
  };

  const totalWeight = equipment.reduce((sum, item) => sum + (item.weight ?? 0), 0);
  const lightLimit = getLightLoad(str);
  const mediumLimit = getMediumLoad(str);
  const heavyLimit = getHeavyLoad(str);
  const loadCategory = getLoadCategory(totalWeight, str);

  const loadLabel = {
    light: 'Light load',
    medium: 'Medium load',
    heavy: 'Heavy load',
    overloaded: 'Overloaded',
  }[loadCategory];

  const loadClass = {
    light: '',
    medium: 'equipment__load--medium',
    heavy: 'equipment__load--heavy',
    overloaded: 'equipment__load--overloaded',
  }[loadCategory];

  return (
    <div className="equipment">
      {equipment.length > 0 && (
        <div className="equipment__list">
          {equipment.map((item, i) => (
            <div
              key={i}
              className={`equipment-item${item.equipped ? ' equipment-item--equipped' : ''}`}
            >
              <div className="equipment-item__row">
                <label className="equipment-item__equipped-label" title="Equipped">
                  <input
                    type="checkbox"
                    checked={item.equipped}
                    onChange={() => {
                      onToggleEquipped(i);
                      onBlur();
                    }}
                  />
                </label>
                <span
                  className="equipment-item__name"
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                >
                  {item.name}
                </span>
                <input
                  className="equipment-item__weight"
                  type="number"
                  min="0"
                  step="0.5"
                  value={item.weight ?? 0}
                  onChange={(e) => onSetWeight(i, parseFloat(e.target.value) || 0)}
                  onBlur={onBlur}
                  title="Weight (lbs)"
                />
                <span className="equipment-item__weight-unit">lb</span>
                <button
                  className="btn btn--xs btn--ghost"
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  title="Notes"
                >
                  {item.notes ? '✎' : '…'}
                </button>
                <button
                  className="btn btn--xs btn--danger-ghost"
                  onClick={() => {
                    onRemove(i);
                    onBlur();
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
              {expandedIndex === i && (
                <input
                  className="equipment-item__notes"
                  type="text"
                  value={item.notes ?? ''}
                  onChange={(e) => onSetNotes(i, e.target.value)}
                  onBlur={onBlur}
                  placeholder="Notes..."
                />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="equipment__add">
        <input
          className="equipment__add-input"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Item name..."
        />
        <input
          className="equipment__add-weight"
          type="number"
          min="0"
          step="0.5"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="lb"
          title="Weight (lbs)"
        />
        <button className="btn btn--sm btn--primary" onClick={handleAdd} disabled={!newName.trim()}>
          Add
        </button>
      </div>
      <div className={`equipment__load ${loadClass}`}>
        <span className="equipment__load-total">
          {totalWeight % 1 === 0 ? totalWeight : totalWeight.toFixed(1)} lb carried
        </span>
        <span className="equipment__load-status">{loadLabel}</span>
        <span className="equipment__load-limits">
          Light {lightLimit} / Med {mediumLimit} / Heavy {heavyLimit} lb
        </span>
      </div>
    </div>
  );
}
