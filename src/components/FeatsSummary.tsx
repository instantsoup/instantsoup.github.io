import { findFeat } from '../data/feats';
import type { Level } from '../types/level';

interface FeatsSummaryProps {
  levels: Level[];
}

export function FeatsSummary({ levels }: FeatsSummaryProps) {
  // Collect all feats with their level info
  const allFeats: { name: string; level: number; className: string }[] = [];

  for (const lvl of levels) {
    for (const featName of lvl.feats ?? []) {
      allFeats.push({ name: featName, level: lvl.level, className: lvl.class });
    }
  }

  if (allFeats.length === 0) {
    return (
      <div className="summary-empty">
        No feats yet. Add levels and assign feats in the Levels panel.
      </div>
    );
  }

  return (
    <div className="summary-panel">
      <div className="summary-count">{allFeats.length} feats total</div>
      <ul className="summary-list">
        {allFeats.map((item, idx) => {
          const feat = findFeat(item.name);
          return (
            <li key={`${item.name}-${item.level}-${idx}`} className="summary-item">
              <div className="summary-item__header">
                <span className="summary-item__name">{item.name}</span>
                <span className="summary-item__level">
                  Lvl {item.level} ({item.className})
                </span>
              </div>
              {feat?.description && (
                <div className="summary-item__description">{feat.description}</div>
              )}
              {feat?.source && (
                <div className="summary-item__source">
                  {feat.source.abbr}
                  {feat.source.page ? ` p.${feat.source.page}` : ''}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
