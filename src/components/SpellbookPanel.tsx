import { Fragment, useMemo, useState } from 'react';

import { findSpell, spells as allSpells } from '../data/spells';
import { getLearnableSpells } from '../rules/wizard/eligibility';
import {
  effectiveWizardLevels,
  wizardClassLevels as getWizardClassLevels,
} from '../rules/wizard/levels';
import { maxForbiddenSchools, toggleForbiddenSchool } from '../rules/wizard/specialist';
import {
  copySpellCost,
  freeSpellbookSlots,
  maxLearnableSpellLevel,
  researchSpellCost,
} from '../rules/wizard/spellbook';
import type { CombatStats, SpellbookEntry } from '../schema/schema';
import type { Level } from '../types/level';
import { SpellDetail } from './SpellDetail';

const WIZARD_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
  'Universal',
] as const;

const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

type Source = SpellbookEntry['source'];

const SOURCE_LABELS: Record<Source, string> = {
  starting: 'Starting',
  'free-levelup': 'Free',
  purchased: 'Copied',
  researched: 'Researched',
  found: 'Found',
};

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

type Props = {
  levels: Level[];
  intMod: number;
  combatStats: CombatStats;
  /** Specialist-adjusted spell slots (see calculateEffectiveSlots). */
  calculatedSlots: Record<string, number>;
  memorizedSpells: Record<string, string[]>;
  memorizedSpellsUsed: Record<string, boolean[]>;
  spellbook: SpellbookEntry[];
  wizardSpecialty: string | undefined;
  wizardForbiddenSchools: string[];
  primaryCastingMod: number | undefined;
  addMemorizedSpell: (level: string, name: string) => void;
  removeMemorizedSpell: (level: string, index: number) => void;
  castMemorizedSpell: (level: string, index: number) => void;
  uncastMemorizedSpell: (level: string, index: number) => void;
  newDaySpells: () => void;
  addSpellbookEntry: (entry: SpellbookEntry) => void;
  removeSpellbookEntry: (spellName: string) => void;
  setWizardSpecialty: (school: string | undefined) => void;
  setWizardForbiddenSchools: (schools: string[]) => void;
  onBlur: () => void;
};

