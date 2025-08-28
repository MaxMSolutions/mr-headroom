import { addGameLog, addDiscoveredClue } from '../../engine/save/SaveManager';

export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}

/**
 * GameState interface for saving/loading game state
 */
export interface GameState {
  gameId: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  score?: number;
  level?: number;
  progress?: number;
  customState?: any;
}

/**
 * Abstract base class for all games in the system
 * Provides common functionality for logging, clue discovery, and game lifecycle
 */
export abstract class GameBase {
  protected gameId: string;
  protected logs: GameEvent[] = [];
  protected gameState: GameState;
  
  constructor(gameId: string) {
    this.gameId = gameId;
    this.gameState = {
      gameId,
      status: 'idle'
    };
  }
  
  /**
   * Initialize the game with optional saved state
   * Should be called before starting the game
   */
  public abstract initialize(savedState?: any): void;
  
  /**
   * Start the game
   * Sets the game status to 'running'
   */
  public start(): void {
    this.gameState.status = 'running';
    this.logEvent('game_start', { gameId: this.gameId });
  }
  
  /**
   * Pause the game
   * Sets the game status to 'paused'
   */
  public pause(): void {
    this.gameState.status = 'paused';
    this.logEvent('game_pause', { gameId: this.gameId });
  }
  
  /**
   * Resume the game from a paused state
   * Sets the game status to 'running'
   */
  public resume(): void {
    if (this.gameState.status === 'paused') {
      this.gameState.status = 'running';
      this.logEvent('game_resume', { gameId: this.gameId });
    }
  }
  
  /**
   * Reset the game to its initial state
   * Sets the game status to 'idle'
   */
  public reset(): void {
    this.gameState = {
      gameId: this.gameId,
      status: 'idle'
    };
    this.logEvent('game_reset', { gameId: this.gameId });
  }
  
  /**
   * Get the current game state
   * Used for saving game progress
   */
  public getGameState(): GameState {
    return { ...this.gameState };
  }
  
  /**
   * Set the game state
   * Used for loading game progress
   */
  public setGameState(state: Partial<GameState>): void {
    this.gameState = {
      ...this.gameState,
      ...state
    };
  }
  
  /**
   * Log a game event
   * Events are stored locally and sent to the SaveManager
   */
  public logEvent(type: string, data: any): void {
    try {
      const event = {
        type,
        data,
        timestamp: Date.now()
      };
      
      this.logs.push(event);
      
      // Send to SaveManager
      addGameLog(this.gameId, event);
      
      // Check for clues
      this.checkForClues(event);
    } catch (error) {
      console.error(`Error logging event in ${this.gameId}:`, error);
      // Log the error event
      this.logError(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Log an error event
   */
  protected logError(error: Error): void {
    const errorEvent = {
      type: 'error',
      data: { message: error.message, stack: error.stack },
      timestamp: Date.now()
    };
    
    this.logs.push(errorEvent);
    addGameLog(this.gameId, errorEvent);
  }
  
  /**
   * Complete the game successfully
   */
  protected completeGame(data: any = {}): void {
    this.gameState.status = 'completed';
    this.logEvent('game_complete', data);
  }
  
  /**
   * End the game with failure
   */
  protected failGame(data: any = {}): void {
    this.gameState.status = 'failed';
    this.logEvent('game_fail', data);
  }
  
  /**
   * Check if a game event should trigger a clue discovery
   * This method should be implemented by each game
   */
  protected abstract checkForClues(event: GameEvent): void;
}
