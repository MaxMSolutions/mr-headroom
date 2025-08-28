/**
 * Test file to verify the MysteryEngine implementation
 */
import { MysteryEngine } from '../engine/mystery/MysteryEngine';
import * as SaveManager from '../engine/save/SaveManager';

// This file is for manually testing MysteryEngine functionality

// Get a reference to the MysteryEngine
const mysteryEngine = MysteryEngine.getInstance();

// Test functions
function testMysterySystem() {
  console.log('Starting MysteryEngine test...');
  
  // 1. Test maintenance window
  console.log('Testing maintenance window...');
  console.log(`Maintenance window active: ${mysteryEngine.isMaintenanceWindowActive()}`);
  mysteryEngine.setMaintenanceWindowActive(true);
  console.log(`After activation: ${mysteryEngine.isMaintenanceWindowActive()}`);
  
  // 2. Test ending triggers with SaveManager
  console.log('Testing ending triggers...');
  SaveManager.setGameFlag('endingPath', 'alpha');
  const currentState = SaveManager.getGameState();
  console.log(`Current ending path: ${currentState.gameFlags.endingPath}`);
  
  SaveManager.setGameFlag('endingTriggerEvent', 'execute_initiate_alpha');
  console.log(`Trigger event: ${SaveManager.getGameState().gameFlags.endingTriggerEvent}`);
  
  // Return to default state
  mysteryEngine.setMaintenanceWindowActive(false);
}

// Execute tests
console.log('=== Mystery Engine Test ===');
testMysterySystem();
console.log('=== Test Complete ===');

export {};
