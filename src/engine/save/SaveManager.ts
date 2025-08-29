import { useState, useEffect } from 'react';
import { GameEvent } from '../games/GameBase';

// Define the game state interface
export interface GameState {
  version: string;
  player: {
    name: string;
    progress: number;
    discoveredClues: string[];
    completedPuzzles: string[];
    choices: Record<string, boolean | string>;
  };
  settings: {
    theme: string;
    showGlitchEffects: boolean;
    accessibilityMode: boolean;
    audioEnabled: boolean;
    verboseBoot: boolean;
  };
  gameFlags: {
    realityIndex: number; // 0.0-1.0, determines which ending is available
    mrheadroomAwareness: number; // 0-100, influences narrative elements
    systemCorruption: number; // 0-100, visual glitch frequency
    endingPath: 'alpha' | 'beta' | 'gamma' | null;
    endingTriggerEvent?: string; // The event that triggered the ending
    alphaPathAvailable?: boolean;
    betaPathAvailable?: boolean;
    gammaPathAvailable?: boolean;
  };
  gameLogs?: Record<string, GameEvent[]>;
  discoveredClues?: string[];
  metadata: {
    startTime: string;
    lastSaved: string;
    playTime: number; // in seconds
    saveCount: number;
  };
}

// Default initial state
const initialState: GameState = {
  version: '1.0',
  player: {
    name: 'Henry Hedrum',
    progress: 0,
    discoveredClues: [],
    completedPuzzles: [],
    choices: {},
  },
  settings: {
    theme: 'default',
    showGlitchEffects: true,
    accessibilityMode: false,
    audioEnabled: true,
    verboseBoot: false,
  },
  gameFlags: {
    realityIndex: 1.0, // Start at full "reality" (1.0)
    mrheadroomAwareness: 0,
    systemCorruption: 0,
    endingPath: null,
    endingTriggerEvent: undefined,
    alphaPathAvailable: false,
    betaPathAvailable: false,
    gammaPathAvailable: false,
  },
  metadata: {
    startTime: new Date().toISOString(),
    lastSaved: new Date().toISOString(),
    playTime: 0,
    saveCount: 0,
  },
};

// Keys for local storage
const SAVE_STATE_KEY = 'mrheadroom_save';
const AUTOSAVE_KEY = 'mrheadroom_autosave';

export class SaveManager {
  private state: GameState;
  private playTimeInterval: NodeJS.Timeout | null = null;

  constructor(initialData?: GameState) {
    this.state = initialData || { ...initialState };
    
    // Add sample logs if none exist
    if (!this.state.gameLogs || Object.keys(this.state.gameLogs).length === 0) {
      console.log('[SaveManager] Initializing with sample logs');
      this.state.gameLogs = {
        'system': [],
        'debug': []
      };
    }
    
    this.startPlayTimeTracking();
  }

  // Start tracking play time
  private startPlayTimeTracking() {
    if (this.playTimeInterval) {
      clearInterval(this.playTimeInterval);
    }

    this.playTimeInterval = setInterval(() => {
      this.state.metadata.playTime += 1;
    }, 1000);
  }

  // Stop tracking play time
  private stopPlayTimeTracking() {
    if (this.playTimeInterval) {
      clearInterval(this.playTimeInterval);
      this.playTimeInterval = null;
    }
  }

  // Load save state from localStorage
  loadFromLocalStorage(key: string = SAVE_STATE_KEY): GameState | null {
    try {
      const savedData = localStorage.getItem(key);
      if (!savedData) return null;

      const parsedData = JSON.parse(savedData) as GameState;
      
      // Version checking could go here
      
      this.state = parsedData;
      return parsedData;
    } catch (error) {
      console.error('Failed to load save state:', error);
      return null;
    }
  }

  // Save state to localStorage
  saveToLocalStorage(key: string = SAVE_STATE_KEY): boolean {
    try {
      // Update last saved time
      this.state.metadata.lastSaved = new Date().toISOString();
      this.state.metadata.saveCount += 1;

      localStorage.setItem(key, JSON.stringify(this.state));
      return true;
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
      return false;
    }
  }

