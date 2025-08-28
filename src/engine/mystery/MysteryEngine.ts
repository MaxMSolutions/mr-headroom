import { GameEvent } from '../games/GameBase';
import { getGameState, setGameFlag, addGameLog } from '../save/SaveManager';
import { clues, getClue } from '../../data/clues';

export type ClueId = string;

export interface MysteryState {
  discoveredClues: ClueId[];
  maintenanceWindowActive: boolean;
  activePatterns: PatternId[];
  pendingHints: HintId[];
  pathProgress: {
    alpha: number; // Progress toward Acceptance ending (0-100)
    beta: number;  // Progress toward Liminal ending (0-100)
    gamma: number; // Progress toward Escape ending (0-100)
  };
}

export type PatternId = string;
export type HintId = string;

/**
 * MysteryEngine manages the state and logic for the mystery narrative
 * It tracks clues, patterns, hints, and progression toward the three endings
 */
export class MysteryEngine {
  private static instance: MysteryEngine;
  private state: MysteryState;

  private constructor() {
    this.state = this.loadState();
    console.log('[MysteryEngine] Initialized');
  }

  /**
   * Get the singleton instance of MysteryEngine
   */
  public static getInstance(): MysteryEngine {
    if (!MysteryEngine.instance) {
      MysteryEngine.instance = new MysteryEngine();
    }
    return MysteryEngine.instance;
  }

  /**
   * Load the mystery state from the game state
   */
  private loadState(): MysteryState {
    const gameState = getGameState() as any;
    
    // Default state if none exists
    return {
      discoveredClues: gameState.discoveredClues || [],
      maintenanceWindowActive: false,
      activePatterns: gameState.activePatterns || [],
      pendingHints: gameState.pendingHints || [],
      pathProgress: gameState.pathProgress || {
        alpha: 0,
        beta: 0,
        gamma: 0
      }
    };
  }

  /**
   * Check if a clue has been discovered
   * @param clueId The ID of the clue to check
   */
  public hasDiscoveredClue(clueId: ClueId): boolean {
    return this.state.discoveredClues.includes(clueId);
  }

  /**
   * Get all discovered clues
   */
  public getDiscoveredClues(): ClueId[] {
    return [...this.state.discoveredClues];
  }

  /**
   * Check if a maintenance window is currently active
   */
  public isMaintenanceWindowActive(): boolean {
    return this.state.maintenanceWindowActive;
  }

  /**
   * Set the maintenance window active state
   * @param active Whether the maintenance window is active
   */
  public setMaintenanceWindowActive(active: boolean): void {
    this.state.maintenanceWindowActive = active;
    
    // Log this important system event
    const event: GameEvent = {
      type: active ? 'maintenance_window_open' : 'maintenance_window_closed',
      data: {
        timestamp: new Date().toISOString(),
        systemTime: '02:00',
        accessLevel: 'ELEVATED',
        securityProtocols: active ? 'REDUCED' : 'NORMAL',
        opportunities: active ? 'BREAKTHROUGH_POSSIBLE' : 'STANDARD'
      },
      timestamp: Date.now()
    };
    
    addGameLog('system', event);
    
    // If opening maintenance window, check if we should add a clue
    if (active) {
      this.checkForMaintenanceWindowClues();
    }
  }

  /**
   * Check for clues that should be triggered by an active maintenance window
   */
  private checkForMaintenanceWindowClues(): void {
    // This could check for specific conditions being met during maintenance window
    // For example, having discovered certain clues or performed certain actions
    
    // For now, we'll just add a basic maintenance window discovery clue
    const hasRequiredClues = this.hasDiscoveredClue('reality_002') && 
                            this.hasDiscoveredClue('mrheadroom_002');
    
    if (hasRequiredClues) {
      // Could trigger a specific clue about maintenance windows here
      const event: GameEvent = {
        type: 'maintenance_window_discovery',
        data: {
          message: 'System maintenance window detected. Security reduced. Breakthrough possible.',
          securityLevel: 'LOW',
          exploitPotential: 'HIGH'
        },
        timestamp: Date.now()
      };
      
      addGameLog('system', event);
      
      // Increase gamma path progress
      this.updatePathProgress('gamma', 15);
    }
  }
  
