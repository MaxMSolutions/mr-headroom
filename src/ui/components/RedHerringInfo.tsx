/**
 * RedHerringInfo.tsx
 * Component for displaying information about red herrings
 */

import React from 'react';
import useRedHerringSystem from '../hooks/useRedHerringSystem';
import { RedHerring } from '../../engine/mystery/RedHerringSystem';
import './RedHerringInfo.css';

interface RedHerringInfoProps {
  showExposed?: boolean;  // Whether to show exposed red herrings
  showUnexposed?: boolean; // Whether to show unexposed red herrings
  clueId?: string;  // Optional specific clue to check
  compact?: boolean; // Compact display mode
}

/**
 * Component that displays information about red herrings
 */
const RedHerringInfo: React.FC<RedHerringInfoProps> = ({
  showExposed = true,
  showUnexposed = false,
  clueId,
  compact = false
}) => {
  const { 
    redHerrings, 
    exposedHerrings, 
    exposurePercentage,
    isRedHerring, 
    isExposed,
    exposeRedHerring
  } = useRedHerringSystem();
  
  // Filter herrings based on props
  const herringsToShow = React.useMemo(() => {
    if (clueId) {
      return isRedHerring(clueId) ? 
        redHerrings.filter(h => h.clueId === clueId) : 
        [];
    }
    
    let result: RedHerring[] = [];
    if (showExposed) result = [...result, ...exposedHerrings];
    if (showUnexposed) result = [...result, ...redHerrings.filter(h => !isExposed(h.clueId))];
    return result;
  }, [redHerrings, exposedHerrings, showExposed, showUnexposed, clueId, isRedHerring, isExposed]);
  
  if (herringsToShow.length === 0) {
    return null;
  }
  
  // Handle exposing a red herring
  const handleExposeClick = (id: string) => {
    exposeRedHerring(id);
  };
  
  return (
    <div className={`red-herring-info ${compact ? 'compact' : ''}`}>
      {!clueId && (
        <div className="red-herring-stats">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${exposurePercentage}%` }}
            />
          </div>
          <div className="stats-text">
            {exposedHerrings.length} of {redHerrings.length} red herrings exposed
          </div>
        </div>
      )}
      
      <div className="red-herring-list">
        {herringsToShow.map(herring => (
          <div 
            key={herring.id}
            className={`red-herring-item ${isExposed(herring.clueId) ? 'exposed' : ''}`}
          >
            <div className="red-herring-icon">
              {isExposed(herring.clueId) ? '✓' : '?'}
            </div>
            <div className="red-herring-content">
              <div className="red-herring-title">
                {/* Get title from clues using clueId */}
                {herring.clueId}
              </div>
              {!compact && (
                <>
                  <div className="red-herring-confidence">
                    Confidence: {herring.confidence}%
                  </div>
                  {herring.targetEndingPath && (
                    <div className="red-herring-target">
                      Target path: {herring.targetEndingPath}
                    </div>
                  )}
                </>
              )}
            </div>
            {!isExposed(herring.clueId) && (
              <button 
                className="expose-button"
                onClick={() => handleExposeClick(herring.clueId)}
              >
                Expose
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RedHerringInfo;
