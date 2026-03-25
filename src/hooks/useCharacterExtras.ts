import { useState } from 'react';

import type { Character, CustomResource, Taint } from '../schema/schema';

export function useCharacterExtras(initial: Character) {
  const [flaws, setFlaws] = useState<string[]>(initial.flaws ?? []);
  const [languages, setLanguages] = useState<string[]>(initial.languages ?? []);
  const [taint, setTaint] = useState<Taint | undefined>(initial.taint);
  const [customResources, setCustomResources] = useState<CustomResource[]>(
    initial.customResources ?? [],
  );
  const [notes, setNotes] = useState<string>(initial.notes ?? '');

  // Flaws
  const addFlaw = (flawName: string) =>
    setFlaws((prev) => (prev.includes(flawName) ? prev : [...prev, flawName]));
  const removeFlaw = (flawName: string) => setFlaws((prev) => prev.filter((f) => f !== flawName));

  // Languages
  const addLanguage = (lang: string) =>
    setLanguages((prev) => (prev.includes(lang) ? prev : [...prev, lang]));
  const removeLanguage = (lang: string) => setLanguages((prev) => prev.filter((l) => l !== lang));

  // Taint
  const enableTaint = () => setTaint({ depravity: 0, corruption: 0 });
  const disableTaint = () => setTaint(undefined);
  const updateTaint = (field: keyof Taint, value: number) =>
    setTaint((prev) => ({
      depravity: 0,
      corruption: 0,
      ...prev,
      [field]: Math.max(0, Math.min(9, value)),
    }));

  // Custom resources
  const addCustomResource = (resource: CustomResource) =>
    setCustomResources((prev) => [...prev, resource]);

  const removeCustomResource = (index: number) =>
    setCustomResources((prev) => prev.filter((_, i) => i !== index));

  const updateCustomResourceUsed = (index: number, used: number) =>
    setCustomResources((prev) =>
      prev.map((r, i) => (i === index ? { ...r, used: Math.max(0, Math.min(r.max, used)) } : r)),
    );

  const resetCustomResource = (index: number) =>
    setCustomResources((prev) => prev.map((r, i) => (i === index ? { ...r, used: 0 } : r)));

  const resetAllCustomResources = () =>
    setCustomResources((prev) => prev.map((r) => ({ ...r, used: 0 })));

  const loadFrom = (char: Character) => {
    setFlaws(char.flaws ?? []);
    setLanguages(char.languages ?? []);
    setTaint(char.taint);
    setCustomResources(char.customResources ?? []);
    setNotes(char.notes ?? '');
  };

  const reset = () => {
    setFlaws([]);
    setLanguages([]);
    setTaint(undefined);
    setCustomResources([]);
    setNotes('');
  };

  return {
    flaws,
    addFlaw,
    removeFlaw,
    languages,
    addLanguage,
    removeLanguage,
    taint,
    enableTaint,
    disableTaint,
    updateTaint,
    customResources,
    addCustomResource,
    removeCustomResource,
    updateCustomResourceUsed,
    resetCustomResource,
    resetAllCustomResources,
    notes,
    setNotes,
    loadFrom,
    reset,
  };
}
