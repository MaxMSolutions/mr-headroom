# PatternPuzzleSystem Documentation

The PatternPuzzleSystem is a powerful puzzle mechanics framework that enables pattern recognition across user actions in the RetroOS experience. It integrates with the MysteryEngine to connect puzzle-solving with narrative progression.

## Core Concepts

### Pattern Types

The system supports multiple types of patterns:

1. **Sequence Patterns**: Ordered series of actions (e.g., specific terminal commands in order)
2. **Combination Patterns**: Unordered set of actions that must all be performed
3. **Spatial Patterns**: Clicking or interacting with specific locations in the UI
4. **Temporal Patterns**: Actions that must be performed during specific time windows
5. **Metadata Patterns**: Discovering hidden data in file metadata
6. **Meta Patterns**: Actions that span across different applications

### Pattern Definition

A pattern is defined with the following properties:

```typescript
interface PatternDefinition {
  id: PatternId;
  type: PatternType;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // The actual pattern data - structure depends on pattern type
  patternData: any;
  
  // Recognition configuration
  recognitionConfig: {
    requiredMatches: number; // How many elements need to match
    tolerance: number; // How exact the match needs to be (0-1)
    timeLimit?: number; // For temporal patterns, time limit in ms
  };
  
  // What happens when the pattern is activated
  onActivation?: {
    clueId?: string; // Clue to reveal when activated
    triggerEvent?: string; // Event to trigger
    visualEffect?: string; // Visual effect to show
  };
  
  // Visual representation for UI
  visualRepresentation?: {
    icon: string;
    color: string;
    animation?: string;
  };
  
  // For tracking partial progress
  progressThresholds?: number[];
}
```

## Usage Examples

### 1. Recording User Actions

```typescript
import patternSystem from '../../engine/mystery/PatternPuzzleSystem';

// Record a terminal command
patternSystem.recordAction({
  type: 'terminal_command',
  value: 'grep "ERROR" /var/log/system.log',
  timestamp: Date.now()
});

// Record a file access
patternSystem.recordAction({
  type: 'file_access',
  value: { path: '/home/user/documents/notes.txt' },
  timestamp: Date.now()
});

// Record a click in a game
patternSystem.recordAction({
  type: 'click',
  value: { x: 120, y: 150, context: 'starfield' },
  timestamp: Date.now()
});
```

### 2. Registering a New Pattern

```typescript
patternSystem.registerPattern({
  id: 'secret_sequence',
  type: 'sequence',
  name: 'Secret Command Sequence',
  description: 'A hidden sequence of terminal commands',
  difficulty: 'medium',
  patternData: {
    sequence: ['cd /secret', 'cat manifest.txt', 'decode --key=7531']
  },
  recognitionConfig: {
    requiredMatches: 3,
    tolerance: 1.0
  },
  onActivation: {
    clueId: 'hidden_system_access',
    visualEffect: 'terminal_flash'
  },
  visualRepresentation: {
    icon: 'key',
    color: '#00ff00',
    animation: 'pulse'
  },
  progressThresholds: [0.33, 0.66, 1.0]
});
```

### 3. React Integration

Use the provided hook to integrate with React components:

```tsx
import usePatternSystem from '../hooks/usePatternSystem';

function PatternProgressIndicator() {
  const { patterns, getPatternProgress, isPatternActive } = usePatternSystem();
  
  return (
    <div className="pattern-indicators">
      {patterns.map(pattern => (
        <div 
          key={pattern.id}
          className={`pattern-indicator ${isPatternActive(pattern.id) ? 'active' : ''}`}
        >
          <div className="pattern-name">{pattern.name}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${getPatternProgress(pattern.id) * 100}%`}} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## UI Components

The following UI components are available:

1. **PatternNotification**: Shows a notification when patterns are activated
2. **PatternProgress**: Visualizes progress toward pattern discovery 
3. **PatternVisualizer**: Detailed visualization of pattern progress with animations
4. **PatternSystemIntegration**: Wrapper component that integrates applications with patterns

## Integration with MysteryEngine

The PatternPuzzleSystem integrates with the MysteryEngine to:

1. Discover clues when patterns are completed
2. Trigger events for narrative progression
3. Track active patterns in the game state

## Best Practices

1. **Use descriptive pattern IDs**: Make pattern IDs descriptive and follow a consistent naming convention.
2. **Set appropriate tolerances**: For spatial patterns, set tolerance based on the precision needed.
3. **Use pattern animations**: Visual feedback helps players understand pattern discovery.
4. **Test pattern recognition**: Ensure patterns can be consistently discovered with expected inputs.
5. **Balance difficulty**: Include patterns of varying difficulty throughout the game.

## Troubleshooting

1. **Pattern not recognizing**: Check tolerance values and ensure actions match the expected format.
2. **Events not firing**: Verify event listener setup in UI components.
3. **Progress not updating**: Check that the PatternPuzzleSystem is being used as a singleton.
4. **Patterns activating too easily**: Increase required matches or decrease tolerance.
