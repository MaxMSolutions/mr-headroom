/**
 * PatternPuzzleSystem.ts
 * A system for recognizing, tracking, and visualizing patterns throughout the RetroOS experience.
 * This integrates with the MysteryEngine to activate patterns when discovered.
 */

import { MysteryEngine, PatternId } from './MysteryEngine';
import { GameEvent } from '../games/GameBase';
import { addGameLog } from '../save/SaveManager';

// Define pattern types for different recognition contexts
type PatternType = 
  | 'sequence' // Ordered sequence of actions/inputs
  | 'combination' // Unordered set of actions/inputs
  | 'spatial' // Pattern in spatial arrangement
  | 'temporal' // Time-based pattern
  | 'metadata' // File metadata patterns
  | 'meta'; // Pattern across different system components

// Event object for pattern system events
interface PatternEvent {
  type: string;
  patternId: PatternId;
  data?: any;
  timestamp: number;
}

interface PatternDefinition {
  id: PatternId;
  type: PatternType;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // The actual pattern data - structure depends on pattern type
  patternData: any;
  
  // Recognition configuration
  recognitionConfig: {
    requiredMatches: number; // How many elements need to match
    tolerance: number; // How exact the match needs to be (0-1)
    timeLimit?: number; // For temporal patterns, time limit in ms
  };
  
  // What happens when the pattern is activated
  onActivation?: {
    clueId?: string; // Clue to reveal when activated
    triggerEvent?: string; // Event to trigger
    visualEffect?: string; // Visual effect to show
  };
  
  // Visual representation for UI
  visualRepresentation?: {
    icon: string;
    color: string;
    animation?: string;
  };
  
  // For tracking partial progress
  progressThresholds?: number[];
}

// For tracking user actions that might match patterns
interface PatternAction {
  type: string;
  value: any;
  timestamp: number;
  context?: string;
}

/**
 * The PatternPuzzleSystem tracks user actions and recognizes patterns across the RetroOS experience.
 * 
 * Key features:
 * - Tracks partial progress toward pattern discovery
 * - Provides visual feedback when patterns are discovered
 * - Supports multiple pattern types: sequence, combination, spatial, temporal, metadata, meta
 * - Integrates with MysteryEngine to unlock clues when patterns are completed
 * - Provides hooks and components for UI integration
 * 
 * Usage examples:
 * 
 * 1. Recording a terminal command:
 *    ```typescript
 *    import patternSystem from './PatternPuzzleSystem';
 *    
 *    patternSystem.recordAction({
 *      type: 'terminal_command',
 *      value: 'ls -la',
 *      timestamp: Date.now()
 *    });
 *    ```
 * 
 * 2. Checking pattern progress:
 *    ```typescript
 *    const progress = patternSystem.getPatternProgress('terminal_command_sequence');
 *    console.log(`Progress: ${progress * 100}%`);
 *    ```
 * 
 * 3. React integration:
 *    ```tsx
 *    import { usePatternSystem } from '../hooks/usePatternSystem';
 *    
 *    function PatternIndicator({ patternId }) {
 *      const { getPatternProgress, isPatternActive } = usePatternSystem();
 *      const progress = getPatternProgress(patternId);
 *      const active = isPatternActive(patternId);
 *      
 *      return (
 *        <div>
 *          <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
 *          {active && <div>Pattern discovered!</div>}
 *        </div>
 *      );
 *    }
 *    ```
 */
class PatternPuzzleSystem {
  private static instance: PatternPuzzleSystem;
  private patterns: Map<PatternId, PatternDefinition> = new Map();
  private activePatternIds: Set<PatternId> = new Set();
  private recentActions: PatternAction[] = [];
  private patternProgress: Map<PatternId, number> = new Map();
  
  // For the FileMetadataSystem integration
  private fileMetadataSystem: any = null;
  private fileMetadataSystemPromise: Promise<any> | null = null;
  
