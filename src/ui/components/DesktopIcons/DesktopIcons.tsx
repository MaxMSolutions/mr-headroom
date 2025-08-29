import React, { useState, useRef, useCallback } from 'react';
import IconsGrid from './IconsGrid';
import IconsList from './IconsList';
import IconContextMenuManager from './IconContextMenuManager';
import IconPropertiesManager from './IconPropertiesManager';
import { useIconsData } from './hooks/useIconsData';
import { useIconsInteraction } from './hooks/useIconsInteraction';
import './DesktopIcons.css';
import './DesktopIconSizes.css'; // Import the size fixes
import './settings-icon.css'; // Import settings icon style
import './calculator-icon.css'; // Import calculator icon style
import './text-editor-icon.css'; // Import text editor icon style
import './terminal-icon.css'; // Import terminal icon style
import './doom-icon.css'; // Import doom game icon style
import './wolf3d-icon.css'; // Import Wolfenstein 3D game icon style
import './keen-icon.css'; // Import Commander Keen game icon style
import './oregontrail-icon.css'; // Import Oregon Trail game icon style
import './desktop-icon-fixes.css'; // Import additional fixes

interface DesktopIconsProps {
  onIconClick?: (iconName: string, filePath?: string) => void;
  onIconDoubleClick?: (iconName: string, filePath?: string) => void;
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({ onIconClick, onIconDoubleClick }) => {
  // Get icons data from hook
  const { 
    icons, 
    updateIconPosition, 
    findNextAvailablePosition 
  } = useIconsData();

  // State for UI components
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [draggedIcon, setDraggedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, iconId: string } | null>(null);
  const [propertiesDialog, setPropertiesDialog] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Handle icon selection
  const handleIconSelect = useCallback((id: string) => {
    setSelectedIcon(id);
  }, []);

  // Handle icon execution (called from double-click or context menu)
  const handleIconExecute = useCallback((id: string) => {
    console.log(`DesktopIcons: Execute icon ${id} (from double-click or context menu)`);
    const icon = icons.find(icon => icon.id === id);
    
    if (!icon) {
      console.error(`DesktopIcons: Could not find icon with id ${id}`);
      return;
    }
    
    // For the corrupted icon, add special behavior
    if (id === 'boundary-test') {
      // Trigger a brief desktop-wide glitch effect
      document.body.classList.add('system-glitch');
      setTimeout(() => document.body.classList.remove('system-glitch'), 500);
    }
    
    // Close any open context menu
    setContextMenu(null);
    
    if (onIconDoubleClick) {
      console.log(`DesktopIcons: Calling parent double-click handler for ${id} with path ${icon.filePath || 'undefined'}`);
      onIconDoubleClick(id, icon.filePath);
    } else {
      console.warn(`DesktopIcons: No double-click handler available for ${id}`);
    }
  }, [icons, onIconDoubleClick]);

  // Close all floating UI elements
  const closeAllMenus = useCallback(() => {
    setContextMenu(null);
    setPropertiesDialog(null);
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`DesktopIcons: Context menu requested for icon ${id} at position ${e.clientX},${e.clientY}`);
    setSelectedIcon(id);
    setContextMenu({ x: e.clientX, y: e.clientY, iconId: id });
  }, []);

  // Handle menu item action
  const handleMenuItemAction = useCallback((action: string, iconId: string) => {
    console.log(`Menu action received: ${action} for icon ${iconId}`);
    if (action === 'open') {
      console.log(`Opening icon ${iconId} from context menu`);
      handleIconExecute(iconId);
    } else if (action === 'properties') {
      console.log(`Showing properties for ${iconId} from context menu`);
      setPropertiesDialog(iconId);
    }
  }, [handleIconExecute]);

  // Set up drag handlers for icons
  const { 
    handleDragStart, 
    handleDrag, 
    handleDragEnd 
  } = useIconsInteraction({
    icons,
    updateIconPosition,
    findNextAvailablePosition,
    onIconSelect: setSelectedIcon,
    desktopRef
  });
  
  const handleDragStartWrapper = useCallback((id: string, e: React.MouseEvent) => {
    setDraggedIcon(id);
    // HTML5 drag requires DragEvent
    if (e.nativeEvent instanceof DragEvent) {
      const dragEvent = e as unknown as React.DragEvent<Element>;
      handleDragStart(id, dragEvent);
    }
  }, [handleDragStart]);
  
  const handleDragWrapper = useCallback((id: string, e: React.MouseEvent) => {
    // HTML5 drag requires DragEvent
    if (e.nativeEvent instanceof DragEvent) {
      const dragEvent = e as unknown as React.DragEvent<Element>;
      handleDrag(id, dragEvent);
    }
  }, [handleDrag]);
  
  const handleDragEndWrapper = useCallback((id: string, e: React.MouseEvent) => {
    // HTML5 drag requires DragEvent
    if (e.nativeEvent instanceof DragEvent) {
      const dragEvent = e as unknown as React.DragEvent<Element>;
      handleDragEnd(id, dragEvent);
    }
    setDraggedIcon(null);
  }, [handleDragEnd]);

  return (
    <IconsGrid
      icons={icons}
      selectedIcon={selectedIcon}
      setSelectedIcon={setSelectedIcon}
      closeAllMenus={closeAllMenus}
      updateIconPosition={updateIconPosition}
      findNextAvailablePosition={findNextAvailablePosition}
      onIconExecute={handleIconExecute}
    >
      <IconsList
        icons={icons}
        selectedIcon={selectedIcon}
        draggedIcon={draggedIcon}
        onIconSelect={(id) => {
          handleIconSelect(id);
          // Also call the parent's click handler if provided
          const icon = icons.find(i => i.id === id);
          if (onIconClick && icon) {
            onIconClick(id, icon.filePath);
          }
        }}
        onIconDoubleClick={(id, _filePath) => {
          console.log(`Double-click on icon: ${id}`);
          handleIconExecute(id);
        }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStartWrapper}
        onDrag={handleDragWrapper}
        onDragEnd={handleDragEndWrapper}
      />

      <IconContextMenuManager
        contextMenuPosition={contextMenu}
        onClose={() => setContextMenu(null)}
        onMenuItemAction={handleMenuItemAction}
      />

      <IconPropertiesManager
        propertiesDialogIconId={propertiesDialog}
        icons={icons}
        onClose={() => setPropertiesDialog(null)}
      />
    </IconsGrid>
  );
};

export default DesktopIcons;