  // Create autosave - Modified to always use main save key to ensure logs are visible
  autoSave(): boolean {
    console.log('[SaveManager] autoSave called, saving to main key instead of autosave key');
    // Use the main save key to ensure logs are saved properly
    return this.saveToLocalStorage(SAVE_STATE_KEY);
  }

  // Export save to file
  exportSave(): string {
    return JSON.stringify(this.state);
  }

  // Import save from JSON
  importSave(saveData: string): boolean {
    try {
      const parsedData = JSON.parse(saveData) as GameState;
      
      // Validate the save data
      if (!parsedData.version || !parsedData.player) {
        throw new Error('Invalid save data format');
      }
      
      this.state = parsedData;
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to import save data:', error);
      return false;
    }
  }

  // Get the current state
  getState(): GameState {
    return { ...this.state };
  }

  // Update player progress
  updateProgress(newProgress: number): void {
    this.state.player.progress = Math.max(this.state.player.progress, newProgress);
    this.autoSave();
  }

  // Add discovered clue
  addDiscoveredClue(clueId: string): void {
    if (!this.state.player.discoveredClues.includes(clueId)) {
      this.state.player.discoveredClues.push(clueId);
      this.autoSave();
    }
  }

  // Add completed puzzle
  addCompletedPuzzle(puzzleId: string): void {
    if (!this.state.player.completedPuzzles.includes(puzzleId)) {
      this.state.player.completedPuzzles.push(puzzleId);
      this.autoSave();
    }
  }

  // Record player choice
  recordChoice(choiceId: string, value: boolean | string): void {
    this.state.player.choices[choiceId] = value;
    this.autoSave();
  }

  // Update game flags
  updateGameFlags(flags: Partial<GameState['gameFlags']>): void {
    this.state.gameFlags = {
      ...this.state.gameFlags,
      ...flags,
    };
    this.autoSave();
  }

  // Update settings
  updateSettings(settings: Partial<GameState['settings']>): void {
    this.state.settings = {
      ...this.state.settings,
      ...settings,
    };
    this.saveToLocalStorage();
  }

  // Reset game state
  resetState(): void {
    this.state = { ...initialState, metadata: { ...initialState.metadata, startTime: new Date().toISOString() } };
    this.saveToLocalStorage();
  }

  // Clean up
  destroy() {
    this.stopPlayTimeTracking();
  }

  // Calculate current ending path based on game state
  calculateEndingPath(): 'alpha' | 'beta' | 'gamma' {
    const { realityIndex, mrheadroomAwareness } = this.state.gameFlags;
    
    // Example algorithm - you would adjust this based on your narrative design
    if (realityIndex < 0.3 && mrheadroomAwareness > 75) {
      return 'alpha'; // "Truth" ending
    } else if (realityIndex < 0.6) {
      return 'beta'; // "Partial revelation" ending
    } else {
      return 'gamma'; // "False reality" ending
    }
  }

  // Set a game flag value
  setGameFlag<K extends keyof GameState['gameFlags']>(
    flag: K, 
    value: GameState['gameFlags'][K]
  ): void {
    this.state.gameFlags[flag] = value;
    this.saveToLocalStorage();
    console.log(`[SaveManager] Game flag '${flag}' set to:`, value);
  }
}

// React hook for using SaveManager
export const useSaveManager = () => {
  const [saveManager, setSaveManager] = useState<SaveManager | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const manager = new SaveManager();
    
    // Try to load existing save
    let state = manager.loadFromLocalStorage();
    
    // If no save exists, use the initial state
    if (!state) {
      state = manager.getState();
    }
    
    setSaveManager(manager);
    setGameState(state);
    setLoading(false);
    
    // Auto-save every 60 seconds
    const autoSaveInterval = setInterval(() => {
      manager.autoSave();
    }, 60000);
    
    return () => {
      clearInterval(autoSaveInterval);
      manager.destroy();
    };
  }, []);
  
  // Force a refresh of the game state (useful after updates)
  const refreshState = () => {
    if (saveManager) {
      setGameState(saveManager.getState());
    }
  };
  
  return { saveManager, gameState, loading, refreshState };
};

// Standalone functions for accessing game state outside of class
let globalSaveManager: SaveManager | null = null;

/**
 * Converts a modern timestamp to a 1999 equivalent timestamp
 * Preserves the month, day, hour, minute, second but changes the year to 1999
 */
