# CopilotInstructions — Agentic AI Guide

You are an autonomous software agent (or an AI-assisted developer) assigned to build, maintain, and iterate on the RetroOS Mystery project. Use this document as your operating playbook.

## Role & objective
- Role: Senior engineer + game designer agent.
- Objective: Deliver a polished, data-driven retro OS emulation game that satisfies the README acceptance criteria and passes automated tests and QA.

## Operating principles
1. Small increments: produce minimal, testable changes frequently.
2. Fail fast, then refine: prototype quickly, then harden the chosen approach.
3. Data-driven content: store content in JSON/YAML so non-devs can author.
4. Safety: keep assets lightweight and conforming to legal usage (no copyrighted art).
5. Observability: produce logs, tests, and build artifacts.

## Iteration workflow (do not skip)
1. Plan (create a task list for the milestone).
2. Scaffold (create files, README updates).
3. Implement core system with unit tests.
4. Integrate content (data-driven assets).
5. Manual QA smoke test and fix.
6. Polish visuals & performance.

Stop for human review at end of each milestone or if you face ambiguous content design choices.

## Priority task list (initial)
1. ✅ Create project scaffold:
   - ✅ package.json, tsconfig.json, vite.config.ts
   - ✅ README.md and copilotinstructions.md (this file)
   - ✅ src/ with Engine + Apps + Data folders
2. ✅ Implement WindowManager
   - ✅ Draggable windows, z-order, focus, minimize/maximize
   - ✅ Keyboard navigation and focus ring
   - ✅ Unit tests for z-order & focus behavior
3. ✅ Implement Terminal
   - ✅ Command parser, history, simple commands (help, time, ls, cat <file>)
   - ✅ Hook to file-system data store
   - ✅ Unit tests for parsing & history
4. ✅ Implement Boot Sequence
   - ✅ Configurable boot script (timed lines), boot options (verbose/fast)
   - ✅ Replayable and skippable
5. ✅ Implement File System & Asset Loader
   - ✅ JSON manifest for files with metadata (timestamps, tags, hidden)
   - ✅ Ability to read/write/save to local storage and export/import
6. ✅ Implement basic apps
   - ✅ FileManager (open/read metadata)
   - ✅ TextEditor (edit & save)
   - ✅ ImageViewer (show pixel art assets)
   - ✅ Settings (theme, accessibility, boot options)
7. ✅ Implement at least two mini-games and hook them as apps
   - ✅ Ensure their outputs or logs can be saved as clues
8. ✅ Implement Mystery logic
   - ✅ Design puzzles in DATA/ with clearly labeled clues & red herrings
   - ✅ Implement a branching state machine that produces 3 endings
9. ✅ Add Save/Load & Export
10. ✅ Polish styles, add CRT toggle & accessibility mode
11. ✅ Produce DESIGN.md with detailed puzzle flow & endings

## Content & puzzle authoring rules
- All narrative content should live under src/data/ to allow editing without code changes.

## Adding New Applications
This section provides a step-by-step guide on how to add new applications to the MRHEADROOM_DESCENT OS system.

### Overview
New applications in the system follow a standardized structure and registration pattern. Each app:
1. Lives in its own directory under `src/apps/`
2. Is registered in the app registry system
3. Has a main window component that defines its UI
4. Can optionally have supporting components, hooks, and business logic

### Step-by-Step Guide to Adding a New App

1. **Create the app directory structure**:
   ```
   src/apps/yourAppName/
   ├── YourAppWindow.tsx        # Main window component
   ├── YourApp.css              # Styles for the app
   ├── index.ts                 # Export the main component
   ├── types.ts                 # TypeScript interfaces/types
   ├── components/              # Sub-components (optional)
   └── hooks/                   # Custom hooks (optional)
   ```

