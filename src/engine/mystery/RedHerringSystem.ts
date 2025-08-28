/**
 * RedHerringSystem.ts
 * A system for creating and tracking misleading but plausible clues (red herrings)
 * that add depth to the mystery without blocking progress.
 */

import { MysteryEngine, ClueId } from './MysteryEngine';
import { addGameLog } from '../save/SaveManager';
import { GameEvent } from '../games/GameBase';
import { clues } from '../../data/clues';

/**
 * Interface for a red herring
 */
export interface RedHerring {
  id: string;
  clueId: ClueId;
  exposedBy?: ClueId[];  // Clues that can expose this as a red herring
  isExposed: boolean;    // Whether the player has identified this as a red herring
  confidence: number;    // How convincing the red herring is (0-100)
  relatedFiles?: string[];
  targetEndingPath?: 'alpha' | 'beta' | 'gamma'; // Which ending path this red herring is meant to mislead toward
}

/**
 * The RedHerringSystem manages the creation, tracking, and exposure of red herrings.
 * Red herrings are misleading clues that appear plausible but don't contribute to
 * puzzle solutions or ending requirements.
 */
class RedHerringSystem {
  private static instance: RedHerringSystem;
  private redHerrings: Map<string, RedHerring> = new Map();
  private exposedRedHerrings: Set<string> = new Set();
  private mysteryEngine: MysteryEngine;
  
