// src/data/classes.ts
import { type Class, ClassesFileSchema } from '../types/class';
import rawClasses from './classes.json' assert { type: 'json' };

const parsed = ClassesFileSchema.parse(rawClasses);
export const classes: Class[] = parsed;

// Extract valid class names for validation
export const CLASS_NAMES = classes.map((c) => c.name) as [string, ...string[]];

export function findClass(name: string): Class | undefined {
  const needle = name.trim().toLowerCase();
  return classes.find((c) => c.name.toLowerCase() === needle);
}
