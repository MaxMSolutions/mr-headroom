import React from 'react';
import { SystemStatus } from '../types';
import './StatusDisplay.css';

interface StatusDisplayProps {
  status: SystemStatus;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  const { coherence, memoryUsage, activeProcesses, breachAttempts } = status;
  
  // Determine status colors based on values
  const getCoherenceColor = () => {
    if (coherence > 90) return '#00ff00';
    if (coherence > 75) return '#ffff00';
    return '#ff0000';
  };
  
  const getMemoryColor = () => {
    if (memoryUsage < 60) return '#00ff00';
    if (memoryUsage < 80) return '#ffff00';
    return '#ff0000';
  };
  
  return (
    <div className="status-display">
      <div className="status-header">
        <div className="status-title">SYSTEM STATUS</div>
        <div className="status-time">{new Date().toLocaleTimeString()}</div>
      </div>
      
      <div className="status-section">
        <div className="status-label">Reality Coherence</div>
        <div className="status-bar-container">
          <div 
            className="status-bar" 
            style={{ 
              width: `${coherence}%`, 
              backgroundColor: getCoherenceColor() 
            }}
          />
        </div>
        <div className="status-value">{coherence.toFixed(1)}%</div>
      </div>
      
      <div className="status-section">
        <div className="status-label">Memory Usage</div>
        <div className="status-bar-container">
          <div 
            className="status-bar" 
            style={{ 
              width: `${memoryUsage}%`, 
              backgroundColor: getMemoryColor() 
            }}
          />
        </div>
        <div className="status-value">{memoryUsage.toFixed(1)}%</div>
      </div>
      
      <div className="status-grid">
        <div className="status-grid-item">
          <div className="status-grid-label">Active Processes</div>
          <div className="status-grid-value">{activeProcesses}</div>
        </div>
        
        <div className="status-grid-item">
          <div className="status-grid-label">Breach Attempts</div>
          <div className="status-grid-value">{breachAttempts}</div>
        </div>
      </div>
      
      <div className="status-footer">
        <div className={`status-indicator ${coherence > 85 ? 'status-ok' : 'status-warning'}`}>
          {coherence > 85 ? 'SYSTEM NOMINAL' : 'SYSTEM DEGRADED'}
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
