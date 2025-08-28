/**
 * patternRecognition.ts
 * Integration between terminal commands and the PatternPuzzleSystem
 */

import patternSystem from '../../engine/mystery/PatternPuzzleSystem';

/**
 * Record a terminal command in the PatternPuzzleSystem
 * @param command The terminal command executed
 */
export const recordTerminalCommand = (command: string): void => {
  // Record the command as a pattern action
  patternSystem.recordAction({
    type: 'terminal_command',
    value: command,
    timestamp: Date.now()
  });
};

/**
 * Record a file access in the PatternPuzzleSystem
 * @param filePath The path of the file being accessed
 * @param action The action being performed (open, edit, etc.)
 */
export const recordFileAccess = (filePath: string, action: string): void => {
  patternSystem.recordAction({
    type: 'file_access',
    value: {
      path: filePath,
      action
    },
    timestamp: Date.now()
  });
};

/**
 * Record a click action in a specific application
 * @param appId The ID of the application
 * @param x X coordinate of the click
 * @param y Y coordinate of the click
 * @param context Optional context for the click (element ID, etc.)
 */
export const recordAppClick = (appId: string, x: number, y: number, context?: string): void => {
  patternSystem.recordAction({
    type: 'click',
    value: {
      x,
      y,
      appId,
      elementContext: context
    },
    timestamp: Date.now()
  });
};

/**
 * Record a specific application action
 * @param appId The ID of the application
 * @param action The action performed
 * @param value The value associated with the action
 */
export const recordAppAction = (appId: string, action: string, value: any): void => {
  patternSystem.recordAction({
    type: `${appId}_${action}`,
    value,
    timestamp: Date.now()
  });
};
