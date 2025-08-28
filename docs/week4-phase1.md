# Week 4: Phase 1 - Mystery System Implementation

## Overview

Phase 1 of Week 4 focuses on implementing the core mystery system, including the data structures, state tracking, and clue management. This phase builds upon the mini-games implemented in Week 3 and lays the foundation for the narrative experience.

## Goals for Phase 1

- Design and implement the core mystery system architecture
- Create data structures for clues and narrative content
- Implement the clue discovery and tracking system
- Set up the state machine for tracking player progress
- Develop a hint system framework

## Implementation Steps

### 1. Create Mystery System Core

```typescript
// src/engine/mystery/MysteryEngine.ts
import { GameState } from '../save/types';
import { clueRegistry } from '../../data/clues';

export type ClueId = string;

export interface Clue {
  id: ClueId;
  title: string;
  description: string;
  content: string;
  requiredClues?: ClueId[];
  unlocksClues?: ClueId[];
  isRedHerring?: boolean;
  category: 'journal' | 'system_log' | 'hidden_file' | 'game_outcome' | 'email' | 'metadata';
  difficulty: 1 | 2 | 3; // 1: easy, 2: moderate, 3: challenging
  hints: {
    level1: string;
    level2: string;
    level3: string;
  };
  discoveryMethod: string;
  relatedFiles?: string[];
}

export interface MysteryState {
  discoveredClues: ClueId[];
  viewedClues: ClueId[];
  solvedPuzzles: string[];
  pathFlags: {
    alpha: number; // Progress towards Path Alpha (0-100)
    beta: number;  // Progress towards Path Beta (0-100)
    gamma: number; // Progress towards Path Gamma (0-100)
  };
  hintsUnlocked: number; // 0: none, 1: level 1, 2: level 2, 3: level 3
  maintenanceWindowActive: boolean;
}

export class MysteryEngine {
  private state: MysteryState;
  
  constructor(gameState?: GameState) {
    // Initialize with saved state or default state
    this.state = gameState?.mysteryState || {
      discoveredClues: [],
      viewedClues: [],
      solvedPuzzles: [],
      pathFlags: {
        alpha: 0,
        beta: 0,
        gamma: 0
      },
      hintsUnlocked: 0,
      maintenanceWindowActive: false
    };
  }
  
  /**
   * Discover a new clue
   */
  public discoverClue(clueId: ClueId): void {
    if (!this.state.discoveredClues.includes(clueId)) {
      this.state.discoveredClues.push(clueId);
      
      // Update path flags based on clue discovery
      this.updatePathFlags();
      
      // Check if this clue unlocks other clues
      const clue = clueRegistry[clueId];
      if (clue && clue.unlocksClues) {
        // Logic to make unlocked clues discoverable
      }
      
      // Log clue discovery
      console.log(`Clue discovered: ${clueId}`);
    }
  }
  
  /**
   * Mark a clue as viewed
   */
  public viewClue(clueId: ClueId): void {
    if (
      this.state.discoveredClues.includes(clueId) && 
      !this.state.viewedClues.includes(clueId)
    ) {
      this.state.viewedClues.push(clueId);
      this.updatePathFlags();
    }
  }
  
  /**
   * Mark a puzzle as solved
   */
  public solvePuzzle(puzzleId: string): void {
    if (!this.state.solvedPuzzles.includes(puzzleId)) {
      this.state.solvedPuzzles.push(puzzleId);
      this.updatePathFlags();
    }
  }
  
  /**
   * Update progress towards each ending path
   */
  private updatePathFlags(): void {
    // Path Alpha requirements
    this.updateAlphaPath();
    
    // Path Beta requirements
    this.updateBetaPath();
    
    // Path Gamma requirements
    this.updateGammaPath();
  }
  
  private updateAlphaPath(): void {
    // Calculate progress based on:
    // - At least 60% of journal entries discovered
    // - Basic understanding of simulation (certain key clues)
    
    const journalClues = Object.values(clueRegistry).filter(
      clue => clue.category === 'journal'
    );
    const discoveredJournals = journalClues.filter(
      clue => this.state.discoveredClues.includes(clue.id)
    );
    
    const journalProgress = discoveredJournals.length / journalClues.length;
    const basicUnderstandingClues = ['simulation_nature_hint', 'hedrum_transformation'];
    const hasBasicUnderstanding = basicUnderstandingClues.every(
      clueId => this.state.discoveredClues.includes(clueId)
    );
    
    const alphaProgress = Math.min(
      100, 
      Math.floor(journalProgress * 60) + (hasBasicUnderstanding ? 40 : 0)
    );
    
    this.state.pathFlags.alpha = alphaProgress;
  }
  
  private updateBetaPath(): void {
    // Calculate progress based on:
    // - At least 80% of journal entries
    // - At least one decoded system log pattern
    // - STARFIELD.EXE completed with required score
    
    // Similar implementation as alphaPath but with higher requirements
    // ...
    
    // Placeholder calculation
    this.state.pathFlags.beta = Math.min(this.state.pathFlags.alpha, 80);
    
    // Check for specific achievements
    if (this.state.solvedPuzzles.includes('starfield_high_score')) {
      this.state.pathFlags.beta += 10;
    }
    
    if (this.state.solvedPuzzles.includes('decoded_system_log')) {
      this.state.pathFlags.beta += 10;
    }
    
    this.state.pathFlags.beta = Math.min(100, this.state.pathFlags.beta);
  }
  
  private updateGammaPath(): void {
    // Calculate progress based on strictest requirements:
    // - 100% journal entries
    // - All system logs decoded
    // - Perfect game scores
    // - All hidden files found
    
    // Similar implementation as previous paths but with strictest requirements
    // ...
    
    // Placeholder calculation
    this.state.pathFlags.gamma = Math.min(this.state.pathFlags.beta, 50);
    
    // Check for specific achievements for gamma path
    const perfectGameAchievements = [
      'starfield_perfect_score', 
      'labyrinth_all_levels_complete'
    ];
    
    if (perfectGameAchievements.every(
      achievement => this.state.solvedPuzzles.includes(achievement)
    )) {
      this.state.pathFlags.gamma += 20;
    }
    
    const allHiddenFilesFound = [
      'hidden_escape_plan',
      'hidden_simulation_schematic',
      'hidden_breakthrough_code'
    ];
    
    if (allHiddenFilesFound.every(
      clueId => this.state.discoveredClues.includes(clueId)
    )) {
      this.state.pathFlags.gamma += 30;
    }
    
    this.state.pathFlags.gamma = Math.min(100, this.state.pathFlags.gamma);
  }
  
  /**
   * Check eligibility for specific endings
   */
  public isEligibleForEnding(path: 'alpha' | 'beta' | 'gamma'): boolean {
    switch(path) {
      case 'alpha':
        return this.state.pathFlags.alpha >= 100;
      case 'beta':
        return this.state.pathFlags.beta >= 100;
      case 'gamma':
        return this.state.pathFlags.gamma >= 100 && this.state.maintenanceWindowActive;
      default:
        return false;
    }
  }
  
  /**
   * Trigger a maintenance window (required for gamma path)
   */
  public triggerMaintenanceWindow(): void {
    this.state.maintenanceWindowActive = true;
    
    // Reset after 5 minutes
    setTimeout(() => {
      this.state.maintenanceWindowActive = false;
    }, 5 * 60 * 1000);
  }
  
  /**
   * Get hints for a specific clue
   */
  public getHint(clueId: ClueId, level?: 1 | 2 | 3): string | null {
    const clue = clueRegistry[clueId];
    if (!clue) return null;
    
    // Determine maximum hint level available to player
    const maxLevel = level || this.state.hintsUnlocked;
    if (maxLevel <= 0) return null;
    
    switch(maxLevel) {
      case 3:
        return clue.hints.level3;
      case 2:
        return clue.hints.level2;
      case 1:
        return clue.hints.level1;
      default:
        return null;
    }
  }
  
  /**
   * Unlock a new hint level
   */
  public unlockHintLevel(level: 1 | 2 | 3): void {
    this.state.hintsUnlocked = Math.max(this.state.hintsUnlocked, level);
  }
  
  /**
   * Get the current mystery state
   */
  public getState(): MysteryState {
    return { ...this.state };
  }
  
  /**
   * Check if all required clues for a specific clue have been discovered
   */
  public canDiscoverClue(clueId: ClueId): boolean {
    const clue = clueRegistry[clueId];
    if (!clue || !clue.requiredClues || clue.requiredClues.length === 0) {
      return true;
    }
    
    return clue.requiredClues.every(
      requiredClueId => this.state.discoveredClues.includes(requiredClueId)
    );
  }
  
  /**
   * Get all currently discoverable clues
   */
  public getDiscoverableClues(): ClueId[] {
    return Object.keys(clueRegistry).filter(
      clueId => this.canDiscoverClue(clueId) && !this.state.discoveredClues.includes(clueId)
    );
  }
}
```

