/**
 * RedHerringSystem.test.ts
 * Tests for the RedHerringSystem class
 */

import { RedHerringSystem, RedHerring } from '../src/engine/mystery/RedHerringSystem';
import { MysteryEngine } from '../src/engine/mystery/MysteryEngine';
import * as SaveManager from '../src/engine/save/SaveManager';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('../src/engine/mystery/MysteryEngine', () => {
  return {
    MysteryEngine: {
      getInstance: jest.fn().mockReturnValue({
        discoverClue: jest.fn(),
        getDiscoveredClues: jest.fn().mockReturnValue([])
      })
    }
  };
});

jest.mock('../src/engine/save/SaveManager', () => {
  return {
    addGameLog: jest.fn()
  };
});

// Mock the clues data structure
jest.mock('../src/data/clues', () => {
  return {
    clues: {
      'false_lead_001': {
        id: 'false_lead_001',
        title: 'Suspicious Activity',
        description: 'Evidence of unusual system access',
        isRedHerring: true,
        displayType: 'important',
        relatedFiles: ['/var/log/suspicious.log']
      },
      'false_security_002': {
        id: 'false_security_002',
        title: 'Security Breach',
        description: 'Potential security breach detected',
        isRedHerring: true,
        displayType: 'normal',
        relatedFiles: ['/etc/security/breach.log']
      },
      'false_lead_003': {
        id: 'false_lead_003',
        title: 'Hidden Message',
        description: 'Encoded message found in system files',
        isRedHerring: true,
        displayType: 'important',
        relatedFiles: ['/usr/share/encoded.bin']
      },
      'reality_006': {
        id: 'reality_006',
        title: 'Reality Glitch',
        description: 'Evidence of reality manipulation',
        isRedHerring: false
      }
    }
  };
});

describe('RedHerringSystem', () => {
  let redHerringSystem: RedHerringSystem;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton
    (RedHerringSystem as any).instance = null;
    redHerringSystem = RedHerringSystem.getInstance();
  });
  
  it('should be a singleton', () => {
    const instance1 = RedHerringSystem.getInstance();
    const instance2 = RedHerringSystem.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  it('should initialize red herrings from clues', () => {
    const allHerrings = redHerringSystem.getAllRedHerrings();
    expect(allHerrings.length).toBeGreaterThan(0);
    expect(allHerrings.some(h => h.clueId === 'false_lead_001')).toBe(true);
  });
  
  it('should correctly identify red herrings', () => {
    expect(redHerringSystem.isRedHerring('false_lead_001')).toBe(true);
    expect(redHerringSystem.isRedHerring('reality_006')).toBe(false);
  });
  
  it('should expose a red herring', () => {
    // Expose a red herring
    const result = redHerringSystem.exposeRedHerring('false_lead_001');
    
    // Verify it was exposed
    expect(result).toBe(true);
    expect(redHerringSystem.isRedHerringExposed('false_lead_001')).toBe(true);
    
    // Verify a log was added
    expect(SaveManager.addGameLog).toHaveBeenCalled();
  });
  
  it('should not expose an already exposed red herring', () => {
    // Expose it once
    redHerringSystem.exposeRedHerring('false_lead_001');
    
    // Reset mock
    jest.clearAllMocks();
    
    // Try to expose again
    const result = redHerringSystem.exposeRedHerring('false_lead_001');
    
    // Verify it didn't do anything new
    expect(result).toBe(false);
    expect(SaveManager.addGameLog).not.toHaveBeenCalled();
  });
  
  it('should calculate red herring exposure percentage', () => {
    // Initially no red herrings are exposed
    expect(redHerringSystem.getRedHerringExposurePercentage()).toBe(0);
    
    // Expose one red herring
    redHerringSystem.exposeRedHerring('false_lead_001');
    
    // Get total count
    const totalCount = redHerringSystem.getTotalRedHerrings();
    
    // Verify percentage
    expect(redHerringSystem.getRedHerringExposurePercentage()).toBe(1 / totalCount * 100);
  });
  
  it('should discover a clue when exposing a special red herring', () => {
    // Process the exposure of a red herring that reveals a clue
    const result = redHerringSystem.processRedHerringExposure('false_lead_003');
    
    // Verify it was successful
    expect(result).toBe(true);
    
    // Verify the clue was discovered
    expect(MysteryEngine.getInstance().discoverClue).toHaveBeenCalledWith('reality_006');
  });
  
  it('should get red herrings by target ending path', () => {
    // Expose the result of getRedHerringsForPath
    const gammaHerrings = redHerringSystem.getRedHerringsForPath('gamma');
    
    // Expect at least one (false_security_002 should target gamma based on our logic)
    expect(gammaHerrings.some(h => h.clueId === 'false_security_002')).toBe(true);
  });
});

export {};
