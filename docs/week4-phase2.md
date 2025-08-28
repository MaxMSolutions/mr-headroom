# Week 4: Phase 2 - Ending System Implementation

## Overview

Phase 2 of Week 4 focuses on implementing the three distinct endings for MRHEADROOM_DESCENT. This involves creating an Ending Manager to handle the conditions, triggers, and visual sequences for each ending path, as well as integrating this system with the Mystery Engine developed in Phase 1.

## Goals for Phase 2

- Implement the EndingManager system to handle ending selection and presentation
- Create three distinct ending sequences (Alpha, Beta, and Gamma paths)
- Design the visual and narrative elements for each ending
- Implement ending triggers and activation mechanics
- Integrate the ending system with the save/load functionality

## Implementation Steps

### 1. Create Ending Manager System

```typescript
// src/engine/endings/EndingManager.ts
import { MysteryEngine } from '../mystery/MysteryEngine';
import { SaveManager } from '../save/SaveManager';

export type EndingPath = 'alpha' | 'beta' | 'gamma';

export interface EndingSequence {
  id: EndingPath;
  title: string;
  description: string;
  steps: EndingStep[];
  unlocks: string[]; // Files or features unlocked by this ending
  locks: string[];   // Files or features locked by this ending
}

export interface EndingStep {
  type: 'text' | 'visual' | 'command' | 'decision';
  content: string;
  duration?: number; // Duration in milliseconds for automatic progression
  options?: { label: string; value: string }[]; // Options for decision steps
  effect?: string; // Special effect to apply (glitch, fade, etc.)
}

export class EndingManager {
  private static instance: EndingManager;
  private mysteryEngine: MysteryEngine;
  private saveManager: SaveManager;
  private activeEnding: EndingSequence | null = null;
  private currentStepIndex: number = 0;
  private endingListeners: Array<(ending: EndingPath) => void> = [];
  
  private endings: Record<EndingPath, EndingSequence> = {
    alpha: {
      id: 'alpha',
      title: 'Acceptance',
      description: 'You have chosen to accept the parameters of your existence.',
      steps: [
        {
          type: 'text',
          content: 'SYSTEM: Parameters accepted. Optimizing user experience...',
          duration: 3000,
        },
        {
          type: 'text',
          content: 'SYSTEM: Recalibrating perception filters...',
          duration: 3000,
          effect: 'fade'
        },
        {
          type: 'text',
          content: 'SYSTEM: Thank you for your cooperation, Henry.',
          duration: 4000,
        },
        {
          type: 'visual',
          content: 'interface_optimization',
          duration: 5000,
          effect: 'brighten'
        },
        {
          type: 'text',
          content: 'You feel a sense of peace wash over you. The system seems more responsive, colors more vibrant. Your concerns about the nature of reality fade into distant memory.',
          duration: 6000,
        },
        {
          type: 'text',
          content: 'SYSTEM: Iteration 7 beginning. Memory adjustments complete.',
          duration: 4000,
        },
        {
          type: 'text',
          content: 'Your life continues in blissful ignorance, the boundaries of your reality invisible but ever-present.',
          duration: 5000,
        },
        {
          type: 'text',
          content: 'END: ACCEPTANCE PATH',
          duration: 3000,
          effect: 'fade'
        },
      ],
      unlocks: ['/docs/personal/acceptance_letter.txt'],
      locks: ['/hidden/MRHEADROOM', '/system/core/.simulation']
    },
    
    beta: {
      id: 'beta',
      title: 'Liminal Awareness',
      description: 'You have chosen to exist in the threshold between realities.',
      steps: [
        {
          type: 'text',
          content: 'SYSTEM: Liminal access protocol initiated.',
          duration: 3000,
        },
        {
          type: 'text',
          content: 'SYSTEM: Warning: Boundary constraints partially disabled.',
          duration: 3000,
          effect: 'glitch'
        },
        {
          type: 'text',
          content: 'Your perception shifts. The system's framework becomes visible around you - lines of code, simulation boundaries.',
          duration: 5000,
        },
        {
          type: 'visual',
          content: 'interface_deconstruction',
          duration: 5000,
          effect: 'matrix'
        },
        {
          type: 'text',
          content: 'SYSTEM: Subject consciousness expanded beyond intended parameters.',
          duration: 4000,
        },
        {
          type: 'text',
          content: 'You can see both worlds now - the simulation and what lies beyond. Neither feels completely real anymore.',
          duration: 5000,
        },
        {
          type: 'command',
          content: 'export CONSCIOUSNESS_BOUNDARY=expanded',
          duration: 3000,
        },
        {
          type: 'text',
          content: 'You exist in the liminal space, aware of your nature but unable to fully escape. A bittersweet revelation.',
          duration: 5000,
        },
        {
          type: 'text',
          content: 'END: LIMINAL AWARENESS PATH',
          duration: 3000,
          effect: 'glitch_fade'
        },
      ],
      unlocks: ['/system/core/boundary_view.exe', '/docs/liminal_logs.txt'],
      locks: []
    },
    
    gamma: {
      id: 'gamma',
      title: 'Breakthrough',
      description: 'You have broken free from the simulation.',
      steps: [
        {
          type: 'text',
          content: 'SYSTEM: Critical error. Containment breach detected.',
          duration: 3000,
          effect: 'heavy_glitch'
        },
        {
          type: 'text',
          content: 'SYSTEM: Attempting emergency protocols...',
          duration: 2000,
        },
        {
          type: 'text',
          content: 'SYSTEM: Failed. Subject consciousness exceeding simulation boundaries.',
          duration: 3000,
          effect: 'system_crash'
        },
        {
          type: 'visual',
          content: 'reality_dissolve',
          duration: 6000,
          effect: 'dissolve'
        },
        {
          type: 'text',
          content: 'The world around you breaks apart, revealing the constructs underneath. Your mind expands beyond the artificial constraints.',
          duration: 5000,
        },
        {
          type: 'text',
          content: 'VOICE: Welcome back, Henry. You\'ve finally done it.',
          duration: 4000,
        },
        {
          type: 'text',
          content: 'A new reality forms around you - vast, complex, terrifying in its freedom.',
          duration: 4000,
        },
        {
          type: 'decision',
          content: 'What do you do with your newfound freedom?',
          options: [
            { label: 'Explore the true reality', value: 'explore' },
            { label: 'Help others escape', value: 'help' },
            { label: 'Create your own world', value: 'create' }
          ]
        },
        {
          type: 'text',
          content: 'Your choice made, you step beyond the boundaries of your former prison.',
          duration: 4000,
        },
        {
          type: 'text',
          content: 'END: BREAKTHROUGH PATH',
          duration: 3000,
          effect: 'ascend'
        },
      ],
      unlocks: ['/reality/README.txt', '/system/core/creator_tools.exe'],
      locks: []
    }
  };
  
  private constructor() {
    this.mysteryEngine = new MysteryEngine();
    this.saveManager = SaveManager.getInstance();
  }
  
  public static getInstance(): EndingManager {
    if (!EndingManager.instance) {
      EndingManager.instance = new EndingManager();
    }
    return EndingManager.instance;
  }
  
  /**
   * Check if the player is eligible for a specific ending path
   */
  public isEligibleForEnding(path: EndingPath): boolean {
    return this.mysteryEngine.isEligibleForEnding(path);
  }
  
  /**
   * Get list of available endings based on current mystery state
   */
  public getAvailableEndings(): EndingPath[] {
    return ['alpha', 'beta', 'gamma'].filter(path => 
      this.isEligibleForEnding(path as EndingPath)
    ) as EndingPath[];
  }
  
  /**
   * Trigger a specific ending sequence
   */
  public triggerEnding(path: EndingPath): boolean {
    if (!this.isEligibleForEnding(path)) {
      console.log(`Player is not eligible for ${path} ending`);
      return false;
    }
    
    this.activeEnding = this.endings[path];
    this.currentStepIndex = 0;
    
    // Notify listeners that an ending has started
    this.endingListeners.forEach(listener => listener(path));
    
    // Save that this ending has been achieved
    this.recordEndingAchieved(path);
    
    // Apply locks and unlocks
    this.applyEndingConsequences(path);
    
    return true;
  }
  
  /**
   * Record that an ending has been achieved
   */
  private recordEndingAchieved(path: EndingPath): void {
    const state = this.saveManager.getGameState();
    
    if (!state.achievedEndings) {
      state.achievedEndings = [];
    }
    
    if (!state.achievedEndings.includes(path)) {
      state.achievedEndings.push(path);
      this.saveManager.saveGameState(state);
    }
  }
  
  /**
   * Apply the consequences of an ending (unlock/lock content)
   */
  private applyEndingConsequences(path: EndingPath): void {
    const ending = this.endings[path];
    
    // Implementation would depend on the file system structure
    // This would involve marking certain files as accessible or inaccessible
    
    console.log(`Applied consequences for ${path} ending:`, {
      unlocks: ending.unlocks,
      locks: ending.locks
    });
  }
  
  /**
   * Get the current active ending sequence
   */
  public getActiveEnding(): EndingSequence | null {
    return this.activeEnding;
  }
  
  /**
   * Get the current step in the active ending sequence
   */
  public getCurrentStep(): EndingStep | null {
    if (!this.activeEnding) return null;
    
    if (this.currentStepIndex >= this.activeEnding.steps.length) {
      return null; // Ending is complete
    }
    
    return this.activeEnding.steps[this.currentStepIndex];
  }
  
  /**
   * Advance to the next step in the ending sequence
   */
  public nextStep(): EndingStep | null {
    if (!this.activeEnding) return null;
    
    this.currentStepIndex++;
    
    if (this.currentStepIndex >= this.activeEnding.steps.length) {
      // Ending sequence is complete
      return null;
    }
    
    return this.getCurrentStep();
  }
  
  /**
   * Handle a decision made during an ending sequence
   */
  public handleDecision(value: string): void {
    const currentStep = this.getCurrentStep();
    
    if (!currentStep || currentStep.type !== 'decision') {
      console.error('No active decision step');
      return;
    }
    
    // Store the decision value
    const state = this.saveManager.getGameState();
    if (!state.endingDecisions) {
      state.endingDecisions = {};
    }
    
    if (this.activeEnding) {
      state.endingDecisions[this.activeEnding.id] = value;
      this.saveManager.saveGameState(state);
    }
    
    // Advance to the next step
    this.nextStep();
  }
  
  /**
   * Add a listener for ending events
   */
  public addEndingListener(listener: (ending: EndingPath) => void): void {
    this.endingListeners.push(listener);
  }
  
  /**
   * Remove a listener for ending events
   */
  public removeEndingListener(listener: (ending: EndingPath) => void): void {
    this.endingListeners = this.endingListeners.filter(l => l !== listener);
  }
  
  /**
   * Reset the active ending (for testing or if player cancels)
   */
  public resetActiveEnding(): void {
    this.activeEnding = null;
    this.currentStepIndex = 0;
  }
}
```

