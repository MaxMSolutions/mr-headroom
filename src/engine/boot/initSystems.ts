// This is a fix for the LogViewer component to make sure it doesn't rely on FileSystem
// when it doesn't need to. This will be used in the App.tsx file to initialize
// both systems correctly.

import FileSystem, { FileSystemData } from '../fileSystem';
import { SaveManager, getGameState } from '../save/SaveManager';

/**
 * Initialize both the FileSystem and SaveManager 
 * to ensure they're both ready for use throughout the app
 */
export const initializeAppSystems = async (): Promise<{
  fileSystem: FileSystem;
  saveManager: SaveManager;
}> => {
  console.log('[AppSystemsInit] Initializing app systems');
  
  // Initialize FileSystem
  const fs = new FileSystem();
  try {
    await fs.loadFromUrl('/src/data/filesystem/fileSystem.json');
    console.log('[AppSystemsInit] FileSystem initialized successfully');
  } catch (error) {
    console.error('[AppSystemsInit] Failed to initialize FileSystem:', error);
  }
  
  // Initialize SaveManager (this is already done by getGameState)
  const gameState = getGameState();
  console.log('[AppSystemsInit] SaveManager initialized successfully');
  
  // Return initialized systems
  return {
    fileSystem: fs,
    saveManager: new SaveManager() // This is just for type completion, the actual instance is managed by getGameState
  };
};
