import React, { useState, useEffect } from 'react';
import Terminal from '../../engine/terminal';
import './TerminalWindow.css';
import FileSystem from '../../engine/fileSystem';

interface TerminalWindowProps {
  id: string;
  title?: string;
  initialCommands?: string[];
  fileSystem?: FileSystem;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  id,
  title = 'TERMINAL',
  initialCommands = [],
  fileSystem,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false
}) => {
  const [glitchEffect, setGlitchEffect] = useState(false);
  
  // Occasionally trigger glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.95;
      if (shouldGlitch) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 200);
      }
    }, 8000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className={`terminal-window ${glitchEffect ? 'glitch-effect' : ''}`}>
      <Terminal
        initialCommands={initialCommands}
        welcomeMessage=""
        prompt=">> "
        fileSystem={fileSystem}
      />
    </div>
  );
};

export default TerminalWindow;
