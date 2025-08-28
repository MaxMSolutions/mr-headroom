/**
 * PatternVisualizer.tsx
 * A React component for visualizing pattern progress and active patterns
 */

import React from 'react';
import { type PatternDefinition } from '../../engine/mystery/PatternPuzzleSystem';
import { usePatternSystem } from '../hooks/usePatternSystem';
import './PatternVisualizer.css';

interface PatternVisualizerProps {
  // Optional filter to show only patterns of specific types
  typeFilter?: string[];
  // Optional filter to show only active patterns
  showOnlyActive?: boolean;
  // Optional compact mode for smaller UI
  compact?: boolean;
}

/**
 * A component that visualizes pattern progress and active patterns
 */
const PatternVisualizer: React.FC<PatternVisualizerProps> = ({
  typeFilter,
  showOnlyActive = false,
  compact = false
}) => {
  const { patterns, getPatternProgress, isPatternActive } = usePatternSystem();
  
  // Filter patterns based on props
  const filteredPatterns = patterns.filter(pattern => {
    if (showOnlyActive && !isPatternActive(pattern.id)) {
      return false;
    }
    
    if (typeFilter && !typeFilter.includes(pattern.type)) {
      return false;
    }
    
    return true;
  });
  
  if (filteredPatterns.length === 0) {
    return <div className="pattern-visualizer pattern-visualizer-empty">
      <p className="pattern-visualizer-message">No patterns to display</p>
    </div>;
  }
  
  return (
    <div className={`pattern-visualizer ${compact ? 'pattern-visualizer-compact' : ''}`}>
      <h4 className="pattern-visualizer-title">Pattern Recognition</h4>
      <div className="pattern-visualizer-list">
        {filteredPatterns.map(pattern => (
          <PatternItem
            key={pattern.id}
            pattern={pattern}
            progress={getPatternProgress(pattern.id)}
            isActive={isPatternActive(pattern.id)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

interface PatternItemProps {
  pattern: PatternDefinition;
  progress: number;
  isActive: boolean;
  compact: boolean;
}

/**
 * A component that visualizes a single pattern's progress
 */
const PatternItem: React.FC<PatternItemProps> = ({ pattern, progress, isActive, compact }) => {
  // Convert progress to percentage
  const progressPercent = Math.round(progress * 100);
  
  // Determine classes based on progress and active state
  const itemClasses = [
    'pattern-visualizer-item',
    isActive ? 'pattern-active' : '',
    progress > 0 ? 'pattern-in-progress' : '',
    compact ? 'pattern-compact' : ''
  ].filter(Boolean).join(' ');
  
  // Get visualization color from pattern definition or use default
  const color = pattern.visualRepresentation?.color || '#888888';
  
  // Get the animation class if needed
  const animationClass = isActive && pattern.visualRepresentation?.animation
    ? `animation-${pattern.visualRepresentation.animation}`
    : '';
  
  return (
    <div className={itemClasses}>
      {!compact && (
        <div className={`pattern-icon ${animationClass}`} style={{ color }}>
          {pattern.visualRepresentation?.icon || '◆'}
        </div>
      )}
      
      <div className="pattern-info">
        {!compact && <div className="pattern-name">{pattern.name}</div>}
        
        <div className="pattern-progress-bar">
          <div 
            className="pattern-progress-fill" 
            style={{ 
              width: `${progressPercent}%`,
              backgroundColor: color 
            }}
          />
        </div>
        
        {!compact && (
          <div className="pattern-detail">
            {isActive ? 'ACTIVE' : `${progressPercent}% complete`}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternVisualizer;
