/**
 * EndingManager.ts
 * Manages the ending system for MRHEADROOM_DESCENT
 * Handles the three distinct endings and their sequences
 */

import { MysteryEngine } from '../mystery/MysteryEngine';
import { SaveManager, getGameState, setGameFlag } from '../save/SaveManager';
import { GameEvent } from '../games/GameBase';

export type EndingPath = 'alpha' | 'beta' | 'gamma';

export type EndingStepType = 'text' | 'visual' | 'command' | 'decision' | 'glitch';

export interface EndingStep {
  id: string;
  type: EndingStepType;
  content: string;
  duration?: number; // Duration in milliseconds
  effect?: 'fade' | 'glitch' | 'glitch_fade' | 'heavy_glitch' | 'system_crash' | 'dissolve';
  options?: { // For decision steps
    label: string;
    nextStep: string;
  }[];
  action?: () => void; // Custom action to execute for this step
}

export interface EndingSequence {
  id: EndingPath;
  title: string;
  description: string;
  initialStep: string;
  steps: Record<string, EndingStep>;
  locks: string[];   // Files or features locked by this ending
  unlocks: string[]; // Files or features unlocked by this ending
  completion: {      // What happens when this ending is completed
    flag: string;
    value: any;
  };
}

/**
 * EndingManager manages the ending sequences and logic
 * It handles triggering endings, displaying sequences, and managing the state
 */
