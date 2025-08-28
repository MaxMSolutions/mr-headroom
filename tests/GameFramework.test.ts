import { GameBase, GameEvent, GameState } from '../src/engine/games/GameBase';
import { addGameLog, addDiscoveredClue, getGameState } from '../src/engine/save/SaveManager';

// Mock implementation for testing
class TestGame extends GameBase {
  public testEvent: GameEvent | null = null;
  public initializedWithState: any = null;
  
  constructor() {
    super('test-game');
  }
  
  initialize(savedState?: any): void {
    this.initializedWithState = savedState;
    
    if (savedState) {
      this.setGameState(savedState);
    }
  }
  
  protected checkForClues(event: GameEvent): void {
    this.testEvent = event;
    
    if (event.type === 'test-clue-trigger') {
      addDiscoveredClue('test-clue-id', event.data);
    }
    
    // Additional clue trigger for testing clue combinations
    if (event.type === 'advanced-trigger' && event.data.complexity > 5) {
      addDiscoveredClue('advanced-clue-id', event.data);
    }
  }
  
  // Method for testing
  public triggerEvent(type: string, data: any): void {
    this.logEvent(type, data);
  }
  
  // Test error handling
  public triggerErrorEvent(): void {
    try {
      throw new Error('Test error in game');
    } catch (error) {
      if (error instanceof Error) {
        this.logError(error);
      }
    }
  }
  
  // Expose protected methods for testing
  public completeGameTest(data: any = {}): void {
    this.completeGame(data);
  }
  
  public failGameTest(data: any = {}): void {
    this.failGame(data);
  }
}

describe('Game Framework Tests', () => {
  let testGame: TestGame;
  
  beforeEach(() => {
    // Reset game state between tests
    localStorage.clear();
    testGame = new TestGame();
  });
  
  describe('Event Logging', () => {
    test('Game events are properly logged', () => {
      // Arrange
      const eventType = 'player-action';
      const eventData = { action: 'jump', position: { x: 10, y: 20 } };
      
      // Act
      testGame.triggerEvent(eventType, eventData);
      
      // Assert
      const gameState = getGameState();
      expect(gameState.gameLogs).toBeDefined();
      expect(gameState.gameLogs!['test-game']).toBeDefined();
      expect(gameState.gameLogs!['test-game'].length).toBe(1);
      expect(gameState.gameLogs!['test-game'][0].type).toBe(eventType);
      expect(gameState.gameLogs!['test-game'][0].data).toEqual(eventData);
    });
    
    test('Error events are properly logged', () => {
      // Act
      testGame.triggerErrorEvent();
      
      // Assert
      const gameState = getGameState();
      expect(gameState.gameLogs!['test-game'].length).toBe(1);
      expect(gameState.gameLogs!['test-game'][0].type).toBe('error');
      expect(gameState.gameLogs!['test-game'][0].data.message).toBe('Test error in game');
    });
    
    test('Game logs persist between sessions', () => {
      // Arrange
      testGame.triggerEvent('session1-event', { value: 42 });
      
      // Act - simulate closing and reopening the game
      const gameState1 = getGameState();
      localStorage.setItem('mrheadroom_save', JSON.stringify(gameState1));
      
      // Create a new instance and check logs
      const newTestGame = new TestGame();
      newTestGame.triggerEvent('session2-event', { value: 84 });
      
      // Assert
      const gameState2 = getGameState();
      expect(gameState2.gameLogs!['test-game'].length).toBe(2);
      expect(gameState2.gameLogs!['test-game'][0].type).toBe('session1-event');
      expect(gameState2.gameLogs!['test-game'][1].type).toBe('session2-event');
    });
  });
  
  describe('Clue Discovery', () => {
    test('Clues are discovered when specific events occur', () => {
      // Arrange
      const eventType = 'test-clue-trigger';
      const eventData = { secretCode: '1234' };
      
      // Act
      testGame.triggerEvent(eventType, eventData);
      
      // Assert
      const gameState = getGameState();
      expect(gameState.discoveredClues).toBeDefined();
      expect(gameState.discoveredClues).toContain('test-clue-id');
    });
    
    test('Clues are triggered based on event data conditions', () => {
      // Arrange - should trigger
      const complexData = { complexity: 8, details: 'Complex pattern' };
      
      // Act
      testGame.triggerEvent('advanced-trigger', complexData);
      
      // Assert
      let gameState = getGameState();
      expect(gameState.discoveredClues).toContain('advanced-clue-id');
      
      // Arrange - should not trigger
      const simpleData = { complexity: 3, details: 'Simple pattern' };
      
      // Reset clues for second test
      localStorage.clear();
      testGame = new TestGame();
      
      // Act
      testGame.triggerEvent('advanced-trigger', simpleData);
      
      // Assert
      gameState = getGameState();
      expect(gameState.discoveredClues || []).not.toContain('advanced-clue-id');
    });
  });
  
  describe('Game Lifecycle', () => {
    test('Game goes through proper lifecycle states', () => {
      // Initial state should be idle
      expect(testGame.getGameState().status).toBe('idle');
      
      // Start the game
      testGame.start();
      expect(testGame.getGameState().status).toBe('running');
      
      // Pause the game
      testGame.pause();
      expect(testGame.getGameState().status).toBe('paused');
      
      // Resume the game
      testGame.resume();
      expect(testGame.getGameState().status).toBe('running');
      
      // Complete the game
      testGame.completeGameTest({ score: 100 });
      expect(testGame.getGameState().status).toBe('completed');
      
      // Reset the game
      testGame.reset();
      expect(testGame.getGameState().status).toBe('idle');
      
      // Start and then fail
      testGame.start();
      testGame.failGameTest({ reason: 'time_expired' });
      expect(testGame.getGameState().status).toBe('failed');
    });
    
    test('Game state can be saved and loaded', () => {
      // Set up initial state
      testGame.setGameState({
        score: 50,
        level: 3,
        customState: { powerups: ['shield'] }
      });
      
      // Check it was set correctly
      expect(testGame.getGameState().score).toBe(50);
      expect(testGame.getGameState().level).toBe(3);
      expect(testGame.getGameState().customState.powerups).toContain('shield');
      
      // Save the state
      const savedState = testGame.getGameState();
      
      // Create a new game and load the state
      const newGame = new TestGame();
      newGame.initialize(savedState);
      
      // Check the state was loaded
      expect(newGame.getGameState().score).toBe(50);
      expect(newGame.getGameState().level).toBe(3);
      expect(newGame.getGameState().customState.powerups).toContain('shield');
    });
  });
});
