/**
 * PatternSystemIntegration.tsx
 * React component that wraps applications and integrates them with the pattern system
 */

import React, { useCallback } from 'react';
import { recordAppClick, recordAppAction, recordTerminalCommand } from '../../engine/mystery/patternRecognition';

interface PatternSystemIntegrationProps {
  children: React.ReactNode;
  appId: string;
}

/**
 * Wrapper component that integrates applications with the PatternPuzzleSystem
 */
const PatternSystemIntegration: React.FC<PatternSystemIntegrationProps> = ({ children, appId }) => {
  // Handle click events within the application
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Record the click in the pattern system
    recordAppClick(appId, x, y);
    
    // Don't interfere with normal event handling
  }, [appId]);
  
  // Return the children wrapped in a div that captures events
  return (
    <div className="pattern-system-integration" onClick={handleClick}>
      {children}
    </div>
  );
};

/**
 * Hook to integrate terminal commands with the pattern system
 */
export const useTerminalPatternIntegration = () => {
  // Callback to record terminal commands
  const recordCommand = useCallback((command: string) => {
    recordTerminalCommand(command);
  }, []);
  
  return { recordCommand };
};

/**
 * Hook to integrate file system actions with the pattern system
 */
export const useFilePatternIntegration = () => {
  // Callback to record file access
  const recordFileAccess = useCallback((filePath: string, action: string) => {
    recordAppAction('fileManager', 'access', { filePath, action });
  }, []);
  
  return { recordFileAccess };
};

/**
 * Hook to integrate game actions with the pattern system
 */
export const useGamePatternIntegration = (gameId: string) => {
  // Callback to record game events
  const recordGameEvent = useCallback((eventType: string, data: any) => {
    recordAppAction(gameId, eventType, data);
  }, [gameId]);
  
  return { recordGameEvent };
};

export default PatternSystemIntegration;
