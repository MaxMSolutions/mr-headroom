import React, { useEffect, useRef } from 'react';
import { IconData } from './hooks/useIconsData';
import { useIconsInteraction } from './hooks/useIconsInteraction';

interface IconsGridProps {
  children: React.ReactNode;
  icons: IconData[];
  selectedIcon: string | null;
  setSelectedIcon: (iconId: string | null) => void;
  closeAllMenus: () => void;
  updateIconPosition: (iconId: string, row: number, col: number) => void;
  findNextAvailablePosition: (row: number, col: number, excludeIconId?: string) => { row: number, col: number };
  onIconExecute: (iconId: string) => void;
}

const IconsGrid: React.FC<IconsGridProps> = ({
  children,
  icons,
  selectedIcon,
  setSelectedIcon,
  closeAllMenus,
  updateIconPosition,
  findNextAvailablePosition,
  onIconExecute
}) => {
  const desktopRef = useRef<HTMLDivElement>(null);

  // Setup interactions with useIconsInteraction hook
  const {
    handleDragOver,
    handleDesktopDrop
  } = useIconsInteraction({
    icons,
    updateIconPosition,
    findNextAvailablePosition,
    onIconSelect: setSelectedIcon,
    desktopRef
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedIcon) return;
      
      // Find current icon index and position
      const currentIndex = icons.findIndex(icon => icon.id === selectedIcon);
      if (currentIndex === -1) return;
      
      const currentIcon = icons[currentIndex];
      const currentPos = currentIcon.gridPosition || { row: 1, col: 1 };
      
      let nextRow = currentPos.row;
      let nextCol = currentPos.col;
      
      // Arrow key navigation
      switch (e.key) {
        case 'ArrowUp':
          nextRow = Math.max(1, currentPos.row - 1);
          break;
        case 'ArrowDown':
          nextRow = Math.min(7, currentPos.row + 1); // Updated from 8 to 7 to match maxRow in useIconsData
          break;
        case 'ArrowLeft':
          nextCol = Math.max(1, currentPos.col - 1);
          break;
        case 'ArrowRight':
          nextCol = Math.min(10, currentPos.col + 1);
          break;
        case 'Enter':
          onIconExecute(selectedIcon);
          return;
        default:
          return;
      }
      
      // Find icon at the new position
      const nextIcon = icons.find(icon => 
        icon.gridPosition?.row === nextRow && icon.gridPosition?.col === nextCol
      );
      
      if (nextIcon && !nextIcon.hidden) {
        setSelectedIcon(nextIcon.id);
        // Focus the next icon
        const iconElement = document.querySelector(`[data-icon-id="${nextIcon.id}"]`) as HTMLElement;
        if (iconElement) {
          iconElement.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcon, icons, setSelectedIcon, onIconExecute]);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If clicked on the desktop itself (not an icon)
      if (desktopRef.current && desktopRef.current.contains(e.target as Node) && 
          !(e.target as Element).closest('.desktop-icon')) {
        setSelectedIcon(null);
        closeAllMenus();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllMenus, setSelectedIcon]);

  return (
    <div 
      ref={desktopRef} 
      className="desktop-icons"
      onDragOver={handleDragOver}
      onDrop={handleDesktopDrop}
    >
      {children}
    </div>
  );
};

export default IconsGrid;
