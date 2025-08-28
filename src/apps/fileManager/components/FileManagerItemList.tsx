import React from 'react';
import { FileSystemObject } from '../../../engine/fileSystem';
import FileItem from './FileItem';

interface FileManagerItemListProps {
  files: FileSystemObject[];
  selectedItem: string | null;
  onItemClick: (item: FileSystemObject) => void;
  onItemDoubleClick: (item: FileSystemObject) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemObject | null) => void;
}

const FileManagerItemList: React.FC<FileManagerItemListProps> = ({
  files,
  selectedItem,
  onItemClick,
  onItemDoubleClick,
  onContextMenu
}) => {
  return (
    <div 
      className="file-manager-content"
      onContextMenu={(e) => onContextMenu(e, null)}
    >
      {files.length > 0 ? (
        files.map((item, index) => (
          <FileItem
            key={index}
            item={item}
            isSelected={selectedItem === item.name}
            onClick={() => onItemClick(item)}
            onDoubleClick={() => onItemDoubleClick(item)}
            onContextMenu={(e: React.MouseEvent) => onContextMenu(e, item)}
          />
        ))
      ) : (
        <div className="file-manager-empty">
          <div>EMPTY DIRECTORY</div>
          <div className="blinking-cursor">█</div>
        </div>
      )}
    </div>
  );
};

export default FileManagerItemList;
