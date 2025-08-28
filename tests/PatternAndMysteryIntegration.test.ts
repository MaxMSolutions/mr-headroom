/**
 * PatternAndMysteryIntegration.test.ts
 * 
 * Integration tests to verify that the PatternPuzzleSystem and MysteryEngine
 * are correctly integrated. These tests ensure that pattern discovery properly
 * triggers clue discovery and advances the mystery narrative.
 */

import { PatternPuzzleSystem, PatternAction } from '../src/engine/mystery/PatternPuzzleSystem';
import { MysteryEngine } from '../src/engine/mystery/MysteryEngine';

// Setup spy functions for tracking calls
const activatePatternSpy = jest.fn();
const discoverClueSpy = jest.fn();

// Mock the MysteryEngine
jest.mock('../src/engine/mystery/MysteryEngine', () => {
  return {
    MysteryEngine: {
      getInstance: jest.fn().mockReturnValue({
        activatePattern: activatePatternSpy,
        isPatternActive: jest.fn().mockImplementation((id) => id === 'already_active_pattern'),
        discoverClue: discoverClueSpy,
        isMaintenanceWindowActive: jest.fn().mockReturnValue(true),
        updatePathProgress: jest.fn()
      })
    }
  };
});

// Mock SaveManager
jest.mock('../src/engine/save/SaveManager', () => {
  return {
    addGameLog: jest.fn(),
    getGameState: jest.fn().mockReturnValue({
      discoveredClues: [],
      gameFlags: {}
    })
  };
});

describe('Pattern and Mystery System Integration', () => {
  let patternSystem: PatternPuzzleSystem;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton
    (PatternPuzzleSystem as any).instance = null;
    patternSystem = PatternPuzzleSystem.getInstance();
  });
  
  it('should discover a clue when a pattern is completed', () => {
    // Register a test pattern that rewards a clue
    const testPattern = {
      id: 'test_integration_pattern',
      type: 'sequence' as const,
      name: 'Integration Test Pattern',
      description: 'Testing pattern activation and clue discovery',
      difficulty: 'easy' as const,
      patternData: {
        sequence: ['test_action_1', 'test_action_2']
      },
      recognitionConfig: {
        requiredMatches: 2,
        tolerance: 1.0
      },
      onActivation: {
        clueId: 'test_integration_clue',
        visualEffect: 'test_effect'
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // Perform actions to complete the pattern
    const action1: PatternAction = {
      type: 'terminal_command',
      value: 'test_action_1',
      timestamp: Date.now()
    };
    
    const action2: PatternAction = {
      type: 'terminal_command',
      value: 'test_action_2',
      timestamp: Date.now() + 100
    };
    
    // Record the actions
    patternSystem.recordAction(action1);
    patternSystem.recordAction(action2);
    
    // Verify that the MysteryEngine methods were called
    expect(activatePatternSpy).toHaveBeenCalledWith('test_integration_pattern');
    expect(discoverClueSpy).toHaveBeenCalledWith('test_integration_clue');
  });
  
  it('should not re-activate patterns that are already active', () => {
    // Register a test pattern that is already active
    const testPattern = {
      id: 'already_active_pattern',
      type: 'combination' as const,
      name: 'Already Active Pattern',
      description: 'This pattern is already active',
      difficulty: 'medium' as const,
      patternData: {
        elements: ['element1', 'element2']
      },
      recognitionConfig: {
        requiredMatches: 2,
        tolerance: 1.0
      },
      onActivation: {
        clueId: 'should_not_discover_clue'
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // Perform actions that would normally complete the pattern
    patternSystem.recordAction({
      type: 'terminal_command',
      value: 'element1',
      timestamp: Date.now()
    });
    
    patternSystem.recordAction({
      type: 'terminal_command',
      value: 'element2',
      timestamp: Date.now() + 100
    });
    
    // Verify that the pattern activation and clue discovery were NOT called
    expect(activatePatternSpy).not.toHaveBeenCalledWith('already_active_pattern');
    expect(discoverClueSpy).not.toHaveBeenCalledWith('should_not_discover_clue');
  });
  
  it('should handle multiple patterns activating with the same actions', () => {
    // Register two patterns that share actions
    const pattern1 = {
      id: 'shared_action_pattern_1',
      type: 'sequence' as const,
      name: 'Shared Action Pattern 1',
      description: 'First pattern with shared action',
      difficulty: 'easy' as const,
      patternData: {
        sequence: ['shared_action']
      },
      recognitionConfig: {
        requiredMatches: 1,
        tolerance: 1.0
      },
      onActivation: {
        clueId: 'clue_1'
      }
    };
    
    const pattern2 = {
      id: 'shared_action_pattern_2',
      type: 'combination' as const,
      name: 'Shared Action Pattern 2',
      description: 'Second pattern with shared action',
      difficulty: 'easy' as const,
      patternData: {
        elements: ['shared_action']
      },
      recognitionConfig: {
        requiredMatches: 1,
        tolerance: 1.0
      },
      onActivation: {
        clueId: 'clue_2'
      }
    };
    
    patternSystem.registerPattern(pattern1);
    patternSystem.registerPattern(pattern2);
    
    // Perform the shared action
    patternSystem.recordAction({
      type: 'terminal_command',
      value: 'shared_action',
      timestamp: Date.now()
    });
    
    // Verify both patterns were activated and both clues were discovered
    expect(activatePatternSpy).toHaveBeenCalledWith('shared_action_pattern_1');
    expect(activatePatternSpy).toHaveBeenCalledWith('shared_action_pattern_2');
    expect(discoverClueSpy).toHaveBeenCalledWith('clue_1');
    expect(discoverClueSpy).toHaveBeenCalledWith('clue_2');
  });
});

export {};
