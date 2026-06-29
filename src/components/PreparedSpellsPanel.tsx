import { useMemo, useState } from 'react';

import type { CombatStats } from '../schema/schema';

const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

function schoolClass(school: string): string {
  const map: Record<string, string> = {
    Abjuration: 'school--abj',
    Conjuration: 'school--con',
    Divination: 'school--div',
    Enchantment: 'school--enc',
    Evocation: 'school--evo',
    Illusion: 'school--ill',
    Necromancy: 'school--nec',
    Transmutation: 'school--tra',
    Universal: 'school--uni',
  };
  return map[school] ?? 'school--other';
}

type ClassSpell = { name: string; school: string };

type Props = {
  combatStats: CombatStats;
  effectiveSlots: Record<string, number>;
  memorizedSpells: Record<string, string[]>;
  memorizedSpellsUsed: Record<string, boolean[]>;
  castingMod: number | undefined;
  /** Class spell list by spell level, e.g. classSpellsByLevel['1'] = [{name, school}, ...] */
  classSpellsByLevel: Record<string, ClassSpell[]>;
  /** Whether to show a domain slot indicator on each non-0 spell level (Cleric) */
  hasDomains: boolean;
  addMemorizedSpell: (level: string, name: string) => void;
  removeMemorizedSpell: (level: string, index: number) => void;
  castMemorizedSpell: (level: string, index: number) => void;
  uncastMemorizedSpell: (level: string, index: number) => void;
  newDaySpells: () => void;
  onBlur: () => void;
};

