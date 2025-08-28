import React from 'react';
import { Window } from '../../../engine/windowManager/WindowManager';
import './TaskbarWindows.css';

interface TaskbarWindowsProps {
  windows: Window[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
}

const TaskbarWindows: React.FC<TaskbarWindowsProps> = ({ 
  windows, 
  activeWindowId, 
  onWindowClick 
}) => {
  return (
    <>
      {windows.map(window => (
        <div 
          key={window.id}
          className={`taskbar-app-button ${window.id === activeWindowId ? 'active' : ''} ${window.isMinimized ? 'minimized' : ''}`}
          onClick={() => onWindowClick(window.id)}
        >
          <div className="app-icon">
            {/* Use window icon, component name first letter, or default icon */}
            {window.icon || (window.component ? window.component.charAt(0).toUpperCase() : '⊞')}
          </div>
          <span className="app-title">{window.title}</span>
        </div>
      ))}
    </>
  );
};

export default TaskbarWindows;
