import { type WeaponRef } from '../types/weapon-ref';
import rawWeapons from './weapons.json' assert { type: 'json' };

export const weaponRefs: WeaponRef[] = rawWeapons as WeaponRef[];

export const WEAPON_NAMES = weaponRefs.map((w) => w.name) as [string, ...string[]];

export function findWeaponRef(name: string): WeaponRef | undefined {
  const needle = name.trim().toLowerCase();
  return weaponRefs.find((w) => w.name.toLowerCase() === needle);
}

export function weaponRefsByCategory(category: WeaponRef['category']): WeaponRef[] {
  return weaponRefs.filter((w) => w.category === category);
}