  private constructor() {
    this.mysteryEngine = MysteryEngine.getInstance();
    this.initializeRedHerrings();
    console.log('[RedHerringSystem] Initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): RedHerringSystem {
    if (!RedHerringSystem.instance) {
      RedHerringSystem.instance = new RedHerringSystem();
    }
    return RedHerringSystem.instance;
  }
  
  /**
   * Initialize all red herrings in the game
   */
  private initializeRedHerrings(): void {
    // Get all clues marked as red herrings
    Object.values(clues).forEach(clue => {
      if (clue.isRedHerring) {
        this.redHerrings.set(clue.id, {
          id: `rh_${clue.id}`,
          clueId: clue.id,
          isExposed: false,
          confidence: clue.displayType === 'important' ? 80 : 60,
          relatedFiles: clue.relatedFiles,
          targetEndingPath: this.determineTargetPath(clue.id)
        });
      }
    });
    
    // Set up specific red herrings with custom properties
    this.setupSpecificRedHerrings();
  }
  
  /**
   * Configure specific red herrings with custom properties
   */
  private setupSpecificRedHerrings(): void {
    // Example: Make a specific red herring more convincing
    const specificHerring = this.redHerrings.get('false_lead_001');
    if (specificHerring) {
      specificHerring.confidence = 90;
      specificHerring.exposedBy = ['reality_004', 'mrheadroom_005'];
    }
    
    // Example: Set up another red herring with specific ending path misdirection
    const misleadingHerring = this.redHerrings.get('false_security_002');
    if (misleadingHerring) {
      misleadingHerring.targetEndingPath = 'beta';
      misleadingHerring.exposedBy = ['system_003'];
    }
  }
  
  /**
   * Determine which ending path this red herring might mislead toward
   */
  private determineTargetPath(clueId: string): 'alpha' | 'beta' | 'gamma' | undefined {
    // Logic to determine which ending path this red herring is trying to mislead the player toward
    // For now, use a simple mapping based on ID patterns
    if (clueId.includes('security')) return 'gamma';
    if (clueId.includes('reality')) return 'beta';
    if (clueId.includes('mrheadroom')) return 'alpha';
    return undefined;
  }
  
  /**
   * Get a red herring by ID
   * @param id The ID of the red herring
   * @returns The red herring or undefined if not found
   */
  public getRedHerring(id: string): RedHerring | undefined {
    return this.redHerrings.get(id);
  }
  
  /**
   * Get all red herrings
   * @returns Array of all red herrings
   */
  public getAllRedHerrings(): RedHerring[] {
    return Array.from(this.redHerrings.values());
  }
  
  /**
   * Get all red herrings related to a specific ending path
   * @param path The ending path to check
   * @returns Array of red herrings targeting that path
   */
  public getRedHerringsForPath(path: 'alpha' | 'beta' | 'gamma'): RedHerring[] {
    return this.getAllRedHerrings().filter(rh => rh.targetEndingPath === path);
  }
  
  /**
   * Get all exposed red herrings
   * @returns Array of exposed red herrings
   */
  public getExposedRedHerrings(): RedHerring[] {
    return this.getAllRedHerrings().filter(rh => rh.isExposed);
  }
  
  /**
   * Get all unexposed red herrings
   * @returns Array of unexposed red herrings
   */
  public getUnexposedRedHerrings(): RedHerring[] {
    return this.getAllRedHerrings().filter(rh => !rh.isExposed);
  }
  
  /**
   * Check if a clue is a red herring
   * @param clueId The ID of the clue to check
   * @returns true if the clue is a red herring
   */
  public isRedHerring(clueId: string): boolean {
    return this.redHerrings.has(clueId);
  }
  
  /**
   * Check if a red herring has been exposed
   * @param id The ID of the red herring to check
   * @returns true if the red herring has been exposed
   */
  public isRedHerringExposed(id: string): boolean {
    const redHerring = this.redHerrings.get(id);
    return redHerring?.isExposed ?? false;
  }
  
  /**
   * Expose a red herring (mark as identified as fake)
   * @param id The ID of the red herring to expose
   * @param byClueId Optional clue that exposed this red herring
   * @returns true if the red herring was exposed
   */
  public exposeRedHerring(id: string, byClueId?: string): boolean {
    const redHerring = this.redHerrings.get(id);
    if (redHerring && !redHerring.isExposed) {
      // Mark that the player has identified this as a red herring
      redHerring.isExposed = true;
      this.exposedRedHerrings.add(id);
      
      // Log the event
      addGameLog('redHerring', {
        type: 'expose',
        data: {
          redHerringId: id,
          exposedByClueId: byClueId
        },
        timestamp: Date.now()
      } as GameEvent);
      
      return true;
    }
    return false;
  }
  
  /**
   * Get the percentage of red herrings that have been exposed
   * @returns Percentage (0-100) of red herrings exposed
   */
  public getRedHerringExposurePercentage(): number {
    if (this.redHerrings.size === 0) return 0;
    return (this.exposedRedHerrings.size / this.redHerrings.size) * 100;
  }
  
  /**
   * Get the total number of red herrings in the game
   */
  public getTotalRedHerrings(): number {
    return this.redHerrings.size;
  }
  
  /**
   * Get the number of exposed red herrings
   */
  public getExposedRedHerringCount(): number {
    return this.exposedRedHerrings.size;
  }
  
  /**
   * Check if exposing this red herring would reveal a real clue
   * This is used to create "double-agent" red herrings that,
   * when exposed, actually help the player
   * @param id The ID of the red herring
   * @returns The clue ID that would be revealed, or undefined
   */
  public getRevealedClueOnExposure(id: string): ClueId | undefined {
    // For now just use a hard-coded example
    if (id === 'false_lead_003') {
      return 'reality_006';
    }
    return undefined;
  }
  
  /**
   * Process the exposure of a red herring, potentially revealing new clues
   * @param id The ID of the red herring to expose
   * @returns true if the operation was successful
   */
  public processRedHerringExposure(id: string): boolean {
    // Expose the red herring
    const wasExposed = this.exposeRedHerring(id);
    
    if (wasExposed) {
      // Check if exposing this red herring reveals a clue
      const revealedClueId = this.getRevealedClueOnExposure(id);
      if (revealedClueId) {
        // Discover the revealed clue
        this.mysteryEngine.discoverClue(revealedClueId);
      }
      
      return true;
    }
    
    return false;
  }
}

export { RedHerringSystem };
export default RedHerringSystem.getInstance();
