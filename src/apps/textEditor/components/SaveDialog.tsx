import React, { useState, useEffect, useRef } from 'react';
import { FileSystem } from '../../../engine/fileSystem';
import { getParentPath, joinPath } from '../utils';

interface SaveDialogProps {
  isOpen: boolean;
  currentPath: string;
  onSave: (path: string) => void;
  onCancel: () => void;
  fileSystem?: FileSystem;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  currentPath,
  onSave,
  onCancel,
  fileSystem
}) => {
  const [path, setPath] = useState(currentPath || '/home/hedrum/documents/');
  const [filename, setFilename] = useState('untitled.txt');
  const [directories, setDirectories] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Focus input and reset position when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
      
      // Reset position when opened
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);
  
  // Load directories when path changes
  useEffect(() => {
    if (!fileSystem || !isOpen) return;
    
    const loadDirectories = () => {
      try {
        const parentPath = getParentPath(path);
        
        // Check if parent path exists
        if (!fileSystem.exists(parentPath)) {
          return [];
        }
        
        const dirContent = fileSystem.listDirectory(parentPath);
        if (!dirContent) return [];
        
        return dirContent
          .filter((item: { type: string }) => item && item.type === 'directory')
          .map((dir: { name: string }) => joinPath(parentPath, dir.name));
      } catch (error) {
        console.error("Error loading directory contents:", error);
        return [];
      }
    };
    
    setDirectories(loadDirectories());
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
  
  // Handle save button click
  const handleSaveClick = () => {
    const fullPath = joinPath(path, filename);
    onSave(fullPath);
  };
  
  // If dialog is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div 
      className="save-dialog-overlay always-on-top"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <div 
        className="save-dialog" 
        ref={dialogRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        <div 
          className="save-dialog-title"
          onMouseDown={startDrag}
        >
          Save File
        </div>
        <div className="save-dialog-content">
          <div className="save-dialog-field">
            <label>Path:</label>
            <input 
              className="save-dialog-input"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>
          <div className="save-dialog-field">
            <label>Filename:</label>
            <input 
              className="save-dialog-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              ref={inputRef}
            />
          </div>
          {directories.length > 0 && (
            <div className="save-dialog-field">
              <label>Directories:</label>
              <select 
                className="save-dialog-select"
                onChange={(e) => setPath(e.target.value)}
                value={path}
              >
                {directories.map((dir) => (
                  <option key={dir} value={dir}>
                    {dir}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="save-dialog-actions">
          <button 
            className="save-dialog-button"
            onClick={handleSaveClick}
          >
            Save
          </button>
          <button 
            className="save-dialog-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
