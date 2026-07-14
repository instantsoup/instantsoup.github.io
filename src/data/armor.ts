import { type ArmorRef } from '../types/armor-ref';
import rawArmor from './armor.json' with { type: 'json' };

export const armorRefs: ArmorRef[] = rawArmor as ArmorRef[];

export const ARMOR_NAMES = armorRefs.map((a) => a.name) as [string, ...string[]];

export function findArmorRef(name: string): ArmorRef | undefined {
  const needle = name.trim().toLowerCase();
  return armorRefs.find((a) => a.name.toLowerCase() === needle);
}

export function armorRefsByCategory(category: ArmorRef['category']): ArmorRef[] {
  return armorRefs.filter((a) => a.category === category);
}