  // Maximum number of recent actions to track
  private readonly MAX_RECENT_ACTIONS = 100;
  
  private constructor() {
    this.loadPredefinedPatterns();
    console.log('[PatternPuzzleSystem] Initialized');
  }
  
  /**
   * Get the singleton instance of PatternPuzzleSystem
   */
  public static getInstance(): PatternPuzzleSystem {
    if (!PatternPuzzleSystem.instance) {
      PatternPuzzleSystem.instance = new PatternPuzzleSystem();
    }
    return PatternPuzzleSystem.instance;
  }
  
  /**
   * Load predefined patterns into the system
   */
  private loadPredefinedPatterns(): void {
    // Sequence pattern example: a specific sequence of terminal commands
    this.registerPattern({
      id: 'terminal_command_sequence',
      type: 'sequence',
      name: 'Command Sequence',
      description: 'A specific sequence of terminal commands reveals system information',
      difficulty: 'medium',
      patternData: {
        sequence: ['ls -la', 'cat /var/log/system.log', 'grep "ERROR" /var/log/system.log']
      },
      recognitionConfig: {
        requiredMatches: 3,
        tolerance: 0.9
      },
      onActivation: {
        clueId: 'reality_002',
        visualEffect: 'terminal_flash'
      },
      visualRepresentation: {
        icon: 'terminal',
        color: '#00ff00',
        animation: 'pulse'
      },
      progressThresholds: [0.33, 0.66, 1.0]
    });
    
    // Spatial pattern example: clicking specific locations in the starfield game
    this.registerPattern({
      id: 'starfield_constellation',
      type: 'spatial',
      name: 'Hidden Constellation',
      description: 'Clicking on specific stars in Starfield reveals a constellation',
      difficulty: 'hard',
      patternData: {
        points: [
          { x: 120, y: 150 },
          { x: 200, y: 220 },
          { x: 280, y: 150 },
          { x: 350, y: 90 },
          { x: 420, y: 220 }
        ]
      },
      recognitionConfig: {
        requiredMatches: 5,
        tolerance: 0.15
      },
      onActivation: {
        clueId: 'starfield_constellation',
        visualEffect: 'constellation_reveal'
      },
      visualRepresentation: {
        icon: 'star',
        color: '#ffff00',
        animation: 'connect'
      },
      progressThresholds: [0.2, 0.4, 0.6, 0.8, 1.0]
    });
    
    // Temporal pattern: system actions at specific times
    this.registerPattern({
      id: 'maintenance_window_access',
      type: 'temporal',
      name: 'Maintenance Access',
      description: 'Accessing specific system components during maintenance windows',
      difficulty: 'medium',
      patternData: {
        requiredEvents: [
          { type: 'access_system_logs', during: 'maintenance_window' },
          { type: 'access_user_database', during: 'maintenance_window' },
          { type: 'execute_debug_command', during: 'maintenance_window' }
        ]
      },
      recognitionConfig: {
        requiredMatches: 3,
        tolerance: 1.0
      },
      onActivation: {
        clueId: 'reality_003',
        triggerEvent: 'security_breach_detected'
      },
      visualRepresentation: {
        icon: 'lock-open',
        color: '#ff0000',
        animation: 'alarm'
      },
      progressThresholds: [0.33, 0.66, 1.0]
    });
    
    // Meta pattern: actions across different applications
    this.registerPattern({
      id: 'cross_application_pattern',
      type: 'meta',
      name: 'System Integration',
      description: 'Connect information across multiple system applications',
      difficulty: 'hard',
      patternData: {
        requiredActions: [
          { app: 'fileManager', action: 'open_file', target: 'secret_logs.txt' },
          { app: 'terminal', action: 'execute_command', value: 'decode --key=7531' },
          { app: 'starfield', action: 'navigate_to_coordinates', value: { x: 753, y: 159 } }
        ]
      },
      recognitionConfig: {
        requiredMatches: 3,
        tolerance: 0.95
      },
      onActivation: {
        clueId: 'mrheadroom_003',
        visualEffect: 'system_pulse'
      },
      visualRepresentation: {
        icon: 'network',
        color: '#0088ff',
        animation: 'connect'
      },
      progressThresholds: [0.33, 0.66, 1.0]
    });
    
    // Metadata pattern: discovering hidden data in system files
    this.registerPattern({
      id: 'hidden_system_metadata',
      type: 'metadata',
      name: 'System File Analysis',
      description: 'Discover hidden information in system file metadata',
      difficulty: 'medium',
      patternData: {
        files: [
          '/var/log/system.log',
          '/etc/apps/starfield/config.json',
          '/home/user/documents/notes.txt'
        ]
      },
      recognitionConfig: {
        requiredMatches: 3,
        tolerance: 1.0
      },
      onActivation: {
        clueId: 'reality_003',
        visualEffect: 'data_reveal'
      },
      visualRepresentation: {
        icon: 'search',
        color: '#00ccff',
        animation: 'pulse'
      },
      progressThresholds: [0.33, 0.66, 1.0]
    });
  }
  
