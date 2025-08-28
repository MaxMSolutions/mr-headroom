import React from 'react';
import ContextMenu, { ContextMenuItem } from '../ContextMenu';

interface IconContextMenuManagerProps {
  contextMenuPosition: { x: number, y: number, iconId: string } | null;
  onClose: () => void;
  onMenuItemAction: (action: string, iconId: string) => void;
}

const IconContextMenuManager: React.FC<IconContextMenuManagerProps> = ({ 
  contextMenuPosition, 
  onClose,
  onMenuItemAction
}) => {
  if (!contextMenuPosition) {
    return null;
  }

  // Context menu items generator
  const getContextMenuItems = (iconId: string): ContextMenuItem[] => {
    console.log(`Creating context menu items for icon: ${iconId}`);

    const openItem = {
      label: 'Open',
      icon: '⎋',
      iconId: iconId,
      action: 'open'
    };
    
    const separator1 = {
      separator: true,
      label: ''
    };
    
    const copyItem = { 
      label: 'Copy', 
      icon: '⎘', 
      disabled: true 
    };
    
    const cutItem = { 
      label: 'Cut', 
      icon: '✂', 
      disabled: true 
    };
    
    const separator2 = {
      separator: true,
      label: ''
    };
    
    const propertiesItem = {
      label: 'Properties',
      icon: 'ⓘ',
      iconId: iconId,
      action: 'properties'
    };
    
    return [
      openItem,
      separator1,
      copyItem,
      cutItem,
      separator2,
      propertiesItem
    ];
  };

  return (
    <ContextMenu 
      x={contextMenuPosition.x}
      y={contextMenuPosition.y}
      items={getContextMenuItems(contextMenuPosition.iconId)}
      onMenuItemAction={onMenuItemAction}
      onClose={onClose}
    />
  );
};

export default IconContextMenuManager;