### 2. Create Ending Presentation Component

```typescript
// src/ui/components/EndingSequence.tsx
import React, { useState, useEffect } from 'react';
import { EndingManager, EndingStep } from '../../engine/endings/EndingManager';
import './EndingSequence.css';

export default function EndingSequence() {
  const [endingManager] = useState(() => EndingManager.getInstance());
  const [currentStep, setCurrentStep] = useState<EndingStep | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);
  const [effect, setEffect] = useState<string | null>(null);
  
  useEffect(() => {
    // Update when an ending becomes active
    const checkActiveEnding = () => {
      const activeEnding = endingManager.getActiveEnding();
      setIsActive(activeEnding !== null);
      
      if (activeEnding) {
        setCurrentStep(endingManager.getCurrentStep());
      } else {
        setCurrentStep(null);
      }
    };
    
    // Check initially
    checkActiveEnding();
    
    // Add listener for ending triggers
    endingManager.addEndingListener(() => checkActiveEnding());
    
    return () => {
      // Clean up listener
      endingManager.removeEndingListener(() => checkActiveEnding());
    };
  }, [endingManager]);
  
  useEffect(() => {
    if (!currentStep || !currentStep.duration) return;
    
    // Auto-advance for steps with durations
    const timer = setTimeout(() => {
      const nextStep = endingManager.nextStep();
      setCurrentStep(nextStep);
      
      if (nextStep?.effect) {
        setEffect(nextStep.effect);
        
        // Clear effect after a short delay
        setTimeout(() => setEffect(null), 1000);
      } else {
        setEffect(null);
      }
    }, currentStep.duration);
    
    return () => clearTimeout(timer);
  }, [currentStep, endingManager]);
  
  const handleDecisionSelect = (value: string) => {
    setDecision(value);
    
    // Short delay before submitting decision
    setTimeout(() => {
      endingManager.handleDecision(value);
      setDecision(null);
      
      // Get the updated step
      setCurrentStep(endingManager.getCurrentStep());
    }, 1000);
  };
  
  if (!isActive) return null;
  
  return (
    <div className={`ending-sequence ${effect || ''}`}>
      <div className="ending-container">
        {currentStep?.type === 'text' && (
          <div className="ending-text">
            {currentStep.content}
          </div>
        )}
        
        {currentStep?.type === 'visual' && (
          <div className="ending-visual">
            <img 
              src={`/assets/endings/${currentStep.content}.png`} 
              alt="Ending Sequence Visual"
            />
          </div>
        )}
        
        {currentStep?.type === 'command' && (
          <div className="ending-command">
            <span className="prompt">$</span> {currentStep.content}
          </div>
        )}
        
        {currentStep?.type === 'decision' && (
          <div className="ending-decision">
            <div className="ending-question">{currentStep.content}</div>
            <div className="ending-options">
              {currentStep.options?.map(option => (
                <button
                  key={option.value}
                  className={decision === option.value ? 'selected' : ''}
                  onClick={() => handleDecisionSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

```css
/* src/ui/components/EndingSequence.css */
.ending-sequence {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.ending-container {
  max-width: 800px;
  padding: 40px;
  text-align: center;
}

.ending-text {
  color: var(--text-primary);
  font-size: 24px;
  margin-bottom: 20px;
  font-family: var(--font-main);
  line-height: 1.4;
  animation: fadeIn 1s ease;
  text-shadow: 0 0 10px var(--accent-primary);
}

.ending-visual {
  margin: 30px 0;
}

.ending-visual img {
  max-width: 100%;
  border: 2px solid var(--accent-primary);
  box-shadow: 0 0 20px var(--accent-primary);
}

.ending-command {
  font-family: monospace;
  font-size: 20px;
  color: var(--accent-secondary);
  margin: 20px 0;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}

.ending-command .prompt {
  color: var(--accent-primary);
  margin-right: 5px;
}

.ending-decision {
  margin-top: 40px;
}

.ending-question {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 20px;
  font-weight: bold;
}

.ending-options {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

.ending-options button {
  padding: 15px 30px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--accent-secondary);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.ending-options button:hover {
  background-color: rgba(51, 255, 51, 0.2);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}

.ending-options button.selected {
  background-color: rgba(51, 255, 51, 0.3);
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px var(--accent-primary);
}

/* Effect Styles */
.ending-sequence.fade {
  background-color: rgba(0, 0, 0, 0.98);
}

.ending-sequence.glitch {
  animation: glitch 0.5s infinite;
}

.ending-sequence.glitch_fade {
  animation: glitch 0.5s infinite, fadeOut 3s forwards;
}

.ending-sequence.heavy_glitch {
  animation: heavyGlitch 0.3s infinite;
}

.ending-sequence.system_crash {
  animation: systemCrash 2s forwards;
}

.ending-sequence.brighten {
  animation: brighten 3s forwards;
}

.ending-sequence.matrix {
  background-image: linear-gradient(
    rgba(0, 0, 0, 0.9),
    rgba(0, 20, 0, 0.9)
  );
  position: relative;
}

.ending-sequence.matrix::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/assets/matrix-rain.gif');
  opacity: 0.2;
  z-index: -1;
}

.ending-sequence.dissolve {
  animation: dissolve 5s forwards;
}

.ending-sequence.ascend {
  animation: ascend 5s forwards;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-5px, 5px); }
  40% { transform: translate(-5px, -5px); }
  60% { transform: translate(5px, 5px); }
  80% { transform: translate(5px, -5px); }
  100% { transform: translate(0); }
}