  /**
   * Register a new pattern with the system
   * @param pattern The pattern definition to register
   */
  public registerPattern(pattern: PatternDefinition): void {
    this.patterns.set(pattern.id, pattern);
    this.patternProgress.set(pattern.id, 0);
    console.log(`[PatternPuzzleSystem] Registered pattern: ${pattern.id}`);
  }
  
  /**
   * Record a user action that might be part of a pattern
   * @param action The action to record
   */
  public recordAction(action: PatternAction): void {
    // Add the action to recent actions
    this.recentActions.push(action);
    
    // Trim the action list if it gets too long
    if (this.recentActions.length > this.MAX_RECENT_ACTIONS) {
      this.recentActions.shift();
    }
    
    // Check all patterns for matches with this new action
    this.checkPatterns(action);
  }
  
  /**
   * Check if the new action completes or advances any patterns
   * @param newAction The action that was just recorded
   */
  private checkPatterns(newAction: PatternAction): void {
    // For each pattern, check if this action advances or completes it
    this.patterns.forEach((pattern, patternId) => {
      // Skip patterns that are already active
      if (this.activePatternIds.has(patternId)) {
        return;
      }
      
      // Calculate the new progress value for this pattern
      const newProgress = this.calculatePatternProgress(pattern, newAction);
      
      // If progress improved, update it
      if (newProgress > (this.patternProgress.get(patternId) || 0)) {
        this.patternProgress.set(patternId, newProgress);
        
        // Check if we've reached a progress threshold for visualization
        this.checkProgressThresholds(pattern, newProgress);
        
        // Check if the pattern is now complete
        if (newProgress >= 1.0) {
          this.activatePattern(pattern);
        }
      }
    });
  }
  
  /**
   * Calculate how much progress the user has made toward recognizing a pattern
   * @param pattern The pattern definition
   * @param newAction The newly recorded action
   * @returns A number between 0 and 1 representing progress
   */
  private calculatePatternProgress(pattern: PatternDefinition, newAction: PatternAction): number {
    // Current progress
    const currentProgress = this.patternProgress.get(pattern.id) || 0;
    
    // Different calculation based on pattern type
    switch (pattern.type) {
      case 'sequence':
        return this.calculateSequenceProgress(pattern, newAction);
      case 'combination':
        return this.calculateCombinationProgress(pattern, newAction);
      case 'spatial':
        return this.calculateSpatialProgress(pattern, newAction);
      case 'temporal':
        return this.calculateTemporalProgress(pattern, newAction);
      case 'metadata':
        return this.calculateMetadataProgress(pattern, newAction);
      case 'meta':
        return this.calculateMetaProgress(pattern, newAction);
      default:
        return currentProgress;
    }
  }
  
