import React from 'react'
import { SourceBadge } from './SourceBadge'
import type { SourceAbbrev } from '../data/sourcebooks'

export function SourceBadges({ items, compact }: { items: (SourceAbbrev | string)[]; compact?: boolean }) {
  if (!items?.length) return null
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {items.map((abbr, i) => (
        <SourceBadge key={`${abbr}-${i}`} abbr={abbr} compact={compact} />
      ))}
    </div>
  )
}
