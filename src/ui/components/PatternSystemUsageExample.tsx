/**
 * PatternSystemUsageExample.tsx
 * Example of how to use the PatternPuzzleSystem in a React component
 */

import React, { useState } from 'react';
import usePatternSystem from '../hooks/usePatternSystem';
import PatternProgress from './PatternProgress';
import PatternVisualizer from './PatternVisualizer';
import PatternNotification from './PatternNotification';
import PatternSystemIntegration, { 
  useTerminalPatternIntegration,
  useFilePatternIntegration,
  useGamePatternIntegration
} from './PatternSystemIntegration';

/**
 * Example component showing how to use the PatternPuzzleSystem
 */
const PatternSystemUsageExample: React.FC = () => {
  const { patterns, activePatterns } = usePatternSystem();
  const { recordCommand } = useTerminalPatternIntegration();
  const { recordFileAccess } = useFilePatternIntegration();
  const { recordGameEvent } = useGamePatternIntegration('starfield');
  const [command, setCommand] = useState('');
  
  const handleCommandSubmit = () => {
    if (command) {
      // Record the command in the pattern system
      recordCommand(command);
      setCommand('');
    }
  };
  
  const handleFileClick = (filePath: string) => {
    // Record file access in the pattern system
    recordFileAccess(filePath, 'open');
  };
  
  const handleStarfieldAction = () => {
    // Record a game event in the pattern system
    recordGameEvent('navigate', { x: 120, y: 150 });
  };
  
  return (
    <div className="pattern-system-example">
      {/* Notifications appear when patterns are activated */}
      <PatternNotification timeout={5000} />
      
      <h2>PatternPuzzleSystem Integration Example</h2>
      
      <div className="section">
        <h3>Terminal Command Input</h3>
        <div className="terminal-input">
          <input 
            type="text" 
            value={command} 
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter terminal command"
          />
          <button onClick={handleCommandSubmit}>Execute</button>
        </div>
      </div>
      
      <div className="section">
        <h3>File System Integration</h3>
        <div className="file-list">
          <div className="file" onClick={() => handleFileClick('/var/log/system.log')}>
            system.log
          </div>
          <div className="file" onClick={() => handleFileClick('/etc/apps/starfield/config.json')}>
            starfield/config.json
          </div>
          <div className="file" onClick={() => handleFileClick('/home/user/documents/notes.txt')}>
            notes.txt
          </div>
        </div>
      </div>
      
      <div className="section">
        <h3>Game Integration</h3>
        <button onClick={handleStarfieldAction}>Navigate to Star Coordinates</button>
      </div>
      
      {/* Visualize active patterns */}
      <div className="section">
        <h3>Active Patterns ({activePatterns.length})</h3>
        <PatternProgress showActive={true} />
      </div>
      
      {/* Visualize patterns with progress */}
      <div className="section">
        <h3>Pattern Progress</h3>
        <PatternProgress showProgress={true} />
      </div>
      
      {/* Detailed pattern visualization */}
      <div className="section">
        <h3>Pattern Details</h3>
        <PatternVisualizer />
      </div>
    </div>
  );
};

export default PatternSystemUsageExample;