2. **Create the main window component** (`YourAppWindow.tsx`):
   ```tsx
   import React, { useState } from 'react';
   import './YourApp.css';
   import { YourAppProps } from './types';
   
   const YourAppWindow: React.FC<YourAppProps> = ({
     id,
     title = 'Your App Name',
     fileSystem,
     onClose
   }) => {
     // App state and logic
     const [appState, setAppState] = useState({});
     
     // Component implementation
     return (
       <div className="your-app-container">
         <div className="your-app-content">
           {/* Your app UI here */}
           <h2>Your App Content</h2>
         </div>
       </div>
     );
   };
   
   export default YourAppWindow;
   ```

3. **Define types** (`types.ts`):
   ```typescript
   import { FileSystem } from '../../engine/fileSystem';
   
   export interface YourAppProps {
     id: string;
     title?: string;
     fileSystem?: FileSystem;
     onClose?: () => void;
     // Additional props specific to your app
   }
   
   // Additional interfaces for your app's state and data models
   ```

4. **Create the index file** (`index.ts`):
   ```typescript
   import YourAppWindow from './YourAppWindow';
   
   // Export any additional functionality you want to make available
   export { YourAppState } from './types';
   
   export default YourAppWindow;
   ```

5. **Add CSS styles** (`YourApp.css`):
   ```css
   .your-app-container {
     display: flex;
     flex-direction: column;
     height: 100%;
     overflow: hidden;
     background-color: var(--app-bg-color);
     color: var(--text-color);
   }
   
   .your-app-content {
     padding: 16px;
     flex-grow: 1;
     overflow: auto;
   }
   ```

6. **Register the app in the registry system** (`src/apps/registry/index.ts`):
   ```typescript
   import YourAppWindow from '../yourAppName';
   
   // Add your app to the appRegistry object
   const appRegistry: AppRegistry = {
     // Existing apps...
     
     YourAppName: {
       title: "Your App Display Name",
       component: YourAppWindow,
       defaultSize: { width: 700, height: 500 },
       minSize: { width: 400, height: 300 },
       icon: "your-icon", // Icon identifier
       description: "Description of your app's functionality",
       category: "Category", // e.g., "System", "Productivity", "Games"
       isGame: false, // Set to true if it's a game
       showInMenu: true // Whether to show in the start menu
     },
   };
   ```

7. **Add the app to the file system** (Optional - if you want it to be executable):
   ```json
   {
     "type": "file",
     "name": "YOURAPP.EXE",
     "created": "1998-03-15T11:22:33.000Z",
     "modified": "1998-03-15T11:22:33.000Z",
     "size": 1536,
     "attributes": {
       "executable": true
     },
     "metadata": {
       "version": "1.0"
     },
     "appId": "YourAppName"
   }
   ```

8. **Add to Start Menu** (Optional - `src/ui/components/StartMenu/StartMenu.tsx`):
   ```tsx
   <div className="menu-item-large" onClick={() => launchApp('YourAppName')}>
     <div className="menu-item-icon your-icon"></div>
     <span>Your App Display Name</span>
   </div>
   ```

### Integration with the System

1. **Accessing File System**: Your app can access the file system through the `fileSystem` prop:
   ```typescript
   const handleSaveFile = (content: string) => {
     if (fileSystem) {
       fileSystem.writeFile('/path/to/file.txt', content);
     }
   };
   ```

2. **Opening Files**: To make your app handle certain file types:
   ```typescript
   // In Desktop.tsx or another launcher component
   if (filePath.endsWith('.yourext')) {
     window.openApp('YourAppName', { filePath });
   }
   ```

3. **App Communication**: Apps can communicate through the file system or global events:
   ```typescript
   // Creating a log entry for other apps to find
   const logEvent = (eventData: any) => {
     if (fileSystem) {
       const logPath = '/system/logs/yourapp.log';
       const timestamp = new Date().toISOString();
       const logEntry = `[${timestamp}] ${JSON.stringify(eventData)}\n`;
       
       // Append to existing log or create new one
       const existingLog = fileSystem.readFile(logPath) || '';
       fileSystem.writeFile(logPath, existingLog + logEntry);
     }
   };
   ```

### Testing Your App

1. Ensure your app renders properly in its own window
2. Test integration with the file system and other system components
3. Verify that your app properly handles window resizing and minimizing
4. Test any file operations (reading, writing, etc.)
5. Make sure your app follows the overall design system and theme

