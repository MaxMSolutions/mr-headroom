import React from 'react';
import DesktopIcon from './DesktopIcon';
import { IconData } from './hooks/useIconsData';

interface IconsListProps {
  icons: IconData[];
  selectedIcon: string | null;
  draggedIcon: string | null;
  onIconSelect: (iconId: string) => void;
  onIconDoubleClick: (iconName: string, filePath?: string) => void;
  onContextMenu: (iconId: string, e: React.MouseEvent) => void;
  onDragStart: (iconId: string, e: React.MouseEvent) => void;
  onDrag: (iconId: string, e: React.MouseEvent) => void;
  onDragEnd: (iconId: string, e: React.MouseEvent) => void;
}

const IconsList: React.FC<IconsListProps> = ({
  icons,
  selectedIcon,
  draggedIcon,
  onIconSelect,
  onIconDoubleClick,
  onContextMenu,
  onDragStart,
  onDrag,
  onDragEnd
}) => {
  return (
    <>
      {icons.map((icon) => {
        const isDragging = draggedIcon === icon.id;
        
        // Don't render hidden icons
        if (icon.hidden) return null;
        
        return (
          <DesktopIcon
            key={icon.id}
            iconType={icon.type}
            label={icon.label}
            isHidden={icon.hidden}
            isGlitched={icon.isGlitched}
            isSelected={selectedIcon === icon.id}
            isDragging={isDragging}
            gridPosition={icon.gridPosition}
            onClick={() => onIconSelect(icon.id)}
            onDoubleClick={() => {
              console.log(`Double-click detected on icon: ${icon.id}`);
              onIconDoubleClick(icon.id, icon.filePath);
            }}
            onContextMenu={(e) => onContextMenu(icon.id, e)}
            onDragStart={(e) => onDragStart(icon.id, e)}
            onDrag={(e) => onDrag(icon.id, e)}
            onDragEnd={(e) => onDragEnd(icon.id, e)}
          />
        );
      })}
    </>
  );
};

export default IconsList;
