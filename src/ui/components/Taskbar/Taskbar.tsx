import React from 'react';
import StartButton from './StartButton';
import Clock from './Clock';
import TaskbarWindows from './TaskbarWindows';
import { Window } from '../../../engine/windowManager/WindowManager';
import './Taskbar.css';
import './TaskbarEffects.css';

interface TaskbarProps {
  showStartMenu: boolean;
  toggleStartMenu: () => void;
  isGlitchingTime: boolean;
  startButtonRef: React.RefObject<HTMLDivElement>;
  windows?: Window[];
  activeWindowId?: string | null;
  onWindowClick?: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
  showStartMenu, 
  toggleStartMenu, 
  isGlitchingTime,
  startButtonRef,
  windows = [],
  activeWindowId = null,
  onWindowClick = () => {}
}) => {
  return (
    <div className="taskbar">
      <div className="taskbar-neon-pulse"></div>
      <div ref={startButtonRef}>
        <StartButton 
          isActive={showStartMenu} 
          onClick={toggleStartMenu} 
        />
      </div>
      <div className="taskbar-items">
        {/* Display running applications */}
        <TaskbarWindows 
          windows={windows}
          activeWindowId={activeWindowId}
          onWindowClick={onWindowClick}
        />
        
        {/* System monitor moved to right side */}
      </div>
      <div className="taskbar-right">
        <div className="cyberpunk-data-monitor small">
          <div className="data-monitor-text">
            {windows.length > 0 ? "SYS.ACTIVE" : "SYS.READY"}
          </div>
          <div className="data-monitor-indicator"></div>
        </div>
        <Clock isGlitching={isGlitchingTime} />
      </div>
    </div>
  );
};

export default Taskbar;
