import React from 'react';
import { IoFolderOpenOutline } from 'react-icons/io5';

interface FileManagerPathDisplayProps {
  currentPath: string;
}

const FileManagerPathDisplay: React.FC<FileManagerPathDisplayProps> = ({ currentPath }) => {
  return (
    <div className="file-manager-path">
      <IoFolderOpenOutline className="path-icon" /> {currentPath}
    </div>
  );
};

export default FileManagerPathDisplay;
