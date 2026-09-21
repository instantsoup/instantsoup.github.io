import { Fragment, useMemo, useState } from 'react';

import { allSpells, findSpell } from '../data/spells';
import {
  buildWizardContext,
  canAddToSpellbook,
  getLearnableSpells,
} from '../rules/wizard/eligibility';
import { effectiveWizardLevels, wizardClassLevels } from '../rules/wizard/levels';
import {
  forbiddenSchoolsComplete,
  maxForbiddenSchools,
  normalizeForbiddenSchools,
  toggleForbiddenSchool,
} from '../rules/wizard/specialist';
import {
  acquisitionCost,
  BORROW_FEE_PER_LEVEL,
  copySpellcraftDC,
  copySpellHours,
  freeSourceForWizardLevel,
  freeSpellbookSlots,
  getSpellbookItems,
  maxLearnableSpellLevel,
  specialistCopyBonus,
  summarizeSpellbook,
} from '../rules/wizard/spellbook';
import type { Level } from '../types/level';
import type { SpellbookEntry, SpellbookSource } from '../types/spellbook';
import { SpellDetail } from './SpellDetail';
import {
  formatDuration,
  formatGold,
  levelLabel,
  schoolClass,
  SPELL_LEVELS,
  WIZARD_SCHOOLS,
} from './spellUi';

/** What the player picks; "free" resolves to starting / free-levelup by wizard level. */
type LearnRoute = 'free' | 'purchased' | 'researched' | 'found';

const SOURCE_LABELS: Record<SpellbookSource, string> = {
  starting: 'Starting',
  'free-levelup': 'Free',
  purchased: 'Copied',
  researched: 'Researched',
  found: 'Found',
};

type Props = {
  levels: Level[];
  intMod: number;
  spellbook: SpellbookEntry[];
  wizardSpecialty: string | undefined;
  wizardForbiddenSchools: string[];
  /** Spells prepared today by spell level — a prepared spell can't be removed from the book. */
  memorizedSpells: Record<string, string[]>;
  addSpellbookEntry: (entry: SpellbookEntry) => void;
  removeSpellbookEntry: (spellName: string) => void;
  setWizardSpecialty: (school: string | undefined) => void;
  setWizardForbiddenSchools: (schools: string[]) => void;
  onBlur: () => void;
};

/**
 * The wizard's spellbook: what they know, what it cost to learn, and the rules for
 * learning more. Daily preparation from this book lives in SpellPreparation.
 */
