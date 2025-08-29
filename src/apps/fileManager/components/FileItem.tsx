import React from 'react';
import { FileSystemObject } from '../../../engine/fileSystem';
import { 
  IoFolderOutline, 
  IoDocumentTextOutline, 
  IoImageOutline,
  IoCodeSlashOutline,
  IoSettingsOutline,
  IoTerminalOutline,
  IoServerOutline,
  IoDocumentOutline
} from 'react-icons/io5';

interface FileItemProps {
  item: FileSystemObject;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  item,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu
}) => {
  // Get file icon based on type and extension
  const getFileIcon = (file: FileSystemObject): JSX.Element => {
    if (file.type === 'directory') {
      return <IoFolderOutline className="file-icon" />;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
      case 'log':
        return <IoDocumentTextOutline className="file-icon" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <IoImageOutline className="file-icon" />;
      case 'exe':
      case 'com':
        return <IoSettingsOutline className="file-icon" />;
      case 'bat':
        return <IoTerminalOutline className="file-icon" />;
      case 'ini':
        return <IoCodeSlashOutline className="file-icon" />;
      case 'dat':
        return <IoServerOutline className="file-icon" />;
      default:
        return <IoDocumentOutline className="file-icon" />;
    }
  };

  const isHidden = item.attributes.hidden;

  return (
    <div
      className={`file-manager-item ${isSelected ? 'selected' : ''} ${isHidden ? 'hidden' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="file-manager-item-icon">{getFileIcon(item)}</div>
      <div className="file-manager-item-name">{item.name}</div>
    </div>
  );
};

export default FileItem;
