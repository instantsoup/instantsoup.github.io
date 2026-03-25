import { useRef, useState } from 'react';
import { ZodError } from 'zod';

import { downloadJson } from '../lib/download';
import { type Character, CharacterSchema } from '../schema/schema';
import { clearLocal, saveLocal } from '../store/local';

type LoadCallback = (char: Character) => void;

export function useCharacterPersistence(
  getCurrent: () => Character,
  loadAll: LoadCallback,
  resetAll: () => void,
) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persistLocal = () => {
    saveLocal(getCurrent());
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
      const parsed = CharacterSchema.parse(json);
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
