import React, { useEffect, useRef } from 'react';
import '../ContextMenu.css'; // Reusing same CSS file for consistency

interface PropertiesDialogProps {
  file: {
    name: string;
    type: string;
    path: string;
    size?: string;
    created?: string;
    modified?: string;
    attributes?: string[];
  };
  onClose: () => void;
}

const PropertiesDialog: React.FC<PropertiesDialogProps> = ({ file, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Add keyboard support for ESC key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus the dialog when it opens for better accessibility
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.focus();
    }
  }, []);

  // Format the file type for better display
  const getFileTypeDisplay = () => {
    let displayType = file.type.charAt(0).toUpperCase() + file.type.slice(1);
    
    // Add specific descriptions for common types
    if (file.type === 'folder') return 'Folder';
    if (file.type === 'executable') return 'Application';
    if (file.type === 'terminal') return 'System Application';
    if (file.type === 'corrupted') return 'Unknown File Type (Corrupted)';
    if (file.type === 'glitched') return 'Glitched File';
    if (file.type === 'notes') return 'Text Document';
    if (file.type === 'locked') return 'Protected System File';
    if (file.type === 'game') return 'Game Application';
    
    return displayType;
  };

  return (
    <div 
      className="properties-dialog"
      ref={dialogRef}
      tabIndex={-1} // Make focusable for accessibility
    >
      <div className="properties-header">
        <div className="properties-title">Properties - {file.name}</div>
        <button className="properties-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      
      <div className="properties-content">
        {/* File icon preview */}
        <div className="properties-icon">
          <div className={`icon-preview ${file.type}-icon`}>
            {file.type === 'system' && <div className="system-cube">⌬</div>}
            {file.type === 'game' && <img src="/doom-icon.png" alt="DOOM" className="game-icon-image" />}
          </div>
        </div>
        
        <div className="properties-row">
          <div className="properties-label">Name:</div>
          <div className="properties-value">{file.name}</div>
        </div>
        
        <div className="properties-row">
          <div className="properties-label">Type:</div>
          <div className="properties-value">{getFileTypeDisplay()}</div>
        </div>
        
        <div className="properties-row">
          <div className="properties-label">Location:</div>
          <div className="properties-value">{file.path}</div>
        </div>
        
        {file.size && (
          <div className="properties-row">
            <div className="properties-label">Size:</div>
            <div className="properties-value">{file.size}</div>
          </div>
        )}
        
        {file.created && (
          <div className="properties-row">
            <div className="properties-label">Created:</div>
            <div className="properties-value">{file.created}</div>
          </div>
        )}
        
        {file.modified && (
          <div className="properties-row">
            <div className="properties-label">Modified:</div>
            <div className="properties-value">{file.modified}</div>
          </div>
        )}
        
        {file.attributes && file.attributes.length > 0 && (
          <div className="properties-row">
            <div className="properties-label">Attributes:</div>
            <div className="properties-value">{file.attributes.join(', ')}</div>
          </div>
        )}
      </div>
      
      <div className="properties-actions">
        <button className="properties-button" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default PropertiesDialog;
