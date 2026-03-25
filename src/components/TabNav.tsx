export type Tab = 'overview' | 'combat' | 'skills' | 'spells' | 'build';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'combat', label: 'Combat' },
  { id: 'skills', label: 'Skills' },
  { id: 'spells', label: 'Spells' },
  { id: 'build', label: 'Build' },
];

type TabNavProps = {
  active: Tab;
  onSelect: (tab: Tab) => void;
};

export function TabNav({ active, onSelect }: TabNavProps) {
  return (
    <nav className="tab-nav" aria-label="Character sheet sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab-nav__btn${active === t.id ? ' tab-nav__btn--active' : ''}`}
          onClick={() => onSelect(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
