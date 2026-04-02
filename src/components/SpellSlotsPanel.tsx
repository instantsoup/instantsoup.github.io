import type { CombatStats } from '../schema/schema';

const SPELL_LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

type SpellSlotsPanelProps = {
  combatStats: CombatStats;
  updateSpellSlotsMax: (spellLevel: string, max: number) => void;
  updateSpellSlotsUsed: (spellLevel: string, used: number) => void;
  resetSpellSlots: () => void;
  onBlur: () => void;
  readOnly?: boolean;
  /** Pre-calculated max slots from class progression + ability bonus */
  calculatedSlots?: Record<string, number>;
  /** Primary spellcasting ability modifier for spell DC display */
  primaryCastingMod?: number;
};

export function SpellSlotsPanel({
  combatStats,
  updateSpellSlotsMax,
  updateSpellSlotsUsed,
  resetSpellSlots,
  onBlur,
  readOnly,
  calculatedSlots,
  primaryCastingMod,
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

  const handleAutoFill = () => {
    if (!calculatedSlots) return;
    // First zero out any levels not in calculatedSlots
    for (const lvl of SPELL_LEVELS) {
      if (!(lvl in calculatedSlots) && (slotsMax[lvl] ?? 0) > 0) {
        updateSpellSlotsMax(lvl, 0);
      }
    }
    for (const [lvl, val] of Object.entries(calculatedSlots)) {
      updateSpellSlotsMax(lvl, val);
    }
    onBlur();
  };

  // Determine which rows to show
  const hasCalculated = calculatedSlots && Object.keys(calculatedSlots).length > 0;
  const hasManual = SPELL_LEVELS.some((lvl) => (slotsMax[lvl] ?? 0) > 0);
  const showAll = !hasManual && !readOnly;
  const rows = showAll ? [...SPELL_LEVELS] : SPELL_LEVELS;

  const spellDC = (spellLevel: number): number | null => {
    if (primaryCastingMod === undefined) return null;
    return 10 + spellLevel + primaryCastingMod;
  };

  return (
    <div className="spell-slots">
      {hasCalculated && !readOnly && (
        <div className="spell-slots__auto-bar">
          <span className="spell-slots__auto-hint">Slots calculated from class + ability score</span>
          <button className="btn btn--xs btn--secondary" onClick={handleAutoFill} title="Apply calculated slots">
            ↺ Auto-fill
          </button>
        </div>
      )}

      <div className="spell-slots__header">
        <span className="spell-slots__col-label">Level</span>
        {!readOnly && primaryCastingMod !== undefined && (
          <span className="spell-slots__col-label">DC</span>
        )}
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
        const calcVal = calculatedSlots?.[lvl];
        const dc = spellDC(Number(lvl));
        const mismatch = calcVal !== undefined && calcVal !== max && max > 0;

        if (!showAll && max === 0 && calcVal === undefined) return null;

        return (
          <div
            key={lvl}
            className={`spell-slots__row${isExhausted ? ' spell-slots__row--exhausted' : ''}`}
          >
            <span className="spell-slots__level">
              {lvl === '0' ? 'Cantrip' : `${lvl}`}
              {calcVal !== undefined && calcVal !== max && !readOnly && (
                <span
                  className="spell-slots__calc-hint"
                  title={`Calculated: ${calcVal}`}
                  onClick={() => { updateSpellSlotsMax(lvl, calcVal); onBlur(); }}
                >
                  ({calcVal})
                </span>
              )}
              {mismatch && <span className="spell-slots__mismatch" title="Manual value differs from calculated" />}
            </span>
            {!readOnly && primaryCastingMod !== undefined && (
              <span className="spell-slots__dc">{dc}</span>
            )}
            {readOnly ? (
              <span className="spell-slots__max-display">{max > 0 ? max : '—'}</span>
            ) : (
              <input
                type="number"
                className="spell-slots__input"
                value={max || ''}
                onChange={handleMaxChange(lvl)}
                placeholder={calcVal !== undefined ? String(calcVal) : '0'}
                min={0}
                title={`Max ${lvl === '0' ? 'cantrip' : `level ${lvl}`} slots`}
              />
            )}
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
