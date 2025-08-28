import React from 'react';
import PropertiesDialog from './PropertiesDialog';
import { IconData } from './hooks/useIconsData';

interface IconPropertiesManagerProps {
  propertiesDialogIconId: string | null;
  icons: IconData[];
  onClose: () => void;
}

const IconPropertiesManager: React.FC<IconPropertiesManagerProps> = ({ 
  propertiesDialogIconId,
  icons, 
  onClose 
}) => {
  if (!propertiesDialogIconId) {
    return null;
  }
  
  const selectedIcon = icons.find(icon => icon.id === propertiesDialogIconId);
  
  if (!selectedIcon) {
    console.error(`Could not find icon with id ${propertiesDialogIconId}`);
    return null;
  }
  
  return (
    <PropertiesDialog
      file={{
        name: selectedIcon.label,
        type: selectedIcon.type,
        path: selectedIcon.filePath || '',
        size: selectedIcon.size,
        created: selectedIcon.created,
        modified: selectedIcon.modified,
        attributes: selectedIcon.attributes,
      }}
      onClose={onClose}
    />
  );
};

export default IconPropertiesManager;