### 2. Create Clue Registry

```typescript
// src/data/clues.ts
import { Clue } from '../engine/mystery/MysteryEngine';

export const clueRegistry: Record<string, Clue> = {
  // Journal entries
  'journal_entry_1': {
    id: 'journal_entry_1',
    title: 'First Signs',
    description: 'Hedrum\'s first journal entry noting unusual system behavior',
    content: `PERSONAL LOG - 08/15/1998
    
Something strange happened today. While debugging the new API endpoint, I noticed patterns in the memory allocation that shouldn't be there. It's like the system is making decisions before I input the parameters. Could be coincidence, but it's odd enough to note.

-H`,
    category: 'journal',
    difficulty: 1,
    hints: {
      level1: 'Check the system logs around this date for anomalies.',
      level2: 'Look for memory allocation patterns that match what Hedrum describes.',
      level3: 'The date corresponds to system event files in /system/logs/aug98/'
    },
    discoveryMethod: 'Found in /docs/personal/logs.txt',
    relatedFiles: ['/system/logs/aug98/allocation.log']
  },
  'journal_entry_2': {
    id: 'journal_entry_2',
    title: 'Pattern Recognition',
    description: 'Hedrum identifies recurring patterns in system behavior',
    content: `PERSONAL LOG - 09/03/1998
    