export function PreparedSpellsPanel({
  combatStats,
  effectiveSlots,
  memorizedSpells,
  memorizedSpellsUsed,
  castingMod,
  classSpellsByLevel,
  hasDomains,
  addMemorizedSpell,
  removeMemorizedSpell,
  castMemorizedSpell,
  uncastMemorizedSpell,
  newDaySpells,
  onBlur,
}: Props) {
  const [preparingLevel, setPreparingLevel] = useState<string | null>(null);
  const [pickSearch, setPickSearch] = useState('');
  const [showFullListForLevel, setShowFullListForLevel] = useState<Record<string, boolean>>({});

  const slotsMax = combatStats.spellSlotsMax ?? {};

  // Max spell level the character can cast based on class progression (ignores manual slot overrides)
  const maxCastableLevel = useMemo(
    () =>
      Object.keys(effectiveSlots).length > 0
        ? Math.max(...Object.keys(effectiveSlots).map(Number))
        : 0,
    [effectiveSlots],
  );

  const accessibleLevels = useMemo(
    () => SPELL_LEVELS.filter((lvl) => (slotsMax[lvl] ?? effectiveSlots[lvl] ?? 0) > 0),
    [slotsMax, effectiveSlots],
  );

  const totalPrepared = Object.values(memorizedSpells).reduce((s, arr) => s + arr.length, 0);
  const totalCast = Object.values(memorizedSpellsUsed).reduce(
    (s, arr) => s + arr.filter(Boolean).length,
    0,
  );

  const handleNewDay = () => {
    newDaySpells();
    onBlur();
  };

  const handlePrepare = (lvl: string, spellName: string) => {
    addMemorizedSpell(lvl, spellName);
    setPreparingLevel(null);
    setPickSearch('');
    onBlur();
  };

  if (accessibleLevels.length === 0) {
    return (
      <p className="panel-empty">
        No spell slots configured. Go to Build → Spell Slots and use Auto-fill, or set them
        manually.
      </p>
    );
  }

  return (
    <div className="spellbook-today">
      <div className="spellbook-today__toolbar">
        <span className="spellbook-today__summary">
          {totalPrepared} prepared · {totalCast} cast today
        </span>
        <button className="btn btn--sm btn--secondary" onClick={handleNewDay}>
          New Day
        </button>
      </div>

      {accessibleLevels.map((lvl) => {
        const max = slotsMax[lvl] ?? effectiveSlots[lvl] ?? 0;
        const prepared = memorizedSpells[lvl] ?? [];
        const usedFlags = memorizedSpellsUsed[lvl] ?? [];
        const castCount = usedFlags.filter(Boolean).length;
        const slotsFilled = prepared.length;
        const canPrepareMore = slotsFilled < max;

        // Available class spells for this level, minus already-at-max-duplicates
        const spellsAtLevel = classSpellsByLevel[lvl] ?? [];
        const pickList = spellsAtLevel.filter((s) => {
          const alreadyPrepared = prepared.filter(
            (n) => n.toLowerCase() === s.name.toLowerCase(),
          ).length;
          return canPrepareMore || alreadyPrepared === 0;
        });
        const filteredPickList = pickSearch
          ? pickList.filter((s) => s.name.toLowerCase().includes(pickSearch.toLowerCase()))
          : pickList;

        const levelNum = Number(lvl);
        const exceedsCasterLevel = levelNum > maxCastableLevel;
        const showFull = showFullListForLevel[lvl] ?? false;
        const INITIAL_CAP = 30;
        const visiblePickList =
          showFull || pickSearch ? filteredPickList : filteredPickList.slice(0, INITIAL_CAP);

        const showDomainBadge = hasDomains && lvl !== '0';

        return (
          <div key={lvl} className="spellbook-level-section">
            <div className="spellbook-level-section__header">
              <span className="spellbook-level-section__title">
                {lvl === '0' ? 'Orisons' : `Level ${lvl}`}
                {showDomainBadge && (
                  <span className="school-badge school--div" title="+1 slot for domain spell">
                    +domain
                  </span>
                )}
              </span>
              <span className="spellbook-level-section__slots">
                {slotsFilled}/{max} prepared
                {castCount > 0 && ` · ${castCount} cast`}
                {castingMod !== undefined && (
                  <span className="spellbook-level-section__dc">
                    {' '}
                    DC {10 + Number(lvl) + castingMod}
                  </span>
                )}
              </span>
            </div>

            {prepared.length === 0 && (
              <p className="spellbook-empty-level">
                No spells prepared.{' '}
                {canPrepareMore && spellsAtLevel.length > 0 && (
                  <button
                    className="btn btn--xs btn--ghost"
                    onClick={() => {
                      setPreparingLevel(preparingLevel === lvl ? null : lvl);
                      setPickSearch('');
                    }}
                  >
                    Pick from class list
                  </button>
                )}
              </p>
            )}

            <ul className="spellbook-spells-list">
              {prepared.map((name, i) => {
                const isUsed = usedFlags[i] ?? false;
                const spellMatch = spellsAtLevel.find(
                  (s) => s.name.toLowerCase() === name.toLowerCase(),
                );
                const school = spellMatch?.school ?? '';
                return (
                  <li
                    key={i}
                    className={`spellbook-spell-row${isUsed ? ' spellbook-spell-row--cast' : ''}`}
                  >
                    <span
                      className={`spellbook-spell-row__indicator${isUsed ? ' spellbook-spell-row__indicator--used' : ''}`}
                      title={isUsed ? 'Cast' : 'Ready'}
                    >
                      {isUsed ? '●' : '○'}
                    </span>
                    <span className="spellbook-spell-row__name">{name}</span>
                    {school && (
                      <span className={`school-badge ${schoolClass(school)}`}>
                        {school.slice(0, 3)}
                      </span>
                    )}
                    <div className="spellbook-spell-row__actions">
                      {isUsed ? (
                        <button
                          className="btn btn--xs btn--secondary"
                          onClick={() => {
                            uncastMemorizedSpell(lvl, i);
                            onBlur();
                          }}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          className="btn btn--xs btn--danger"
                          onClick={() => {
                            castMemorizedSpell(lvl, i);
                            onBlur();
                          }}
                        >
                          Cast
                        </button>
                      )}
                      <button
                        className="btn btn--xs btn--ghost"
                        title="Remove from today's preparation"
                        onClick={() => {
                          removeMemorizedSpell(lvl, i);
                          onBlur();
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {prepared.length > 0 && canPrepareMore && spellsAtLevel.length > 0 && (
              <button
                className="btn btn--xs btn--ghost spellbook-prepare-btn"
                onClick={() => {
                  setPreparingLevel(preparingLevel === lvl ? null : lvl);
                  setPickSearch('');
                }}
              >
                + Prepare spell ({max - slotsFilled} slot{max - slotsFilled !== 1 ? 's' : ''} left)
              </button>
            )}

            {preparingLevel === lvl && (
              <div className="spellbook-prepare-picker">
                {exceedsCasterLevel && !showFull ? (
                  <div className="spellbook-prepare-picker__caster-cap">
                    <p className="spellbook-prepare-picker__empty">
                      Level {lvl} spells exceed your caster level (max level {maxCastableLevel}).
                    </p>
                    <button
                      className="btn btn--xs btn--secondary"
                      onClick={() => setShowFullListForLevel((prev) => ({ ...prev, [lvl]: true }))}
                    >
                      Load entire list
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="spellbook-prepare-picker__search">
                      <input
                        type="text"
                        className="memorized-spells__input"
                        value={pickSearch}
                        onChange={(e) => setPickSearch(e.target.value)}
                        placeholder="Filter spells…"
                        autoFocus
                      />
                    </div>
                    {filteredPickList.length === 0 ? (
                      <p className="spellbook-prepare-picker__empty">
                        {pickSearch
                          ? 'No matching spells.'
                          : lvl === '0'
                            ? 'No orisons available.'
                            : `No level ${lvl} spells available.`}
                      </p>
                    ) : (
                      <>
                        <ul className="spellbook-prepare-picker__list">
                          {visiblePickList.map((spell) => (
                            <li key={spell.name} className="spellbook-prepare-picker__item">
                              <span className={`school-badge ${schoolClass(spell.school)}`}>
                                {spell.school.slice(0, 3)}
                              </span>
                              <span className="spellbook-prepare-picker__name">{spell.name}</span>
                              <button
                                className="btn btn--xs btn--primary"
                                onClick={() => handlePrepare(lvl, spell.name)}
                                disabled={!canPrepareMore}
                              >
                                Prepare
                              </button>
                            </li>
                          ))}
                        </ul>
                        {!showFull && !pickSearch && filteredPickList.length > INITIAL_CAP && (
                          <button
                            className="btn btn--xs btn--ghost spellbook-prepare-btn"
                            onClick={() =>
                              setShowFullListForLevel((prev) => ({ ...prev, [lvl]: true }))
                            }
                          >
                            Load entire list ({filteredPickList.length} spells)
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
                <button
                  className="btn btn--xs btn--ghost"
                  onClick={() => {
                    setPreparingLevel(null);
                    setPickSearch('');
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
