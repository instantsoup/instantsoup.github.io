import { useState } from 'react';

import type { EquipmentItem } from '../schema/schema';

type EquipmentPanelProps = {
  equipment: EquipmentItem[];
  onAdd: (item: EquipmentItem) => void;
  onRemove: (index: number) => void;
  onToggleEquipped: (index: number) => void;
  onSetNotes: (index: number, notes: string) => void;
  onBlur: () => void;
};

export function EquipmentPanel({
  equipment,
  onAdd,
  onRemove,
  onToggleEquipped,
  onSetNotes,
  onBlur,
}: EquipmentPanelProps) {
  const [newName, setNewName] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, equipped: false });
    setNewName('');
    onBlur();
  };

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
        <button className="btn btn--sm btn--primary" onClick={handleAdd} disabled={!newName.trim()}>
          Add
        </button>
      </div>
    </div>
  );
}
