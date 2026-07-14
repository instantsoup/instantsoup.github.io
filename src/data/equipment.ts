import { type EquipmentRef } from '../types/equipment-ref';
import rawEquipment from './equipment.json' with { type: 'json' };

export const equipmentRefs: EquipmentRef[] = rawEquipment as EquipmentRef[];

export const EQUIPMENT_NAMES = equipmentRefs.map((e) => e.name) as [string, ...string[]];

export function findEquipmentRef(name: string): EquipmentRef | undefined {
  const needle = name.trim().toLowerCase();
  return equipmentRefs.find((e) => e.name.toLowerCase() === needle);
}

export function equipmentRefsByCategory(category: string): EquipmentRef[] {
  return equipmentRefs.filter((e) => e.category === category);
}
