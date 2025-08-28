# Week 3: Phase 1 - Setup & Framework

## Overview

This phase focuses on establishing the foundation for both mini-games by creating a shared game framework and integrating it with the existing save system.

## Goals

- Create a shared game engine base class
- Extend SaveManager to handle game logs and clue discovery
- Implement game event system for tracking player actions
- Design clue triggering mechanism

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

### 3. Create Game Registry

Create a registry for games that can be referenced by the WindowManager:

```typescript
// src/apps/registry/index.ts
// Add to existing registry

export const appRegistry = {
  // Existing applications...
  
  // Add game applications
  "starfield": {
    title: "STARFIELD.EXE",
    component: StarfieldWindow,
    defaultSize: { width: 650, height: 520 },
    minSize: { width: 640, height: 480 },
    icon: "arcade"
  },
  "labyrinth": {
    title: "LABYRINTH.EXE",
    component: LabyrinthWindow,
    defaultSize: { width: 600, height: 500 },
    minSize: { width: 580, height: 400 },
    icon: "maze"
  },
  "logViewer": {
    title: "System Log Viewer",
    component: LogViewerWindow,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 300 },
    icon: "log"
  }
};
```

## Testing Steps for Phase 1

1. Ensure GameBase class can properly log events
2. Verify SaveManager correctly stores and retrieves game logs
3. Test clue discovery mechanism with mock events
4. Validate game registry integration with WindowManager

## Next Steps

After completing Phase 1, move on to [Phase 2: STARFIELD.EXE Implementation](week3-phase2.md)