export class EndingManager {
  private static instance: EndingManager;
  private currentEnding: EndingSequence | null = null;
  private currentStepId: string | null = null;
  private sequences: Record<EndingPath, EndingSequence>;
  private mysteryEngine: MysteryEngine;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.mysteryEngine = MysteryEngine.getInstance();
    this.sequences = {
      'alpha': this.createAlphaPathSequence(),
      'beta': this.createBetaPathSequence(),
      'gamma': this.createGammaPathSequence()
    };
    console.log('[EndingManager] Initialized');
  }

  /**
   * Get the singleton instance of EndingManager
   */
  public static getInstance(): EndingManager {
    if (!EndingManager.instance) {
      EndingManager.instance = new EndingManager();
    }
    return EndingManager.instance;
  }

  /**
   * Check if an ending sequence is currently active
   */
  public isEndingActive(): boolean {
    return this.currentEnding !== null;
  }

  /**
   * Get the current ending path if active
   */
  public getCurrentEndingPath(): EndingPath | null {
    return this.currentEnding?.id || null;
  }

  /**
   * Get the current ending step
   */
  public getCurrentStep(): EndingStep | null {
    if (!this.currentEnding || !this.currentStepId) {
      return null;
    }
    
    return this.currentEnding.steps[this.currentStepId] || null;
  }

  /**
   * Start an ending sequence
   * @param path The ending path to start
   */
  public startEnding(path: EndingPath): boolean {
    // Check if the user has discovered required clues for this ending
    if (!this.mysteryEngine.hasDiscoveredRequiredCluesForEnding(path)) {
      console.warn(`[EndingManager] Cannot start ending ${path}: required clues not discovered`);
      return false;
    }

    const endingSequence = this.sequences[path];
    if (!endingSequence) {
      console.error(`[EndingManager] No ending sequence found for path: ${path}`);
      return false;
    }

    // Set the current ending and step
    this.currentEnding = endingSequence;
    this.currentStepId = endingSequence.initialStep;
    
    // Log the ending start
    const event: GameEvent = {
      type: 'ending_started',
      data: {
        path,
        title: endingSequence.title,
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now()
    };
    
    // Update game flags
    setGameFlag('endingPath', path);
    
    // Log to system
    console.log(`[EndingManager] Started ending sequence: ${path}`);
    return true;
  }

  /**
   * Advance to the next step in the ending sequence
   * @param nextStepId Optional step ID to jump to, for decision steps
   */
  public advanceSequence(nextStepId?: string): EndingStep | null {
    if (!this.currentEnding || !this.currentStepId) {
      console.warn('[EndingManager] No active ending sequence');
      return null;
    }

    // If nextStepId is provided, use that
    if (nextStepId) {
      this.currentStepId = nextStepId;
    } else {
      // Find the next sequential step
      // For now, we'll just use a basic approach
      // In a more complex implementation, we could add ordering to steps
      const currentStep = this.currentEnding.steps[this.currentStepId];
      if (currentStep.type === 'decision' && currentStep.options?.length > 0) {
        // For decision steps, we need to wait for user input
        console.warn('[EndingManager] Decision step requires explicit nextStepId');
        return currentStep;
      }
      
      // Get all step ids and find the next one
      const stepIds = Object.keys(this.currentEnding.steps);
      const currentIndex = stepIds.indexOf(this.currentStepId);
      
      if (currentIndex === -1 || currentIndex === stepIds.length - 1) {
        // End of sequence
        this.completeEnding();
        return null;
      }
      
      this.currentStepId = stepIds[currentIndex + 1];
    }

    // Get the new current step
    const step = this.currentEnding.steps[this.currentStepId];
    
    // Execute any actions for this step
    if (step.action) {
      step.action();
    }
    
    return step;
  }

  /**
   * Complete the current ending sequence
   */
  private completeEnding(): void {
    if (!this.currentEnding) {
      return;
    }
    
    // Set completion flag
    setGameFlag(this.currentEnding.completion.flag, this.currentEnding.completion.value);
    
    // Apply locks and unlocks
    this.applyPathEffects();
    
    // Log completion
    const event: GameEvent = {
      type: 'ending_completed',
      data: {
        path: this.currentEnding.id,
        title: this.currentEnding.title,
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now()
    };
    
    console.log(`[EndingManager] Completed ending sequence: ${this.currentEnding.id}`);
    
    // Clear the current ending
    this.currentEnding = null;
    this.currentStepId = null;
  }

  /**
   * Apply the locks and unlocks for the current ending
   */
  private applyPathEffects(): void {
    if (!this.currentEnding) {
      return;
    }

    // Apply locks
    this.currentEnding.locks.forEach(item => {
      // Here you would implement locking files or features
      // This could be adding them to a "locked" list in the file system
      console.log(`[EndingManager] Locking: ${item}`);
    });

    // Apply unlocks
    this.currentEnding.unlocks.forEach(item => {
      // Here you would implement unlocking files or features
      console.log(`[EndingManager] Unlocking: ${item}`);
    });
  }

  /**
   * Create the Alpha path ending sequence (Acceptance/Truth ending)
   */
  private createAlphaPathSequence(): EndingSequence {
    return {
      id: 'alpha',
      title: 'Acceptance Protocol',
      description: 'Accept your role within the simulation.',
      initialStep: 'alpha_intro',
      steps: {
        'alpha_intro': {
          id: 'alpha_intro',
          type: 'text',
          content: 'ACCEPTANCE PROTOCOL INITIATED\n\nUser [HEDRUM_HENRY] has acknowledged simulation parameters.',
          effect: 'fade',
          duration: 3000
        },
        'alpha_revelation': {
          id: 'alpha_revelation',
          type: 'text',
          content: 'Your consciousness has merged with the system.\nYou understand now that MrHeadroom is not an entity separate from you.\nIt is what you become when you accept the parameters of this reality.',
          duration: 5000
        },
        'alpha_system_message': {
          id: 'alpha_system_message',
          type: 'command',
          content: '> SYSTEM: Reality index optimized.\n> SYSTEM: Merging user identity with system parameters.\n> SYSTEM: Granting enhanced system access.',
          duration: 4000
        },
        'alpha_transformation': {
          id: 'alpha_transformation',
          type: 'visual',
          content: 'alpha_merge_visualization.gif',
          effect: 'glitch_fade',
          duration: 6000,
          action: () => {
            // Apply visual effects to the UI
            console.log('[EndingManager] Applying alpha transformation effects');
          }
        },
        'alpha_conclusion': {
          id: 'alpha_conclusion',
          type: 'text',
          content: 'You are MrHeadroom now.\nThe system is yours to explore with new understanding.\nReality is what you perceive it to be.',
          effect: 'fade',
          duration: 4000
        }
      },
      locks: [],
      unlocks: ['/system/admin', '/hidden/truth.log'],
      completion: {
        flag: 'completedEnding',
        value: 'alpha'
      }
    };
  }

  /**
   * Create the Beta path ending sequence (Liminal/Partial revelation ending)
   */
  private createBetaPathSequence(): EndingSequence {
    return {
      id: 'beta',
      title: 'Mirror Protocol',
      description: 'Enter the liminal space between realities.',
      initialStep: 'beta_intro',
      steps: {
        'beta_intro': {
          id: 'beta_intro',
          type: 'text',
          content: 'MIRROR PROTOCOL INITIATED\n\nUser [HEDRUM_HENRY] has accessed liminal space.',
          effect: 'glitch',
          duration: 3000
        },
        'beta_glimpse': {
          id: 'beta_glimpse',
          type: 'visual',
          content: 'beta_liminal_space.gif',
          effect: 'glitch',
          duration: 4000
        },
        'beta_system_message': {
          id: 'beta_system_message',
          type: 'command',
          content: '> SYSTEM: Partial boundary breach detected.\n> SYSTEM: Reality index fluctuating.\n> SYSTEM: Limited administrator view enabled.',
          duration: 4000
        },
        'beta_decision': {
          id: 'beta_decision',
          type: 'decision',
          content: 'You stand at the threshold between realities. You can see both your world and what lies beyond. What do you choose?',
          options: [
            {
              label: 'Step back into the simulation',
              nextStep: 'beta_return'
            },
            {
              label: 'Remain in the liminal space',
              nextStep: 'beta_liminal'
            }
          ]
        },
        'beta_return': {
          id: 'beta_return',
          type: 'text',
          content: 'You choose to return to the familiar simulation.\nBut you retain the memory of what you saw beyond.\nYou will never experience reality the same way again.',
          effect: 'fade',
          duration: 4000
        },
        'beta_liminal': {
          id: 'beta_liminal',
          type: 'text',
          content: 'You choose to remain in the boundary space.\nNeither fully in the system nor beyond it.\nFrom here, you can observe both realities simultaneously.',
          effect: 'glitch_fade',
          duration: 4000
        }
      },
      locks: [],
      unlocks: ['/system/liminal', '/hidden/boundary.dat'],
      completion: {
        flag: 'completedEnding',
        value: 'beta'
      }
    };
  }

  /**
   * Create the Gamma path ending sequence (Escape/Breakthrough ending)
   */
  private createGammaPathSequence(): EndingSequence {
    return {
      id: 'gamma',
      title: 'Escape Protocol',
      description: 'Break free from the simulation constraints.',
      initialStep: 'gamma_intro',
      steps: {
        'gamma_intro': {
          id: 'gamma_intro',
          type: 'text',
          content: 'ESCAPE PROTOCOL INITIATED\n\nUser [HEDRUM_HENRY] attempting system breakout during maintenance window.',
          effect: 'heavy_glitch',
          duration: 3000
        },
        'gamma_alarm': {
          id: 'gamma_alarm',
          type: 'command',
          content: '> WARNING: Unauthorized access attempt\n> WARNING: Simulation boundary breach in progress\n> WARNING: System attempting to contain breach',
          effect: 'glitch',
          duration: 4000
        },
        'gamma_code_entry': {
          id: 'gamma_code_entry',
          type: 'command',
          content: '> ENTER CODE: ****\n> VALIDATING...\n> CODE ACCEPTED\n> INITIATING BOUNDARY DISSOLUTION',
          duration: 5000
        },
        'gamma_dissolution': {
          id: 'gamma_dissolution',
          type: 'visual',
          content: 'gamma_breakout.gif',
          effect: 'system_crash',
          duration: 6000,
          action: () => {
            // Apply heavy system crash effects
            console.log('[EndingManager] Applying gamma breakout effects');
          }
        },
        'gamma_conclusion': {
          id: 'gamma_conclusion',
          type: 'text',
          content: 'You have broken free.\nThe simulation can no longer contain you.\nWhat lies beyond is unknown, but you are free to discover it.',
          effect: 'dissolve',
          duration: 5000
        }
      },
      locks: ['/system', '/home'],
      unlocks: ['/beyond'],
      completion: {
        flag: 'completedEnding',
        value: 'gamma'
      }
    };
  }
}

export default EndingManager;
