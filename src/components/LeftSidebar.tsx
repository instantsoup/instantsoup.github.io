import { DiceRollerPanel } from './DiceRollerPanel';
import { PanelSection } from './PanelSection';
import { RollCharacterPanel } from './RollCharacterPanel';

export function LeftSidebar() {
  return (
    <aside className="sidebar">
      <PanelSection title="Dice Roller" defaultOpen>
        <DiceRollerPanel />
      </PanelSection>

      <PanelSection title="Roll Character" defaultOpen={false}>
        <div className="panel__content">
          <RollCharacterPanel />
        </div>
      </PanelSection>
    </aside>
  );
}
