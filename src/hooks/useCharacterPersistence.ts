import { useLayoutEffect, useRef, useState } from 'react';
import { ZodError } from 'zod';

import { downloadJson } from '../lib/download';
import { type Character, CharacterSchema } from '../schema/schema';
import { clearLocal, parseCharacter, saveLocal } from '../store/local';

type LoadCallback = (char: Character) => void;

export function useCharacterPersistence(
  getCurrent: () => Character,
  loadAll: LoadCallback,
  resetAll: () => void,
) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers routinely call a state setter and then persistLocal() in the same tick, when
  // `getCurrent` still closes over the pre-update state. Saving on the next tick from a ref
  // to the latest render's `getCurrent` persists what the user actually just did.
  const getCurrentRef = useRef(getCurrent);
  useLayoutEffect(() => {
    getCurrentRef.current = getCurrent;
  });

  const persistLocal = () => {
    setTimeout(() => saveLocal(getCurrentRef.current()), 0);
    setError(null);
  };

  const exportJson = () => {
    try {
      const parsed = CharacterSchema.parse(getCurrent());
      const safeName = (parsed.name || 'character').replace(/[^\w-]+/g, '_').slice(0, 40);
      downloadJson(`${safeName || 'character'}_v${parsed.version}.json`, parsed);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        const msg = e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        setError(msg || 'Validation failed while exporting.');
      } else if (e instanceof Error) {
        setError(e.message || 'Unable to export JSON.');
      } else {
        setError('Unable to export JSON.');
      }
    }
  };

  const importFromFile = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = parseCharacter(json);
      loadAll(parsed);
      saveLocal(parsed);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        const msg = e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        setError(msg || 'Validation failed while importing.');
      } else if (e instanceof Error) {
        setError(e.message || 'Unable to import file.');
      } else {
        setError('Unable to import file.');
      }
    }
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await importFromFile(f);
    e.target.value = '';
  };

  const doResetAll = () => {
    if (!window.confirm('Clear this character and local saved copy?')) return;
    resetAll();
    clearLocal();
    setError(null);
  };

  return {
    error,
    setError,
    persistLocal,
    exportJson,
    importFromFile,
    onPickFile,
    onFileChange,
    fileInputRef,
    resetAll: doResetAll,
  };
}