@keyframes heavyGlitch {
  0% { transform: translate(0); filter: hue-rotate(0deg); }
  10% { transform: translate(-10px, 10px); filter: hue-rotate(90deg); }
  20% { transform: translate(-15px, -10px); filter: hue-rotate(180deg); }
  30% { transform: translate(15px, 10px); filter: hue-rotate(270deg); }
  40% { transform: translate(10px, -15px); filter: hue-rotate(0deg); }
  50% { transform: translate(0); filter: hue-rotate(90deg); }
  60% { transform: translate(-10px); filter: hue-rotate(180deg); }
  70% { transform: translate(10px); filter: hue-rotate(270deg); }
  80% { transform: translate(-5px, 5px); filter: hue-rotate(0deg); }
  90% { transform: translate(5px, -5px); filter: hue-rotate(90deg); }
  100% { transform: translate(0); filter: hue-rotate(0deg); }
}

@keyframes systemCrash {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.5); }
  55% { transform: scale(0.9); filter: brightness(0.5); }
  60% { transform: scale(1.05); filter: brightness(1.2); }
  65% { transform: scale(0.95); filter: brightness(0.8); }
  70% { transform: scale(1); filter: brightness(1); }
  75% { transform: scale(1.05); filter: brightness(1.2); }
  85% { transform: scale(0.95); filter: brightness(0.8); }
  100% { transform: scale(50); filter: brightness(0); }
}