  /**
   * Calculate progress for a sequence pattern
   */
  private calculateSequenceProgress(pattern: PatternDefinition, _newAction: PatternAction): number {
    const sequence = pattern.patternData.sequence;
    const sequenceLength = sequence.length;
    
    // Get the most recent actions up to the sequence length
    const recentActions = this.recentActions.slice(-sequenceLength);
    
    // Count how many actions match in order
    let matchCount = 0;
    for (let i = 0; i < recentActions.length; i++) {
      if (recentActions[i].type === 'terminal_command' && 
          recentActions[i].value === sequence[i]) {
        matchCount++;
      } else {
        // Break on first mismatch
        break;
      }
    }
    
    return matchCount / sequenceLength;
  }
  
  /**
   * Calculate progress for a combination pattern
   */
  private calculateCombinationProgress(pattern: PatternDefinition, _newAction: PatternAction): number {
    // Check if we have elements or requiredActions format
    const elements = pattern.patternData.elements || pattern.patternData.requiredActions;
    
    if (!elements) {
      console.warn(`[PatternPuzzleSystem] Combination pattern ${pattern.id} missing elements or requiredActions`);
      return this.patternProgress.get(pattern.id) || 0;
    }
    
    const totalElements = elements.length;
    
    // Count how many elements from the combination exist in recent actions
    const foundElements = new Set<string>();
    
    for (const action of this.recentActions) {
      const matchingElement = elements.find((elem: any) => 
        this.actionMatchesElement(action, elem));
      
      if (matchingElement) {
        const id = typeof matchingElement === 'string' 
          ? matchingElement 
          : (matchingElement.id || JSON.stringify(matchingElement));
        foundElements.add(id);
      }
    }
    
    return foundElements.size / totalElements;
  }
  
  /**
   * Calculate progress for a spatial pattern
   */
  private calculateSpatialProgress(pattern: PatternDefinition, newAction: PatternAction): number {
    if (newAction.type !== 'click' || !newAction.value.x || !newAction.value.y) {
      return this.patternProgress.get(pattern.id) || 0;
    }
    
    const points = pattern.patternData.points;
    const tolerance = pattern.recognitionConfig.tolerance * 50; // Convert to pixel distance
    
    // Find the closest matching point that hasn't been matched yet
    const matchedPoints = new Set<number>();
    let matchCount = 0;
    
    // Get previously matched points from recent actions
    for (const action of this.recentActions) {
      if (action.type === 'click' && action.context === pattern.id) {
        matchedPoints.add(action.value.pointIndex);
      }
    }
    
    // Try to match the new action to a point
    for (let i = 0; i < points.length; i++) {
      if (matchedPoints.has(i)) {
        // Already matched this point
        matchCount++;
        continue;
      }
      
      const point = points[i];
      const distance = Math.sqrt(
        Math.pow(newAction.value.x - point.x, 2) + 
        Math.pow(newAction.value.y - point.y, 2)
      );
      
      if (distance <= tolerance) {
        // Found a match, record it
        matchedPoints.add(i);
        
        // Add context to the action
        newAction.context = pattern.id;
        newAction.value.pointIndex = i;
        
        matchCount++;
        break;
      }
    }
    
    return matchCount / points.length;
  }
  
  /**
   * Calculate progress for a temporal pattern
   */
  private calculateTemporalProgress(pattern: PatternDefinition, newAction: PatternAction): number {
    const requiredEvents = pattern.patternData.requiredEvents;
    const matchedEvents = new Set<number>();
    
    // Check if this is a maintenance window action
    const mysteryEngine = MysteryEngine.getInstance();
    const isMaintenanceActive = mysteryEngine.isMaintenanceWindowActive();
    
    // Only proceed if we're in a maintenance window and the pattern requires it
    if (!isMaintenanceActive && requiredEvents.some((e: any) => e.during === 'maintenance_window')) {
      return this.patternProgress.get(pattern.id) || 0;
    }
    
    // Count previously matched events
    for (const action of this.recentActions) {
      if (action.context === pattern.id) {
        matchedEvents.add(action.value.eventIndex);
      }
    }
    
    // Check if the new action matches an event
    for (let i = 0; i < requiredEvents.length; i++) {
      if (matchedEvents.has(i)) {
        continue; // Already matched
      }
      
      const event = requiredEvents[i];
      
      if (newAction.type === event.type) {
        // Found a match
        matchedEvents.add(i);
        
        // Add context to the action
        newAction.context = pattern.id;
        newAction.value.eventIndex = i;
        break;
      }
    }
    
    return matchedEvents.size / requiredEvents.length;
  }
  
