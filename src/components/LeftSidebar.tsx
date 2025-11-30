import { DiceRollerPanel } from './DiceRollerPanel';
import { PanelSection } from './PanelSection';
import { RollCharacterPanel } from './RollCharacterPanel';
import { UtilitiesPanel } from './UtilitiesPanel';

interface LeftSidebarProps {
  persistLocal: () => void;
  exportJson: () => void;
  onPickFile: () => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  resetAll: () => void;
}

export function LeftSidebar({
  persistLocal,
  exportJson,
  onPickFile,
  onFileChange,
  fileInputRef,
  resetAll,
}: LeftSidebarProps) {
  return (
    <aside className="sidebar">
      <PanelSection title="Utilities" defaultOpen={false}>
        <UtilitiesPanel
          persistLocal={persistLocal}
          exportJson={exportJson}
          onPickFile={onPickFile}
          onFileChange={onFileChange}
          fileInputRef={fileInputRef}
          resetAll={resetAll}
        />
      </PanelSection>

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