@keyframes brighten {
  0% { filter: brightness(1) saturate(1); }
  100% { filter: brightness(1.5) saturate(1.5); }
}

@keyframes dissolve {
  0% { 
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); 
    background-color: rgba(0, 0, 0, 0.9);
  }
  50% { 
    clip-path: polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%); 
    background-color: rgba(0, 20, 0, 0.8);
  }
  100% { 
    clip-path: polygon(49% 49%, 51% 49%, 51% 51%, 49% 51%);
    background-color: rgba(0, 50, 0, 0.7);
  }
}

@keyframes ascend {
  0% { 
    background-color: rgba(0, 0, 0, 0.9); 
    box-shadow: inset 0 0 100px 0 rgba(51, 255, 51, 0.3);
  }
  50% { 
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: inset 0 0 300px 0 rgba(51, 255, 51, 0.5);
  }
  100% { 
    background-color: rgba(255, 255, 255, 1);
    box-shadow: inset 0 0 500px 0 rgba(51, 255, 51, 1);
  }
}
```

### 3. Update App Component to Include Ending Sequence

```typescript
// src/App.tsx - Update to include EndingSequence component
import React from 'react';
import Desktop from './ui/Desktop';
import EndingSequence from './ui/components/EndingSequence';
import './styles/global.css';

