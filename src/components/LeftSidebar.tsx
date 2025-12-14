import { DiceRollerPanel } from './DiceRollerPanel';
import { PanelSection } from './PanelSection';
import { RollCharacterPanel } from './RollCharacterPanel';
import { UtilitiesPanel } from './UtilitiesPanel';

interface LeftSidebarProps {
  exportJson: () => void;
  onPickFile: () => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  resetAll: () => void;
}

export function LeftSidebar({
  exportJson,
  onPickFile,
  onFileChange,
  fileInputRef,
  resetAll,
}: LeftSidebarProps) {
  return (
    <aside className="sidebar">
      <PanelSection title="Import/Export" defaultOpen={false}>
        <UtilitiesPanel
          exportJson={exportJson}
          onPickFile={onPickFile}
          onFileChange={onFileChange}
          fileInputRef={fileInputRef}
          resetAll={resetAll}
        />
      </PanelSection>

      <PanelSection title="Dice Roller" defaultOpen={false}>
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
