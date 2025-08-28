# LABYRINTH.EXE UI/UX Design Document

## Overview

This document outlines UI/UX enhancements for the LABYRINTH.EXE game to create a more engaging, accessible, and intuitive player experience while maintaining the retro ASCII aesthetic.

## Visual Design Improvements

### 1. Dynamic Lighting System

**Implementation:**
- Create a gradient visibility system where:
  - Player's immediate vicinity (2-3 cells) is fully visible
  - Medium range (4-6 cells) has 70% opacity
  - Far range (7+ cells) has 30% opacity or is hidden
- Use CSS opacity transitions for smooth reveal effects
- Include option to disable for accessibility

**Code Approach:**
```tsx
// Calculate cell visibility based on distance from player
const getCellVisibility = (playerX: number, playerY: number, cellX: number, cellY: number): number => {
  const distance = Math.sqrt(Math.pow(playerX - cellX, 2) + Math.pow(playerY - cellY, 2));
  if (distance <= 2) return 1;
  if (distance <= 6) return 0.7;
  if (distance <= 10) return 0.3;
  return 0;
};
```

### 2. Animation Effects

**Implementation:**
- Add smooth transitions for player movement using CSS transitions
- Create collection animations with brief scaling/glowing effects
- Implement level transition effects with fade-in/out
- Design subtle maze "breathing" animations for walls to create an eerie atmosphere

**CSS Examples:**
```css
.maze-cell.player {
  transition: all 0.15s ease-out;
  animation: pulse 1.5s infinite alternate;
}

.maze-cell.symbol.collected {
  animation: collect 0.5s forwards;
}

@keyframes collect {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
}
```

### 3. Enhanced Color Schemes

**Implementation:**
- Create three distinct color themes:
  1. **Classic**: Green/cyan on black (default)
  2. **Neon**: Vibrant pink, cyan, and yellow on dark purple
  3. **Accessibility**: High contrast black and white with yellow highlights
- Allow theme switching through settings
- Use CSS variables for easy color management

**Theme Example:**
```css
:root {
  --player-color: #33ff33;
  --player-glow: #33ff33;
  --wall-color: #666666;
  --symbol-color: #00ffff;
  --exit-color: #ff00ff;
}

[data-theme="neon"] {
  --player-color: #ff00ff;
  --player-glow: #ff66ff;
  --wall-color: #330066;
  --symbol-color: #ffff00;
  --exit-color: #00ffff;
}
```

### 4. Minimap Feature

**Implementation:**
- Create a 15% size minimap in the top-right corner
- Simplify the maze representation using dots for paths and blocks for walls
- Highlight the player position with a blinking indicator
- Show discovered symbols and exit
- Include toggle button to show/hide

## Gameplay Enhancements

### 1. Difficulty Settings

**Implementation:**
- Add a difficulty selector at game start
- Normal mode: Current implementation
- Hard mode: 
  - Maze size increases
  - Symbol sequence requires faster collection
  - Limited visibility
  - Time constraints for bonus points

### 2. Breadcrumb Trail System

**Implementation:**
- Add subtle markers to cells the player has visited
- Use different styling for repeatedly visited cells
- Include option to clear the trail or disable the feature
- Gradually fade breadcrumbs over time

**Example:**
```css
.maze-cell.visited-once {
  background-color: rgba(80, 80, 80, 0.2);
}

.maze-cell.visited-multiple {
  background-color: rgba(100, 100, 100, 0.3);
}
```

### 3. Contextual Hint System

**Implementation:**
- After 2 minutes on a level without progress, subtly highlight a path
- Add a "hint" button that reveals one step toward the exit or next symbol
- Create a hint cooldown timer to prevent overuse
- Maintain challenge by limiting hints per level

### 4. Achievement System

**Implementation:**
- Create achievements for:
  - Level completion speed
  - Symbol collection efficiency
  - Finding secret areas
  - Completing special patterns
- Design small notification system for earned achievements
- Link achievements to the broader game narrative

## Accessibility Improvements

### 1. Text Size Adjustments

**Implementation:**
- Add text size controls in settings
- Adjust maze rendering to accommodate larger characters
- Scale UI elements proportionally
- Save preference in user settings

### 2. High Contrast Mode

**Implementation:**
- Design a simplified visual style with maximum contrast
- Remove visual effects that could reduce readability
- Use patterns instead of colors for differentiation
- Include audio cues for important events

### 3. Control Customization

**Implementation:**
- Allow key rebinding for movement
- Improve virtual controls with larger buttons and better positioning
- Add gamepad support for accessibility
- Include one-handed control scheme option

## UI Component Improvements

### 1. Enhanced Status Panel