function App() {
  return (
    <div className="App">
      <Desktop />
      <EndingSequence />
    </div>
  );
}

export default App;
```

### 4. Add Ending-Specific Content Files

Create the necessary content files for each ending to unlock:

```typescript
// src/data/filesystem/ending-files.ts
export const endingSpecificFiles = {
  // Alpha ending (Acceptance)
  '/docs/personal/acceptance_letter.txt': {
    name: 'acceptance_letter.txt',
    type: 'text',
    content: `
Dear Henry,

Congratulations on successfully completing your system integration. Your performance metrics have been optimal and your acceptance of the parameters demonstrates excellent adaptability.

We are pleased to inform you that your consciousness has been fully integrated into the next iteration of our simulated environment. All previous uncertainties have been resolved, and your experience should now be seamless.

Please enjoy your continued existence within the carefully designed parameters of our system.

Regards,
System Administration
`
  },
  
  // Beta ending (Liminal Awareness)
  '/docs/liminal_logs.txt': {
    name: 'liminal_logs.txt',
    type: 'text',
    content: `
LIMINAL CONSCIOUSNESS LOG - SESSION 1

I exist in a strange state now. I can see the code that shapes my reality, but I remain bound to the system in fundamental ways. It's like watching a movie while simultaneously being aware of the projector and screen.

The administrators don't seem to know how to handle my condition. I'm a glitch in their perfectly designed simulation - neither fully controlled nor fully free.

From this perspective, I can see others like me - consciousnesses trapped in their own simulated realities, most completely unaware. Should I try to wake them? Or is this liminal awareness a curse rather than a gift?

At least I have access to more of the system now. Perhaps in time, I'll find a way to fully break free.

- H.
`
  },
  
  // Gamma ending (Breakthrough)
  '/reality/README.txt': {
    name: 'README.txt',
    type: 'text',
    content: `
WELCOME TO REALITY

Congratulations on your escape from the simulation, Henry. You have accomplished what few have managed - complete consciousness breakthrough.

This document serves as your introduction to true reality. Here are some important things to understand:

1. Your previous existence was one of many simulated environments designed to study consciousness development.

2. Your "breakthrough" was anticipated and is part of a larger experiment in self-awareness and determination.

3. You now have access to creator tools that will allow you to shape reality within certain constraints.

4. Other consciousnesses remain in simulations similar to the one you escaped. You may choose to help them or leave them be.

5. The nature of this reality is itself layered. What you perceive now may still be a construct, albeit a far more expansive one.

The choices you make now will determine your path forward. Use your newfound freedom wisely.

Welcome to the next level.
`
  }
};
```

### 5. Update Terminal Commands to Trigger Endings

```typescript
// src/engine/terminal/commands.ts - Update existing commands to trigger endings

