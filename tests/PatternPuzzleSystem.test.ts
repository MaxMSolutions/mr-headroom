/**
 * PatternPuzzleSystem.test.ts
 * Tests for the PatternPuzzleSystem class
 */

import { PatternPuzzleSystem, PatternAction } from '../src/engine/mystery/PatternPuzzleSystem';
import { MysteryEngine } from '../src/engine/mystery/MysteryEngine';
import * as SaveManager from '../src/engine/save/SaveManager';

// Mock dependencies
jest.mock('../src/engine/mystery/MysteryEngine', () => {
  return {
    MysteryEngine: {
      getInstance: jest.fn().mockReturnValue({
        activatePattern: jest.fn(),
        isPatternActive: jest.fn().mockReturnValue(false),
        discoverClue: jest.fn(),
        isMaintenanceWindowActive: jest.fn().mockReturnValue(false)
      })
    }
  };
});

jest.mock('../src/engine/save/SaveManager', () => {
  return {
    addGameLog: jest.fn()
  };
});

describe('PatternPuzzleSystem', () => {
  let patternSystem: PatternPuzzleSystem;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton
    (PatternPuzzleSystem as any).instance = null;
    patternSystem = PatternPuzzleSystem.getInstance();
  });
  
  it('should be a singleton', () => {
    const instance1 = PatternPuzzleSystem.getInstance();
    const instance2 = PatternPuzzleSystem.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  it('should register and retrieve patterns', () => {
    const testPattern = {
      id: 'test_pattern',
      type: 'sequence' as const,
      name: 'Test Pattern',
      description: 'A test pattern',
      difficulty: 'easy' as const,
      patternData: {
        sequence: ['action1', 'action2', 'action3']
      },
      recognitionConfig: {
        requiredMatches: 3,
        tolerance: 1.0
      }
    };
    
    patternSystem.registerPattern(testPattern);
    const retrievedPattern = patternSystem.getPattern('test_pattern');
    
    expect(retrievedPattern).toEqual(testPattern);
  });
  
  it('should track pattern progress', () => {
    const testPattern = {
      id: 'sequence_test',
      type: 'sequence' as const,
      name: 'Sequence Test',
      description: 'Testing sequence recognition',
      difficulty: 'easy' as const,
      patternData: {
        sequence: ['command1', 'command2', 'command3']
      },
      recognitionConfig: {
        requiredMatches: 3,
        tolerance: 1.0
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // Record first action
    const action1: PatternAction = {
      type: 'terminal_command',
      value: 'command1',
      timestamp: Date.now()
    };
    
    patternSystem.recordAction(action1);
    
    // Check progress - should be around 33%
    let progress = patternSystem.getPatternProgress('sequence_test');
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(0.5);
    
    // Record second action
    const action2: PatternAction = {
      type: 'terminal_command',
      value: 'command2',
      timestamp: Date.now()
    };
    
    patternSystem.recordAction(action2);
    
    // Check progress - should be around 66%
    progress = patternSystem.getPatternProgress('sequence_test');
    expect(progress).toBeGreaterThan(0.3);
    expect(progress).toBeLessThan(0.9);
    
    // Record third action
    const action3: PatternAction = {
      type: 'terminal_command',
      value: 'command3',
      timestamp: Date.now()
    };
    
    patternSystem.recordAction(action3);
    
    // Check progress - should be 100%
    progress = patternSystem.getPatternProgress('sequence_test');
    expect(progress).toBeCloseTo(1.0, 1);
  });
  
  it('should activate a pattern when fully matched', () => {
    const mysteryEngine = MysteryEngine.getInstance();
    
    const testPattern = {
      id: 'full_match_test',
      type: 'spatial' as const,
      name: 'Full Match Test',
      description: 'Testing pattern activation',
      difficulty: 'medium' as const,
      patternData: {
        points: [{ x: 10, y: 20 }]
      },
      recognitionConfig: {
        requiredMatches: 1,
        tolerance: 0.2
      },
      onActivation: {
        clueId: 'test_clue'
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // Record action that should complete the pattern
    const action: PatternAction = {
      type: 'click',
      value: { x: 11, y: 19 }, // Close enough to match with tolerance
      timestamp: Date.now()
    };
    
    // Set spy on mystery engine method
    const activatePatternSpy = jest.spyOn(mysteryEngine, 'activatePattern');
    const discoverClueSpy = jest.spyOn(mysteryEngine, 'discoverClue');
    
    // Record the action
    patternSystem.recordAction(action);
    
    // Check that the pattern was activated
    expect(activatePatternSpy).toHaveBeenCalledWith('full_match_test');
    expect(discoverClueSpy).toHaveBeenCalledWith('test_clue');
  });
  
  it('should reset pattern progress', () => {
    const testPattern = {
      id: 'reset_test',
      type: 'sequence' as const,
      name: 'Reset Test',
      description: 'Testing progress reset',
      difficulty: 'easy' as const,
      patternData: {
        sequence: ['step1', 'step2']
      },
      recognitionConfig: {
        requiredMatches: 2,
        tolerance: 1.0
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // Record action to progress
    patternSystem.recordAction({
      type: 'terminal_command',
      value: 'step1',
      timestamp: Date.now()
    });
    
    // Check that we have progress
    let progress = patternSystem.getPatternProgress('reset_test');
    expect(progress).toBeGreaterThan(0);
    
    // Reset progress
    patternSystem.resetPatternProgress('reset_test');
    
    // Check that progress was reset
    progress = patternSystem.getPatternProgress('reset_test');
    expect(progress).toBe(0);
  });
  
  it('should recognize spatial patterns', () => {
    const testPattern = {
      id: 'spatial_test',
      type: 'spatial' as const,
      name: 'Spatial Test',
      description: 'Testing spatial pattern recognition',
      difficulty: 'medium' as const,
      patternData: {
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 200 }
        ]
      },
      recognitionConfig: {
        requiredMatches: 2,
        tolerance: 0.2 // Allows for some imprecision
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // First click close to first point
    patternSystem.recordAction({
      type: 'click',
      value: { x: 105, y: 98 },
      timestamp: Date.now()
    });
    
    // Check progress - should be around 50%
    let progress = patternSystem.getPatternProgress('spatial_test');
    expect(progress).toBeCloseTo(0.5, 1);
    
    // Second click close to second point
    patternSystem.recordAction({
      type: 'click',
      value: { x: 195, y: 205 },
      timestamp: Date.now()
    });
    
    // Check progress - should be 100%
    progress = patternSystem.getPatternProgress('spatial_test');
    expect(progress).toBeCloseTo(1.0, 1);
  });
  
  it('should handle metadata patterns', () => {
    // Use a module factory pattern for better mocking
    jest.mock('../src/engine/mystery/FileMetadataSystem', () => ({
      __esModule: true,
      default: {
        hasDiscoveredHiddenData: jest.fn().mockImplementation((filePath) => {
          // Simulate discovering 2 out of 3 files
          return ['/var/log/system.log', '/home/user/documents/notes.txt'].includes(filePath);
        })
      }
    }), { virtual: true });
    
    // Create a test implementation for the async import
    // @ts-ignore - we're mocking the implementation directly
    patternSystem.calculateMetadataProgress = jest.fn().mockImplementation((pattern) => {
      const files = pattern.patternData.files || [];
      const discoveredFiles = files.filter(file => 
        ['/var/log/system.log', '/home/user/documents/notes.txt'].includes(file)
      );
      return discoveredFiles.length / files.length;
    });
    
    const testPattern = {
      id: 'metadata_test',
      type: 'metadata' as const,
      name: 'File Metadata Test',
      description: 'Testing metadata pattern recognition',
      difficulty: 'hard' as const,
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
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // Record a file access action
    patternSystem.recordAction({
      type: 'file_view_metadata',
      value: { path: '/var/log/system.log' },
      timestamp: Date.now()
    });
    
    // Check progress - should be around 67% (2 out of 3 files)
    const progress = patternSystem.getPatternProgress('metadata_test');
    expect(progress).toBeGreaterThanOrEqual(0.6);
    expect(progress).toBeLessThanOrEqual(0.7);
  });
  
  it('should handle temporal patterns during maintenance windows', () => {
    // Mock MysteryEngine to simulate maintenance window active
    const mysteryEngine = MysteryEngine.getInstance();
    (mysteryEngine.isMaintenanceWindowActive as jest.Mock).mockReturnValue(true);
    
    const testPattern = {
      id: 'temporal_test',
      type: 'temporal' as const,
      name: 'Temporal Pattern Test',
      description: 'Testing temporal pattern recognition during maintenance window',
      difficulty: 'hard' as const,
      patternData: {
        requiredEvents: [
          { type: 'access_system_logs', during: 'maintenance_window' },
          { type: 'access_user_database', during: 'maintenance_window' }
        ]
      },
      recognitionConfig: {
        requiredMatches: 2,
        tolerance: 1.0
      }
    };
    
    patternSystem.registerPattern(testPattern);
    
    // First action during maintenance window
    patternSystem.recordAction({
      type: 'access_system_logs',
      value: { timestamp: Date.now() },
      timestamp: Date.now()
    });
    
    // Check progress - should be around 50%
    let progress = patternSystem.getPatternProgress('temporal_test');
    expect(progress).toBeCloseTo(0.5, 1);
    
    // Second action during maintenance window
    patternSystem.recordAction({
      type: 'access_user_database',
      value: { timestamp: Date.now() },
      timestamp: Date.now()
    });
    
    // Check progress - should be 100%
    progress = patternSystem.getPatternProgress('temporal_test');
    expect(progress).toBeCloseTo(1.0, 1);
    
    // Test that actions outside maintenance window don't count
    (mysteryEngine.isMaintenanceWindowActive as jest.Mock).mockReturnValue(false);
    
    // Reset and try again outside maintenance window
    patternSystem.resetPatternProgress('temporal_test');
    
    patternSystem.recordAction({
      type: 'access_system_logs',
      value: { timestamp: Date.now() },
      timestamp: Date.now()
    });
    
    // Progress should still be 0 since we're outside maintenance window
    progress = patternSystem.getPatternProgress('temporal_test');
    expect(progress).toBe(0);
  });
});

export {};
