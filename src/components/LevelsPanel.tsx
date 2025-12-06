import { classes } from '../data/classes';
import type { ClassName } from '../schema/schema';
import type { Level } from '../types/level';

type LevelsPanelProps = {
  levels: Level[];
  addLevel: () => void;
  removeLevel: () => void;
  updateLevelClass: (levelNumber: number, className: ClassName) => void;
  onBlur?: () => void;
};

export function LevelsPanel({
  levels,
  addLevel,
  removeLevel,
  updateLevelClass,
  onBlur,
}: LevelsPanelProps) {
  const canAddLevel = levels.length < 20;

  const handleAddLevel = () => {
    addLevel();
    onBlur?.();
  };

  const handleRemoveLevel = () => {
    removeLevel();
    onBlur?.();
  };

  const handleUpdateClass = (levelNumber: number, className: ClassName) => {
    updateLevelClass(levelNumber, className);
    onBlur?.();
  };

  return (
    <section className="levels-panel">
      <h2>Character Levels</h2>

      {levels.length === 0 && (
        <p className="levels-empty">No levels added yet. Add your first level to begin.</p>
      )}

      {levels.length > 0 && (
        <table className="levels-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((lvl) => (
              <tr key={lvl.level}>
                <td className="levels-table__level">Level {lvl.level}</td>
                <td className="levels-table__class">
                  <select
                    value={lvl.class}
                    onChange={(e) => handleUpdateClass(lvl.level, e.target.value as ClassName)}
                    className="levels-table__select"
                  >
                    {classes.map((cls) => (
                      <option key={cls.name} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="levels-actions">
        <button onClick={handleAddLevel} disabled={!canAddLevel} className="btn btn--primary">
          {canAddLevel ? 'Add Level' : 'Max Level (20)'}
        </button>
        {levels.length > 0 && (
          <button onClick={handleRemoveLevel} className="btn btn--danger">
            Remove Last Level
          </button>
        )}
      </div>
    </section>
  );
}
