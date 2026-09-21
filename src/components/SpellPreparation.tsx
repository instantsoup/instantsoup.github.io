import { Fragment, useMemo, useState } from 'react';

import { findSpell } from '../data/spells';
import { spellDC } from '../rules/caster/caster-summary';
import { canPrepareSpell, type PrepCandidate } from '../rules/caster/preparation';
import { SpellDetail } from './SpellDetail';
import { levelLabel, schoolClass, SPELL_LEVELS } from './spellUi';

const INITIAL_PICKER_CAP = 30;

type Props = {
  /** Slots per spell level for today (manual override, else calculated incl. specialist bonus). */
  slotMax: Record<string, number>;
  memorizedSpells: Record<string, string[]>;
  memorizedSpellsUsed: Record<string, boolean[]>;
  /** Spells that may be prepared at each spell level: a wizard's spellbook or a class list. */
  candidatesByLevel: Record<string, PrepCandidate[]>;
  castingMod: number | undefined;
  /** Wizard specialty school — its bonus slot per level must hold a spell of that school. */
  specialty?: string;
  forbiddenSchools?: string[];
  /** Show a domain-slot indicator on each non-0 spell level (Cleric). */
  hasDomains?: boolean;
  zeroLevelLabel?: string;
  /** Where candidates come from, for empty-state wording. */
  candidateSource: 'spellbook' | 'class list';
  onOpenSpellbook?: () => void;
  addMemorizedSpell: (level: string, name: string) => void;
  removeMemorizedSpell: (level: string, index: number) => void;
  castMemorizedSpell: (level: string, index: number) => void;
  uncastMemorizedSpell: (level: string, index: number) => void;
  newDaySpells: () => void;
  onBlur: () => void;
};

/**
 * Daily preparation: pick spells from the spellbook (or class list) into today's slots,
 * cast them, and reset on a new day. One component for every prepared caster.
 */
