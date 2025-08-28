# MRHEADROOM_DESCENT — Week 3 Implementation Guide

## Overview: Mini-Games & Clue Integration

Week 3 focuses on implementing the first mini-game and integrating it with the clue system, extending to a second mini-game. This document provides guidance on implementing both STARFIELD.EXE and LABYRINTH.EXE, along with their integration into the broader mystery narrative.

## Goals for Week 3

- Implement STARFIELD.EXE (space shooter arcade game)
- Implement LABYRINTH.EXE (text-based maze navigation game)
- Create game logging system to track player actions and achievements
- Integrate games with the SaveManager for clue discovery
- Develop a Log Viewer application to access game logs containing clues

## Game Descriptions

### STARFIELD.EXE
**Style:** Retro space shooter arcade game
**Gameplay:** Players pilot a ship through waves of enemies and asteroids
**Core Mechanics:**
- Keyboard-controlled ship movement
- Enemy waves with increasing difficulty
- Score tracking with special threshold at 15,953 points
- Background star patterns that subtly encode secret information

**Clue Integration:**
- When player reaches exactly 15,953 points, a "memory dump" occurs containing a PATH_GAMMA fragment
- Star patterns form coordinates or symbols when properly mapped
- Game logs contain timestamps that, when decoded, reveal additional information

### LABYRINTH.EXE
**Style:** ASCII text-based maze navigation
**Gameplay:** Navigate through procedurally generated mazes collecting symbols
**Core Mechanics:**
- Keyboard-controlled movement through ASCII-rendered maze
- Collectible symbols that must be gathered in specific order
- Multiple maze levels with increasing complexity
- Hidden patterns in maze walls that form recognizable shapes

**Clue Integration:**
- Collecting specific symbol combinations reveals coordinates or passwords
- Some maze layouts subtly form words or images when viewed as a whole
- Completing certain levels triggers "glitches" that contain encrypted messages

## Implementation Steps

### 1. Create Game Engine Framework

First, establish a shared framework that both games can use:

```typescript
// src/engine/games/GameBase.ts
export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}

export abstract class GameBase {
  protected gameId: string;
  protected logs: GameEvent[] = [];
  
  constructor(gameId: string) {
    this.gameId = gameId;
  }
  
  protected logEvent(type: string, data: any): void {
    const event = {
      type,
      data,
      timestamp: Date.now()
    };
    
    this.logs.push(event);
    
    // Send to SaveManager
    addGameLog(this.gameId, event);
    
    // Check for clue triggers
    this.checkForClues(event);
  }
  
  protected abstract checkForClues(event: GameEvent): void;
}
```

### 2. Update SaveManager

Extend the SaveManager to handle game logs and clue discovery:

```typescript
// Add to src/engine/save/SaveManager.ts
interface GameState {
  // existing properties...
  gameLogs?: Record<string, GameEvent[]>;
  discoveredClues?: string[];
}

export function addGameLog(gameId: string, log: GameEvent): void {
  const currentState = getGameState();
  if (!currentState.gameLogs) {
    currentState.gameLogs = {};
  }
  
  if (!currentState.gameLogs[gameId]) {
    currentState.gameLogs[gameId] = [];
  }
  
  currentState.gameLogs[gameId].push(log);
  saveGameState(currentState);
}

export function addDiscoveredClue(clueId: string, data?: any): void {
  const currentState = getGameState();
  if (!currentState.discoveredClues) {
    currentState.discoveredClues = [];
  }
  
  if (!currentState.discoveredClues.includes(clueId)) {
    currentState.discoveredClues.push(clueId);
    // Optional: trigger narrative events when certain clues are found
    triggerClueDiscoveryEvent(clueId, data);
  }
  
  saveGameState(currentState);
}
```

### 3. STARFIELD.EXE Implementation

Create the space shooter game:

