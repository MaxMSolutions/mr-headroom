import React, { useState, useEffect, useRef } from 'react';
import FileSystem from '../../../engine/fileSystem';
import { getParentPath, joinPath } from '../utils';
import { 
  IoFolderOutline, 
  IoDocumentOutline, 
  IoArrowUpOutline,
  IoCheckmarkOutline,
  IoCloseOutline 
} from 'react-icons/io5';

interface OpenFileDialogProps {
  isOpen: boolean;
  currentPath: string;
  onSelect: (path: string) => void;
  onCancel: () => void;
  fileSystem?: FileSystem;
}

const OpenFileDialog: React.FC<OpenFileDialogProps> = ({
  isOpen,
  currentPath,
  onSelect,
  onCancel,
  fileSystem
}) => {
  const [path, setPath] = useState(currentPath || '/home/hedrum/documents/');
  const [selectedFile, setSelectedFile] = useState('');
  const [files, setFiles] = useState<{name: string, type: string}[]>([]);
  const [directories, setDirectories] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Reset position and state when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset position and state when opened
      setPosition({ x: 0, y: 0 });
      setDragging(false);
    } else {
      // Clear state when closed to prevent memory leaks or state persistence
      setSelectedFile('');
      setFiles([]);
      setDirectories([]);
    }
  }, [isOpen]);
  
  // Load directories and files when path changes
  useEffect(() => {
    if (!fileSystem || !isOpen) return;
    
    const loadDirectoriesAndFiles = () => {
      try {
        // Check if path exists before listing its contents
        if (!fileSystem.exists(path)) {
          return { dirs: [], files: [] };
        }
        
        const dirContent = fileSystem.listDirectory(path);
        if (!dirContent) return { dirs: [], files: [] };
        
        const dirs = dirContent
          .filter((item: { type: string }) => item && item.type === 'directory')
          .map((dir: { name: string }) => joinPath(path, dir.name));
          
        const files = dirContent
          .filter((item: { type: string }) => item && item.type === 'file');
        
        return { dirs, files };
      } catch (error) {
        console.error("Error loading directory contents:", error);
        return { dirs: [], files: [] };
      }
    };
    
    const { dirs, files } = loadDirectoriesAndFiles();
    setDirectories(dirs);
    setFiles(files);
  }, [fileSystem, path, isOpen]);
  
  // Handle mouse events for dragging
  const startDrag = (e: React.MouseEvent) => {
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };
  
  const onDrag = (e: React.MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };
  
  const stopDrag = () => {
    setDragging(false);
  };
  
  // Navigate to parent directory
  const goToParentDirectory = () => {
    setPath(getParentPath(path));
  };
  
  // Navigate to a subdirectory
  const navigateToDirectory = (dirPath: string) => {
    setPath(dirPath);
  };
  
  // Select a file
  const selectFile = (fileName: string) => {
    setSelectedFile(fileName);
  };
  
  // Handle open button click
  const handleOpenClick = () => {
    if (!selectedFile) return;
    
    const fullPath = joinPath(path, selectedFile);
    // Clean up state before calling onSelect to prevent UI issues
    setSelectedFile('');
    setFiles([]);
    setDirectories([]);
    onSelect(fullPath);
  };
  
  // If dialog is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div 
      className="file-dialog-overlay always-on-top"
      onMouseMove={dragging ? onDrag : undefined}
      onMouseUp={dragging ? stopDrag : undefined}
      onMouseLeave={dragging ? stopDrag : undefined}
    >
      <div 
        className="file-dialog open-file-dialog" 
        ref={dialogRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        <div 
          className="file-dialog-title"
          onMouseDown={startDrag}
        >
          Open File
        </div>
        <div className="file-dialog-content">
          <div className="file-dialog-field">
            <label>Path:</label>
            <input 
              className="file-dialog-input"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>
          
          <div className="file-dialog-navigation">
            <button 
              className="file-dialog-button"
              onClick={goToParentDirectory}
              title="Parent Directory"
            >
              <IoArrowUpOutline className="file-dialog-icon" /> Parent Directory
            </button>
          </div>
          
          {directories.length > 0 && (
            <div className="file-dialog-section">
              <h4>Directories</h4>
              <ul className="file-dialog-list">
                {directories.map((dir) => (
                  <li 
                    key={dir} 
                    className="file-dialog-item directory"
                    onDoubleClick={() => navigateToDirectory(dir)}
                  >
                    <IoFolderOutline className="file-dialog-icon" /> {dir.split('/').pop()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {files.length > 0 && (
            <div className="file-dialog-section">
              <h4>Files</h4>
              <ul className="file-dialog-list">
                {files.map((file) => (
                  <li 
                    key={file.name} 
                    className={`file-dialog-item file ${selectedFile === file.name ? 'selected' : ''}`}
                    onClick={() => selectFile(file.name)}
                    onDoubleClick={() => {
                      selectFile(file.name);
                      handleOpenClick();
                    }}
                  >
                    <IoDocumentOutline className="file-dialog-icon" /> {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="file-dialog-actions">
          <button 
            className="file-dialog-button"
            onClick={handleOpenClick}
            disabled={!selectedFile}
            title="Open Selected File"
          >
            <IoCheckmarkOutline className="file-dialog-icon" /> Open
          </button>
          <button 
            className="file-dialog-button"
            onClick={() => {
              // Clean up state before calling onCancel to prevent UI issues
              setSelectedFile('');
              setFiles([]);
              setDirectories([]);
              onCancel();
            }}
            title="Cancel"
          >
            <IoCloseOutline className="file-dialog-icon" /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenFileDialog;
