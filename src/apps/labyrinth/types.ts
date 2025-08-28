/**
 * Types for the Labyrinth game
 */

// Direction type for player movement
export type Direction = 'up' | 'down' | 'left' | 'right';

// Player position coordinates
export interface Position {
  x: number;
  y: number;
}

// Symbol information
export interface Symbol {
  id: string;
  position: Position;
  collected: boolean;
}

// Cell types in the maze
export enum CellType {
  WALL = 'wall',
  PATH = 'path',
  PLAYER = 'player',
  SYMBOL = 'symbol',
  EXIT = 'exit',
  HIDDEN = 'hidden'
}

// Game state information
export interface LabyrinthGameState {
  level: number;
  collectedSymbols: string[];
  message: string;
  isGameOver: boolean;
  isVictory: boolean;
}

// Clue types that can be discovered in the game
export enum LabyrinthClueType {
  HIDDEN_MESSAGE = 'labyrinth_hidden_message',
  REALITY_FRAGMENT = 'labyrinth_reality_fragment',
  PATTERN_COORDS = 'labyrinth_pattern_coords'
}