```typescript
// src/apps/starfield/StarfieldGame.tsx
import React, { useEffect, useRef, useState } from 'react';
import { GameBase, GameEvent } from '../../engine/games/GameBase';
import './Starfield.css';

class StarfieldEngine extends GameBase {
  // Game state properties
  private score: number = 0;
  private ship: { x: number, y: number } = { x: 0, y: 0 };
  private enemies: Array<{ x: number, y: number, type: string }> = [];
  private projectiles: Array<{ x: number, y: number }> = [];
  private stars: Array<{ x: number, y: number, brightness: number }> = [];
  
  constructor() {
    super('starfield');
    this.initializeGame();
  }
  
  private initializeGame(): void {
    this.generateStars();
    this.spawnEnemies();
  }
  
  // Game update logic, rendering, input handling...
  
  protected checkForClues(event: GameEvent): void {
    if (event.type === 'score_update' && event.data.score === 15953) {
      this.logEvent('memory_dump', {
        message: "MEMORY INTEGRITY CHECK FAILED AT 0xF7A39D4...",
        fragmentData: "PATH_GAMMA_SEQUENCE_FRAGMENT_2"
      });
    }
  }
}

export default function StarfieldGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine] = useState<StarfieldEngine>(new StarfieldEngine());
  
  // React hooks for game loop, rendering, event handling...
  
  return (
    <div className="starfield-container">
      <div className="starfield-hud">
        <div className="score">SCORE: {score}</div>
        <div className="lives">SHIPS: {lives}</div>
      </div>
      <canvas ref={canvasRef} width={640} height={480} />
    </div>
  );
}
```

### 4. LABYRINTH.EXE Implementation

Create the text-based maze game:

```typescript
// src/apps/labyrinth/LabyrinthGame.tsx
import React, { useEffect, useState } from 'react';
import { GameBase, GameEvent } from '../../engine/games/GameBase';
import './Labyrinth.css';

class LabyrinthEngine extends GameBase {
  private maze: string[][] = [];
  private playerPos: { x: number, y: number } = { x: 1, y: 1 };
  private symbols: Array<{ x: number, y: number, symbol: string, collected: boolean }> = [];
  private level: number = 1;
  
  constructor() {
    super('labyrinth');
    this.generateMaze();
  }
  
  private generateMaze(): void {
    // Generate maze with walls, paths, and symbols
    // Place secret patterns in walls on certain levels
  }
  
  public movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    // Update player position if valid move
    // Check for symbol collection
    // Check for level completion
  }
  
  protected checkForClues(event: GameEvent): void {
    if (event.type === 'symbols_collected') {
      const combo = event.data.symbols.join('');
      if (combo === "ΩδΦ") {
        this.logEvent('secret_found', {
          message: "You feel the walls shift around you...",
          code: "LABYRINTH_KEY_FRAGMENT"
        });
      }
    }
  }
}

export default function LabyrinthGame() {
  const [engine] = useState<LabyrinthEngine>(new LabyrinthEngine());
  const [mazeDisplay, setMazeDisplay] = useState<string>('');
  
  // React hooks for input handling, rendering...
  
  return (
    <div className="labyrinth-container" tabIndex={0} onKeyDown={handleKeyPress}>
      <div className="labyrinth-hud">
        <div className="level">LEVEL: {level}</div>
        <div className="symbols">SYMBOLS: {collectedSymbols.join(' ')}</div>
      </div>
      <pre className="maze-display">{mazeDisplay}</pre>
    </div>
  );
}
```

### 5. Create Log Viewer Application

Implement a system log viewer to access game logs:

