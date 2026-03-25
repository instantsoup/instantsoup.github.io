import type { CombatStats } from '../schema/schema';

const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

type SpellSlotsPanelProps = {
  combatStats: CombatStats;
  updateSpellSlotsMax: (spellLevel: string, max: number) => void;
  updateSpellSlotsUsed: (spellLevel: string, used: number) => void;
  resetSpellSlots: () => void;
  onBlur: () => void;
};

export function SpellSlotsPanel({
  combatStats,
  updateSpellSlotsMax,
  updateSpellSlotsUsed,
  resetSpellSlots,
  onBlur,
}: SpellSlotsPanelProps) {
  const slotsMax = combatStats.spellSlotsMax ?? {};
  const slotsUsed = combatStats.spellSlotsUsed ?? {};

  const handleMaxChange = (level: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value || '0', 10);
    updateSpellSlotsMax(level, Number.isFinite(v) ? v : 0);
    onBlur();
  };

  const cast = (level: string) => {
    const max = slotsMax[level] ?? 0;
    const used = slotsUsed[level] ?? 0;
    if (used < max) {
      updateSpellSlotsUsed(level, used + 1);
      onBlur();
    }
  };

  const recover = (level: string) => {
    const used = slotsUsed[level] ?? 0;
    if (used > 0) {
      updateSpellSlotsUsed(level, used - 1);
      onBlur();
    }
  };

  const handleNewDay = () => {
    resetSpellSlots();
    onBlur();
  };

  // Only show levels that have a max set or if all are 0 show them all for setup
  const activeRows = SPELL_LEVELS.filter((lvl) => (slotsMax[lvl] ?? 0) > 0);
  const showAll = activeRows.length === 0;
  const rows = showAll ? [...SPELL_LEVELS] : SPELL_LEVELS;

  return (
    <div className="spell-slots">
      <div className="spell-slots__header">
        <span className="spell-slots__col-label">Level</span>
        <span className="spell-slots__col-label">Max</span>
        <span className="spell-slots__col-label">Used</span>
        <span className="spell-slots__col-label">Remaining</span>
        <span className="spell-slots__col-label">Cast / Recover</span>
      </div>

      {rows.map((lvl) => {
        const max = slotsMax[lvl] ?? 0;
        const used = slotsUsed[lvl] ?? 0;
        const remaining = Math.max(0, max - used);
        const isExhausted = max > 0 && remaining === 0;

        if (!showAll && max === 0) return null;

        return (
          <div
            key={lvl}
            className={`spell-slots__row${isExhausted ? ' spell-slots__row--exhausted' : ''}`}
          >
            <span className="spell-slots__level">{lvl === '0' ? 'Cantrip' : `${lvl}`}</span>
            <input
              type="number"
              className="spell-slots__input"
              value={max || ''}
              onChange={handleMaxChange(lvl)}
              placeholder="0"
              min={0}
              title={`Max ${lvl === '0' ? 'cantrip' : `level ${lvl}`} slots`}
            />
            <span className="spell-slots__used">{max > 0 ? used : '—'}</span>
            <span className="spell-slots__remaining">{max > 0 ? remaining : '—'}</span>
            <div className="spell-slots__actions">
              <button
                className="btn btn--xs btn--danger"
                onClick={() => cast(lvl)}
                disabled={max === 0 || remaining === 0}
                title="Cast a spell"
              >
                Cast
              </button>
              <button
                className="btn btn--xs btn--secondary"
                onClick={() => recover(lvl)}
                disabled={used === 0}
                title="Recover a spell slot"
              >
                Recover
              </button>
            </div>
          </div>
        );
      })}

      <div className="spell-slots__footer">
        <button className="btn btn--sm btn--secondary" onClick={handleNewDay}>
          New Day (reset all slots)
        </button>
      </div>
    </div>
  );
}