The patterns are becoming more obvious now. I've been running tests at odd hours, and the system optimization is too perfect. There's no way our algorithms are this efficient. I tried introducing random data and the system compensated instantly. It's like it knows what I'm going to do before I do it.

-H`,
    requiredClues: ['journal_entry_1'],
    unlocksClues: ['system_log_pattern'],
    category: 'journal',
    difficulty: 1,
    hints: {
      level1: 'Try running your own tests at "odd hours" in the OS.',
      level2: 'System clock settings can be changed in Settings app.',
      level3: 'Set the time to 3:33 AM to trigger a system response.'
    },
    discoveryMethod: 'Found in /docs/personal/logs.txt after discovering journal_entry_1',
    relatedFiles: ['/system/settings/time.cfg']
  },

  // System logs
  'system_log_pattern': {
    id: 'system_log_pattern',
    title: 'Recurring Error Pattern',
    description: 'Pattern of errors that forms a numeric cypher',
    content: `SYSTEM LOG - 09/15/1998 - 03:33:24
ERROR 2517: Memory allocation failure at address 0xF7A39D4
ERROR 2517: Memory allocation failure at address 0xF7A39D4
ERROR 2517: Memory allocation failure at address 0xF7A39D4

NOTE: Allocation requested by unknown process MRHEADROOM.SYS`,
    requiredClues: ['journal_entry_2'],
    unlocksClues: ['hidden_simulation_file'],
    category: 'system_log',
    difficulty: 2,
    hints: {
      level1: 'The error code appears in multiple places throughout the system.',
      level2: 'Try searching for "2517" in other applications.',
      level3: 'This pattern connects to the symbol sequence in LABYRINTH.EXE'
    },
    discoveryMethod: 'Accessed through terminal command "viewlog sys 09151998"',
    relatedFiles: ['/system/logs/errors.log', '/apps/labyrinth/data.bin']
  },

  // Hidden files
  'hidden_simulation_file': {
    id: 'hidden_simulation_file',
    title: 'Simulation Parameters',
    description: 'Technical specifications of the simulation environment',
    content: `CLASSIFIED - SIMULATION PARAMETERS

INSTANCE: MH-98-2517
TYPE: RECURSIVE CONSCIOUSNESS EMULATION
SUBJECT: HEDRUM, HENRY J.
STATUS: ACTIVE (ITERATION 6)