  /**
   * Get a copy of the current mystery state
   */
  public getState(): MysteryState {
    // Return a deep copy to prevent direct mutation
    return JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * Save the current state to game state
   * This is a placeholder as the actual implementation would depend on SaveManager
   */
  private saveState(): void {
    // In a complete implementation, this would save to the game state
    console.log('[MysteryEngine] Saving state');
  }
  
  /**
   * Discover a new clue and update state accordingly
   * @param clueId ID of the clue to discover
   */
  public discoverClue(clueId: ClueId): void {
    // Ignore if we've already discovered this clue
    if (this.state.discoveredClues.includes(clueId)) {
      console.log(`[MysteryEngine] Clue ${clueId} already discovered`);
      return;
    }
    
    // Add to discovered clues
    this.state.discoveredClues.push(clueId);
    
    // Get the clue data
    const clue = getClue(clueId);
    
    // Log the clue discovery
    const event: GameEvent = {
      type: 'clue_discovered',
      data: {
        clueId,
        clueType: clue?.category || 'unknown',
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now()
    };
    
    addGameLog('mystery', event);
    console.log(`[MysteryEngine] Discovered clue: ${clueId}`);
    
    // Update path progress based on the clue
    this.updateCluePathProgress(clueId);
    
    // Save the state
    this.saveState();
  }
  
  /**
   * Check if a pattern is currently active
   * @param patternId ID of the pattern to check
   */
  public isPatternActive(patternId: PatternId): boolean {
    return this.state.activePatterns.includes(patternId);
  }
  
  /**
   * Activate a pattern
   * @param patternId ID of the pattern to activate
   */
  public activatePattern(patternId: PatternId): void {
    if (!this.isPatternActive(patternId)) {
      this.state.activePatterns.push(patternId);
      
      const event: GameEvent = {
        type: 'pattern_activated',
        data: {
          patternId,
          timestamp: new Date().toISOString()
        },
        timestamp: Date.now()
      };
      
      addGameLog('mystery', event);
      console.log(`[MysteryEngine] Activated pattern: ${patternId}`);
      this.saveState();
    }
  }
  
  /**
   * Update progress based on a discovered clue
   * @param clueId ID of the clue that's advancing the path
   */
  private updateCluePathProgress(clueId: ClueId): void {
    // Get the clue data
    const clue = getClue(clueId);
    
    if (!clue) {
      console.warn(`[MysteryEngine] Clue ${clueId} not found, can't update path progress`);
      return;
    }
    
    // Update progress based on the clue's category
    // This is a simplified implementation - you would customize this based on your narrative design
    if (clue.category === 'journal') {
      this.updatePathProgress('alpha', 10);
    } else if (clue.category === 'system_log') {
      this.updatePathProgress('beta', 10);
    } else if (clue.category === 'hidden_file') {
      this.updatePathProgress('gamma', 10);
    }
  }

  /**
   * Update progress toward a specific ending path
   * @param path The ending path to update
   * @param increment The amount to increase the progress
   */
  public updatePathProgress(path: 'alpha' | 'beta' | 'gamma', increment: number): void {
    // Update the progress
    this.state.pathProgress[path] = Math.min(100, this.state.pathProgress[path] + increment);
    
    // Check if this has unlocked a new ending
    this.checkEndingPathAvailability();
  }

  /**
   * Check if any ending paths have reached their required thresholds
   */
  private checkEndingPathAvailability(): void {
    const { alpha, beta, gamma } = this.state.pathProgress;
    
    // Set game flags based on path progress
    if (alpha >= 100) {
      setGameFlag('alphaPathAvailable', true);
    }
    
    if (beta >= 100) {
      setGameFlag('betaPathAvailable', true);
    }
    
    if (gamma >= 100) {
      setGameFlag('gammaPathAvailable', true);
    }
  }

  /**
   * Get the current ending path progress
   */
  public getPathProgress(): { alpha: number; beta: number; gamma: number } {
    return { ...this.state.pathProgress };
  }

  /**
   * Check which ending paths are currently available
   */
  public getAvailableEndingPaths(): ('alpha' | 'beta' | 'gamma')[] {
    const availablePaths: ('alpha' | 'beta' | 'gamma')[] = [];
    const { alpha, beta, gamma } = this.state.pathProgress;
    
    if (alpha >= 100) availablePaths.push('alpha');
    if (beta >= 100) availablePaths.push('beta');
    if (gamma >= 100) availablePaths.push('gamma');
    
    return availablePaths;
  }

  // These methods were duplicated and have been moved to their earlier implementations

  /**
   * Get all active patterns
   */
  public getActivePatterns(): PatternId[] {
    return [...this.state.activePatterns];
  }

  /**
   * Add a pending hint
   * @param hintId The ID of the hint to add
   */
  public addPendingHint(hintId: HintId): void {
    if (!this.state.pendingHints.includes(hintId)) {
      this.state.pendingHints.push(hintId);
    }
  }

  /**
   * Get all pending hints
   */
  public getPendingHints(): HintId[] {
    return [...this.state.pendingHints];
  }

  /**
   * Clear a pending hint
   * @param hintId The ID of the hint to clear
   */
  public clearPendingHint(hintId: HintId): void {
    this.state.pendingHints = this.state.pendingHints.filter(id => id !== hintId);
  }
  
  /**
   * Track game events including file access events
   * @param event The event to track
   */
  public trackEvent(event: any): void {
    console.log(`[MysteryEngine] Tracking event: ${event.type}`, event);
    
    // Log event to the game logs
    const gameEvent: GameEvent = {
      type: 'file_read_event',
      data: event,
      timestamp: Date.now()
    };
    addGameLog('mystery', gameEvent);
    
    // Check for file read events
    if (event.type === 'file_read') {
      this.handleFileReadEvent(event);
    }
  }
  
  /**
   * Handle file read events
   * @param event The file read event
   */
  private handleFileReadEvent(event: any): void {
    // Check if the file contains a clue
    const potentialClues = Object.values(clues).filter(clue => 
      clue.relatedFiles?.includes(event.path) || 
      clue.relatedFiles?.includes(event.filename)
    );
    
    // Discover any clues associated with this file
    potentialClues.forEach(clue => {
      if (!this.state.discoveredClues.includes(clue.id)) {
        this.discoverClue(clue.id);
        const clueEvent: GameEvent = {
          type: 'clue_discovered',
          data: { clueId: clue.id, source: 'file_read', path: event.path },
          timestamp: Date.now()
        };
        addGameLog('mystery', clueEvent);
      }
    });
    
    // Update path progress based on file content or metadata
    // This could be expanded based on specific files
    if (event.path.includes('journal') || event.filename.includes('journal')) {
      // Journal entries slightly boost the alpha path (acceptance)
      this.updatePathProgress('alpha', 1);
    }
    
    if (event.path.includes('exploit') || event.filename.includes('exploit')) {
      // Exploit files boost the gamma path (escape)
      this.updatePathProgress('gamma', 2);
    }
    
    if (event.path.includes('liminal') || event.filename.includes('liminal')) {
      // Liminal files boost the beta path (partial awakening)
      this.updatePathProgress('beta', 2);
    }
  }

  /**
   * Check if the user has discovered all clues required for a particular ending
   * @param endingPath The ending path to check
   */
  public hasDiscoveredRequiredCluesForEnding(endingPath: 'alpha' | 'beta' | 'gamma'): boolean {
    const discoveredClues = this.state.discoveredClues;
    
    switch (endingPath) {
      case 'alpha':
        // Alpha path requires basic understanding of the simulation
        return discoveredClues.includes('mrheadroom_001') && 
               discoveredClues.includes('reality_001');
      
      case 'beta':
        // Beta path requires deeper understanding and partial system access
        return discoveredClues.includes('mrheadroom_001') && 
               discoveredClues.includes('mrheadroom_002') &&
               discoveredClues.includes('mrheadroom_003') &&
               discoveredClues.includes('reality_001') &&
               discoveredClues.includes('reality_002');
      
      case 'gamma':
        // Gamma path requires complete understanding and all critical clues
        return discoveredClues.includes('mrheadroom_001') && 
               discoveredClues.includes('mrheadroom_002') &&
               discoveredClues.includes('mrheadroom_003') &&
               discoveredClues.includes('reality_001') &&
               discoveredClues.includes('reality_002') &&
               discoveredClues.includes('reality_003') &&
               discoveredClues.includes('starfield_memory_dump') &&
               discoveredClues.includes('starfield_constellation');
      
      default:
        return false;
    }
  }

  /**
   * Alias for hasDiscoveredRequiredCluesForEnding to fix compatibility issues
   * @param endingPath The ending path to check
   */
  public checkEndingRequirements(endingPath: 'alpha' | 'beta' | 'gamma'): boolean {
    return this.hasDiscoveredRequiredCluesForEnding(endingPath);
  }

  /**
   * Calculate the user's progress toward solving the overall mystery
   */
  public calculateOverallProgress(): number {
    // Count total non-red-herring clues in the system
    const totalClues = Object.values(clues).filter(clue => !clue.isRedHerring).length;
    
    // Count discovered non-red-herring clues
    const discoveredRealClues = this.state.discoveredClues.filter(clueId => {
      const clue = getClue(clueId);
      return clue && !clue.isRedHerring;
    }).length;
    
    return Math.round((discoveredRealClues / totalClues) * 100);
  }
}
