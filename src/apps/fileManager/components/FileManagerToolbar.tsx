import React from 'react';
import { 
  IoArrowUpOutline, 
  IoEyeOutline, 
  IoEyeOffOutline 
} from 'react-icons/io5';

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
      <button 
        className="file-manager-toolbar-button" 
        onClick={onGoUp}
        title="Parent Directory"
      >
        <IoArrowUpOutline className="toolbar-icon" /> PARENT_DIR
      </button>
      <button 
        className="file-manager-toolbar-button" 
        onClick={onToggleHiddenFiles}
        title={showHiddenFiles ? "Show Normal Files" : "Show All Files"}
      >
        {showHiddenFiles ? 
          <IoEyeOutline className="toolbar-icon" /> : 
          <IoEyeOffOutline className="toolbar-icon" />
        } {showHiddenFiles ? 'SHOW_ALL' : 'SHOW_NORMAL'}
      </button>
    </div>
  );
};

export default FileManagerToolbar;
