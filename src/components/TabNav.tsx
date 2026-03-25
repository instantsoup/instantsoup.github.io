export type Tab = 'overview' | 'combat' | 'skills' | 'spells' | 'build' | 'sheet';

const BUILD_TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'combat', label: 'Combat' },
  { id: 'skills', label: 'Skills' },
  { id: 'spells', label: 'Spells' },
  { id: 'build', label: 'Build' },
];

const PLAY_TABS: { id: Tab; label: string }[] = [
  { id: 'sheet', label: 'Sheet' },
  { id: 'overview', label: 'Overview' },
  { id: 'combat', label: 'Combat' },
  { id: 'skills', label: 'Skills' },
  { id: 'spells', label: 'Spells' },
];

type TabNavProps = {
  active: Tab;
  onSelect: (tab: Tab) => void;
  mode: 'build' | 'play';
};

export function TabNav({ active, onSelect, mode }: TabNavProps) {
  const TABS = mode === 'play' ? PLAY_TABS : BUILD_TABS;
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
