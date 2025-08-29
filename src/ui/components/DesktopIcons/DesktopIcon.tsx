import React, { useState, useEffect, useRef } from 'react';
import './DesktopIcon.css';
import './text-editor-icon.css'; // Import text editor icon styles

interface DesktopIconProps {
  iconType: 'folder' | 'terminal' | 'executable' | 'texteditor' | 'notes' | 'corrupted' | 'glitched' | 'system' | 'locked' | 'game' | string;
  label: string;
  isHidden?: boolean;
  isGlitched?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  position?: { x: number, y: number };
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onDrag?: (e: React.MouseEvent) => void;
  onDragEnd?: (e: React.MouseEvent) => void;
  iconImage?: string;
  filePath?: string; // Path to the executable file
  gridPosition?: { row: number, col: number };
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  iconType, 
  label, 
  isHidden = false,
  isGlitched = false,
  isSelected = false,
  isDragging = false,
  position,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDrag,
  onDragEnd,
  gridPosition
}) => {
  const [randomGlitch, setRandomGlitch] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastClickTime = useRef<number>(0);
  
  // For randomly triggering glitch effects on icons
  useEffect(() => {
    if (isGlitched) {
      const glitchInterval = setInterval(() => {
        // 2% chance of glitching
        if (Math.random() < 0.02) {
          setRandomGlitch(true);
          setTimeout(() => setRandomGlitch(false), 300 + Math.random() * 500);
        }
      }, 3000);
      
      return () => clearInterval(glitchInterval);
    }
  }, [isGlitched]);

  // Simple click handler that detects double clicks
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If we're dragging, ignore clicks
    if (isDraggingRef.current) {
      return;
    }
    
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    
    // Check if this is a double click (within 400ms)
    if (timeSinceLastClick < 400) {
      // This is a double click
      console.log(`Double click on ${label}`);
      onDoubleClick && onDoubleClick();
      lastClickTime.current = 0; // Reset to prevent triple-click being detected as another double-click
    } else {
      // This is a single click
      console.log(`Single click on ${label}`);
      // Delay single click slightly to allow for double-click detection
      setTimeout(() => {
        if (lastClickTime.current === now) { // If this is still the last click
          onClick && onClick();
        }
      }, 400);
      lastClickTime.current = now;
    }
  };
  
  // Handle right-click (context menu)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Context menu on ${label}`);
    onContextMenu && onContextMenu(e);
  };
  
  // Use HTML5 native drag and drop for better compatibility
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    // Set the drag image (optional, you can use this to customize the drag visual)
    if (iconRef.current) {
      try {
        // Create ghost drag image
        const rect = iconRef.current.getBoundingClientRect();
        const ghostElement = iconRef.current.cloneNode(true) as HTMLElement;
        
        // Make sure it's visible but not affecting layout
        ghostElement.style.position = 'absolute';
        ghostElement.style.top = '-9999px';
        ghostElement.style.opacity = '0.8';
        
        // Add to DOM temporarily
        document.body.appendChild(ghostElement);
        
        // Set as drag image
        e.dataTransfer.setDragImage(ghostElement, e.clientX - rect.left, e.clientY - rect.top);
        
        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(ghostElement);
        }, 0);
      } catch (err) {
        // Fallback if custom drag image fails
        console.error("Drag image error:", err);
      }
    }
    
    // Store data in the drag event
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', label); // Store the label
    
    // Notify the parent component
    if (onDragStart) {
      onDragStart(e);
    }
    
    // Visual indication of dragging
    isDraggingRef.current = true;
    
    // Add a class to the body to prevent text selection during drag
    document.body.classList.add('dragging-in-progress');
  };
  
  // Drag functionality is now handled via the HTML5 drag and drop API
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    // Clean up
    isDraggingRef.current = false;
    document.body.classList.remove('dragging-in-progress');
    
    // Notify the parent component
    if (onDragEnd) {
      onDragEnd(e);
    }
    
    // Reset last click time to prevent double click
    lastClickTime.current = 0;
  };
  
  // We don't need mouse handlers for drag anymore since we're using HTML5 drag and drop API
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      lastClickTime.current = 0;
    };
  }, []);

  // Apply grid positioning if available
  const style: React.CSSProperties = {};
  if (gridPosition) {
    style.gridColumn = gridPosition.col;
    style.gridRow = gridPosition.row;
  }
  if (position) {
    style.position = 'absolute';
    style.left = `${position.x}px`;
    style.top = `${position.y}px`;
    style.zIndex = 1000; // Ensure dragged item is on top
  }

  return (
    <div 
      ref={iconRef}
      className={`desktop-icon 
        ${isHidden ? 'hidden-icon' : ''} 
        ${randomGlitch ? 'random-glitch' : ''} 
        ${isSelected ? 'selected' : ''}
        ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={style}
      tabIndex={0}
      data-icon-id={label.replace(/\s+/g, '-').toLowerCase()}
      // HTML5 Drag and Drop attributes
      draggable={true}
      onDragStart={handleDragStart}
      onDrag={(e) => onDrag && onDrag(e)}
      onDragEnd={handleDragEnd}
    >
      <div className={`icon-image ${iconType}-icon`}>
        {iconType === 'system' && <div className="system-cube">⌬</div>}
        {iconType === 'folder' && (
          <div className="folder-icon">
            <div className="window-controls">
              <div className="window-button"></div>
              <div className="window-button"></div>
              <div className="window-button"></div>
            </div>
            <div className="nav-bar">
              <div className="path-indicator"></div>
            </div>
            <div className="sidebar">
              <div className="sidebar-item"></div>
              <div className="sidebar-item"></div>
              <div className="sidebar-item"></div>
            </div>
            <div className="content-area">
              <div className="file-item"></div>
              <div className="file-item"></div>
              <div className="file-item"></div>
              <div className="file-icon"></div>
              <div className="file-icon"></div>
              <div className="file-icon"></div>
            </div>
            <div className="status-bar"></div>
          </div>
        )}
        {iconType === 'texteditor' && (
          <div className="texteditor-icon">
            <div className="text-line"></div>
            <div className="text-line"></div>
            <div className="text-line"></div>
            <div className="text-cursor"></div>
          </div>
        )}
        {iconType === 'terminal' && (
          <div className="terminal-icon">
            <div className="prompt">{'>'}</div>
            <div className="command-line"></div>
            <div className="cursor"></div>
            <div className="output-line"></div>
            <div className="output-line"></div>
          </div>
        )}
        {iconType === 'settings' && (
          <div className="settings-icon">
            <div className="slider slider-1"></div>
            <div className="slider slider-2"></div>
            <div className="slider slider-3"></div>
            <div className="slider-knob slider-knob-1"></div>
            <div className="slider-knob slider-knob-2"></div>
            <div className="slider-knob slider-knob-3"></div>
            <div className="label">SET</div>
          </div>
        )}
        {iconType === 'calculator' && (
          <div className="calculator-icon">
            <div className="display"></div>
            <div className="digits">123</div>
            <div className="button-grid">
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
              <div className="button"></div>
            </div>
          </div>
        )}
        {iconType === 'doom' && <img src="/msdos/icons/doom-icon.png" alt="DOOM" className="doom-icon-image" draggable="false" />}
        {iconType === 'wolf3d' && <img src="/msdos/icons/wolf3d.png" alt="Wolfenstein 3D" className="wolf3d-icon-image" draggable="false" />}
        {iconType === 'keen' && <img src="/msdos/icons/keen4.png" alt="Commander Keen" className="keen-icon-image" draggable="false" />}
        {iconType === 'oregontrail' && <img src="/msdos/icons/oregontrail.png" alt="Oregon Trail" className="oregontrail-icon-image" draggable="false" />}
        {iconType === 'paint' && <img src="/msdos/icons/paint.png" alt="MS Paint" className="paint-icon-image" draggable="false" />}
        {iconType === 'win95' && <img src="/msdos/icons/win95.png" alt="Windows 95" className="win95-icon-image" draggable="false" />}
      </div>
      <div className="icon-text">{label}</div>
    </div>
  );
};

export default DesktopIcon;
