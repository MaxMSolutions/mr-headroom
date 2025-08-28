/**
 * EndingManager.test.ts
 * Tests for the EndingManager class
 */

import { EndingManager } from '../src/engine/endings/EndingManager';
import { MysteryEngine } from '../src/engine/mystery/MysteryEngine';
import * as SaveManager from '../src/engine/save/SaveManager';

// Mock dependencies
jest.mock('../src/engine/mystery/MysteryEngine', () => {
  return {
    MysteryEngine: {
      getInstance: jest.fn().mockReturnValue({
        hasDiscoveredRequiredCluesForEnding: jest.fn().mockReturnValue(true),
        getDiscoveredClues: jest.fn().mockReturnValue(['mrheadroom_001', 'reality_001']),
        isMaintenanceWindowActive: jest.fn().mockReturnValue(true),
        setMaintenanceWindowActive: jest.fn(),
        updatePathProgress: jest.fn()
      })
    }
  };
});

jest.mock('../src/engine/save/SaveManager', () => {
  return {
    getGameState: jest.fn().mockReturnValue({
      discoveredClues: ['mrheadroom_001', 'reality_001'],
      gameFlags: {
        endingPath: null
      }
    }),
    setGameFlag: jest.fn(),
    addGameLog: jest.fn()
  };
});

describe('EndingManager', () => {
  let endingManager: EndingManager;
  
  beforeEach(() => {
    jest.clearAllMocks();
    endingManager = EndingManager.getInstance();
  });
  
  it('should be a singleton', () => {
    const instance1 = EndingManager.getInstance();
    const instance2 = EndingManager.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  it('should start an ending sequence', () => {
    const result = endingManager.startEnding('alpha');
    expect(result).toBe(true);
    expect(endingManager.getCurrentEndingPath()).toBe('alpha');
    expect(SaveManager.setGameFlag).toHaveBeenCalledWith('endingPath', 'alpha');
  });
  
  it('should not start an ending if required clues are not discovered', () => {
    (MysteryEngine.getInstance() as any).hasDiscoveredRequiredCluesForEnding.mockReturnValueOnce(false);
    const result = endingManager.startEnding('gamma');
    expect(result).toBe(false);
    expect(endingManager.getCurrentEndingPath()).not.toBe('gamma');
  });
  
  it('should advance the ending sequence', () => {
    endingManager.startEnding('alpha');
    const initialStep = endingManager.getCurrentStep();
    expect(initialStep).not.toBeNull();
    
    const nextStep = endingManager.advanceSequence();
    expect(nextStep).not.toBeNull();
    expect(nextStep).not.toBe(initialStep);
  });
  
  it('should handle decision steps correctly', () => {
    // Start beta path which has a decision step
    endingManager.startEnding('beta');
    
    // Navigate to the decision step (should be the 4th step in the sequence)
    endingManager.advanceSequence(); // beta_intro
    endingManager.advanceSequence(); // beta_glimpse
    endingManager.advanceSequence(); // beta_system_message
    const decisionStep = endingManager.advanceSequence(); // beta_decision
    
    expect(decisionStep?.type).toBe('decision');
    expect(decisionStep?.options?.length).toBeGreaterThan(0);
    
    // Choose the first option
    const nextStep = endingManager.advanceSequence(decisionStep?.options?.[0].nextStep);
    expect(nextStep).not.toBeNull();
    expect(nextStep?.id).toBe(decisionStep?.options?.[0].nextStep);
  });
});

export {};
