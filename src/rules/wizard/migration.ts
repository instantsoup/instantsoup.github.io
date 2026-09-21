/**
 * One-time consolidation: wizard levels used to keep their own `spells` list, separate
 * from the spellbook.  The spellbook is now the single record of what a wizard knows,
 * so those per-level picks are folded into it.  Idempotent — a second run is a no-op.
 */

import type { SpellbookEntry } from '../../types/spellbook';
import type { Level } from '../types';
import { freeSourceForWizardLevel } from './spellbook';

export function foldWizardLevelSpellsIntoSpellbook(
  levels: Level[],
  spellbook: SpellbookEntry[],
): { levels: Level[]; spellbook: SpellbookEntry[] } {
  if (!levels.some((l) => l.class === 'Wizard' && (l.spells ?? []).length > 0)) {
    return { levels, spellbook };
  }

  const known = new Set(spellbook.map((e) => e.spellName.toLowerCase()));
  const added: SpellbookEntry[] = [];
  let wizardLevel = 0;

  const migratedLevels = levels.map((lvl) => {
    if (lvl.class !== 'Wizard') return lvl;
    wizardLevel += 1;
    for (const name of lvl.spells ?? []) {
      const key = name.toLowerCase();
      if (known.has(key)) continue;
      known.add(key);
      added.push({
        spellName: name,
        source: freeSourceForWizardLevel(wizardLevel),
        goldPaid: 0,
        addedAtCharLevel: lvl.level,
        borrowed: false,
      });
    }
    return { ...lvl, spells: [] };
  });

  return { levels: migratedLevels, spellbook: [...spellbook, ...added] };
}