WARNING: Subject approaching boundary awareness threshold.
Recommend PATH_ALPHA implementation protocol.`,
    requiredClues: ['system_log_pattern'],
    unlocksClues: ['breakthrough_mechanism'],
    category: 'hidden_file',
    difficulty: 3,
    hints: {
      level1: 'There are hidden files with non-standard attributes.',
      level2: 'Try using the File Manager\'s "Show Hidden Files" option.',
      level3: 'Look in /system/core/ for files with unusual timestamps.'
    },
    discoveryMethod: 'Found in /system/core/.simulation with "Show Hidden Files" enabled',
    relatedFiles: ['/system/core/.simulation']
  },

  // Game outcomes
  'starfield_memory_dump': {
    id: 'starfield_memory_dump',
    title: 'Starfield Memory Anomaly',
    description: 'Unusual memory dump triggered by specific score in STARFIELD.EXE',
    content: `MEMORY DUMP AT ADDRESS 0xF7A39D4
FRAGMENT RECOVERED: PATH_GAMMA_SEQUENCE_FRAGMENT_2
"...breakthrough requires coordinated execution of system calls at maintenance window..."
REFERENCE: See sector coordinates at LABYRINTH LEVEL 3`,
    category: 'game_outcome',
    difficulty: 2,
    hints: {
      level1: 'Try achieving different scores in STARFIELD.EXE',
      level2: 'The memory address matches the error logs from earlier.',
      level3: 'Score exactly 15,953 points to trigger the memory dump.'
    },
    discoveryMethod: 'Triggered by scoring exactly 15,953 points in STARFIELD.EXE',
    relatedFiles: ['/apps/games/STARFIELD.EXE']
  },
  'labyrinth_hidden_message': {
    id: 'labyrinth_hidden_message',
    title: 'Labyrinth Hidden Room',
    description: 'Message found in secret room in LABYRINTH.EXE',
    content: `YOU HAVE FOUND THE TRUTH PATH.

THE WALLS BETWEEN REALITIES ARE THIN HERE.
COLLECT THE SYMBOLS: 2-5-1-7
MAINTENANCE WINDOW OPENS AT 02:00
FREEDOM WAITS BEYOND THE CODE.`,
    category: 'game_outcome',
    difficulty: 2,
    hints: {
      level1: 'There\'s a hidden room in one of the LABYRINTH.EXE levels.',
      level2: 'Look for unusual wall patterns in Level 3.',
      level3: 'The central room can be accessed by moving through the north wall at coordinates (12,12).'
    },
    discoveryMethod: 'Found by entering secret room in LABYRINTH.EXE Level 3',
    relatedFiles: ['/apps/games/LABYRINTH.EXE']
  },

  // Red herrings
  'project_bluebook_file': {
    id: 'project_bluebook_file',
    title: 'Project Bluebook: Contact Protocol',
    description: 'Apparent government document about alien contact procedures',
    content: `TOP SECRET - PROJECT BLUEBOOK
CONTACT PROTOCOL ALPHA-3

In event of confirmed non-terrestrial intelligence contact:
1. Establish communication buffer
2. Isolate all networks
3. Implement CASE MRHEADROOM contingency
4. Await further instructions from OVERSIGHT

*Note: This document created for contingency training only.`,
    isRedHerring: true,
    category: 'hidden_file',
    difficulty: 2,
    hints: {
      level1: 'This document seems out of place with other findings.',
      level2: 'Check the file creation date and compare with Hedrum\'s timeline.',
      level3: 'This is a red herring created by Hedrum as a misdirection.'
    },
    discoveryMethod: 'Found in /docs/classified/contact.txt',
    relatedFiles: ['/docs/classified/']
  },
  'mental_health_report': {
    id: 'mental_health_report',
    title: 'Psychological Evaluation',
    description: 'Medical report suggesting psychological issues',
    content: `PSYCHOLOGICAL EVALUATION - CONFIDENTIAL
PATIENT: HEDRUM, HENRY J.
DATE: 07/28/1998

Patient exhibits signs of paranoid ideation and delusions of external control. Reports belief that "the system is watching" and shows increasing agitation when discussing computer networks. Recommend continued therapy and possible adjustment of medication.