**Implementation:**
- Reorganize to show:
  - Current level and progress bar to next level
  - Symbols collected with visual indication of order
  - Timer (optional challenge mode)
  - Visual hint indicator
- Use intuitive icons instead of text where possible
- Implement collapsible sections for advanced information

**Example:**
```tsx
<div className="labyrinth-status">
  <div className="level-info">
    <h3>Level {gameStatus.level}/{engine.maxLevel}</h3>
    <div className="progress-bar">
      <div className="progress" style={{width: `${(gameStatus.level/engine.maxLevel)*100}%`}} />
    </div>
  </div>
  
  <div className="symbol-collection">
    {gameStatus.collectedSymbols.map((symbol, index) => (
      <span key={index} className="collected-symbol">{symbol}</span>
    ))}
    {/* Empty placeholder spaces for symbols not yet collected */}
    {Array(totalSymbols - gameStatus.collectedSymbols.length).fill(0).map((_, index) => (
      <span key={`empty-${index}`} className="uncollected-symbol">?</span>
    ))}
  </div>
</div>
```

### 2. Context-Sensitive Help

**Implementation:**
- Create a small help system that shows tips based on:
  - Current level challenges
  - Player behavior (repeated movements, stuck detection)
  - Game progress
- Design unobtrusive notification system
- Include dismiss and "don't show again" options

### 3. Improved Instructions

**Implementation:**
- Create multi-stage tutorial that introduces:
  - Basic movement
  - Symbol collection
  - Exit finding
  - Special patterns
- Allow players to revisit tutorial at any time
- Incorporate visual examples with the instructions

## Implementation Priority

1. **Highest Priority**
   - Enhanced color schemes
   - Improved status panel
   - Basic animations

2. **Medium Priority**
   - Accessibility features
   - Breadcrumb trail system
   - Context-sensitive help

3. **Polish Features**
   - Dynamic lighting
   - Achievement system
   - Minimap

## Technical Considerations

- Keep performance in mind, especially for animations
- Ensure all features can be toggled for accessibility
- Maintain the retro ASCII aesthetic while adding modern UX
- Save user preferences to local storage
- Test thoroughly on different devices and screen sizes

## Mockups

```
┌────────────────────────────────────────────────────────┐
│  LABYRINTH.EXE                                    _ □ X │
├────────────────────────────────────────────────────────┤
│  Level: 3/5  [███████████████□□□□□□□□□□]                │
│  Collected: 2 5 _ _          Message: Find the exit!   │
├─────────────────────────┬──────────────────────────────┤
│                         │           ┌─────┐            │
│  █████████████████████  │           │     │            │
│  █     █           █ █  │           │ [P] │            │
│  █ ███ █ █████████ █ █  │           │  #  │            │
│  █ █ █ █ █     █ █ █ █  │           └─────┘            │
│  █ █ █ █ █ ███ █ █ █ █  │                             │
│  █ █ █ █ █ █2█   █ █ █  │                             │
│  █ █ █   █ █████ █ █ █  │                             │
│  █ █ █████ █     █ █ █  │  Controls:                  │
│  █ █       █ █████ █ █  │  [↑][↓][←][→] or [WASD]     │
│  █ █████████ █     █ █  │                             │
│  █ █         █ █████ █  │  [H] Hint (2 remaining)     │
│  █ █ █████████ █   █ █  │  [R] Restart level          │
│  █ █ █       █ ███ █ █  │  [ESC] Menu                 │
│  █ █ █ █████ █   █ █ █  │                             │
│  █ █ █ █   █ ███ █ █ █  │                             │
│  █ █ █ █ █ █ █ █ █ █ █  │  🏆 Speed Runner: Complete  │
│  █ █ █ █ █ █ █ █ █ █ █  │     this level in 45 secs   │
│  █ █ █ █ █   █   █ █ █  │                             │
│  █ █ █ ███████████ █ █  │                             │
│  █☺█         5     █◊█  │                             │
│  █████████████████████  │                             │
└─────────────────────────┴─────────────────────────────┘
```

## User Testing Plan

1. Conduct play tests focusing on:
   - Intuitiveness of navigation
   - Visibility and clarity of maze elements
   - Understanding of objectives and progress
   - Enjoyment and engagement levels

2. Collect feedback specifically on:
   - Color scheme preferences
   - Animation speed and style
   - Control responsiveness
   - Help system effectiveness

3. Iterate based on feedback with at least two rounds of testing

## Conclusion

These UI/UX enhancements will maintain the retro aesthetic of LABYRINTH.EXE while significantly improving the player experience through better visual design, more intuitive controls, and enhanced accessibility. The improvements focus on making the game more engaging while ensuring all players can enjoy the experience regardless of their abilities.
