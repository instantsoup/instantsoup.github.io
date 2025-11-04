import React from 'react';

import { DiceRollerPanel } from './DiceRollerPanel';
import { PanelSection } from './PanelSection';
import { RollCharacter } from './RollCharacter';

export function LeftSidebar() {
  return (
    <aside className="sidebar">
      <PanelSection title="Dice Roller" defaultOpen>
        <DiceRollerPanel />
      </PanelSection>

      <PanelSection title="Roll Character" defaultOpen={false}>
        <div className="panel__content">
          <RollCharacter />
        </div>
      </PanelSection>
    </aside>
  );
}
