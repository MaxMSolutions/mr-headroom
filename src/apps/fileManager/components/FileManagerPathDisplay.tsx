import React from 'react';

interface FileManagerPathDisplayProps {
  currentPath: string;
}

const FileManagerPathDisplay: React.FC<FileManagerPathDisplayProps> = ({ currentPath }) => {
  return (
    <div className="file-manager-path">
      &gt; {currentPath}
    </div>
  );
};

export default FileManagerPathDisplay;