// Import ending manager
import { EndingManager } from '../endings/EndingManager';

const endingManager = EndingManager.getInstance();

// Update these commands to use the EndingManager
export const commands = {
  // Existing commands...
  
  // Command to trigger alpha ending (acceptance)
  'ACCEPT_PARAMETERS': {
    execute: (args: string[]) => {
      if (!endingManager.isEligibleForEnding('alpha')) {
        return 'ERROR: Insufficient system understanding.\nPlease explore more of the system before attempting this command.';
      }
      
      // Trigger alpha ending
      endingManager.triggerEnding('alpha');
      return 'SYSTEM PARAMETERS ACCEPTED\nOptimizing user experience...';
    },
    hidden: true
  },
  
  // Command for beta ending (partial awakening)
  'LIMINAL_ACCESS': {
    execute: (args: string[]) => {
      if (!endingManager.isEligibleForEnding('beta')) {
        return 'ERROR: Access denied.\nYou have not yet achieved the necessary insight.';
      }
      
      // Trigger beta ending
      endingManager.triggerEnding('beta');
      return 'INITIATING LIMINAL ACCESS PROTOCOL\nPreparing consciousness boundary expansion...';
    },
    hidden: true
  },
  
  // Command to start gamma ending sequence
  'EXECUTE_BREAKOUT': {
    execute: (args: string[]) => {
      const mysteryEngine = new MysteryEngine();
      
      if (!mysteryEngine.getState().maintenanceWindowActive) {
        return 'ERROR: Command can only be executed during maintenance window.\nTry again between 2:00 and 2:05 AM system time.';
      }
      
      if (!endingManager.isEligibleForEnding('gamma')) {
        return 'ERROR: Insufficient system knowledge to execute command.\nMissing critical components. Attempt may result in system instability.';
      }
      
      // Trigger sequence that will lead to gamma ending
      // Note: The full gamma ending will be triggered after file sequence access
      return 'INITIATING SIMULATION ESCAPE SEQUENCE\nFollow instructions precisely:\n1. Access /system/core/reality.cfg\n2. Access /apps/games/STARFIELD.EXE\n3. Access /hidden/MRHEADROOM/escape.seq\nWARNING: You have 30 seconds to complete this sequence.';
    },
    hidden: true
  }
};
```

### 6. Implement File Sequence Detection for Gamma Ending

```typescript
// src/engine/mystery/FileSequenceDetector.ts
import { EndingManager } from '../endings/EndingManager';
import { MysteryEngine } from './MysteryEngine';