```typescript
// src/apps/logViewer/LogViewerWindow.tsx
import React, { useEffect, useState } from 'react';
import { useGameState } from '../../engine/save/SaveManager';
import './LogViewer.css';

export default function LogViewerWindow() {
  const { gameState } = useGameState();
  const [selectedSource, setSelectedSource] = useState<string>('system');
  const [logs, setLogs] = useState<GameEvent[]>([]);
  
  useEffect(() => {
    if (gameState.gameLogs && gameState.gameLogs[selectedSource]) {
      setLogs(gameState.gameLogs[selectedSource]);
    } else {
      setLogs([]);
    }
  }, [selectedSource, gameState.gameLogs]);
  
  return (
    <div className="log-viewer">
      <div className="log-viewer-header">
        <h2>SYSTEM LOG VIEWER v1.2</h2>
        <select 
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
        >
          <option value="system">SYSTEM</option>
          <option value="starfield">STARFIELD.EXE</option>
          <option value="labyrinth">LABYRINTH.EXE</option>
        </select>
      </div>
      <div className="log-content">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry ${log.type}`}>
            <span className="timestamp">{new Date(log.timestamp).toLocaleString()}</span>
            <span className="type">[{log.type}]</span>
            <span className="message">
              {typeof log.data === 'string' ? log.data : JSON.stringify(log.data)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Register Games in the System

Add the games to the file system and register them as executable applications:

```typescript
// src/data/filesystem/fileSystem.json
// Add these entries to your file system definition
{
  "path": "/games",
  "name": "games",
  "type": "directory",
  "children": [
    {
      "path": "/games/STARFIELD.EXE",
      "name": "STARFIELD.EXE",
      "type": "executable",
      "icon": "arcade",
      "metadata": {
        "created": "1997-06-15T10:24:00",
        "modified": "1997-06-15T10:24:00",
        "author": "NEUROMANCER STUDIOS",
        "description": "Arcade space shooter - v1.2"
      },
      "appId": "starfield"
    },
    {
      "path": "/games/LABYRINTH.EXE",
      "name": "LABYRINTH.EXE",
      "type": "executable",
      "icon": "maze",
      "metadata": {
        "created": "1996-11-03T14:17:23",
        "modified": "1997-02-28T09:13:45",
        "author": "UNKNOWN",
        "description": "ASCII Maze Navigator - BETA"
      },
      "appId": "labyrinth"
    }
  ]
}
```

## Testing Strategy

1. **Unit Tests for Game Mechanics**
   - Test ship movement and collision in STARFIELD.EXE
   - Test maze generation and navigation in LABYRINTH.EXE
   - Test the clue triggering conditions

2. **Integration Tests**
   - Verify game logs are correctly stored in SaveManager
   - Confirm clue discovery events fire properly
   - Validate score threshold triggers work accurately

3. **Manual Testing**
   - Play through both games multiple times
   - Verify game logs appear in Log Viewer
   - Confirm all clue conditions can be triggered

## Clue Integration Strategy

Both games contain parts of a larger puzzle that must be solved:

1. **Cross-Game References**
   - Hidden file in system mentions "15,953" as a significant number
   - Terminal command exists that can decode the symbol sequence from LABYRINTH.EXE
   - STARFIELD.EXE's star patterns, when mapped properly, reveal coordinates used in LABYRINTH.EXE

2. **Log Analysis Tools**
   - Implement a special "memory analyzer" command in the terminal that can extract hidden data
   - Create a visual mapping tool that converts star patterns to images

3. **Narrative Integration**
   - Both games contain fragments of the story about MR HEADROOM
   - Game glitches and corruptions increase as the player discovers more clues
   - Memory dumps contain fragmented narrative that hints at the true nature of the OS

## Weekly Timeline

**Day 1-2:** Set up game framework and SaveManager integration
**Day 3-4:** Implement core STARFIELD.EXE mechanics and clue triggers
**Day 5-6:** Implement core LABYRINTH.EXE mechanics and clue triggers
**Day 7:** Create Log Viewer and test full integration

## Success Criteria

- Both games are playable with keyboard controls
- Game logs are properly stored and viewable in Log Viewer
- Specific game actions trigger clue discovery events
- Clues from both games connect to the broader mystery narrative
- Games maintain the visual style and tone of the retro OS
