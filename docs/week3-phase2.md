# Week 3: Phase 2 - STARFIELD.EXE Implementation

## Overview

This phase focuses on implementing the STARFIELD.EXE arcade-style space shooter game, including its core mechanics and clue integration.

## Game Description

**STARFIELD.EXE** is a retro space shooter where players pilot a ship through waves of enemies and asteroids. The background star patterns subtly encode secret information, and achieving specific score thresholds triggers "memory dumps" containing crucial clues.

## Core Mechanics

- Keyboard-controlled ship movement
- Enemy waves with increasing difficulty
- Score tracking with special threshold at 15,953 points
- Background star patterns that subtly encode secret information
- Lives system and power-ups

## Implementation Steps

### 1. Create Basic Game Structure

```typescript
// src/apps/starfield/index.ts
export { default as StarfieldWindow } from './StarfieldWindow';
```

```typescript
// src/apps/starfield/StarfieldWindow.tsx
import React from 'react';
import StarfieldGame from './StarfieldGame';
import './Starfield.css';

export default function StarfieldWindow() {
  return (
    <div className="starfield-window">
      <div className="starfield-header">
        <div className="title">STARFIELD v1.2</div>
        <div className="subtitle">© 1997 NEUROMANCER STUDIOS</div>
      </div>
      <StarfieldGame />
    </div>
  );
}
```

### 2. Implement Game Engine

```typescript
// src/apps/starfield/StarfieldGame.tsx
import React, { useEffect, useRef, useState } from 'react';
import { GameBase, GameEvent } from '../../engine/games/GameBase';
import './Starfield.css';

class StarfieldEngine extends GameBase {
  // Game state properties
  private score: number = 0;
  private lives: number = 3;
  private ship: { x: number, y: number } = { x: 0, y: 0 };
  private enemies: Array<{ x: number, y: number, type: string }> = [];
  private projectiles: Array<{ x: number, y: number }> = [];
  private stars: Array<{ x: number, y: number, brightness: number }> = [];
  private gameOver: boolean = false;
  
  constructor() {
    super('starfield');
    this.initializeGame();
  }
  
  private initializeGame(): void {
    this.generateStars();
    this.spawnEnemies();
    this.logEvent('game_start', { timestamp: Date.now() });
  }
  
  private generateStars(): void {
    // Generate star pattern that subtly encodes a clue
    // Stars form a pattern that when mapped resembles coordinates or a symbol
    this.stars = [];
    
    // Generate 100 random stars
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * 640,
        y: Math.random() * 480,
        brightness: Math.random() * 0.7 + 0.3
      });
    }
    
    // Add specific stars that form a pattern
    // These stars are positioned to form a recognizable shape when connected
    const patternStars = [
      { x: 120, y: 80, brightness: 1.0 },
      { x: 180, y: 120, brightness: 1.0 },
      { x: 240, y: 160, brightness: 1.0 },
      { x: 300, y: 120, brightness: 1.0 },
      { x: 360, y: 80, brightness: 1.0 },
      { x: 240, y: 240, brightness: 1.0 },
      // More stars forming a constellation
    ];
    
    this.stars.push(...patternStars);
  }
  
  private spawnEnemies(): void {
    // Spawn enemy ships based on current score and difficulty
  }
  
  public update(deltaTime: number): void {
    // Update game entities
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.checkCollisions();
  }
  
  public handleKeyPress(key: string): void {
    // Handle player input
    switch (key) {
      case 'ArrowLeft':
        this.moveShip(-1, 0);
        break;
      case 'ArrowRight':
        this.moveShip(1, 0);
        break;
      case 'ArrowUp':
        this.moveShip(0, -1);
        break;
      case 'ArrowDown':
        this.moveShip(0, 1);
        break;
      case ' ':
        this.fireProjectile();
        break;
    }
  }
  
  private updateScore(points: number): void {
    this.score += points;
    this.logEvent('score_update', { score: this.score });
    
    // Check for specific score milestones
    if (this.score === 15953) {
      this.triggerMemoryDump();
    }
  }
  
  private triggerMemoryDump(): void {
    this.logEvent('memory_dump', {
      message: "MEMORY INTEGRITY CHECK FAILED AT 0xF7A39D4...",
      fragmentData: "PATH_GAMMA_SEQUENCE_FRAGMENT_2",
      timestamp: Date.now()
    });
  }
  
  protected checkForClues(event: GameEvent): void {
    if (event.type === 'score_update' && event.data.score === 15953) {
      // This is handled by the memory dump function, but we could add
      // additional clue discovery logic here
    }
    
    if (event.type === 'game_over' && this.score > 10000) {
      this.logEvent('high_score', {
        score: this.score,
        message: "Star patterns decoded: Connection to LABYRINTH.EXE detected."
      });
    }
  }
  
  // Additional game logic...
}

export default function StarfieldGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine] = useState<StarfieldEngine>(new StarfieldEngine());
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  
  useEffect(() => {
    // Set up game loop
    let lastTime = 0;
    let animationFrameId: number;
    
    const render = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      
      // Update game state
      engine.update(deltaTime);
      
      // Update UI state
      setScore(engine.getScore());
      setLives(engine.getLives());
      
      // Render game
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        renderGame(ctx);
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    const renderGame = (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 640, 480);
      
      // Render stars
      engine.getStars().forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.fillRect(star.x, star.y, 1, 1);
      });
      
      // Render ship, enemies, projectiles...
    };
    
    // Start game loop
    animationFrameId = requestAnimationFrame(render);
    
    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.handleKeyPress(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);
  
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

### 3. Create CSS Styling

```css
/* src/apps/starfield/Starfield.css */
.starfield-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--window-bg);
  color: var(--text-primary);
}

.starfield-header {
  padding: 5px 10px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--window-header-bg);
}

.starfield-header .title {
  font-weight: bold;
}

.starfield-header .subtitle {
  font-size: 0.8em;
  opacity: 0.8;
}

.starfield-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #000;
  position: relative;
}

.starfield-hud {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  color: #0f0;
  font-family: 'VT323', monospace;
  font-size: 1.2em;
  text-shadow: 0 0 5px #0f0;
  z-index: 10;
}
```

### 4. Add Game Files to FileSystem

Update the file system JSON to include STARFIELD.EXE:

```json
// Add to src/data/filesystem/fileSystem.json
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
}
```

## Clue Integration

The game contains several clue elements:

1. **Memory Dump Trigger**
   - When player reaches exactly 15,953 points, a memory dump occurs
   - The memory dump contains a fragment of the PATH_GAMMA escape sequence
   - This connects to other clues found elsewhere in the system

2. **Star Pattern Encoding**
   - The stars form a pattern that encodes coordinates or a symbol
   - When mapped or connected properly, they reveal information needed for other puzzles
   - This subtly links to puzzles in LABYRINTH.EXE

3. **High Score Connection**
   - Achieving certain high score thresholds reveals additional log entries
   - These logs hint at connections between the games and the broader mystery

## Testing Steps for Phase 2

1. Test basic game rendering and input handling
2. Verify score tracking and lives system works correctly
3. Confirm the memory dump triggers at exactly 15,953 points
4. Test game integration with SaveManager and clue discovery

## Next Steps

After completing Phase 2, move on to [Phase 3: LABYRINTH.EXE Implementation](week3-phase3.md)
