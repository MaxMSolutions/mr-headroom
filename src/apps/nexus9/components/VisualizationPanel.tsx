import React, { useState, useEffect } from 'react';
import './VisualizationPanel.css';

interface VisualizationPanelProps {
  coherenceLevel: number;
  accessLevel: string;
  glitchFrequency?: number;
}

// Simplified visualization component that uses CSS animations instead of canvas
const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  coherenceLevel,
  accessLevel,
  glitchFrequency = 0.5
}) => {
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
  }>>([]);

  // Generate particles only once on mount
  useEffect(() => {
    try {
      const particleCount = 30; // Reduced for performance
      const newParticles = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // Use percentages for positioning
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          color: `rgba(${accessLevel === 'ADMIN' ? '255, 0, 255' : '0, 255, 255'}, ${Math.random() * 0.5 + 0.5})`
        });
      }
      
      setParticles(newParticles);
    } catch (error) {
      console.error('Error generating particles:', error);
    }
  }, [accessLevel]);
  
  // Update status message based on coherence level
  useEffect(() => {
    try {
      if (coherenceLevel > 90) {
        setStatusMessage('System stable');
      } else if (coherenceLevel > 70) {
        setStatusMessage('Minor fluctuations detected');
      } else if (coherenceLevel > 50) {
        setStatusMessage('WARNING: Reality coherence degrading');
      } else {
        setStatusMessage('CRITICAL: Reality matrix unstable');
      }
    } catch (error) {
      console.error('Error updating status message:', error);
      setStatusMessage('Status unavailable');
    }
  }, [coherenceLevel]);
  
  // Simulate occasional glitches
  useEffect(() => {
    try {
      const glitchInterval = setInterval(() => {
        // Only show glitches based on coherence level and access level
        const shouldGlitch = 
          (accessLevel !== 'DEFAULT') && 
          (Math.random() < ((100 - coherenceLevel) / 100) * glitchFrequency);
        
        if (shouldGlitch) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 200 + Math.random() * 300);
        }
      }, 2000);
      
      return () => clearInterval(glitchInterval);
    } catch (error) {
      console.error('Error in glitch effect:', error);
      return () => {}; // Return empty cleanup function on error
    }
  }, [coherenceLevel, accessLevel, glitchFrequency]);

  const getStatusClass = () => {
    if (coherenceLevel > 80) return 'status-good';
    if (coherenceLevel > 50) return 'status-warning';
    return 'status-critical';
  };

  return (
    <div className={`visualization-panel ${glitchActive ? 'glitch-active' : ''}`}>
      <div className="visualization-header">
        <span>REALITY MATRIX VISUALIZATION</span>
        <span className={`visualization-status ${getStatusClass()}`}>
          {statusMessage}
        </span>
      </div>
      <div className="visualization-content">
        <div className="matrix-grid">
          {particles.map(particle => (
            <div 
              key={particle.id}
              className="matrix-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color
              }}
            />
          ))}
        </div>
        
        <div className="matrix-info">
          <div className="matrix-info-item">
            <span className="matrix-label">COHERENCE:</span>
            <span className={`matrix-value ${getStatusClass()}`}>
              {coherenceLevel.toFixed(1)}%
            </span>
          </div>
          <div className="matrix-info-item">
            <span className="matrix-label">ACCESS LEVEL:</span>
            <span className="matrix-value">{accessLevel}</span>
          </div>
          
          {accessLevel === 'ADMIN' && (
            <div className="matrix-admin-message">
              REALITY BREACH DETECTION ACTIVE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;
