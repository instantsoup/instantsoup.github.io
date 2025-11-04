import { CharacterSchemaV1, type CharacterV1 } from '../schema/schema';
import { emptyScores } from '../types';

const KEY = 'v0-char';

export function loadLocal(): { name: string; scores: typeof emptyScores } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { name: '', scores: emptyScores };
    const json = JSON.parse(raw);
    const safe = CharacterSchemaV1.safeParse(json);
    if (safe.success) return { name: safe.data.name, scores: safe.data.scores };
    return { name: json?.name ?? '', scores: json?.scores ?? emptyScores };
  } catch {
    return { name: '', scores: emptyScores };
  }
}

export function saveLocal(v: CharacterV1) {
  localStorage.setItem(KEY, JSON.stringify(v));
}

export function clearLocal() {
  localStorage.removeItem(KEY);
}
