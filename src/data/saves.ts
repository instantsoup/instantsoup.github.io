// src/data/saves.ts
import { type Save, SavesFileSchema } from '../types/save';
import rawSaves from './saves.json' with { type: 'json' };

const parsed = SavesFileSchema.parse(rawSaves);
export const saves: Save[] = parsed;

export function findSave(name: string): Save | undefined {
  const needle = name.trim().toLowerCase();
  return saves.find((s) => s.name.toLowerCase() === needle);
}
