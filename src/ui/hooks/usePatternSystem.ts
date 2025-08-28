/**
 * usePatternSystem.ts
 * A React hook for interacting with the PatternPuzzleSystem
 */

import { useState, useEffect } from 'react';
import patternSystemInstance, { type PatternDefinition, type PatternAction } from '../../engine/mystery/PatternPuzzleSystem';
import { type PatternId } from '../../engine/mystery/MysteryEngine';

/**
 * A hook for using the PatternPuzzleSystem in React components
 */
export const usePatternSystem = () => {
  const [patterns, setPatterns] = useState<PatternDefinition[]>([]);
  const [progress, setProgress] = useState<Map<PatternId, number>>(new Map());
  const [activePatterns, setActivePatterns] = useState<PatternId[]>([]);

  useEffect(() => {
    // Get initial state from PatternPuzzleSystem
    setPatterns(patternSystemInstance.getAllPatterns());
    setProgress(patternSystemInstance.getAllPatternProgress());
    
    const active = patternSystemInstance.getAllPatterns()
      .filter((pattern: PatternDefinition) => patternSystemInstance.isPatternActive(pattern.id))
      .map((pattern: PatternDefinition) => pattern.id);
    setActivePatterns(active);
    
    // Handle pattern updates from event system with debouncing to prevent excessive renders
    let progressUpdateTimeout: number | null = null;
    
    const handlePatternUpdate = (event: CustomEvent<{ type: string, patternId: PatternId, data?: any }>) => {
      const { type, patternId, data } = event.detail;
      
      if (type === 'progress_updated') {
        // Debounce progress updates to avoid excessive renders
        if (progressUpdateTimeout) {
          window.clearTimeout(progressUpdateTimeout);
        }
        
        progressUpdateTimeout = window.setTimeout(() => {
          setProgress(patternSystemInstance.getAllPatternProgress());
          progressUpdateTimeout = null;
        }, 100);
      } else if (type === 'pattern_activated') {
        // Update active patterns immediately
        setActivePatterns(prev => {
          if (prev.includes(patternId)) {
            return prev; // Avoid duplicate entries
          }
          return [...prev, patternId];
        });
        
        // Also update patterns in case the activated pattern has additional data
        setPatterns(patternSystemInstance.getAllPatterns());
      }
    };
    
    // Register the callback for state changes - same handler for both methods
    const stateChangeHandler = (eventData: { type: string, patternId: PatternId, data?: any }) => {
      const { type, patternId, data } = eventData;
      
      if (type === 'progress_updated') {
        // Debounce progress updates to avoid excessive renders
        if (progressUpdateTimeout) {
          window.clearTimeout(progressUpdateTimeout);
        }
        
        progressUpdateTimeout = window.setTimeout(() => {
          setProgress(patternSystemInstance.getAllPatternProgress());
          progressUpdateTimeout = null;
        }, 100);
      } else if (type === 'pattern_activated') {
        // Update active patterns immediately
        setActivePatterns(prev => {
          if (prev.includes(patternId)) {
            return prev; // Avoid duplicate entries
          }
          return [...prev, patternId];
        });
        
        // Also update patterns in case the activated pattern has additional data
        setPatterns(patternSystemInstance.getAllPatterns());
      }
    };
    
    // Use the same handler for both event types
    patternSystemInstance.registerStateChangeCallback(stateChangeHandler);

    // Create a custom event listener for pattern updates
    window.addEventListener('patternUpdate', handlePatternUpdate as EventListener);

    return () => {
      // Clean up event listener
      window.removeEventListener('patternUpdate', handlePatternUpdate as EventListener);
      
      // Clear any pending timeouts
      if (progressUpdateTimeout) {
        window.clearTimeout(progressUpdateTimeout);
      }
    };
  }, []);

  /**
   * Record a user action that might be part of a pattern
   * @param action The action to record
   */
  const recordAction = (action: PatternAction) => {
    patternSystemInstance.recordAction(action);
    setProgress(patternSystemInstance.getAllPatternProgress());
  };

  /**
   * Get the progress for a specific pattern
   * @param patternId The pattern ID to get progress for
   */
  const getPatternProgress = (patternId: PatternId): number => {
    return progress.get(patternId) || 0;
  };

  /**
   * Check if a pattern is active
   * @param patternId The pattern ID to check
   */
  const isPatternActive = (patternId: PatternId): boolean => {
    return activePatterns.includes(patternId);
  };

  return {
    patterns,
    progress,
    activePatterns,
    recordAction,
    getPatternProgress,
    isPatternActive
  };
};

export default usePatternSystem;