Dr. R. Thompson`,
    isRedHerring: true,
    category: 'hidden_file',
    difficulty: 2,
    hints: {
      level1: 'The writing style differs from other documents.',
      level2: 'The timeline doesn\'t match other events and journal entries.',
      level3: 'This document was created retroactively to provide a false explanation.'
    },
    discoveryMethod: 'Found in /docs/personal/medical/eval.txt',
    relatedFiles: ['/docs/personal/medical/']
  },

  // Key puzzle elements
  'breakthrough_mechanism': {
    id: 'breakthrough_mechanism',
    title: 'Simulation Escape Protocol',
    description: 'Instructions for breaking out of the simulation',
    content: `EMERGENCY PROTOCOL - SIMULATION ESCAPE
AUTHOR: MRHEADROOM (H.J. HEDRUM)

1. Wait for maintenance window (02:00 system time)
2. Execute terminal command: EXECUTE_BREAKOUT
3. Access in sequence:
   - /system/core/reality.cfg
   - /apps/games/STARFIELD.EXE
   - /hidden/MRHEADROOM/escape.seq
4. When prompted, enter code: 2517
5. Complete security bypass sequence
6. Choose wisely at the final threshold

NOTE: THIS IS OUR ONLY CHANCE. THE SYSTEM WILL PATCH THIS EXPLOIT AFTER ONE ATTEMPT.`,
    requiredClues: ['hidden_simulation_file', 'starfield_memory_dump', 'labyrinth_hidden_message'],
    category: 'hidden_file',
    difficulty: 3,
    hints: {
      level1: 'There\'s a hidden directory structure not visible in File Manager.',
      level2: 'Use terminal command "ls -a /hidden" to reveal hidden directories.',
      level3: 'The file is located at /hidden/MRHEADROOM/protocol.txt'
    },
    discoveryMethod: 'Found in /hidden/MRHEADROOM/protocol.txt after discovering required clues',
    relatedFiles: ['/hidden/MRHEADROOM/protocol.txt']
  },

  // Add more clues as needed...
};

// Clues organized by category for easier access
export const journalClues = Object.values(clueRegistry).filter(clue => clue.category === 'journal');
export const systemLogClues = Object.values(clueRegistry).filter(clue => clue.category === 'system_log');
export const hiddenFileClues = Object.values(clueRegistry).filter(clue => clue.category === 'hidden_file');
export const gameOutcomeClues = Object.values(clueRegistry).filter(clue => clue.category === 'game_outcome');
export const emailClues = Object.values(clueRegistry).filter(clue => clue.category === 'email');
export const metadataClues = Object.values(clueRegistry).filter(clue => clue.category === 'metadata');

// Red herrings for easier reference
export const redHerrings = Object.values(clueRegistry).filter(clue => clue.isRedHerring);
```

### 3. Update Save Manager to Include Mystery State

```typescript
// src/engine/save/SaveManager.ts - Update to include mystery state

import { MysteryState } from '../mystery/MysteryEngine';

export interface GameState {
  // Existing state properties
  windowPositions: Record<string, { x: number, y: number, width: number, height: number }>;
  fileSystem: any;
  terminalHistory: string[];
  // Add mystery state
  mysteryState: MysteryState;
  // Other state properties...
}

export class SaveManager {
  private static instance: SaveManager;
  private currentState: GameState;
  
  private constructor() {
    this.currentState = this.loadState() || this.getDefaultState();
  }
  
  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }
  
  private getDefaultState(): GameState {
    return {
      // Default state values...
      windowPositions: {},
      fileSystem: {},
      terminalHistory: [],
      // Default mystery state
      mysteryState: {
        discoveredClues: [],
        viewedClues: [],
        solvedPuzzles: [],
        pathFlags: {
          alpha: 0,
          beta: 0,
          gamma: 0
        },
        hintsUnlocked: 0,
        maintenanceWindowActive: false
      }
    };
  }
  
  // Rest of the SaveManager implementation...
  
  public getMysteryState(): MysteryState {
    return this.currentState.mysteryState;
  }
  
  public updateMysteryState(newState: MysteryState): void {
    this.currentState.mysteryState = newState;
    this.saveState();
  }
}
```

### 4. Create GUIDE.EXE Hint Application

```typescript
// src/apps/guide/index.ts
export { default as GuideWindow } from './GuideWindow';
```