export function SpellbookPanel({
  levels,
  intMod,
  spellbook,
  wizardSpecialty,
  wizardForbiddenSchools,
  memorizedSpells,
  addSpellbookEntry,
  removeSpellbookEntry,
  setWizardSpecialty,
  setWizardForbiddenSchools,
  onBlur,
}: Props) {
  const [learnOpen, setLearnOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [route, setRoute] = useState<LearnRoute>('free');
  const [borrowed, setBorrowed] = useState(false);
  const [allowAboveCap, setAllowAboveCap] = useState(false);
  const [learnAtChoice, setLearnAtChoice] = useState<number | null>(null);
  const [editingSpecialty, setEditingSpecialty] = useState(false);
  const [showCantrips, setShowCantrips] = useState(false);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const wizardClassLvls = useMemo(() => wizardClassLevels(levels), [levels]);
  const freeTotal = freeSpellbookSlots(wizardClassLvls, intMod);

  const items = useMemo(
    () => getSpellbookItems(spellbook, allSpells, wizardForbiddenSchools, wizardClassLvls > 0),
    [spellbook, wizardForbiddenSchools, wizardClassLvls],
  );

  const summary = useMemo(
    () => summarizeSpellbook(spellbook, (name) => findSpell(name)?.levels['Sor/Wiz'], freeTotal),
    [spellbook, freeTotal],
  );

  // Gold/time per acquisition route, so the cells add up to the total.
  const costBySource = useMemo(() => {
    const levelOf = (name: string) => findSpell(name)?.levels['Sor/Wiz'];
    const only = (src: SpellbookSource) =>
      summarizeSpellbook(
        spellbook.filter((e) => e.source === src),
        levelOf,
        0,
      );
    return { purchased: only('purchased'), researched: only('researched') };
  }, [spellbook]);

  // Character levels that advanced wizard casting — the levels spells can be learned at.
  const learnableAtLevels = useMemo(
    () =>
      levels
        .map((_, i) => i + 1)
        .filter(
          (n) =>
            effectiveWizardLevels(levels.slice(0, n)) >
            effectiveWizardLevels(levels.slice(0, n - 1)),
        ),
    [levels],
  );
  const learnAt =
    learnAtChoice !== null && learnableAtLevels.includes(learnAtChoice)
      ? learnAtChoice
      : (learnableAtLevels[learnableAtLevels.length - 1] ?? levels.length);

  const ctx = useMemo(
    () =>
      buildWizardContext(levels, learnAt, {
        intMod,
        specialty: wizardSpecialty,
        forbiddenSchools: wizardForbiddenSchools,
        spellbookNames: new Set(spellbook.map((e) => e.spellName.toLowerCase())),
      }),
    [levels, learnAt, intMod, wizardSpecialty, wizardForbiddenSchools, spellbook],
  );

  const source: SpellbookSource =
    route === 'free' ? freeSourceForWizardLevel(ctx.wizardClassLevels) : route;
  const canExceedCap = route === 'purchased' || route === 'found';
  const showAboveCap = canExceedCap && allowAboveCap;
  const levelCap = maxLearnableSpellLevel(ctx.effectiveWizardLevels);

  const results = useMemo(() => {
    if (!search.trim() && !levelFilter && !schoolFilter) return [];
    return getLearnableSpells(allSpells, ctx, {
      search,
      levelFilter,
      schoolFilter,
      showAllLevels: showAboveCap,
    }).slice(0, showAboveCap ? 200 : 50);
  }, [search, levelFilter, schoolFilter, ctx, showAboveCap]);

  const itemsByLevel = useMemo(() => {
    const byLevel: Record<string, typeof items> = {};
    for (const item of items) (byLevel[String(item.level)] ??= []).push(item);
    return byLevel;
  }, [items]);

  const preparedCount = (name: string) =>
    Object.values(memorizedSpells)
      .flat()
      .filter((n) => n.toLowerCase() === name.toLowerCase()).length;

  const handleLearn = (spellName: string) => {
    const spell = findSpell(spellName);
    if (!spell) return;
    const spellLevel = spell.levels['Sor/Wiz'] ?? 0;
    const isBorrowed = source === 'purchased' && borrowed;
    addSpellbookEntry({
      spellName: spell.name,
      source,
      goldPaid: acquisitionCost(source, spellLevel, { borrowed: isBorrowed }).gold,
      addedAtCharLevel: learnAt,
      borrowed: isBorrowed,
    });
    setSearch('');
    onBlur();
  };

  const handleSetSpecialty = (school: string | undefined) => {
    setWizardSpecialty(school);
    setWizardForbiddenSchools(normalizeForbiddenSchools(school, wizardForbiddenSchools));
    onBlur();
  };

  const handleToggleForbidden = (school: string) => {
    if (!wizardSpecialty) return;
    setWizardForbiddenSchools(
      toggleForbiddenSchool(school, wizardForbiddenSchools, wizardSpecialty),
    );
    if (schoolFilter === school) setSchoolFilter('');
    onBlur();
  };

  const costNote = (spellLevel: number, school: string): string | null => {
    if (source === 'purchased') {
      const cost = acquisitionCost('purchased', spellLevel, { borrowed });
      const dc = copySpellcraftDC(spellLevel);
      const bonus = specialistCopyBonus(school, wizardSpecialty);
      return `${formatGold(cost.gold)} · ${formatDuration(cost.hours)} · Spellcraft DC ${dc}${bonus ? ` (+${bonus} specialist)` : ''}`;
    }
    if (source === 'researched') {
      const cost = acquisitionCost('researched', spellLevel);
      return `${formatGold(cost.gold)} · ${formatDuration(cost.hours)}`;
    }
    return null;
  };

  const renderSpecialist = () => (
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

      {wizardSpecialty && !forbiddenSchoolsComplete(wizardSpecialty, wizardForbiddenSchools) && (
        <p className="spellbook-warning">
          A {wizardSpecialty} specialist must give up {maxForbiddenSchools(wizardSpecialty)} school
          {maxForbiddenSchools(wizardSpecialty) === 1 ? '' : 's'} ({wizardForbiddenSchools.length}{' '}
          chosen).
        </p>
      )}

      {editingSpecialty && (
        <div className="spellbook-specialist__editor">
          <p className="spellbook-specialist__label">Specialty school:</p>
          <div className="spellbook-specialist__schools">
            {WIZARD_SCHOOLS.filter((s) => s !== 'Universal').map((school) => (
              <button
                key={school}
                className={`school-badge school-badge--btn ${schoolClass(school)}${wizardSpecialty === school ? ' school-badge--selected' : ''}`}
                onClick={() => handleSetSpecialty(wizardSpecialty === school ? undefined : school)}
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
          <button className="btn btn--xs btn--secondary" onClick={() => setEditingSpecialty(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  );

  const renderCosts = () => (
    <div className="spellbook-costs">
      <div
        className={`spellbook-costs__cell${summary.freeRemaining < 0 ? ' spellbook-costs__cell--over' : ''}`}
        title="3 + Int modifier starting spells at level 1, then 2 per wizard level. Every 0-level spell is included for free."
      >
        <span className="spellbook-costs__label">Free spells</span>
        <span className="spellbook-costs__value">
          {summary.freeUsed} / {summary.freeTotal}
        </span>
        <span className="spellbook-costs__sub">
          {summary.freeRemaining >= 0
            ? `${summary.freeRemaining} left`
            : `${-summary.freeRemaining} over budget`}
        </span>
      </div>
      <div
        className="spellbook-costs__cell"
        title="100 gp per page, 8 h study + 24 h scribing each"
      >
        <span className="spellbook-costs__label">Copied</span>
        <span className="spellbook-costs__value">{summary.counts.purchased}</span>
        <span className="spellbook-costs__sub">
          {formatGold(costBySource.purchased.totalGold)} ·{' '}
          {formatDuration(costBySource.purchased.totalHours)}
        </span>
      </div>
      <div className="spellbook-costs__cell" title="1,000 gp and a week per spell level">
        <span className="spellbook-costs__label">Researched</span>
        <span className="spellbook-costs__value">{summary.counts.researched}</span>
        <span className="spellbook-costs__sub">
          {formatGold(costBySource.researched.totalGold)} ·{' '}
          {formatDuration(costBySource.researched.totalHours)}
        </span>
      </div>
      <div className="spellbook-costs__cell spellbook-costs__cell--total">
        <span className="spellbook-costs__label">Total spent</span>
        <span className="spellbook-costs__value">{formatGold(summary.totalGold)}</span>
        <span className="spellbook-costs__sub">{formatDuration(summary.totalHours)}</span>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="spellbook-add-form">
      <button
        className={`btn btn--sm btn--primary${learnOpen ? ' btn--active' : ''}`}
        onClick={() => setLearnOpen(!learnOpen)}
      >
        {learnOpen ? '▲ Close' : '+ Learn a Spell'}
      </button>

      {learnOpen && (
        <div className="spellbook-add-form__body">
          <div className="spellbook-add-form__source">
            <span className="spellbook-add-form__source-label">How:</span>
            {(
              [
                ['free', `Free (${summary.freeRemaining} left)`],
                ['purchased', 'Copy from scroll/book'],
                ['researched', 'Research'],
                ['found', 'Already in book'],
              ] as [LearnRoute, string][]
            ).map(([val, label]) => (
              <label key={val} className="spellbook-add-form__radio">
                <input
                  type="radio"
                  name="learn-route"
                  value={val}
                  checked={route === val}
                  onChange={() => setRoute(val)}
                />
                {label}
              </label>
            ))}
          </div>

          {route === 'purchased' && (
            <div className="spellbook-add-form__note">
              <label className="spellbook-add-form__radio">
                <input
                  type="checkbox"
                  checked={borrowed}
                  onChange={(e) => setBorrowed(e.target.checked)}
                />
                Borrowed from a living wizard’s book (+{BORROW_FEE_PER_LEVEL} gp per spell level)
              </label>
              <p>
                Study 8 h, then scribe 24 h ({formatDuration(copySpellHours())} total) at 100 gp per
                page (a page per spell level). Unfamiliar writing needs Read Magic or a Spellcraft
                check (DC 20 + spell level). If the copy check fails you can’t retry that spell
                until you gain a Spellcraft rank.
              </p>
            </div>
          )}
          {route === 'researched' && (
            <div className="spellbook-add-form__note">
              <p>Research costs 1,000 gp and a week per spell level.</p>
            </div>
          )}

          <div className="spellbook-add-form__filters">
            <input
              type="text"
              className="spellbook-add-form__search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search spells…"
              autoFocus
            />
            <select
              className="spellbook-add-form__select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="">Any level</option>
              {SPELL_LEVELS.filter((lvl) => lvl !== '0').map((lvl) => (
                <option key={lvl} value={lvl}>
                  {levelLabel(lvl)}
                </option>
              ))}
            </select>
            <select
              className="spellbook-add-form__select"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
            >
              <option value="">Any school</option>
              {WIZARD_SCHOOLS.filter((s) => !wizardForbiddenSchools.includes(s)).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {learnableAtLevels.length > 1 && (
              <select
                className="spellbook-add-form__select"
                value={learnAt}
                onChange={(e) => setLearnAtChoice(Number(e.target.value))}
                title="Character level at which the spell is learned"
                aria-label="Learned at character level"
              >
                {learnableAtLevels.map((n) => (
                  <option key={n} value={n}>
                    Learned at level {n}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="spellbook-add-form__level-cap">
            <span className="spellbook-add-form__level-cap-note">
              {showAboveCap
                ? 'Showing spells above your castable level.'
                : `Up to level ${levelCap} spells (wizard level ${ctx.effectiveWizardLevels}); cantrips are already in your book.`}
            </span>
            {canExceedCap && (
              <button
                className="btn btn--xs btn--ghost"
                onClick={() => setAllowAboveCap(!allowAboveCap)}
              >
                {allowAboveCap ? 'Limit to castable level' : 'Show higher levels'}
              </button>
            )}
          </div>

          {results.length === 0 && (search || levelFilter || schoolFilter) && (
            <p className="spellbook-add-form__empty">No matching spells found.</p>
          )}
          {!search && !levelFilter && !schoolFilter && (
            <p className="spellbook-add-form__hint">
              Search by name, or filter by level or school above. Forbidden schools are hidden.
            </p>
          )}

          {results.length > 0 && (
            <ul className="spellbook-add-form__results">
              {results.map((spell) => {
                const lvl = spell.levels['Sor/Wiz'] ?? 0;
                const check = canAddToSpellbook(spell, ctx, {
                  source,
                  freeRemaining: summary.freeRemaining,
                  allowAboveLevelCap: allowAboveCap,
                });
                const note = costNote(lvl, spell.school);
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
                          {spell.school === wizardSpecialty && (
                            <span className="spellbook-specialty-star">★</span>
                          )}
                        </span>
                        {spell.description && (
                          <span className="spell-inline-desc">{spell.description}</span>
                        )}
                      </span>
                      <span className="spellbook-add-form__result-level">Lvl {lvl}</span>
                      {note && <span className="spellbook-add-form__result-cost">{note}</span>}
                      <button
                        className="btn btn--xs btn--primary"
                        onClick={() => handleLearn(spell.name)}
                        disabled={!check.eligible}
                        title={check.reason}
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
        </div>
      )}
    </div>
  );

  const renderContents = () => {
    if (items.length === 0) {
      return <p className="panel-empty">Your spellbook is empty. Learn a spell above.</p>;
    }
    return (
      <div className="spellbook-contents">
        {SPELL_LEVELS.map((lvl) => {
          const levelItems = itemsByLevel[lvl] ?? [];
          if (levelItems.length === 0) return null;
          const collapsed = lvl === '0' && !showCantrips;
          return (
            <div key={lvl} className="spellbook-level-section">
              <div className="spellbook-level-section__header">
                <span className="spellbook-level-section__title">
                  {levelLabel(lvl)}
                  <span className="spellbook-level-section__count"> ({levelItems.length})</span>
                </span>
                {lvl === '0' && (
                  <button
                    className="btn btn--xs btn--ghost"
                    onClick={() => setShowCantrips(!showCantrips)}
                  >
                    {showCantrips ? 'Hide' : 'Show all'}
                  </button>
                )}
              </div>
              {!collapsed && (
                <ul className="spellbook-spells-list spellbook-spells-list--book">
                  {levelItems.map((item) => {
                    const entry = item.entry;
                    const bookKey = `book-${item.name}`;
                    const isExpanded = expandedSpell === bookKey;
                    const prepared = preparedCount(item.name);
                    const cost = entry
                      ? acquisitionCost(entry.source, item.level, { borrowed: entry.borrowed })
                      : null;
                    return (
                      <Fragment key={item.name}>
                        <li
                          className={`spellbook-spell-row spellbook-spell-row--book${item.forbidden ? ' spellbook-spell-row--forbidden' : ''}`}
                        >
                          <span
                            className={`school-badge ${schoolClass(item.school)}`}
                            title={item.school}
                          >
                            {item.school.slice(0, 3)}
                          </span>
                          <span
                            className="spellbook-spell-row__name spellbook-spell-row__name--clickable"
                            onClick={() => setExpandedSpell(isExpanded ? null : bookKey)}
                            title="Click to see description"
                          >
                            {item.name}
                            {item.school === wizardSpecialty && (
                              <span
                                className="spellbook-specialty-star"
                                title={`${wizardSpecialty} specialty`}
                              >
                                ★
                              </span>
                            )}
                            {item.forbidden && (
                              <span className="spellbook-forbidden-note"> forbidden school</span>
                            )}
                          </span>
                          {entry && (
                            <span
                              className={`spellbook-source-badge spellbook-source-badge--${entry.source}`}
                              title={`Learned at character level ${entry.addedAtCharLevel}`}
                            >
                              {SOURCE_LABELS[entry.source]}
                              {cost && cost.gold > 0 && ` · ${formatGold(cost.gold)}`}
                              {cost && cost.hours > 0 && ` · ${formatDuration(cost.hours)}`}
                            </span>
                          )}
                          {prepared > 0 && (
                            <span className="spellbook-prepared-count">×{prepared} prepared</span>
                          )}
                          {entry && (
                            <div className="spellbook-spell-row__actions">
                              {confirmRemove === item.name ? (
                                <>
                                  <span className="spellbook-confirm-text">Remove?</span>
                                  <button
                                    className="btn btn--xs btn--danger"
                                    onClick={() => {
                                      removeSpellbookEntry(item.name);
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
                                  onClick={() => setConfirmRemove(item.name)}
                                  disabled={prepared > 0}
                                  title={
                                    prepared > 0
                                      ? 'Prepared today — unprepare it first'
                                      : 'Remove from spellbook'
                                  }
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                        {isExpanded && (
                          <li className="spell-detail-row">
                            <SpellDetail spellName={item.name} />
                          </li>
                        )}
                      </Fragment>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="spellbook-book">
      {renderSpecialist()}
      {renderCosts()}
      {renderLearn()}
      {renderContents()}
    </div>
  );
}
