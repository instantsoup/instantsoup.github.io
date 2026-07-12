import { findSpell } from '../data/spells';

type Props = { spellName: string };

export function SpellDetail({ spellName }: Props) {
  const spell = findSpell(spellName);
  if (!spell) return null;

  const stats: { label: string; value: string }[] = [
    spell.castingTime && { label: 'CT', value: spell.castingTime },
    spell.range && { label: 'Range', value: spell.range },
    spell.duration && { label: 'Duration', value: spell.duration },
    spell.components && { label: 'Components', value: spell.components },
    spell.savingThrow && { label: 'Save', value: spell.savingThrow },
    spell.spellResistance && { label: 'SR', value: spell.spellResistance },
  ].filter(Boolean) as { label: string; value: string }[];

  const schoolLine = [spell.school, spell.subschool].filter(Boolean).join(' / ') +
    (spell.descriptor.length ? ` [${spell.descriptor.join(', ')}]` : '');

  return (
    <div className="spell-detail">
      <div className="spell-detail__school">{schoolLine}</div>
      {spell.description && <p className="spell-detail__desc">{spell.description}</p>}
      {stats.length > 0 && (
        <p className="spell-detail__stats">
          {stats.map((s, i) => (
            <span key={s.label}>
              {i > 0 && <span className="spell-detail__sep"> · </span>}
              <span className="spell-detail__label">{s.label}:</span>{' '}
              <span className="spell-detail__value">{s.value}</span>
            </span>
          ))}
        </p>
      )}
      {spell.source.page != null && (
        <span className="spell-detail__source">
          {spell.source.abbr} p.{spell.source.page}
        </span>
      )}
    </div>
  );
}