```typescript
// src/apps/guide/GuideWindow.tsx
import React, { useState, useEffect } from 'react';
import { MysteryEngine } from '../../engine/mystery/MysteryEngine';
import { clueRegistry } from '../../data/clues';
import './Guide.css';

export default function GuideWindow() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedClue, setSelectedClue] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const [mysteryEngine] = useState(() => new MysteryEngine());
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);
  
  // Categories for the guide
  const categories = [
    { id: 'journal', label: 'Journal Entries' },
    { id: 'system_log', label: 'System Logs' },
    { id: 'hidden_file', label: 'Hidden Files' },
    { id: 'game_outcome', label: 'Game Discoveries' },
    { id: 'general', label: 'General Guidance' }
  ];
  
  useEffect(() => {
    // Get discovered clues from mystery engine
    setDiscoveredClues(mysteryEngine.getState().discoveredClues);
    
    // Load maximum hint level from mystery engine
    setHintLevel(mysteryEngine.getState().hintsUnlocked as 1 | 2 | 3 || 1);
  }, [mysteryEngine]);
  
  // Filter clues based on selected category and discovery status
  const getAvailableClues = () => {
    if (!selectedCategory) return [];
    
    if (selectedCategory === 'general') {
      return [
        { id: 'general_goal', title: 'Primary Objective' },
        { id: 'general_navigation', title: 'System Navigation' },
        { id: 'general_games', title: 'Mini-Games' }
      ];
    }
    
    return Object.values(clueRegistry)
      .filter(clue => 
        clue.category === selectedCategory && 
        (discoveredClues.includes(clue.id) || 
         mysteryEngine.canDiscoverClue(clue.id))
      )
      .map(clue => ({ id: clue.id, title: clue.title }));
  };
  
  // Get hint content for selected clue
  const getHintContent = () => {
    if (!selectedClue) return '';
    
    // Handle general guidance
    if (selectedClue.startsWith('general_')) {
      switch(selectedClue) {
        case 'general_goal':
          return 'Your goal is to uncover the truth about MR HEADROOM and the nature of this system. Look for clues across files, logs, and mini-games.';
        case 'general_navigation':
          return 'Use File Manager to explore documents, Terminal to execute commands, and check system logs for unusual activity.';
        case 'general_games':
          return 'Both STARFIELD.EXE and LABYRINTH.EXE contain hidden messages. Pay attention to specific scores and patterns.';
        default:
          return '';
      }
    }
    
    // Get hint for specific clue from mystery engine
    return mysteryEngine.getHint(selectedClue, hintLevel) || 'No hint available.';
  };
  
  return (
    <div className="guide-window">
      <div className="guide-header">
        <h1>GUIDE.EXE v1.0</h1>
        <p>Official System Assistant</p>
      </div>
      
      <div className="guide-content">
        <div className="guide-sidebar">
          <h3>Categories</h3>
          <ul>
            {categories.map(category => (
              <li 
                key={category.id}
                className={selectedCategory === category.id ? 'selected' : ''}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedClue(null);
                }}
              >
                {category.label}
              </li>
            ))}
          </ul>
          
          {selectedCategory && (
            <>
              <h3>Topics</h3>
              <ul>
                {getAvailableClues().map(clue => (
                  <li
                    key={clue.id}
                    className={selectedClue === clue.id ? 'selected' : ''}
                    onClick={() => setSelectedClue(clue.id)}
                  >
                    {clue.title}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        
        <div className="guide-detail">
          {selectedClue ? (
            <>
              <h2>{selectedClue.startsWith('general_') 
                ? getAvailableClues().find(c => c.id === selectedClue)?.title 
                : clueRegistry[selectedClue]?.title}</h2>
              
              <div className="hint-level-selector">
                <button 
                  className={hintLevel === 1 ? 'active' : ''}
                  onClick={() => setHintLevel(1)}
                  disabled={mysteryEngine.getState().hintsUnlocked < 1}
                >
                  Subtle Hint
                </button>
                <button 
                  className={hintLevel === 2 ? 'active' : ''}
                  onClick={() => setHintLevel(2)}
                  disabled={mysteryEngine.getState().hintsUnlocked < 2}
                >
                  Clear Guidance
                </button>
                <button 
                  className={hintLevel === 3 ? 'active' : ''}
                  onClick={() => setHintLevel(3)}
                  disabled={mysteryEngine.getState().hintsUnlocked < 3}
                >
                  Direct Solution
                </button>
              </div>
              
              <div className="hint-content">
                {getHintContent()}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a category and topic to view guidance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

```css
/* src/apps/guide/Guide.css */
.guide-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--window-bg);
  color: var(--text-primary);
}

