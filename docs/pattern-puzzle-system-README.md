# PatternPuzzleSystem

A comprehensive pattern recognition and puzzle system for the RetroOS mystery experience.

## Overview

The PatternPuzzleSystem allows players to discover patterns throughout the RetroOS experience by performing specific actions, accessing files in particular sequences, or finding connections between different parts of the system. When patterns are completed, they can unlock clues, trigger events, or provide visual feedback.

## Key Features

- **Multiple pattern types**: Sequence, combination, spatial, temporal, metadata, meta
- **Progress tracking**: Track partial progress toward pattern discovery
- **Visual feedback**: Notifications and progress indicators
- **Integration with MysteryEngine**: Connects puzzle solving to narrative progression
- **React components**: Ready-to-use UI components for visualization

## Pattern Types

1. **Sequence Patterns**: Ordered series of actions (e.g., terminal commands in specific order)
2. **Combination Patterns**: Unordered set of actions that must all be performed
3. **Spatial Patterns**: Clicking or interacting with specific locations in the UI
4. **Temporal Patterns**: Actions that must be performed during specific time windows
5. **Metadata Patterns**: Discovering hidden data in file metadata
6. **Meta Patterns**: Patterns that span across different applications or systems

## Usage Examples

### Recording Actions

```typescript
// Record a terminal command
patternSystem.recordAction({
  type: 'terminal_command',
  value: 'cat /var/log/system.log',
  timestamp: Date.now()
});

// Record a file access
patternSystem.recordAction({
  type: 'file_access',
  value: { path: '/home/user/notes.txt', action: 'open' },
  timestamp: Date.now()
});

// Record a click in an application
patternSystem.recordAction({
  type: 'click',
  value: { x: 150, y: 200, appId: 'starfield' },
  timestamp: Date.now()
});
```

### Checking Pattern Progress

```typescript
// Get progress for a specific pattern
const progress = patternSystem.getPatternProgress('constellation_pattern');
console.log(`Pattern progress: ${progress * 100}%`);

// Check if a pattern is active (completed)
const isActive = patternSystem.isPatternActive('maintenance_window_pattern');
```

### React Components

```tsx
// Show progress for active patterns
<PatternProgress showActive={true} />

// Show notifications when patterns are discovered
<PatternNotification />

// Show detailed pattern visualization
<PatternVisualizer />
```

## Integration with Applications

To integrate the PatternPuzzleSystem with your application:

1. Use the provided hooks:
   - `usePatternSystem` - Core pattern system functionality
   - `useTerminalPatternIntegration` - For terminal commands
   - `useFilePatternIntegration` - For file access events
   - `useGamePatternIntegration` - For game-specific events

2. Wrap your application with `PatternSystemIntegration`:

```tsx
<PatternSystemIntegration appId="fileManager">
  <FileManagerWindow />
</PatternSystemIntegration>
```

3. Include the notification component in your UI:

```tsx
function App() {
  return (
    <div>
      <Desktop />
      <PatternNotification />
    </div>
  );
}
```

## Testing

The PatternPuzzleSystem includes comprehensive tests for all pattern types. To run the tests:

```bash
npm test PatternPuzzleSystem
```
