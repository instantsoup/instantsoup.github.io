import { PanelSection } from './PanelSection'
import { DiceRollerPanel } from './DiceRollerPanel'
import { UtilitiesPanel } from './UtilitiesPanel'

export function LeftSidebar() {
  return (
    <aside className="sidebar">
      <PanelSection title="Dice Roller" defaultOpen={true}>
        <DiceRollerPanel />
      </PanelSection>

      <PanelSection title="Utilities" defaultOpen={false}>
        <UtilitiesPanel />
      </PanelSection>
    </aside>
  )
}