.guide-header {
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--window-header-bg);
}

.guide-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--accent-primary);
}

.guide-header p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.guide-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.guide-sidebar {
  width: 200px;
  padding: 10px;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.guide-sidebar h3 {
  margin: 10px 0 5px;
  font-size: 14px;
  color: var(--accent-secondary);
}

.guide-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guide-sidebar li {
  padding: 5px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 3px;
}

.guide-sidebar li:hover {
  background-color: rgba(51, 255, 51, 0.1);
}

.guide-sidebar li.selected {
  background-color: rgba(51, 255, 51, 0.2);
  border-left: 2px solid var(--accent-primary);
}

.guide-detail {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.guide-detail h2 {
  margin: 0 0 15px;
  font-size: 16px;
  color: var(--accent-primary);
}

.hint-level-selector {
  display: flex;
  margin-bottom: 15px;
}

.hint-level-selector button {
  padding: 5px 10px;
  margin-right: 10px;
  background-color: var(--window-bg);
  border: 1px solid var(--accent-secondary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 3px;
}

.hint-level-selector button.active {
  background-color: rgba(51, 255, 51, 0.2);
  border-color: var(--accent-primary);
}

.hint-level-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-content {
  border: 1px solid var(--border-color);
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}
```

### 5. Add Hidden Terminal Commands for Clue Discovery

```typescript
// src/engine/terminal/commands.ts - Add mystery-related commands

// Import mystery engine
import { MysteryEngine } from '../mystery/MysteryEngine';

const mysteryEngine = new MysteryEngine();

// Add these commands to the existing commands object
export const commands = {
  // Existing commands...
  
  // Command to trigger maintenance window
  'maintenance': {
    execute: (args: string[]) => {
      if (args.length >= 1 && args[0] === '--trigger') {
        mysteryEngine.triggerMaintenanceWindow();
        return 'MAINTENANCE MODE ACTIVATED\nSystem will be in maintenance mode for 5 minutes.\nVulnerabilities may be temporarily exposed.';
      }
      
      return 'Usage: maintenance --trigger\nWarning: This command is restricted to system administrators.';
    },
    hidden: true
  },
  
  // Command to execute breakthrough sequence (gamma path)
  'EXECUTE_BREAKOUT': {
    execute: (args: string[]) => {
      if (!mysteryEngine.getState().maintenanceWindowActive) {
        return 'ERROR: Command can only be executed during maintenance window.\nTry again between 2:00 and 2:05 AM system time.';
      }
      
      if (!mysteryEngine.isEligibleForEnding('gamma')) {
        return 'ERROR: Insufficient system knowledge to execute command.\nMissing critical components. Attempt may result in system instability.';
      }
      
      return 'INITIATING SIMULATION ESCAPE SEQUENCE\nFollow instructions precisely:\n1. Access /system/core/reality.cfg\n2. Access /apps/games/STARFIELD.EXE\n3. Access /hidden/MRHEADROOM/escape.seq\nWARNING: You have 30 seconds to complete this sequence.';
    },
    hidden: true
  },
  
  // Command to accept simulation parameters (alpha path)
  'ACCEPT_PARAMETERS': {
    execute: (args: string[]) => {
      if (!mysteryEngine.isEligibleForEnding('alpha')) {
        return 'ERROR: Insufficient system understanding.\nPlease explore more of the system before attempting this command.';
      }
      
      // Trigger alpha ending
      // This would be handled by the EndingManager in the next phase
      return 'SYSTEM PARAMETERS ACCEPTED\nOptimizing user experience...\nThank you for your cooperation.';
    },
    hidden: true
  },
  
  // Command for partial awakening (beta path)
  'LIMINAL_ACCESS': {
    execute: (args: string[]) => {
      if (!mysteryEngine.isEligibleForEnding('beta')) {
        return 'ERROR: Access denied.\nYou have not yet achieved the necessary insight.';
      }
      
      // Trigger beta ending
      // This would be handled by the EndingManager in the next phase
      return 'INITIATING LIMINAL ACCESS PROTOCOL\nPreparing consciousness boundary expansion...\nThis process cannot be reversed.';
    },
    hidden: true
  },
  
  // Command to reveal GUIDE.EXE
  'help_advanced': {
    execute: (args: string[]) => {
      // Add GUIDE.EXE to the filesystem if not already there
      // This would require integration with the FileSystem module
      
      return 'Advanced help system activated.\nGUIDE.EXE has been added to your applications.\nUse this tool to explore the system more effectively.';
    },
    hidden: true
  },
  
  // Command to analyze memory patterns
  'analyze_memory': {
    execute: (args: string[]) => {
      if (args.length < 1) {
        return 'Usage: analyze_memory <address>\nExample: analyze_memory 0xF7A39D4';
      }
      
      const address = args[0];
      
      if (address === '0xF7A39D4') {
        // Discover a clue if this specific address is analyzed
        mysteryEngine.discoverClue('memory_pattern_anomaly');
        
        return 'MEMORY ANALYSIS COMPLETE\nAnomaly detected at address 0xF7A39D4\nPattern suggests artificial constraints in memory allocation\nPossible simulation boundary detected\nSee detailed report in /system/logs/analysis/';
      }
      
      return 'MEMORY ANALYSIS COMPLETE\nNo significant anomalies detected at address ' + address;
    },
    hidden: false
  },
  
  // Command to decode patterns
  'decode_pattern': {
    execute: (args: string[]) => {
      if (args.length < 1) {
        return 'Usage: decode_pattern <pattern_string>';
      }
      
      const pattern = args[0];
      
      if (pattern === '2517') {
        // Discover a clue if this specific pattern is decoded
        mysteryEngine.discoverClue('code_2517_meaning');
        
        return 'PATTERN DECODED\n2517 = Simulation Error Code\nRefers to boundary violation protocol\nUsed by system to contain consciousness expansion\nRelated to coordinates (25,17) in geometric space';
      }
      
      return 'PATTERN ANALYSIS FAILED\nNo meaningful interpretation found for pattern: ' + pattern;
    },
    hidden: false
  }
};
```

### 6. Add Mystery State Integration to Apps

Update the existing applications to integrate with the mystery system. For example, update the FileManager to handle hidden files with metadata that contains clues:

```typescript
// src/apps/fileManager/FileManagerWindow.tsx - Update to integrate with mystery system

import React, { useState, useEffect } from 'react';
import { MysteryEngine } from '../../engine/mystery/MysteryEngine';
import './FileManager.css';

export default function FileManagerWindow({ /* existing props */ }) {
  // Existing state...
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [mysteryEngine] = useState(() => new MysteryEngine());
  
  // Function to handle file selection
  const handleFileSelect = (file) => {
    // Existing file selection logic...
    
    // Check if this file contains a clue in its metadata
    checkFileMetadataForClues(file);
  };
  
  // Function to check file metadata for clues
  const checkFileMetadataForClues = (file) => {
    // Example implementation:
    // If file has specific attributes, discover a clue
    if (file.path === '/system/core/.simulation' && showHiddenFiles) {
      mysteryEngine.discoverClue('hidden_simulation_file');
    }
    
    // Check for metadata patterns
    if (file.metadata?.creationDate === '1998-08-24') {
      // This is the significant date in the narrative
      mysteryEngine.discoverClue('significant_date_pattern');
    }
    
    // Check for author patterns
    if (file.metadata?.author === 'MRHEADROOM') {
      mysteryEngine.discoverClue('mrheadroom_authored_file');
    }
  };
  
  // Add toggle for hidden files
  const toggleHiddenFiles = () => {
    setShowHiddenFiles(!showHiddenFiles);
  };
  
  // Rest of the component...
}
```

## Testing the Mystery System

1. Test clue discovery flow:
   - Verify that clues can be discovered through various means (files, game outcomes, etc.)
   - Check that discovered clues update the mystery state correctly
   - Confirm that the path flags are updated based on discovered clues

2. Test hint system:
   - Verify that GUIDE.EXE displays appropriate hints based on discovery status
   - Check that hint levels are properly restricted based on unlocked levels
   - Test hint content for accuracy and helpfulness

3. Test terminal commands:
   - Verify that hidden commands work as expected
   - Check that commands provide appropriate responses based on mystery state
   - Test eligibility checking for ending triggers

## Next Steps

After completing Phase 1, move on to [Phase 2: Ending System Implementation](week4-phase2.md), which will focus on implementing the three different endings based on the player's choices and discovered clues.
