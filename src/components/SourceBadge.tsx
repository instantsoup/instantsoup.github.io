import React from 'react'
import {
  getSourceFullName,
  getSourceCategory,
  coerceSourceAbbrev,
  type SourceAbbrev,
  type SourceCategory,
} from '../data/sourcebooks'

type Props = {
  abbr: SourceAbbrev | string
  compact?: boolean
  titleOverride?: string
}

function colorsForCategory(cat: SourceCategory) {
  switch (cat) {
    case 'Core':
      return { bg: '#e6f4ea', border: '#a7d7b7', text: '#106b21' }     // green-ish
    case 'Supplement':
      return { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3' }     // indigo-ish
    case 'CheckWithGM':
      return { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' }     // amber-ish
  }
}

export function SourceBadge({ abbr, compact, titleOverride }: Props) {
  const key = typeof abbr === 'string' ? coerceSourceAbbrev(abbr) : abbr
  if (!key) {
    return (
      <span style={{ padding: '2px 8px', borderRadius: 999, border: '1px solid #ddd', color: '#666' }} title="Unknown source">
        ?
      </span>
    )
  }
  const cat = getSourceCategory(key)!
  const full = getSourceFullName(key)!
  const { bg, border, text } = colorsForCategory(cat)

  return (
    <abbr
      title={titleOverride ?? `${key} — ${full} (${cat})`}
      style={{
        display: 'inline-block',
        padding: compact ? '2px 8px' : '4px 10px',
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        color: text,
        fontSize: compact ? 12 : 13,
        lineHeight: 1,
        letterSpacing: 0.2,
        textDecoration: 'none',
        cursor: 'default',
      }}
    >
      {key}
    </abbr>
  )
}