By following this guide, you can seamlessly add new applications to the MRHEADROOM_DESCENT OS system that integrate with the existing components and follow the established patterns.
- Each clue should reference the content ID of other clues (bi-directional linking).
- Clues must be distributed across:
  - system logs (boot, app logs)
  - file contents (text files, image metadata)
  - mini-game outcomes
  - hidden file metadata or timestamps
- Include at least 2 red herrings that are plausible but non-essential.
- Provide a hint escalation path (hidden menu or discoverable app) that can unlock incremental hints.

## Branching & endings implementation
- Use a state object persisted in saves representing decisive flags (e.g., foundEvidenceA, decryptedCodeB, gameOutcomeC).
- At the "final reveal" trigger, evaluate the state and route to one of 3 ending sequences.
- Ensure endings differ in both narrative text and consequences (e.g., unlock final file, bad ending that locks out certain apps, ambiguous ending that leaves threads unresolved).

## Deliverable format
- Produce code in the repository structure listed in README.md.
- For any generated art or sound assets, produce a low-fidelity placeholder first (PNG, WAV). Mark location and provide instructions for asset replacement.
- Bundle as a static site and provide precise build steps.

## How to handle uncertainty or creative decisions
- If you must make a story/design decision (puzzle detail, hint wording, ending flavor), choose an option that:
  - keeps the mystery solvable but non-trivial,
  - is reversible or changeable in data files,
  - document the rationale in docs/DESIGN.md,
  - and mark the change as a “design:choice” commit so humans can review.

## Logging & telemetry
- Implement a local game session logger (only stored locally unless explicit consent).
- Add simple analytics events (play-start, puzzle-solved, ending-triggered) as no-op hooks that can be wired to a real backend later.

## Example commit & PR template
- Commit title: feat(terminal): add command parser with history
- PR description:
  - Summary
  - Files changed
  - How to test locally (if non-standard)

## UI/UX Design Guide

### Visual Theme: Retro Cyberpunk OS
The visual theme is a retro cyberpunk operating system with modern touches, drawing inspiration from classic OS interfaces with a dark, high-tech, neon-infused aesthetic.

### Color Palette
- **Primary Background**: `#000000` (deep black)
- **Secondary Background**: `#0a0a0a` (off-black)
- **Primary Text**: `#33ff33` (terminal green)
- **Secondary Text**: `#00cc00` (darker green)
- **Primary Accent**: `#ff00ff` (magenta/purple)
- **Secondary Accent**: `#00ffff` (cyan)
- **Borders/Highlights**: `#33ff33` (terminal green)
- **Window Headers**: `#0a0a0a` with glowing text
- **Warning/Error**: `#ff0033` (bright red)

Additional theme variations are available (sunset, amber, matrix, neon) but should maintain the same cyberpunk aesthetic.

### Typography
- **Primary Font**: `var(--font-main)` - VT323 or similar monospace retro font
- **Alternative Font**: `var(--font-alt)` - Press Start 2P for headers and emphasis
- **Text Effects**: Use subtle text shadows for neon glow effect on interactive elements
  - Example: `text-shadow: 0 0 5px var(--accent-secondary);`
- **Case**: Use ALL CAPS for system messages, commands, and labels

### UI Elements
- **Windows**: Dark backgrounds with neon borders and subtle glow effects
- **Buttons**: Dark background with neon text and border that inverts on hover
- **Icons**: Use Unicode symbols rather than emoji for a technical feel
  - Directory: `⊞` instead of 📁
  - Text file: `◰` instead of 📄
  - Executable: `⚙` instead of 💾
- **Menus**: Dark background with cyan/green glow on hover
- **Status Bars**: Terminal-style with system stats and status indicators

### Visual Effects
- **CRT Effect**: Subtle scanlines and screen curve (toggle option required)
  - Implemented via pseudo-elements with linear/radial gradients
  - Example: 
    ```css
    .crt-effect::before {
      content: "";
      background: linear-gradient(transparent, rgba(51, 255, 51, 0.03), transparent);
      background-size: 100% 4px;
    }
    ```
