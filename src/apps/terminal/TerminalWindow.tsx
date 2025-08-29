import React, { useState, useEffect, useRef } from 'react';
import Terminal from '../../engine/terminal';
import './TerminalWindow.css';
import './terminal-animations.css';
import FileSystem from '../../engine/fileSystem';

interface TerminalWindowProps {
  id?: string;
  initialCommands?: string[];
  fileSystem?: FileSystem;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({
  initialCommands = [],
  fileSystem
}) => {
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Simulate connection status changes
  useEffect(() => {
    // Start with connecting status
    setConnectionStatus('connecting');
    
    // After a delay, set to connected
    const connectionTimeout = setTimeout(() => {
      setConnectionStatus('connected');
    }, 1200);
    
    // Occasionally simulate connection issues
    const connectionInterval = setInterval(() => {
      const shouldDisconnect = Math.random() > 0.97;
      if (shouldDisconnect) {
        setConnectionStatus('disconnected');
        setTimeout(() => {
          setConnectionStatus('connecting');
          setTimeout(() => {
            setConnectionStatus('connected');
          }, 800);
        }, 500);
      }
    }, 30000);
    
    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(connectionInterval);
    };
  }, []);
  
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

  // Occasionally show matrix rain effect
  useEffect(() => {
    const matrixInterval = setInterval(() => {
      // Small chance of showing matrix effect
      const shouldShowMatrix = Math.random() > 0.98;
      if (shouldShowMatrix) {
        setShowMatrixRain(true);
        setTimeout(() => setShowMatrixRain(false), 5000);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(matrixInterval);
  }, []);

  // Generate matrix rain characters
  const createMatrixRain = () => {
    if (!showMatrixRain) return null;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const raindrops = [];
    
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 5 + 3}s`,
        animationDelay: `${Math.random() * 2}s`,
      };
      
      const char = chars[Math.floor(Math.random() * chars.length)];
      raindrops.push(<span key={i} style={style}>{char}</span>);
    }
    
    return <div className="matrix-rain">{raindrops}</div>;
  };
  
  // Focus terminal when clicked
  useEffect(() => {
    const handleClick = () => {
      // Focus the terminal input if available
      const input = terminalRef.current?.querySelector('input');
      if (input) {
        input.focus();
      }
    };
    
    terminalRef.current?.addEventListener('click', handleClick);
    return () => terminalRef.current?.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className={`terminal-window ${glitchEffect ? 'glitch-effect' : ''}`} ref={terminalRef}>
      <div className="terminal-content">
        <Terminal
          initialCommands={initialCommands}
          welcomeMessage="NEXUS-9 Terminal [Version 1.98.0710]\nCopyright (c) 1998 Axiom Technologies. All rights reserved."
          prompt="$ "
          fileSystem={fileSystem}
        />
        {createMatrixRain()}
      </div>
      <div className="terminal-status-bar">
        <span className="terminal-status-item">SYS:OK</span>
        <span className="terminal-status-item">MEM:64K</span>
        <span className="terminal-status-item">ACCESS:ROOT</span>
        <span className="terminal-status-item blink">REC</span>
        <span className="terminal-status-item">
          <span className={`terminal-indicator ${connectionStatus === 'connected' ? 'connected' : connectionStatus === 'connecting' ? 'connecting' : 'disconnected'}`} 
            title={`Terminal ${connectionStatus}`}
          />
        </span>
      </div>
    </div>
  );
};

export default TerminalWindow;