function convertTo1999Timestamp(timestamp: number): number {
  const date = new Date(timestamp);
  // Create a new date in 1999 with the same month, day, hour, minute, second
  const date1999 = new Date(
    1999,
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
  return date1999.getTime();
}

export function getGameState(): GameState {
  if (!globalSaveManager) {
    globalSaveManager = new SaveManager();
  }
  return globalSaveManager.getState();
}

export function saveGameState(state: Partial<GameState>): void {
  if (!globalSaveManager) {
    globalSaveManager = new SaveManager();
  }
  // Update the save manager with the new state
  if (state.gameLogs) {
    // Handle game logs separately since they need special merging
    Object.entries(state.gameLogs).forEach(([gameId, logs]) => {
      logs.forEach(log => {
        addGameLog(gameId, log);
      });
    });
  }
}

export function addGameLog(gameId: string, log: GameEvent): void {
  console.log(`[SaveManager] Adding log to ${gameId}:`, log.type);
  
  const currentState = getGameState();
  console.log('[SaveManager] Current state before adding log:', 
    currentState.gameLogs ? `Has ${Object.keys(currentState.gameLogs).length} game(s) with logs` : 'No logs yet');
  
  if (!currentState.gameLogs) {
    console.log('[SaveManager] Creating gameLogs object');
    currentState.gameLogs = {};
  }
  
  if (!currentState.gameLogs[gameId]) {
    console.log(`[SaveManager] Creating log array for ${gameId}`);
    currentState.gameLogs[gameId] = [];
  }
  
  // Convert the timestamp to 1999 equivalent
  const modifiedLog = {
    ...log,
    timestamp: convertTo1999Timestamp(log.timestamp)
  };
  
  // Also update any nested timestamp in the data if present
  if (modifiedLog.data && modifiedLog.data.timestamp) {
    if (typeof modifiedLog.data.timestamp === 'number') {
      modifiedLog.data.timestamp = convertTo1999Timestamp(modifiedLog.data.timestamp);
    } else if (typeof modifiedLog.data.timestamp === 'string' && !isNaN(Date.parse(modifiedLog.data.timestamp))) {
      // If it's an ISO string, convert to 1999 equivalent
      const date = new Date(modifiedLog.data.timestamp);
      const date1999 = new Date(
        1999,
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      );
      modifiedLog.data.timestamp = date1999.toISOString();
    }
  }
  
  currentState.gameLogs[gameId].push(modifiedLog);
  console.log(`[SaveManager] Log added, ${gameId} now has ${currentState.gameLogs[gameId].length} logs`);
  
  // Create or update the SaveManager instance
  if (!globalSaveManager) {
    console.log('[SaveManager] Creating new SaveManager instance');
    globalSaveManager = new SaveManager();
  }
  
  // Debug log before saving
  console.log('[SaveManager] About to save game state with logs:', 
    currentState.gameLogs ? 
    Object.keys(currentState.gameLogs).map(key => `${key}: ${currentState.gameLogs![key].length} logs`) :
    'No logs to save');
  
  // Save to main storage key to ensure persistence
  globalSaveManager.saveToLocalStorage();
  
  // Debug log after saving
  const savedData = localStorage.getItem(SAVE_STATE_KEY);
  console.log(`[SaveManager] Saved ${savedData ? Math.round(savedData.length / 1024) + 'KB' : '0KB'} to localStorage key: ${SAVE_STATE_KEY}`);
}

export function addTestLog(): void {
  // This function can be called from the console for debugging
  addGameLog('system', {
    type: 'test_log',
    data: {
      message: 'Test log entry',
      timestamp: new Date().toISOString(), // This will be converted to 1999 by addGameLog
      details: 'This is a test log created manually for debugging purposes'
    },
    timestamp: Date.now() // This will be converted to 1999 by addGameLog
  });
}

// Make addTestLog available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).addTestLog = (gameId: string = 'system', message: string = 'Test log entry') => {
    addGameLog(gameId, {
      type: 'test_log',
      data: {
        message,
        timestamp: new Date().toISOString(), // This will be converted to 1999 by addGameLog
        details: 'This is a test log created manually for debugging purposes'
      },
      timestamp: Date.now() // This will be converted to 1999 by addGameLog
    });
    console.log('Test log added to', gameId);
    return 'Log added successfully';
  };

  // Also expose the getGameState function for debugging
  (window as any).getDebugGameState = () => {
    const state = getGameState();
    console.log('Current game state:', state);
    return state;
  };
  
  // Function to clear all logs (for testing)
  (window as any).clearAllLogs = () => {
    if (!globalSaveManager) {
      globalSaveManager = new SaveManager();
    }
    const state = globalSaveManager.getState();
    state.gameLogs = {};
    globalSaveManager.saveToLocalStorage();
    console.log('All logs have been cleared');
    return 'Logs cleared';
  };
  
  // Function to reset save data completely (for testing)
  (window as any).resetGameState = () => {
    if (!globalSaveManager) {
      globalSaveManager = new SaveManager();
    }
    globalSaveManager.resetState();
    console.log('Game state has been reset');
    return 'Game state reset';
  };
}