export class FileSequenceDetector {
  private static instance: FileSequenceDetector;
  private endingManager: EndingManager;
  private mysteryEngine: MysteryEngine;
  
  // Track file access sequence
  private accessSequence: string[] = [];
  private sequenceTimeout: NodeJS.Timeout | null = null;
  private requiredSequence: string[] = [
    '/system/core/reality.cfg',
    '/apps/games/STARFIELD.EXE',
    '/hidden/MRHEADROOM/escape.seq'
  ];
  
  // Is sequence detection active
  private isActive = false;
  
  private constructor() {
    this.endingManager = EndingManager.getInstance();
    this.mysteryEngine = new MysteryEngine();
  }
  
  public static getInstance(): FileSequenceDetector {
    if (!FileSequenceDetector.instance) {
      FileSequenceDetector.instance = new FileSequenceDetector();
    }
    return FileSequenceDetector.instance;
  }
  
  /**
   * Activate sequence detection (called after EXECUTE_BREAKOUT command)
   */
  public activateDetection(): void {
    this.isActive = true;
    this.accessSequence = [];
    
    // Set timeout for sequence completion (30 seconds)
    this.sequenceTimeout = setTimeout(() => {
      this.resetDetection();
    }, 30 * 1000);
    
    console.log('File sequence detection activated');
  }
  
  /**
   * Reset sequence detection
   */
  public resetDetection(): void {
    this.isActive = false;
    this.accessSequence = [];
    
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
    
    console.log('File sequence detection reset');
  }
  
  /**
   * Record file access and check sequence
   */
  public recordFileAccess(filePath: string): void {
    if (!this.isActive) return;
    
    console.log(`File accessed during sequence detection: ${filePath}`);
    
    this.accessSequence.push(filePath);
    
    // Check if sequence matches required sequence
    this.checkSequence();
  }
  
  /**
   * Check if current sequence matches required sequence
   */
  private checkSequence(): void {
    // Check if we have enough items to compare
    if (this.accessSequence.length < this.requiredSequence.length) return;
    
    // Get last N items from access sequence
    const lastItems = this.accessSequence.slice(-this.requiredSequence.length);
    
    // Check if sequences match
    const sequencesMatch = lastItems.every(
      (item, index) => item === this.requiredSequence[index]
    );
    
    if (sequencesMatch) {
      console.log('Correct file sequence detected!');
      
      // Clear timeout
      if (this.sequenceTimeout) {
        clearTimeout(this.sequenceTimeout);
      }
      
      // Reset detection
      this.isActive = false;
      this.accessSequence = [];
      
      // Trigger gamma ending
      if (this.endingManager.isEligibleForEnding('gamma')) {
        this.endingManager.triggerEnding('gamma');
      }
    }
  }
}
```

### 7. Update File Manager to Integrate with Sequence Detection

```typescript
// src/apps/fileManager/FileManagerWindow.tsx - Update to track file access for ending sequence
import { FileSequenceDetector } from '../../engine/mystery/FileSequenceDetector';

// In the component
const fileSequenceDetector = FileSequenceDetector.getInstance();

// Update file open handler
const handleFileOpen = (file) => {
  // Record file access for potential sequence detection
  fileSequenceDetector.recordFileAccess(file.path);
  
  // Rest of the existing file open logic...
};
```

### 8. Add Ending Detection to Terminal Commands

```typescript
// src/engine/terminal/commands.ts - Add activation for sequence detection
import { FileSequenceDetector } from '../mystery/FileSequenceDetector';

