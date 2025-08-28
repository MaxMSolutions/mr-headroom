import React from 'react';

interface FileManagerToolbarProps {
  onGoUp: () => void;
  showHiddenFiles: boolean;
  onToggleHiddenFiles: () => void;
}

const FileManagerToolbar: React.FC<FileManagerToolbarProps> = ({ 
  onGoUp, 
  showHiddenFiles, 
  onToggleHiddenFiles 
}) => {
  return (
    <div className="file-manager-toolbar">
      <button className="file-manager-toolbar-button" onClick={onGoUp}>⇧ PARENT_DIR</button>
      <button 
        className="file-manager-toolbar-button" 
        onClick={onToggleHiddenFiles}
      >
        {showHiddenFiles ? '◉ SHOW_ALL' : '◎ SHOW_NORMAL'}
      </button>
    </div>
  );
};

export default FileManagerToolbar;