export function SpellbookPanel({
  levels,
  intMod,
  combatStats,
  calculatedSlots,
  memorizedSpells,
  memorizedSpellsUsed,
  spellbook,
  wizardSpecialty,
  wizardForbiddenSchools,
  primaryCastingMod,
  addMemorizedSpell,
  removeMemorizedSpell,
  castMemorizedSpell,
  uncastMemorizedSpell,
  newDaySpells,
  addSpellbookEntry,
  removeSpellbookEntry,
  setWizardSpecialty,
  setWizardForbiddenSchools,
  onBlur,
}: Props) {
  const [view, setView] = useState<'today' | 'spellbook'>('today');
  const [preparingLevel, setPreparingLevel] = useState<string | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addLevelFilter, setAddLevelFilter] = useState('');
  const [addSchoolFilter, setAddSchoolFilter] = useState('');
  const [addSource, setAddSource] = useState<Source>('free-levelup');
  const [editingSpecialty, setEditingSpecialty] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [showAllSpellLevels, setShowAllSpellLevels] = useState(false);

  const wizardClassLvls = useMemo(() => getWizardClassLevels(levels), [levels]);
  const wizardLevels = useMemo(() => effectiveWizardLevels(levels), [levels]);
  const isWizard = wizardLevels > 0;
  const maxAddableLevel = isWizard ? maxLearnableSpellLevel(wizardLevels) : 9;
  const totalFree = freeSpellbookSlots(wizardClassLvls, intMod);
  const usedFree = useMemo(
    () => spellbook.filter((e) => e.source === 'starting' || e.source === 'free-levelup').length,
    [spellbook],
  );
  const freeRemaining = Math.max(0, totalFree - usedFree);

  const slotsMax = combatStats.spellSlotsMax ?? {};

  // calculatedSlots already includes the specialist +1-per-level bonus
  // (computed once via calculateEffectiveSlots in App.tsx).
  const effectiveSlots = calculatedSlots;

  // Spellbook entries indexed by wizard spell level
  const spellbookByLevel = useMemo(() => {
    const byLevel: Record<string, SpellbookEntry[]> = {};
    for (const entry of spellbook) {
      const spell = findSpell(entry.spellName);
      if (!spell) continue;
      const wizLvl = spell.levels['Sor/Wiz'];
      if (wizLvl === undefined) continue;
      const key = String(wizLvl);
      (byLevel[key] ??= []).push(entry);
    }
    for (const entries of Object.values(byLevel)) {
      entries.sort((a, b) => {
        const sa = findSpell(a.spellName)?.school ?? '';
        const sb = findSpell(b.spellName)?.school ?? '';
        return sa.localeCompare(sb) || a.spellName.localeCompare(b.spellName);
      });
    }
    return byLevel;
  }, [spellbook]);

  const addResults = useMemo(() => {
    if (!addSearch.trim() && !addLevelFilter && !addSchoolFilter) return [];
    const spellbookNames = new Set(spellbook.map((e) => e.spellName.toLowerCase()));
    return getLearnableSpells(
      allSpells,
      {
        wizardClassLevels: wizardClassLvls,
        effectiveWizardLevels: wizardLevels,
        wizardSpecialty,
        wizardForbiddenSchools,
        intMod,
        spellbookNames,
      },
      {
        search: addSearch,
        levelFilter: addLevelFilter,
        schoolFilter: addSchoolFilter,
        showAllLevels: showAllSpellLevels,
      },
    ).slice(0, showAllSpellLevels ? 200 : 50);
  }, [
    addSearch,
    addLevelFilter,
    addSchoolFilter,
    wizardForbiddenSchools,
    wizardSpecialty,
    wizardClassLvls,
    wizardLevels,
    spellbook,
    showAllSpellLevels,
    intMod,
  ]);

  const handleAddSpell = (spellName: string) => {
    const spell = findSpell(spellName);
    if (!spell) return;
    const spellLvl = spell.levels['Sor/Wiz'] ?? 0;
    const goldPaid =
      addSource === 'purchased'
        ? copySpellCost(spellLvl)
        : addSource === 'researched'
          ? researchSpellCost(spellLvl)
          : 0;
    addSpellbookEntry({
      spellName: spell.name,
      source: addSource,
      goldPaid,
      addedAtCharLevel: levels.length,
    });
    setAddSearch('');
    onBlur();
  };

  const handlePrepare = (spellLevel: string, spellName: string) => {
    const max = slotsMax[spellLevel] ?? effectiveSlots[spellLevel] ?? 0;
    const prepared = memorizedSpells[spellLevel] ?? [];
    if (prepared.length >= max) return;
    addMemorizedSpell(spellLevel, spellName);
    setPreparingLevel(null);
    onBlur();
  };

  const handleNewDay = () => {
    newDaySpells();
    onBlur();
  };

  const handleToggleForbidden = (school: string) => {
    if (!wizardSpecialty) return;
    const wasForbidden = wizardForbiddenSchools.includes(school);
    const updated = toggleForbiddenSchool(school, wizardForbiddenSchools, wizardSpecialty);
    if (updated !== wizardForbiddenSchools) {
      setWizardForbiddenSchools(updated);
      if (!wasForbidden && addSchoolFilter === school) setAddSchoolFilter('');
    }
    onBlur();
  };

  // ── Today's Spells view ─────────────────────────────────────────────────
  const renderToday = () => {
    const accessibleLevels = SPELL_LEVELS.filter(
      (lvl) => (slotsMax[lvl] ?? effectiveSlots[lvl] ?? 0) > 0,
    );

    const totalPrepared = Object.values(memorizedSpells).reduce((s, arr) => s + arr.length, 0);
    const totalCast = Object.values(memorizedSpellsUsed).reduce(
      (s, arr) => s + arr.filter(Boolean).length,
      0,
    );

    return (
      <div className="spellbook-today">
        <div className="spellbook-today__toolbar">
          <span className="spellbook-today__summary">
            {totalPrepared} prepared · {totalCast} cast today
          </span>
          {wizardSpecialty && (
            <span className="spellbook-today__specialty">
              <span
                className={`school-badge ${schoolClass(wizardSpecialty)} school-badge--specialty`}
              >
                {wizardSpecialty} ★
              </span>
              {wizardForbiddenSchools.length > 0 && (
                <span className="spellbook-today__forbidden">
                  ✕ {wizardForbiddenSchools.join(', ')}
                </span>
              )}
            </span>
          )}
          {isWizard && !wizardSpecialty && (
            <button
              className="btn btn--xs btn--ghost"
              onClick={() => {
                setView('spellbook');
                setEditingSpecialty(true);
              }}
              title="Configure specialist school and forbidden schools"
            >
              + Specialist school
            </button>
          )}
          <button className="btn btn--sm btn--secondary" onClick={handleNewDay}>
            New Day
          </button>
        </div>

        {isWizard && spellbook.length === 0 && accessibleLevels.length > 0 && (
          <div className="spellbook-empty-callout">
            Your spellbook is empty — add spells in{' '}
            <button className="btn btn--xs btn--ghost" onClick={() => setView('spellbook')}>
              My Spellbook
            </button>{' '}
            first, then prepare them here each day.
          </div>
        )}

        {accessibleLevels.length === 0 && (
          <p className="panel-empty">
            No spell slots configured. Go to Build → Spell Slots and use Auto-fill, or set them
            manually.
          </p>
        )}

        {accessibleLevels.map((lvl) => {
          const max = slotsMax[lvl] ?? effectiveSlots[lvl] ?? 0;
          const prepared = memorizedSpells[lvl] ?? [];
          const usedFlags = memorizedSpellsUsed[lvl] ?? [];
          const castCount = usedFlags.filter(Boolean).length;
          const isSpecialtyLevel = wizardSpecialty && lvl !== '0';
          const slotsFilled = prepared.length;

          // Spellbook spells at this level not yet prepared
          const canPrepareMore = slotsFilled < max;
          const bookSpellsAtLevel = (spellbookByLevel[lvl] ?? []).filter((entry) => {
            const spell = findSpell(entry.spellName);
            if (spell && wizardForbiddenSchools.includes(spell.school)) return false;
            // Can still prepare same spell multiple times
            const preparedCount = prepared.filter(
              (n) => n.toLowerCase() === entry.spellName.toLowerCase(),
            ).length;
            // Only limit if no slots remain
            return canPrepareMore || preparedCount === 0;
          });

          return (
            <div key={lvl} className="spellbook-level-section">
              <div className="spellbook-level-section__header">
                <span className="spellbook-level-section__title">
                  {lvl === '0' ? 'Cantrips' : `Level ${lvl}`}
                  {isSpecialtyLevel && (
                    <span
                      className={`school-badge ${schoolClass(wizardSpecialty!)} school-badge--specialty`}
                    >
                      {wizardSpecialty} ★
                    </span>
                  )}
                </span>
                <span className="spellbook-level-section__slots">
                  {slotsFilled}/{max} prepared
                  {castCount > 0 && ` · ${castCount} cast`}
                  {primaryCastingMod !== undefined && (
                    <span className="spellbook-level-section__dc">
                      {' '}
                      DC {10 + Number(lvl) + primaryCastingMod}
                    </span>
                  )}
                </span>
              </div>

              {prepared.length === 0 && (
                <p className="spellbook-empty-level">
                  No spells prepared.{' '}
                  {isWizard && canPrepareMore && (
                    <button
                      className="btn btn--xs btn--ghost"
                      onClick={() => setPreparingLevel(preparingLevel === lvl ? null : lvl)}
                    >
                      Prepare from spellbook
                    </button>
                  )}
                </p>
              )}

              <ul className="spellbook-spells-list">
                {prepared.map((name, i) => {
                  const isUsed = usedFlags[i] ?? false;
                  const spell = findSpell(name);
                  const school = spell?.school ?? '';
                  const isSpecialty = school === wizardSpecialty;
                  const detailKey = `today-${lvl}-${i}`;
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
                          {isSpecialty && <span className="spellbook-specialty-star">★</span>}
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

              {prepared.length > 0 && canPrepareMore && isWizard && (
                <button
                  className="btn btn--xs btn--ghost spellbook-prepare-btn"
                  onClick={() => setPreparingLevel(preparingLevel === lvl ? null : lvl)}
                >
                  + Prepare spell ({max - slotsFilled} slot{max - slotsFilled !== 1 ? 's' : ''}{' '}
                  left)
                </button>
              )}

              {preparingLevel === lvl && (
                <div className="spellbook-prepare-picker">
                  <p className="spellbook-prepare-picker__hint">Choose from your spellbook:</p>
                  {bookSpellsAtLevel.length === 0 ? (
                    <div className="spellbook-prepare-picker__empty-state">
                      <p className="spellbook-prepare-picker__empty">
                        No {lvl === '0' ? 'cantrips' : `level ${lvl} spells`} in your spellbook yet.
                      </p>
                      <button
                        className="btn btn--xs btn--primary"
                        onClick={() => {
                          setPreparingLevel(null);
                          setView('spellbook');
                        }}
                      >
                        Go to My Spellbook →
                      </button>
                    </div>
                  ) : (
                    <ul className="spellbook-prepare-picker__list">
                      {bookSpellsAtLevel.map((entry) => {
                        const spell = findSpell(entry.spellName);
                        const pickerKey = `picker-${lvl}-${entry.spellName}`;
                        const isExpanded = expandedSpell === pickerKey;
                        return (
                          <Fragment key={entry.spellName}>
                            <li className="spellbook-prepare-picker__item">
                              <span className={`school-badge ${schoolClass(spell?.school ?? '')}`}>
                                {(spell?.school ?? '').slice(0, 3)}
                              </span>
                              <span
                                className="spellbook-prepare-picker__name spellbook-prepare-picker__name--clickable"
                                onClick={() => setExpandedSpell(isExpanded ? null : pickerKey)}
                                title="Click to expand full details"
                              >
                                <span>{entry.spellName}</span>
                                {spell?.description && (
                                  <span className="spell-inline-desc">{spell.description}</span>
                                )}
                              </span>
                              <button
                                className="btn btn--xs btn--primary"
                                onClick={() => handlePrepare(lvl, entry.spellName)}
                                disabled={!canPrepareMore}
                              >
                                Prepare
                              </button>
                            </li>
                            {isExpanded && (
                              <li className="spell-detail-row">
                                <SpellDetail spellName={entry.spellName} />
                              </li>
                            )}
                          </Fragment>
                        );
                      })}
                    </ul>
                  )}
                  <button
                    className="btn btn--xs btn--ghost"
                    onClick={() => setPreparingLevel(null)}
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
  };

  // ── My Spellbook view ───────────────────────────────────────────────────
  const renderSpellbook = () => {
    return (
      <div className="spellbook-book">
        {/* Specialist config */}
        <div className="spellbook-specialist">
          {wizardSpecialty ? (
            <div className="spellbook-specialist__info">
              <span className={`school-badge ${schoolClass(wizardSpecialty)} school-badge--lg`}>
                {wizardSpecialty} Specialist ★
              </span>
              {wizardForbiddenSchools.length > 0 && (
                <span className="spellbook-specialist__forbidden">
                  Forbidden: {wizardForbiddenSchools.join(', ')}
                </span>
              )}
              <button
                className="btn btn--xs btn--ghost"
                onClick={() => setEditingSpecialty(!editingSpecialty)}
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              className="btn btn--xs btn--ghost"
              onClick={() => setEditingSpecialty(!editingSpecialty)}
            >
              + Configure Specialist School
            </button>
          )}

          {editingSpecialty && (
            <div className="spellbook-specialist__editor">
              <p className="spellbook-specialist__label">Specialty school:</p>
              <div className="spellbook-specialist__schools">
                {WIZARD_SCHOOLS.filter((s) => s !== 'Universal').map((school) => (
                  <button
                    key={school}
                    className={`school-badge school-badge--btn ${schoolClass(school)}${wizardSpecialty === school ? ' school-badge--selected' : ''}`}
                    onClick={() => {
                      setWizardSpecialty(wizardSpecialty === school ? undefined : school);
                      onBlur();
                    }}
                  >
                    {school}
                    {wizardSpecialty === school && ' ★'}
                  </button>
                ))}
              </div>
              {wizardSpecialty && (
                <>
                  <p className="spellbook-specialist__label">
                    Forbidden schools (choose {maxForbiddenSchools(wizardSpecialty)}):
                  </p>
                  <div className="spellbook-specialist__schools">
                    {WIZARD_SCHOOLS.filter((s) => s !== 'Universal' && s !== wizardSpecialty).map(
                      (school) => (
                        <button
                          key={school}
                          className={`school-badge school-badge--btn ${schoolClass(school)}${wizardForbiddenSchools.includes(school) ? ' school-badge--forbidden' : ''}`}
                          onClick={() => handleToggleForbidden(school)}
                        >
                          {school}
                          {wizardForbiddenSchools.includes(school) && ' ✕'}
                        </button>
                      ),
                    )}
                  </div>
                </>
              )}
              <button
                className="btn btn--xs btn--secondary"
                onClick={() => setEditingSpecialty(false)}
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Free slot budget — Wizard class feature only, not from prestige class advancement */}
        {wizardClassLvls > 0 && (
          <div className="spellbook-budget">
            <span className="spellbook-budget__label">
              Free spell slots: {freeRemaining} remaining ({usedFree}/{totalFree} used)
            </span>
            <span className="spellbook-budget__rates">
              Copy: 100 gp/level · Research: 1,000 gp/level
            </span>
          </div>
        )}

        {/* Add spell form */}
        <div className="spellbook-add-form">
          <button
            className={`btn btn--sm btn--primary${addOpen ? ' btn--active' : ''}`}
            onClick={() => setAddOpen(!addOpen)}
          >
            {addOpen ? '▲ Close' : '+ Add Spell to Spellbook'}
          </button>

          {addOpen && (
            <div className="spellbook-add-form__body">
              <div className="spellbook-add-form__filters">
                <input
                  type="text"
                  className="spellbook-add-form__search"
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="Search spells…"
                  autoFocus
                />
                <select
                  className="spellbook-add-form__select"
                  value={addLevelFilter}
                  onChange={(e) => setAddLevelFilter(e.target.value)}
                >
                  <option value="">Any level</option>
                  {SPELL_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl === '0' ? 'Cantrips' : `Level ${lvl}`}
                    </option>
                  ))}
                </select>
                <select
                  className="spellbook-add-form__select"
                  value={addSchoolFilter}
                  onChange={(e) => setAddSchoolFilter(e.target.value)}
                >
                  <option value="">Any school</option>
                  {WIZARD_SCHOOLS.filter((s) => !wizardForbiddenSchools.includes(s)).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="spellbook-add-form__level-cap">
                {showAllSpellLevels ? (
                  <>
                    <span className="spellbook-add-form__level-cap-note">
                      Showing all spell levels.
                    </span>
                    <button
                      className="btn btn--xs btn--ghost"
                      onClick={() => setShowAllSpellLevels(false)}
                    >
                      Limit to caster level
                    </button>
                  </>
                ) : (
                  <>
                    <span className="spellbook-add-form__level-cap-note">
                      Spells limited to level {maxAddableLevel} (wizard level {wizardLevels}).
                    </span>
                    <button
                      className="btn btn--xs btn--ghost"
                      onClick={() => setShowAllSpellLevels(true)}
                    >
                      Load entire list
                    </button>
                  </>
                )}
              </div>

              <div className="spellbook-add-form__source">
                <span className="spellbook-add-form__source-label">Source:</span>
                {(
                  [
                    ['starting', 'Starting'],
                    ['free-levelup', `Free slot (${freeRemaining} left)`],
                    ['purchased', 'Copy (100 gp/lvl)'],
                    ['researched', 'Research (1,000 gp/lvl)'],
                    ['found', 'Found/gifted'],
                  ] as [Source, string][]
                ).map(([val, label]) => (
                  <label key={val} className="spellbook-add-form__radio">
                    <input
                      type="radio"
                      name="add-source"
                      value={val}
                      checked={addSource === val}
                      onChange={() => setAddSource(val)}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {addResults.length === 0 && (addSearch || addLevelFilter || addSchoolFilter) && (
                <p className="spellbook-add-form__empty">
                  {addSearch || addLevelFilter || addSchoolFilter
                    ? 'No matching spells found.'
                    : 'Type a spell name to search.'}
                </p>
              )}

              {addResults.length > 0 && (
                <ul className="spellbook-add-form__results">
                  {addResults.map((spell) => {
                    const lvl = spell.levels['Sor/Wiz'] ?? 0;
                    const isSpecialty = spell.school === wizardSpecialty;
                    const cost =
                      addSource === 'purchased'
                        ? `${copySpellCost(lvl)} gp`
                        : addSource === 'researched'
                          ? `${researchSpellCost(lvl)} gp`
                          : null;
                    const addKey = `add-${spell.name}`;
                    const isExpanded = expandedSpell === addKey;
                    return (
                      <Fragment key={spell.name}>
                        <li className="spellbook-add-form__result">
                          <span className={`school-badge ${schoolClass(spell.school)}`}>
                            {spell.school.slice(0, 3)}
                          </span>
                          <span
                            className="spellbook-add-form__result-name spellbook-add-form__result-name--clickable"
                            onClick={() => setExpandedSpell(isExpanded ? null : addKey)}
                            title="Click to expand full details"
                          >
                            <span>
                              {spell.name}
                              {isSpecialty && <span className="spellbook-specialty-star">★</span>}
                            </span>
                            {spell.description && (
                              <span className="spell-inline-desc">{spell.description}</span>
                            )}
                          </span>
                          <span className="spellbook-add-form__result-level">Lvl {lvl}</span>
                          {cost && <span className="spellbook-add-form__result-cost">{cost}</span>}
                          <button
                            className="btn btn--xs btn--primary"
                            onClick={() => handleAddSpell(spell.name)}
                            disabled={addSource === 'free-levelup' && freeRemaining <= 0}
                          >
                            Add
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

              {!addSearch && !addLevelFilter && !addSchoolFilter && (
                <p className="spellbook-add-form__hint">
                  Search by name, or filter by level or school above.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Spellbook contents */}
        {spellbook.length === 0 ? (
          <p className="panel-empty">Your spellbook is empty. Add spells above to get started.</p>
        ) : (
          <div className="spellbook-contents">
            {SPELL_LEVELS.map((lvl) => {
              const entries = spellbookByLevel[lvl] ?? [];
              if (entries.length === 0) return null;
              const accessible = (slotsMax[lvl] ?? effectiveSlots[lvl] ?? 0) > 0;
              return (
                <div key={lvl} className="spellbook-level-section">
                  <div className="spellbook-level-section__header">
                    <span className="spellbook-level-section__title">
                      {lvl === '0' ? 'Cantrips' : `Level ${lvl} Spells`}
                      <span className="spellbook-level-section__count"> ({entries.length})</span>
                    </span>
                    {wizardSpecialty && lvl !== '0' && (
                      <span
                        className={`school-badge ${schoolClass(wizardSpecialty)} school-badge--specialty`}
                      >
                        +1 {wizardSpecialty} slot
                      </span>
                    )}
                  </div>

                  <ul className="spellbook-spells-list spellbook-spells-list--book">
                    {entries.map((entry) => {
                      const spell = findSpell(entry.spellName);
                      const school = spell?.school ?? '';
                      const isSpecialty = school === wizardSpecialty;
                      const isForbidden = wizardForbiddenSchools.includes(school);
                      const prepared = (memorizedSpells[lvl] ?? []).filter(
                        (n) => n.toLowerCase() === entry.spellName.toLowerCase(),
                      ).length;
                      const bookKey = `book-${entry.spellName}`;
                      const isExpanded = expandedSpell === bookKey;
                      return (
                        <Fragment key={entry.spellName}>
                          <li
                            className={`spellbook-spell-row spellbook-spell-row--book${isForbidden ? ' spellbook-spell-row--forbidden' : ''}`}
                          >
                            <span className={`school-badge ${schoolClass(school)}`} title={school}>
                              {school.slice(0, 3)}
                            </span>
                            <span
                              className="spellbook-spell-row__name spellbook-spell-row__name--clickable"
                              onClick={() => setExpandedSpell(isExpanded ? null : bookKey)}
                              title="Click to see description"
                            >
                              {entry.spellName}
                              {isSpecialty && (
                                <span
                                  className="spellbook-specialty-star"
                                  title={`${wizardSpecialty} specialty`}
                                >
                                  ★
                                </span>
                              )}
                            </span>
                            <span
                              className={`spellbook-source-badge spellbook-source-badge--${entry.source}`}
                            >
                              {SOURCE_LABELS[entry.source]}
                              {entry.goldPaid > 0 && ` (${entry.goldPaid} gp)`}
                            </span>
                            {prepared > 0 && (
                              <span className="spellbook-prepared-count">×{prepared} prepared</span>
                            )}
                            <div className="spellbook-spell-row__actions">
                              {accessible && !isForbidden && (
                                <button
                                  className="btn btn--xs btn--secondary"
                                  onClick={() => handlePrepare(lvl, entry.spellName)}
                                  disabled={
                                    (memorizedSpells[lvl] ?? []).length >=
                                    (slotsMax[lvl] ?? effectiveSlots[lvl] ?? 0)
                                  }
                                  title="Add to today's prepared spells"
                                >
                                  Prepare
                                </button>
                              )}
                              {confirmRemove === entry.spellName ? (
                                <>
                                  <span className="spellbook-confirm-text">Remove?</span>
                                  <button
                                    className="btn btn--xs btn--danger"
                                    onClick={() => {
                                      removeSpellbookEntry(entry.spellName);
                                      setConfirmRemove(null);
                                      onBlur();
                                    }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className="btn btn--xs btn--ghost"
                                    onClick={() => setConfirmRemove(null)}
                                  >
                                    No
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn btn--xs btn--ghost"
                                  onClick={() => setConfirmRemove(entry.spellName)}
                                  title="Remove from spellbook"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </li>
                          {isExpanded && (
                            <li className="spell-detail-row">
                              <SpellDetail spellName={entry.spellName} />
                            </li>
                          )}
                        </Fragment>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="spellbook-panel">
      <div className="spellbook-panel__tabs">
        <button
          className={`spellbook-panel__tab${view === 'today' ? ' spellbook-panel__tab--active' : ''}`}
          onClick={() => setView('today')}
        >
          Today's Spells
        </button>
        {isWizard && (
          <button
            className={`spellbook-panel__tab${view === 'spellbook' ? ' spellbook-panel__tab--active' : ''}`}
            onClick={() => setView('spellbook')}
          >
            My Spellbook
            {spellbook.length > 0 && (
              <span className="spellbook-panel__count">{spellbook.length}</span>
            )}
          </button>
        )}
      </div>

      <div className="spellbook-panel__body">
        {view === 'today' && renderToday()}
        {view === 'spellbook' && isWizard && renderSpellbook()}
      </div>
    </div>
  );
}