  /**
   * Calculate progress for a meta pattern
   */
  private calculateMetaProgress(pattern: PatternDefinition, newAction: PatternAction): number {
    const requiredActions = pattern.patternData.requiredActions;
    const matchedActions = new Set<number>();
    
    // Count previously matched actions
    for (const action of this.recentActions) {
      if (action.context === pattern.id) {
        matchedActions.add(action.value.actionIndex);
      }
    }
    
    // Check if the new action matches a required action
    for (let i = 0; i < requiredActions.length; i++) {
      if (matchedActions.has(i)) {
        continue; // Already matched
      }
      
      const requiredAction = requiredActions[i];
      
      // Check if the action matches based on app and action type
      if (newAction.type === `${requiredAction.app}_${requiredAction.action}`) {
        // Check if the value matches
        const valueMatches = this.valueMatches(
          newAction.value,
          requiredAction.value,
          pattern.recognitionConfig.tolerance
        );
        
        if (valueMatches) {
          // Found a match
          matchedActions.add(i);
          
          // Add context to the action
          newAction.context = pattern.id;
          newAction.value.actionIndex = i;
          break;
        }
      }
    }
    
    return matchedActions.size / requiredActions.length;
  }
  
  /**
   * Check if we've crossed any visualization thresholds for the pattern
   * @param pattern The pattern definition
   * @param progress The current progress value (0-1)
   */
  private checkProgressThresholds(pattern: PatternDefinition, progress: number): void {
    if (!pattern.progressThresholds) return;
    
    const thresholds = pattern.progressThresholds;
    for (const threshold of thresholds) {
      // Find the highest threshold we've passed
      if (progress >= threshold) {
        // We could dispatch a UI event here for visualization
        // For now, just log it
        console.log(`[PatternPuzzleSystem] Pattern ${pattern.id} reached threshold ${threshold}`);
        
        // We could also trigger a hint or subtle UI effect
        this.triggerProgressVisualization(pattern.id, threshold);
      }
    }
  }
  
  /**
   * Trigger a visualization effect for pattern progress
   * @param patternId The pattern ID
   * @param threshold The threshold that was reached
   */
  private triggerProgressVisualization(patternId: PatternId, threshold: number): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;
    
    // Create an event for the visualization system
    const event: GameEvent = {
      type: 'pattern_progress',
      data: {
        patternId,
        threshold,
        visualData: pattern.visualRepresentation
      },
      timestamp: Date.now()
    };
    
    // Log the event
    addGameLog('pattern', event);
    
    // Dispatch a custom event for UI components
    this.dispatchPatternEvent('progress_updated', patternId, threshold);
    
