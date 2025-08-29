/**
 * Boot sequence sound manager - DISABLED
 * This file has been modified to disable all sound functionality.
 */

// Empty sound types object
export const BOOT_SOUNDS = {
  powerOn: '',
  error: '',
  warning: '',
  glitch: '',
  memoryBeep: '',
  bootComplete: ''
};

/**
 * Stub function - No longer preloads sounds
 * @returns Empty promise that resolves immediately
 */
export const preloadBootSounds = (): Promise<void> => {
  return Promise.resolve();
};

/**
 * Stub function - No longer plays any sounds
 * @param _type Ignored sound type parameter
 * @param _volume Ignored volume parameter
 */
export const playBootSound = (_type: keyof typeof BOOT_SOUNDS, _volume = 0.5): void => {
  // Sound playing functionality removed
};
