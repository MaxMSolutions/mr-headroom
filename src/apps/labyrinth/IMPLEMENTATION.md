# LABYRINTH.EXE Implementation Documentation

## Overview

LABYRINTH.EXE is a text-based maze navigation game with ASCII graphics. It serves as one of the two required mini-games for the MRHEADROOM_DESCENT project, providing clues that are essential to solving the overall mystery.

## Features Implemented

- **Procedural Maze Generation**: Creates unique mazes using recursive division algorithm
- **Keyboard Navigation**: WASD or arrow key control system for intuitive movement
- **Symbol Collection**: Players collect symbols in specific combinations to unlock clues
- **Multiple Levels**: Progressive difficulty with 5 unique levels
- **Hidden Patterns**: Special patterns in level 3 that reveal additional clues
- **Secret Room**: Hidden central room that contains narrative fragments
- **Code System**: The "2517" code that triggers special events when entered
- **Audio Feedback**: Sound effects for movements, collections, and victories
- **Comprehensive Logging**: Game events recorded and analyzed for clue discovery

## Clue Integration

The game has been integrated with the mystery narrative through:

1. **Hidden Message Clue**
   - Triggered when finding the central hidden room in level 3
   - Contains hints about "the truth beyond the code"

2. **Reality Fragment Clue**
   - Triggered when symbols are collected in the "2517" sequence
   - Reveals a fragment of the truth about the system's nature

3. **Maze Pattern Coordinates**
   - Visual patterns formed in level 3 maze walls
   - When mapped, reveals coordinates or information used in other parts of the mystery

## Technical Implementation

- **LabyrinthEngine.ts**: Core game logic and mechanics
- **LabyrinthWindow.tsx**: React component for UI rendering and interaction
- **LabyrinthAudio.tsx**: Audio effects management component
- **types.ts**: Type definitions for the game

## How to Play

1. Navigate the maze using arrow keys or WASD
2. Collect symbols (displayed as characters like 2, 5, 1, 7)
3. Find the exit (◊) to advance to the next level
4. Pay attention to patterns in the maze walls
5. Look for special sequences in collected symbols

## Future Enhancements

- More complex patterns in maze generation
- Additional symbol types with special effects
- Time-based challenges and racing modes
- Visual glitch effects tied to narrative elements
- Alternative control schemes for accessibility

## Integration with Other Systems

The game integrates with:
- SaveManager for game state persistence
- GameBase for event logging and game lifecycle
- File system as an executable application
- Log Viewer for detailed event analysis and clue discovery

### Log Viewer Integration

A comprehensive Log Viewer integration has been implemented with:

1. **Direct Access Button**: 
   Added a "Logs" button in the game controls section that opens the System Log Viewer directly:
   ```typescript
   window.windowManager.addWindow({
     title: 'System Log Viewer',
     component: 'LogViewer',
     width: 850,
     height: 600
   });
   ```

2. **Enhanced Log Event Generation**:
   Each game event generates detailed, structured logs with a consistent format:
   ```typescript
   logEvent('symbol_collected', { 
     symbol, 
     order: this.collectedSymbols.length,
     position: { x: this.playerPos.x, y: this.playerPos.y },
     currentSequence: this.collectedSymbols.join(''),
     timestamp_encoded: this.encodeTimestampForLogs(),
     level: this.currentLevel
   });
   ```

3. **Special Event Types**:
   Added specialized event types for narrative development:
   - `anomaly_detected`: For unusual game states or discoveries
   - `pattern_found`: When meaningful patterns emerge in gameplay
   - `signal_received`: For narrative communication elements
   - `structure_analysis`: For environmental patterns with significance

4. **Cross-Reference Data**: 
   Logs include references to other system components:
   ```typescript
   {
     connection_points: ['STARFIELD.EXE:navigation_system', 'TERMINAL:reality_parse']
   }
   ```

5. **Pattern Recognition**:
   The system tracks partial matches and progress toward significant patterns:
   - Tracks progress toward pattern completion
   - Logs potential matches as symbols are collected
   - Provides escalating log significance as patterns near completion

## Testing

Unit tests cover:
- Maze generation and validation
- Player movement mechanics
- Symbol collection logic
- Level progression

## Known Issues

- The visual patterns in level 3 are currently simplified and could be enhanced
- Audio may not play on first interaction due to browser autoplay restrictions

## Log Event Schema Reference

| Event Type | Description | Special Data Fields |
|------------|-------------|---------------------|
| `symbol_collected` | Player collects a symbol | symbol, order, position, currentSequence |
| `anomaly_detected` | Unusual game state detected | anomaly_type, description, significance |
| `pattern_found` | Meaningful pattern recognized | pattern, pattern_type, connection_points |
| `signal_received` | Narrative message delivered | signal_type, content, origin |
| `structure_analysis` | Environmental pattern found | pattern_type, visual_signature |
| `partial_sequence_match` | Progress toward pattern | current_sequence, partial_match |
| `player_move` | Player movement tracking | direction, position |
| `code_entered` | Special code sequence entry | code, level, position, collection_order |
| `secret_room_found` | Discovery of hidden locations | room, level, coordinates |
| `level_completed` | Level transition | level, symbolsCollected |