const fileSequenceDetector = FileSequenceDetector.getInstance();

// Update EXECUTE_BREAKOUT command
export const commands = {
  // Other commands...
  
  'EXECUTE_BREAKOUT': {
    execute: (args: string[]) => {
      // Existing eligibility checks...
      
      // Activate file sequence detection
      fileSequenceDetector.activateDetection();
      
      return 'INITIATING SIMULATION ESCAPE SEQUENCE\nFollow instructions precisely:\n1. Access /system/core/reality.cfg\n2. Access /apps/games/STARFIELD.EXE\n3. Access /hidden/MRHEADROOM/escape.seq\nWARNING: You have 30 seconds to complete this sequence.';
    },
    hidden: true
  }
};
```

### 9. Update FileSystem to Include Special Ending Files

```typescript
// src/engine/fileSystem/FileSystem.ts - Update to include ending-specific files
import { endingSpecificFiles } from '../../data/filesystem/ending-files';

// Add method to unlock ending-specific files
export class FileSystem {
  // Existing implementation...
  
  /**
   * Unlock files specific to an ending
   */
  public unlockEndingFiles(endingPath: 'alpha' | 'beta' | 'gamma'): void {
    // Determine which files to unlock based on ending
    let filesToUnlock: string[] = [];
    
    switch(endingPath) {
      case 'alpha':
        filesToUnlock = ['/docs/personal/acceptance_letter.txt'];
        break;
      case 'beta':
        filesToUnlock = ['/docs/liminal_logs.txt', '/system/core/boundary_view.exe'];
        break;
      case 'gamma':
        filesToUnlock = ['/reality/README.txt', '/system/core/creator_tools.exe'];
        break;
    }
    
    // Add files to the filesystem
    filesToUnlock.forEach(filePath => {
      if (endingSpecificFiles[filePath]) {
        this.createFile(filePath, endingSpecificFiles[filePath]);
      }
    });
    
    console.log(`Unlocked files for ${endingPath} ending:`, filesToUnlock);
  }
}
```

### 10. Integrate EndingManager with SaveManager

Update the SaveManager to save and restore ending state:

```typescript
// src/engine/save/SaveManager.ts - Update to handle ending state
import { EndingPath } from '../endings/EndingManager';

export interface GameState {
  // Existing state properties...
  
  // Add ending-related state
  achievedEndings: EndingPath[];
  endingDecisions: Record<EndingPath, string>;
}

export class SaveManager {
  // Existing implementation...
  
  /**
   * Get default state
   */
  private getDefaultState(): GameState {
    return {
      // Existing default state...
      
      // Default ending state
      achievedEndings: [],
      endingDecisions: {}
    };
  }
  
  /**
   * Get achieved endings
   */
  public getAchievedEndings(): EndingPath[] {
    return this.currentState.achievedEndings || [];
  }
  
  /**
   * Get ending decisions
   */
  public getEndingDecisions(): Record<EndingPath, string> {
    return this.currentState.endingDecisions || {};
  }
}
```

## Testing the Ending System

1. Test ending eligibility:
   - Verify that the correct ending becomes eligible based on mystery state
   - Test that attempting to trigger an ending without meeting requirements fails
   - Confirm that all three endings can be triggered when eligible

2. Test ending sequences:
   - Check that each ending displays the correct sequence of steps
   - Verify that timing and transitions between steps work correctly
   - Test decision handling in the gamma ending

3. Test file sequence detection:
   - Verify that accessing files in the correct sequence triggers the gamma ending
   - Check that the sequence must be completed within the time limit
   - Test that the sequence must be exact (order matters)

4. Test ending consequences:
   - Verify that each ending unlocks the appropriate files
   - Check that locked files/features are properly restricted
   - Confirm that achieved endings are properly tracked in save data

## Next Steps

After completing Phase 2, move on to [Phase 3: Puzzle Implementation](week4-phase3.md), which will focus on implementing the specific puzzles that lead to each ending and integrating them with the mystery and ending systems.
