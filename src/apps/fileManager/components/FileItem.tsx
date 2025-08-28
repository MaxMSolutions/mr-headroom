import React from 'react';
import { FileSystemObject } from '../../../engine/fileSystem';

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
  const getFileIcon = (file: FileSystemObject): string => {
    if (file.type === 'directory') {
      return '⊞';
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
      case 'log':
        return '◰';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '◨';
      case 'exe':
      case 'com':
        return '⚙';
      case 'bat':
        return '≡';
      case 'ini':
        return '⌆';
      case 'dat':
        return '⧈';
      default:
        return '◎';
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
