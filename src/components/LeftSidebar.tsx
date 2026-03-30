import { type EquipmentItem, type Weapon } from '../schema/schema';
import { ArmorBrowser } from './ArmorBrowser';
import { ClassesBrowser } from './ClassesBrowser';
import { DiceRollerPanel } from './DiceRollerPanel';
import { EquipmentBrowser } from './EquipmentBrowser';
import { FeatsBrowser } from './FeatsBrowser';
import { PanelSection } from './PanelSection';
import { RollCharacterPanel } from './RollCharacterPanel';
import { SkillsBrowser } from './SkillsBrowser';
import { SpellsBrowser } from './SpellsBrowser';
import { UtilitiesPanel } from './UtilitiesPanel';
import { WeaponsBrowser } from './WeaponsBrowser';

interface LeftSidebarProps {
  exportJson: () => void;
  onPickFile: () => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  resetAll: () => void;
  onAddWeapon?: (weapon: Weapon) => void;
  onAddEquipment?: (item: EquipmentItem) => void;
}

export function LeftSidebar({
  exportJson,
  onPickFile,
  onFileChange,
  fileInputRef,
  resetAll,
  onAddWeapon,
  onAddEquipment,
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

      <PanelSection title="Classes" defaultOpen={false}>
        <ClassesBrowser />
      </PanelSection>

      <PanelSection title="Skills" defaultOpen={false}>
        <SkillsBrowser />
      </PanelSection>

      <PanelSection title="Feats" defaultOpen={false}>
        <FeatsBrowser />
      </PanelSection>

      <PanelSection title="Spells" defaultOpen={false}>
        <SpellsBrowser />
      </PanelSection>

      <PanelSection title="Weapons" defaultOpen={false}>
        <WeaponsBrowser onAdd={onAddWeapon} />
      </PanelSection>

      <PanelSection title="Armor" defaultOpen={false}>
        <ArmorBrowser />
      </PanelSection>

      <PanelSection title="Equipment" defaultOpen={false}>
        <EquipmentBrowser onAdd={onAddEquipment} />
      </PanelSection>
    </aside>
  );
}
