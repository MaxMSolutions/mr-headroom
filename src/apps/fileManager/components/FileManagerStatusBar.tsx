import React from 'react';
import { FileSystemObject } from '../../../engine/fileSystem';

interface FileManagerStatusBarProps {
  fileCount: number;
  statusMessage: string;
  selectedItem: string | null;
  files: FileSystemObject[];
}

const FileManagerStatusBar: React.FC<FileManagerStatusBarProps> = ({
  fileCount,
  statusMessage,
  selectedItem,
  files
}) => {
  // Format file size
  const formatFileSize = (size?: number): string => {
    if (size === undefined) return '0 bytes';
    
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedFile = files.find(item => item.name === selectedItem);

  return (
    <div className="file-manager-status-bar">
      <div>FILES: {fileCount} | STATUS: {statusMessage}</div>
      <div>
        {selectedItem && selectedFile?.type === 'file' && 
          `SIZE: ${formatFileSize(selectedFile?.size)}`}
      </div>
    </div>
  );
};

export default FileManagerStatusBar;
