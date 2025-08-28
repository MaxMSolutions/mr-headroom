import React from 'react';
import usePatternSystem from '../hooks/usePatternSystem';
import { PatternId } from '../../engine/mystery/MysteryEngine';
import { PatternDefinition } from '../../engine/mystery/PatternPuzzleSystem';

import './PatternProgress.css';

interface PatternProgressProps {
  patternId?: PatternId;  // Optional: show a specific pattern
  showAll?: boolean;      // Show all patterns
  showActive?: boolean;   // Only show active patterns
  showProgress?: boolean; // Show progress indicators
}

/**
 * Component to visualize pattern discovery progress
 */
const PatternProgress: React.FC<PatternProgressProps> = ({
  patternId,
  showAll = false,
  showActive = false,
  showProgress = true
}) => {
  const { patterns, progress, activePatterns, getPatternProgress, isPatternActive } = usePatternSystem();
  
  // Determine which patterns to show
  const patternsToShow = React.useMemo(() => {
    if (patternId) {
      // Show a specific pattern
      const pattern = patterns.find(p => p.id === patternId);
      return pattern ? [pattern] : [];
    } else if (showActive) {
      // Show only active patterns
      return patterns.filter(p => isPatternActive(p.id));
    } else if (showAll) {
      // Show all patterns
      return patterns;
    } else {
      // Show patterns with progress > 0
      return patterns.filter(p => getPatternProgress(p.id) > 0);
    }
  }, [patterns, patternId, showAll, showActive, isPatternActive, getPatternProgress]);
  
  if (patternsToShow.length === 0) {
    return null;
  }
  
  const renderPatternIndicator = (pattern: PatternDefinition) => {
    const isActive = isPatternActive(pattern.id);
    const currentProgress = getPatternProgress(pattern.id);
    const thresholdsPassed = pattern.progressThresholds?.filter(t => currentProgress >= t) || [];
    const visualRep = pattern.visualRepresentation;
    
    return (
      <div 
        key={pattern.id} 
        className={`pattern-indicator ${isActive ? 'active' : ''}`}
        style={{
          borderColor: visualRep?.color || '#888',
          backgroundColor: isActive ? (visualRep?.color || '#888') + '22' : 'transparent'
        }}
      >
        <div className="pattern-icon">
          {visualRep?.icon && <span className={`icon icon-${visualRep.icon}`} />}
        </div>
        
        <div className="pattern-info">
          <div className="pattern-name">{pattern.name}</div>
          {showProgress && (
            <div className="pattern-progress-bar">
              <div 
                className="pattern-progress-fill" 
                style={{
                  width: `${currentProgress * 100}%`,
                  backgroundColor: visualRep?.color || '#888'
                }}
              />
            </div>
          )}
          {isActive && <div className="pattern-completed">Discovered</div>}
        </div>
        
        {pattern.visualRepresentation?.animation && (
          <div className={`pattern-animation ${pattern.visualRepresentation.animation}`} />
        )}
      </div>
    );
  };
  
  return (
    <div className="pattern-progress-container">
      {patternsToShow.map(renderPatternIndicator)}
    </div>
  );
};

export default PatternProgress;