export function SpellPreparation({
  slotMax,
  memorizedSpells,
  memorizedSpellsUsed,
  candidatesByLevel,
  castingMod,
  specialty,
  forbiddenSchools = [],
  hasDomains = false,
  zeroLevelLabel = 'Cantrips',
  candidateSource,
  onOpenSpellbook,
  addMemorizedSpell,
  removeMemorizedSpell,
  castMemorizedSpell,
  uncastMemorizedSpell,
  newDaySpells,
  onBlur,
}: Props) {
  const [pickingLevel, setPickingLevel] = useState<string | null>(null);
  const [pickSearch, setPickSearch] = useState('');
  const [showFullList, setShowFullList] = useState(false);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const accessibleLevels = useMemo(
    () => SPELL_LEVELS.filter((lvl) => (slotMax[lvl] ?? 0) > 0),
    [slotMax],
  );

  const totalPrepared = Object.values(memorizedSpells).reduce((s, arr) => s + arr.length, 0);
  const totalCast = Object.values(memorizedSpellsUsed).reduce(
    (s, arr) => s + arr.filter(Boolean).length,
    0,
  );

  const schoolOf = (level: string, name: string): string =>
    (candidatesByLevel[level] ?? []).find((c) => c.name.toLowerCase() === name.toLowerCase())
      ?.school ??
    findSpell(name)?.school ??
    '';

  const togglePicker = (lvl: string) => {
    setPickingLevel(pickingLevel === lvl ? null : lvl);
    setPickSearch('');
    setShowFullList(false);
  };

  const handlePrepare = (lvl: string, name: string) => {
    addMemorizedSpell(lvl, name);
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
        {specialty && (
          <span className="spellbook-today__specialty">
            <span className={`school-badge ${schoolClass(specialty)} school-badge--specialty`}>
              {specialty} ★
            </span>
            {forbiddenSchools.length > 0 && (
              <span className="spellbook-today__forbidden">✕ {forbiddenSchools.join(', ')}</span>
            )}
          </span>
        )}
        <button
          className="btn btn--sm btn--secondary"
          onClick={() => {
            newDaySpells();
            onBlur();
          }}
        >
          New Day
        </button>
      </div>

      {accessibleLevels.map((lvl) => {
        const max = slotMax[lvl] ?? 0;
        const prepared = memorizedSpells[lvl] ?? [];
        const usedFlags = memorizedSpellsUsed[lvl] ?? [];
        const castCount = usedFlags.filter(Boolean).length;
        const preparedSchools = prepared.map((name) => schoolOf(lvl, name));
        const slotsLeft = max - prepared.length;
        const candidates = candidatesByLevel[lvl] ?? [];
        const filtered = pickSearch
          ? candidates.filter((c) => c.name.toLowerCase().includes(pickSearch.toLowerCase()))
          : candidates;
        const visible =
          showFullList || pickSearch ? filtered : filtered.slice(0, INITIAL_PICKER_CAP);

        return (
          <div key={lvl} className="spellbook-level-section">
            <div className="spellbook-level-section__header">
              <span className="spellbook-level-section__title">
                {levelLabel(lvl, zeroLevelLabel)}
                {specialty && (
                  <span
                    className={`school-badge ${schoolClass(specialty)} school-badge--specialty`}
                    title={`One slot per level is reserved for a ${specialty} spell`}
                  >
                    +1 {specialty}
                  </span>
                )}
                {hasDomains && lvl !== '0' && (
                  <span className="school-badge school--div" title="+1 slot for domain spell">
                    +domain
                  </span>
                )}
              </span>
              <span className="spellbook-level-section__slots">
                {prepared.length}/{max} prepared
                {castCount > 0 && ` · ${castCount} cast`}
                {castingMod !== undefined && (
                  <span className="spellbook-level-section__dc">
                    {' '}
                    DC {spellDC(Number(lvl), castingMod)}
                  </span>
                )}
              </span>
            </div>

            {prepared.length === 0 && <p className="spellbook-empty-level">No spells prepared.</p>}

            <ul className="spellbook-spells-list">
              {prepared.map((name, i) => {
                const isUsed = usedFlags[i] ?? false;
                const school = preparedSchools[i];
                const detailKey = `prepared-${lvl}-${i}`;
                const isExpanded = expandedSpell === detailKey;
                return (
                  <Fragment key={i}>
                    <li
                      className={`spellbook-spell-row${isUsed ? ' spellbook-spell-row--cast' : ''}`}
                    >
                      <span
                        className={`spellbook-spell-row__indicator${isUsed ? ' spellbook-spell-row__indicator--used' : ''}`}
                        title={isUsed ? 'Cast' : 'Ready'}
                      >
                        {isUsed ? '●' : '○'}
                      </span>
                      <span
                        className="spellbook-spell-row__name spellbook-spell-row__name--clickable"
                        onClick={() => setExpandedSpell(isExpanded ? null : detailKey)}
                        title="Click to see description"
                      >
                        {name}
                        {school && school === specialty && (
                          <span className="spellbook-specialty-star">★</span>
                        )}
                      </span>
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
                    {isExpanded && (
                      <li className="spell-detail-row">
                        <SpellDetail spellName={name} />
                      </li>
                    )}
                  </Fragment>
                );
              })}
            </ul>

            {slotsLeft > 0 && (
              <button
                className="btn btn--xs btn--ghost spellbook-prepare-btn"
                onClick={() => togglePicker(lvl)}
              >
                {pickingLevel === lvl ? '▲ Close' : `+ Prepare from ${candidateSource}`} (
                {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left)
              </button>
            )}

            {pickingLevel === lvl && (
              <div className="spellbook-prepare-picker">
                {candidates.length === 0 ? (
                  <div className="spellbook-prepare-picker__empty-state">
                    <p className="spellbook-prepare-picker__empty">
                      No {lvl === '0' ? zeroLevelLabel.toLowerCase() : `level ${lvl} spells`} in
                      your {candidateSource}.
                    </p>
                    {onOpenSpellbook && (
                      <button className="btn btn--xs btn--primary" onClick={onOpenSpellbook}>
                        Go to Spellbook →
                      </button>
                    )}
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
                    {filtered.length === 0 ? (
                      <p className="spellbook-prepare-picker__empty">No matching spells.</p>
                    ) : (
                      <ul className="spellbook-prepare-picker__list">
                        {visible.map((spell) => {
                          const check = canPrepareSpell(spell.school, {
                            max,
                            preparedSchools,
                            specialty,
                            forbiddenSchools,
                          });
                          const count = prepared.filter(
                            (n) => n.toLowerCase() === spell.name.toLowerCase(),
                          ).length;
                          const pickerKey = `picker-${lvl}-${spell.name}`;
                          const isExpanded = expandedSpell === pickerKey;
                          return (
                            <Fragment key={spell.name}>
                              <li className="spellbook-prepare-picker__item">
                                <span className={`school-badge ${schoolClass(spell.school)}`}>
                                  {spell.school.slice(0, 3)}
                                </span>
                                <span
                                  className="spellbook-prepare-picker__name spellbook-prepare-picker__name--clickable"
                                  onClick={() => setExpandedSpell(isExpanded ? null : pickerKey)}
                                  title="Click to expand full details"
                                >
                                  <span>
                                    {spell.name}
                                    {spell.school === specialty && (
                                      <span className="spellbook-specialty-star">★</span>
                                    )}
                                  </span>
                                  {spell.description && (
                                    <span className="spell-inline-desc">{spell.description}</span>
                                  )}
                                </span>
                                {count > 0 && (
                                  <span className="spellbook-prepared-count">×{count}</span>
                                )}
                                <button
                                  className="btn btn--xs btn--primary"
                                  onClick={() => handlePrepare(lvl, spell.name)}
                                  disabled={!check.eligible}
                                  title={check.reason}
                                >
                                  Prepare
                                </button>
                              </li>
                              {isExpanded && (
                                <li className="spell-detail-row">
                                  <SpellDetail spellName={spell.name} />
                                </li>
                              )}
                            </Fragment>
                          );
                        })}
                      </ul>
                    )}
                    {!showFullList && !pickSearch && filtered.length > INITIAL_PICKER_CAP && (
                      <button
                        className="btn btn--xs btn--ghost spellbook-prepare-btn"
                        onClick={() => setShowFullList(true)}
                      >
                        Load entire list ({filtered.length} spells)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
