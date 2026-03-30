type CombatTrackerProps = {
  inCombat: boolean;
  combatRound: number;
  combatInitiative: number | undefined;
  initiativeBonus: number;
  onStart: () => void;
  onEnd: () => void;
  onSetInitiative: (n: number) => void;
  onAdvanceRound: () => void;
};

export function CombatTracker({
  inCombat,
  combatRound,
  combatInitiative,
  initiativeBonus,
  onStart,
  onEnd,
  onSetInitiative,
  onAdvanceRound,
}: CombatTrackerProps) {
  if (!inCombat) {
    return (
      <div className="combat-tracker">
        <button className="btn combat-tracker__start-btn" onClick={onStart}>
          ⚔ Enter Combat
        </button>
      </div>
    );
  }

  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

  return (
    <div className="combat-tracker combat-tracker--active">
      <span className="combat-tracker__sword">⚔</span>

      <div className="combat-tracker__block">
        <span className="combat-tracker__label">Round</span>
        <div className="combat-tracker__round-controls">
          <button
            className="btn btn--xs combat-tracker__round-btn"
            onClick={() => {
              /* handled by parent — round only advances, not decrements via this button */
            }}
            disabled={combatRound <= 1}
            title="Previous round"
            aria-label="Previous round"
          >
            ←
          </button>
          <span className="combat-tracker__round">{combatRound}</span>
          <button
            className="btn btn--xs combat-tracker__round-btn"
            onClick={onAdvanceRound}
            title="Next round — decrements active condition timers"
            aria-label="Next round"
          >
            →
          </button>
        </div>
      </div>

      <div className="combat-tracker__block">
        <span className="combat-tracker__label">Initiative</span>
        <input
          type="number"
          className="combat-tracker__init-input"
          value={combatInitiative ?? ''}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) onSetInitiative(val);
          }}
          placeholder={fmt(initiativeBonus)}
          title="Enter rolled initiative (d20 + bonus)"
        />
      </div>

      <button
        className="btn btn--sm combat-tracker__end-btn"
        onClick={onEnd}
        title="End combat — resets round counter"
      >
        End Combat
      </button>
    </div>
  );
}
