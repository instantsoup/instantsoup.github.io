import type { AbilityDamage } from '../schema/schema';
import type { Scores } from '../types';

type AbilityDamagePanelProps = {
  scores: Scores;
  effectiveScores: Scores;
  abilityDamage: AbilityDamage;
  onSetDamage: (key: keyof AbilityDamage, value: number) => void;
  onBlur: () => void;
};

const ABILITIES: { key: keyof Scores; label: string }[] = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
];

export function AbilityDamagePanel({
  scores,
  effectiveScores,
  abilityDamage,
  onSetDamage,
  onBlur,
}: AbilityDamagePanelProps) {
  return (
    <div className="ability-damage">
      <div className="ability-damage__header">
        <span className="ability-damage__col">Ability</span>
        <span className="ability-damage__col ability-damage__col--center">Base</span>
        <span className="ability-damage__col ability-damage__col--center">Damage</span>
        <span className="ability-damage__col ability-damage__col--center">Effective</span>
      </div>
      {ABILITIES.map(({ key, label }) => {
        const dmg = abilityDamage[key] ?? 0;
        const effective = effectiveScores[key];
        const damaged = dmg > 0;
        return (
          <div key={key} className={`ability-damage__row${damaged ? ' ability-damage__row--damaged' : ''}`}>
            <span className="ability-damage__ability">{label}</span>
            <span className="ability-damage__base">{scores[key]}</span>
            <input
              type="number"
              className="ability-damage__input"
              value={dmg || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onSetDamage(key, Number.isNaN(val) ? 0 : val);
              }}
              onBlur={onBlur}
              placeholder="0"
              min="0"
            />
            <span className={`ability-damage__effective${damaged ? ' ability-damage__effective--reduced' : ''}`}>
              {effective}
            </span>
          </div>
        );
      })}
    </div>
  );
}