    // Additional visualization logic could be added here or handled by subscribers
    // For example, showing a brief flash, highlighting an element, etc.
  }
  
  /**
   * Dispatch a pattern event for UI components to listen to
   * 
   * @param type - The type of pattern event (e.g. 'progress_updated', 'pattern_activated')
   * @param patternId - The ID of the pattern that changed
   * @param data - Additional data related to the event
   */
  private dispatchPatternEvent(type: string, patternId: PatternId, data?: any): void {
    // Only dispatch events if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Create and dispatch a custom event
      const event = new CustomEvent<PatternEvent>('patternUpdate', {
        detail: {
          type,
          patternId,
          data,
          timestamp: Date.now()
        },
        bubbles: true,
        cancelable: true
      });
      
      window.dispatchEvent(event);
    }
    
    // Also trigger a state change event for alternative integration methods
    this.onStateChange?.({
      type,
      patternId,
      data,
      timestamp: Date.now()
    });
  }
  
  // Optional callback for state changes (useful for non-browser environments or testing)
  private onStateChange?: (event: PatternEvent) => void;
  
  /**
   * Register a callback for state changes
   * This is an alternative to the event-based system
   * 
   * @param callback - Function to call when pattern state changes
   */
  public registerStateChangeCallback(callback: (event: PatternEvent) => void): void {
    this.onStateChange = callback;
  }
  
  /**
   * Activate a completed pattern
   * @param pattern The pattern that was completed
   */
  private activatePattern(pattern: PatternDefinition): void {
    const mysteryEngine = MysteryEngine.getInstance();
    
    // Mark as active in our local tracking
    this.activePatternIds.add(pattern.id);
    
    // Activate in the MysteryEngine
    mysteryEngine.activatePattern(pattern.id);
    
    // Handle activation effects
    if (pattern.onActivation) {
      // Reveal a clue if specified
      if (pattern.onActivation.clueId) {
        mysteryEngine.discoverClue(pattern.onActivation.clueId);
      }
      
      // Trigger an event if specified
      if (pattern.onActivation.triggerEvent) {
        const event: GameEvent = {
          type: pattern.onActivation.triggerEvent,
          data: {
            patternId: pattern.id,
            timestamp: new Date().toISOString()
          },
          timestamp: Date.now()
        };
        
        addGameLog('system', event);
      }
      
      // Handle visual effect if specified
      if (pattern.onActivation.visualEffect) {
        const event: GameEvent = {
          type: 'visual_effect',
          data: {
            effectType: pattern.onActivation.visualEffect,
            patternId: pattern.id,
            visualData: pattern.visualRepresentation
          },
          timestamp: Date.now()
        };
        
        addGameLog('ui', event);
      }
    }
    
    // Dispatch a custom event for UI components
    this.dispatchPatternEvent('pattern_activated', pattern.id, {
      name: pattern.name,
      visualData: pattern.visualRepresentation
    });
    
    console.log(`[PatternPuzzleSystem] Pattern activated: ${pattern.id}`);
  }
  
  /**
   * Get all available patterns
   */
  public getAllPatterns(): PatternDefinition[] {
    return Array.from(this.patterns.values());
  }
  
  /**
   * Get a specific pattern definition by ID
   * @param patternId The pattern ID to retrieve
   */
  public getPattern(patternId: PatternId): PatternDefinition | undefined {
    return this.patterns.get(patternId);
  }
  
  /**
   * Get the current progress for all patterns
   */
  public getAllPatternProgress(): Map<PatternId, number> {
    return new Map(this.patternProgress);
  }
  
  /**
   * Get progress for a specific pattern
   * @param patternId The pattern ID to get progress for
   */
  public getPatternProgress(patternId: PatternId): number {
    return this.patternProgress.get(patternId) || 0;
  }
  
  /**
   * Check if a pattern is active
   * @param patternId The pattern ID to check
   */
  public isPatternActive(patternId: PatternId): boolean {
    return this.activePatternIds.has(patternId);
  }
  
  /**
   * Find patterns related to a specific clue
   * @param clueId The clue ID to find related patterns for
   * @returns Array of patterns that are related to the clue
   */
  public getPatternsForClue(clueId: string): PatternDefinition[] {
    return Array.from(this.patterns.values()).filter(pattern => 
      pattern.onActivation?.clueId === clueId
    );
  }
  
  /**
   * Reset progress for a specific pattern
   * @param patternId The pattern ID to reset
   */
  public resetPatternProgress(patternId: PatternId): void {
    this.patternProgress.set(patternId, 0);
    
    // Filter out actions related to this pattern
    this.recentActions = this.recentActions.filter(
      action => action.context !== patternId
    );
    
    console.log(`[PatternPuzzleSystem] Reset progress for pattern: ${patternId}`);
  }
  
  /**
   * Helper to check if an action matches a pattern element
   */
  private actionMatchesElement(action: PatternAction, element: any): boolean {
    // Simple equality check - could be extended for more complex matching
    if (typeof element === 'string') {
      return action.value === element;
    } else if (typeof element === 'object') {
      return this.valueMatches(action.value, element.value, 0.9);
    }
    return false;
  }
  
  /**
   * Calculate progress for a metadata pattern
   * This pattern type integrates with the FileMetadataSystem to detect patterns in file metadata
   * 
   * @param pattern - The metadata pattern definition
   * @param newAction - The newly recorded action
   * @returns The current progress value (0-1)
   */
  private calculateMetadataProgress(pattern: PatternDefinition, newAction: PatternAction): number {
    // Only process file access actions
    if (newAction.type !== 'file_access' && newAction.type !== 'file_view_metadata') {
      return this.patternProgress.get(pattern.id) || 0;
    }
    
    // Use dynamic import to avoid circular dependency but improve handling
    // Store the promise to avoid multiple imports
    if (!this.fileMetadataSystemPromise) {
      this.fileMetadataSystemPromise = import('./FileMetadataSystem')
        .then(module => {
          this.fileMetadataSystem = module.default;
          return module.default;
        })
        .catch(error => {
          console.error(`[PatternPuzzleSystem] Error loading FileMetadataSystem: ${error}`);
          return null;
        });
    }

    // If we already have the FileMetadataSystem, use it directly
    if (this.fileMetadataSystem) {
      const requiredFiles = pattern.patternData.files;
      if (!requiredFiles || !Array.isArray(requiredFiles)) {
        console.warn(`[PatternPuzzleSystem] Metadata pattern ${pattern.id} missing files array`);
        return this.patternProgress.get(pattern.id) || 0;
      }
      
      // Count discovered hidden data in required files
      let discoveredCount = 0;
      
      for (const filePath of requiredFiles) {
        if (this.fileMetadataSystem.hasDiscoveredHiddenData(filePath)) {
          discoveredCount++;
        }
      }
      
      // Update progress
      const newProgress = discoveredCount / requiredFiles.length;
      this.patternProgress.set(pattern.id, newProgress);
      
      // Trigger a progress update event
      if (newProgress > 0) {
        this.checkProgressThresholds(pattern, newProgress);
      }
      
      return newProgress;
    }
    
    // If the system is still loading, queue this action to be processed later
    this.fileMetadataSystemPromise?.then(system => {
      if (system) {
        // Re-run this calculation once the system is available
        this.calculateMetadataProgress(pattern, newAction);
      }
    });
    
    // Return current progress while async import is running
    return this.patternProgress.get(pattern.id) || 0;
  }

  /**
   * Helper to check if two values match within a tolerance
   */
  private valueMatches(value1: any, value2: any, tolerance: number): boolean {
    if (value1 === value2) return true;
    
    // Handle different types of values
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      // For numbers, calculate relative difference
      const max = Math.max(Math.abs(value1), Math.abs(value2));
      if (max === 0) return true; // Both are zero
      return Math.abs(value1 - value2) / max <= (1 - tolerance);
    } 
    else if (typeof value1 === 'string' && typeof value2 === 'string') {
      // For strings, could use string distance algorithms
      // For now, simple check if one contains the other
      return value1.includes(value2) || value2.includes(value1);
    }
    else if (typeof value1 === 'object' && typeof value2 === 'object') {
      // For objects like coordinates, check each property
      if (value1 === null || value2 === null) return false;
      
      const keys = Object.keys(value2);
      for (const key of keys) {
        if (!this.valueMatches(value1[key], value2[key], tolerance)) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
}

// Export the types, class and a default singleton instance
export type { PatternType, PatternDefinition, PatternAction, PatternEvent };
export { PatternPuzzleSystem };
export default PatternPuzzleSystem.getInstance();
