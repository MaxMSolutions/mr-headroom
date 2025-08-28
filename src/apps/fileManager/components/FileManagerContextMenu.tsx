import React from 'react';

interface Position {
  x: number;
  y: number;
}

interface FileManagerContextMenuProps {
  position: Position;
  contextMenuTarget: string | null;
  showHiddenFiles: boolean;
  onFileOperation: (operation: string) => void;
  onToggleHiddenFiles: () => void;
  onRefresh: () => void;
}

const FileManagerContextMenu: React.FC<FileManagerContextMenuProps> = ({
  position,
  contextMenuTarget,
  showHiddenFiles,
  onFileOperation,
  onToggleHiddenFiles,
  onRefresh
}) => {
  return (
    <div 
      className="file-manager-context-menu"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {contextMenuTarget ? (
        <>
          <div className="file-manager-context-item" onClick={() => onFileOperation('open')}>
            OPEN
          </div>
          <div className="file-manager-context-separator" />
          <div className="file-manager-context-item" onClick={() => onFileOperation('delete')}>
            DELETE
          </div>
          <div className="file-manager-context-separator" />
          <div className="file-manager-context-item" onClick={() => onFileOperation('properties')}>
            PROPERTIES
          </div>
        </>
      ) : (
        <>
          <div className="file-manager-context-item" onClick={onRefresh}>
            REFRESH
          </div>
          <div className="file-manager-context-separator" />
          <div className="file-manager-context-item" onClick={onToggleHiddenFiles}>
            {showHiddenFiles ? 'HIDE SYSTEM FILES' : 'SHOW ALL FILES'}
          </div>
        </>
      )}
    </div>
  );
};

export default FileManagerContextMenu;
