import { findSpell } from '../data/spells';
import type { Level } from '../types/level';

interface SpellsSummaryProps {
  levels: Level[];
}

function formatLevels(levels: Record<string, number>): string {
  return Object.entries(levels)
    .sort((a, b) => a[1] - b[1])
    .map(([cls, lvl]) => `${cls} ${lvl}`)
    .join(', ');
}

export function SpellsSummary({ levels }: SpellsSummaryProps) {
  // Collect all spells with their level info
  const allSpells: { name: string; level: number; className: string }[] = [];

  for (const lvl of levels) {
    for (const spellName of lvl.spells ?? []) {
      allSpells.push({ name: spellName, level: lvl.level, className: lvl.class });
    }
  }

  if (allSpells.length === 0) {
    return (
      <div className="summary-empty">
        No spells yet. Add levels and assign spells in the Levels panel.
      </div>
    );
  }

  return (
    <div className="summary-panel">
      <div className="summary-count">{allSpells.length} spells total</div>
      <ul className="summary-list">
        {allSpells.map((item, idx) => {
          const spell = findSpell(item.name);
          return (
            <li key={`${item.name}-${item.level}-${idx}`} className="summary-item">
              <div className="summary-item__header">
                <span className="summary-item__name">{item.name}</span>
                <span className="summary-item__level">
                  Lvl {item.level} ({item.className})
                </span>
              </div>
              {spell && (
                <div className="summary-item__meta">
                  {spell.school}
                  {spell.subschool && ` (${spell.subschool})`} - {formatLevels(spell.levels)}
                </div>
              )}
              {spell?.description && (
                <div className="summary-item__description">{spell.description}</div>
              )}
              {spell?.source && (
                <div className="summary-item__source">
                  {spell.source.abbr}
                  {spell.source.page ? ` p.${spell.source.page}` : ''}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
