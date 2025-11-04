import React from 'react';

import type { SourceAbbrev } from '../data/sourcebooks';
import { SourceBadge } from './SourceBadge';

export function SourceBadges({
  items,
  compact,
}: {
  items: (SourceAbbrev | string)[];
  compact?: boolean;
}) {
  if (!items?.length) return null;

  return (
    <div className="flex-row gap-2 wrap">
      {items.map((abbr, i) => (
        <SourceBadge key={`${abbr}-${i}`} abbr={abbr} compact={compact} />
      ))}
    </div>
  );
}
