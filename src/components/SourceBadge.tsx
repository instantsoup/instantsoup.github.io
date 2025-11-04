import React from 'react';

import { coerceSourceAbbrev, getSourceFullName, type SourceAbbrev } from '../data/sourcebooks';

type Props = {
  abbr: SourceAbbrev | string;
  compact?: boolean;
  titleOverride?: string;
};

export function SourceBadge({ abbr, compact, titleOverride }: Props) {
  const key = typeof abbr === 'string' ? coerceSourceAbbrev(abbr) : abbr;
  if (!key) {
    return (
      <span className="badge text-muted" title="Unknown source">
        ?
      </span>
    );
  }

  const full = getSourceFullName(key)!;

  const baseClass = compact ? 'badge badge-compact' : 'badge';

  return (
    <abbr title={titleOverride ?? `${key} — ${full}`} className={`${baseClass}`}>
      {key}
    </abbr>
  );
}