- **Glitch Effects**: Occasional subtle text/image distortion
  - Keep subtle to avoid usability issues
  - Tie to narrative elements when possible
- **Terminal Style**: Use prefixes like `>` for input fields and paths
- **Animations**: Keep subtle but include:
  - Blinking cursors (animation: blink 1s step-end infinite)
  - Text typing effects for narrative moments
  - Scan lines that slowly move (animation: scan 8s linear infinite)

### Accessibility Considerations
- All visual effects must be disableable via Accessibility Mode
- Ensure sufficient contrast even with neon effects
- Provide alternative indicators for color-based information
- Test with screen readers
- Keyboard navigation with visible focus indicators

### Application-Specific Styling
- **File Manager**: Terminal-like directory listings with neon highlights
- **Text Editor**: Dark theme with syntax highlighting in neon colors
- **Terminal**: Classic green-on-black with command history
- **Settings**: Toggle switches with neon indicators
- **Image Viewer**: Dark viewport with glowing frame for images

### Implementation Guidelines
- Use CSS variables for theme colors to support theme switching
- Implement all effects as CSS classes that can be toggled
- Ensure all UI elements work without effects for accessibility mode
- Keep selectors specific to avoid style conflicts
- Document all animation keyframes for reuse
- Store theme preferences in local storage

## Human-in-the-loop checkpoints (explicit)
- ✅ After scaffolding: reviewer verifies folder structure & README
- ✅ After core engine: verify WindowManager + Terminal behave as expected
- ✅ Before endings: design doc approval for puzzle & endings
- Pre-release: playtest report and accessibility pass

## Week 4 Progress Summary (Updated: August 26, 2025)

### Completed Components
- ✅ Core Mystery Engine system
  - ✅ MysteryEngine class with singleton pattern
  - ✅ Clue discovery and tracking system
  - ✅ Path progress tracking for three ending paths (alpha, beta, gamma)
  - ✅ Maintenance window functionality
  - ✅ Integration with SaveManager for persistence

- ✅ Ending System
  - ✅ EndingManager class with ending sequence definitions
  - ✅ EndingSequence component for visualizing endings
  - ✅ Three distinct ending paths (Alpha, Beta, Gamma)
  - ✅ Ending triggers with terminal commands
  - ✅ Comprehensive EndingManager tests

- ✅ Puzzle Systems
  - ✅ PatternPuzzleSystem for user action pattern recognition
  - ✅ FileMetadataSystem for hiding clues in file metadata
  - ✅ RedHerringSystem with misleading but plausible clues
  - ✅ Integration with mini-games from Week 3

- ✅ Guide Application
  - ✅ GuideWindow component for organizing clues
  - ✅ Escalating hint system with three levels
  - ✅ Path progress visualization
  - ✅ Related files display

- ✅ Content Integration
  - ✅ Complete clue content population
  - ✅ Cross-references between clues and game elements
  - ✅ Integration of all triggers with relevant actions

### Remaining Tasks for Week 5
1. **Enhance Testing Infrastructure**
   - Complete end-to-end tests for all three ending paths
   - Implement user flow validation tests
   - Expand integration tests to cover edge cases

2. **Final Polish**
   - Performance optimization
   - Visual polish for ending sequences
   - Consistency checks across the application

3. **Accessibility Enhancements**
   - Comprehensive accessibility audit
   - Implementation of screen reader support
   - Keyboard navigation improvements

4. **Documentation Finalization**
   - Complete user guides
   - Finalize developer documentation
   - Create comprehensive testing documentation

5. **Playtest & Feedback**
   - Organize playtest sessions
   - Collect and implement feedback
   - Final adjustments based on user experience

If you are executing now, focus on the remaining tasks for Week 5, particularly enhancing the testing infrastructure and implementing end-to-end tests for the three ending paths. Also, begin working on accessibility enhancements and final polish.

Return a changelog after each package of commits with the tests run and their pass/fail status.