export function addDiscoveredClue(clueId: string, data?: any): void {
  const currentState = getGameState();
  if (!currentState.discoveredClues) {
    currentState.discoveredClues = [];
  }
  
  // Check if we already have this clue
  if (!currentState.discoveredClues.includes(clueId)) {
    // Import clue data dynamically to avoid circular dependencies
    import('../../data/clues').then((cluesModule) => {
      // We need to manually get the clue since the module doesn't export getClue function
      const clues = Object.values(cluesModule).find(Array.isArray);
      const clue = clues?.find((c: any) => c.id === clueId);
      
      if (!clue) {
        console.error(`Tried to add non-existent clue: ${clueId}`);
        return;
      }
      
      // Check if this clue has requirements and if they are met
      if (clue.requiredClues && clue.requiredClues.length > 0) {
        const discoveredCluesList = currentState.discoveredClues || [];
        const missingClues = clue.requiredClues.filter(
          (requiredId: string) => !discoveredCluesList.includes(requiredId)
        );
        
        if (missingClues.length > 0) {
          console.log(`Clue ${clueId} requirements not met yet. Missing clues: ${missingClues.join(', ')}`);
          return;
        }
      }
      
      // Add the clue
      const discoveredCluesList = currentState.discoveredClues || [];
      discoveredCluesList.push(clueId);
      currentState.discoveredClues = discoveredCluesList;
      console.log(`Clue discovered: ${clueId}`, clue.title);
      
      // Trigger narrative events
      triggerClueDiscoveryEvent(clueId, data, clue);
      
      // Save the updated state
      if (globalSaveManager) {
        globalSaveManager.autoSave();
      }
      
      // Check if this clue unlocks any narrative progression
      checkForNarrativeProgression(currentState.discoveredClues || []);
    });
  }
}

export function triggerClueDiscoveryEvent(clueId: string, _data?: any, clue?: any): void {
  // This function will handle any special events that need to occur when a clue is discovered
  console.log(`Triggering events for clue: ${clueId}`);
  
  // Here you could trigger UI notifications, game events, or update game flags
  const currentState = getGameState();
  
  // If we have the clue data, use its reward flags
  if (clue && clue.rewardFlag) {
    const { flag, value } = clue.rewardFlag;
    
    if (flag === 'mrheadroomAwareness') {
      const awarenessIncrease = value || 10;
      if (globalSaveManager) {
        globalSaveManager.updateGameFlags({
          mrheadroomAwareness: Math.min(100, currentState.gameFlags.mrheadroomAwareness + awarenessIncrease)
        });
        console.log(`MrHeadroom awareness increased by ${awarenessIncrease} to ${Math.min(100, currentState.gameFlags.mrheadroomAwareness + awarenessIncrease)}`);
      }
    }
    
    if (flag === 'realityIndex') {
      const realityChange = value || -0.1;
      if (globalSaveManager) {
        const newRealityIndex = Math.max(0, Math.min(1, currentState.gameFlags.realityIndex + realityChange));
        globalSaveManager.updateGameFlags({
          realityIndex: newRealityIndex
        });
        console.log(`Reality index changed by ${realityChange} to ${newRealityIndex}`);
      }
    }
    
    // Add more flags as needed
  } else {
    // Fall back to the old behavior for backward compatibility
    if (clueId.startsWith('mrheadroom')) {
      const awarenessIncrease = 10; // Can be customized per clue
      if (globalSaveManager) {
        globalSaveManager.updateGameFlags({
          mrheadroomAwareness: Math.min(100, currentState.gameFlags.mrheadroomAwareness + awarenessIncrease)
        });
      }
    }
    
    if (clueId.startsWith('reality')) {
      const realityDecrease = 0.1; // Can be customized per clue
      if (globalSaveManager) {
        globalSaveManager.updateGameFlags({
          realityIndex: Math.max(0, currentState.gameFlags.realityIndex - realityDecrease)
        });
      }
    }
  }
  
  // Dispatch an event that the UI can listen for to show notifications
  const event = new CustomEvent('clueDiscovered', { 
    detail: { 
      clueId, 
      clueData: clue || { id: clueId },
      timestamp: convertTo1999Timestamp(Date.now())
    } 
  });
  window.dispatchEvent(event);
}

