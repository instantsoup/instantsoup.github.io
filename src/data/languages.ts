import { type Language } from '../types/language';
import rawLanguages from './languages.json' with { type: 'json' };

export const languages: Language[] = rawLanguages as Language[];

export function findLanguage(name: string): Language | undefined {
  const needle = name.trim().toLowerCase();
  return languages.find((l) => l.name.toLowerCase() === needle);
}