/**
 * Check if the current set of discovered clues should trigger narrative progression
 * @param discoveredClues Array of discovered clue IDs
 */
function checkForNarrativeProgression(discoveredClues: string[]): void {
  // Define key clue combinations that unlock narrative progression
  const narrativeStages = [
    {
      id: 'intro_complete',
      requiredClues: ['mrheadroom_001'],
      action: () => {
        console.log('Intro narrative stage complete');
        // Unlock new content or trigger events
      }
    },
    {
      id: 'mid_game',
      requiredClues: ['mrheadroom_002', 'reality_001'],
      action: () => {
        console.log('Mid-game narrative stage reached');
        // Unlock mid-game content
      }
    },
    {
      id: 'approaching_finale',
      requiredClues: ['mrheadroom_003', 'reality_002'],
      action: () => {
        console.log('Approaching finale narrative stage');
        // Start preparing for finale
      }
    },
    {
      id: 'finale_ready',
      requiredClues: ['mrheadroom_003', 'reality_003'],
      action: () => {
        console.log('Finale ready - all key clues discovered');
        // Enable finale sequence
      }
    }
  ];
  
  // Get current game state to check what stages have been triggered already
  const currentState = getGameState();
  if (!currentState.player.completedPuzzles) {
    currentState.player.completedPuzzles = [];
  }
  
  // Check each narrative stage
  for (const stage of narrativeStages) {
    // Skip already completed stages
    if (currentState.player.completedPuzzles.includes(stage.id)) {
      continue;
    }
    
    // Check if all required clues are discovered
    const allCluesDiscovered = stage.requiredClues.every(
      clueId => discoveredClues.includes(clueId)
    );
    
    if (allCluesDiscovered) {
      console.log(`Narrative stage ${stage.id} triggered`);
      
      // Mark as completed
      currentState.player.completedPuzzles.push(stage.id);
      
      // Run the stage action
      stage.action();
      
      // Update the ending path if needed
      if (globalSaveManager) {
        const endingPath = globalSaveManager.calculateEndingPath();
        globalSaveManager.updateGameFlags({
          endingPath
        });
        console.log(`Current ending path: ${endingPath}`);
        
        // Save progress
        globalSaveManager.autoSave();
      }
    }
  }
}

/**
 * Set a specific game flag value
 * @param flag The flag to set
 * @param value The value to set
 */
export function setGameFlag<K extends keyof GameState['gameFlags']>(
  flag: K, 
  value: GameState['gameFlags'][K]
): void {
  const currentState = getGameState();
  
  if (globalSaveManager) {
    // Use type assertion to handle the flag safely
    const flagUpdate = {
      [flag]: value
    } as Partial<GameState['gameFlags']>;
    
    globalSaveManager.updateGameFlags(flagUpdate);
  } else {
    // If no SaveManager instance, update the state directly
    if (!currentState.gameFlags) {
      currentState.gameFlags = { ...initialState.gameFlags };
    }
    
    // Update the flag with type safety
    if (flag in currentState.gameFlags) {
      currentState.gameFlags[flag] = value;
      
      // Save the updated state
      saveGameState(currentState);
    } else {
      console.warn(`[SaveManager] Attempted to set unknown game flag: ${flag}`);
    }
  }
}

export default SaveManager;
