# MRHEADROOM_DESCENT — Project README

### Project summary
MRHEADROOM_DESCENT is a stylized retro operating system emulation that blends a MUD-style terminal, point-and-click exploration, and mini-games into a cohesive experience. The player explores a faux 1998 operating system (with a strong 1980s design influence), uncovers hidden files and apps, solves puzzles, and discovers a narrative mystery about the nature of reality itself. The game features three possible endings determined by the player's choices and puzzle-solving abilities.

### Vision & Tone
- Visual: neon & CRT, chunky UI elements, pixel-art icons, scanned-paper textures and late-90s skeuomorphism. Content, and story is dark in tone.
- Audio: system beeps, floppy-like noises, monophonic startup jingle, ambient hum. Psuedorandom red herring sounds play to improve the overall ambiance of the "thriller" aspect of the game's theme.
- UX: tactile, forgiving, nostalgic but polished. Must feel like interacting with a convincing legacy OS.

### Top-level feature checklist (MUST)
1. Hyper-stylized 1980s-themed 1998 OS design
   - Palette, fonts, UI chrome, and optional CRT shader.
   - Themeable via CSS variables.
   - Accessibility mode to disable heavy effects.

2. Realistic initial boot sequence
   - Text boot log with timed output and progress.
   - Optional BIOS-esque screens, loading spinner, and configurable boot scenarios (fast, normal, verbose).
   - Boot should be replayable from a menu.

3. Base-level apps & files convincingly emulated
   - File Manager with clickable files.
   - Text Editor (NOTE.TXT) with saved content.
   - Image Viewer that can display pixel art assets.
   - Settings app (display, audio, accessibility).
   - Emulated disk / file metadata (timestamps, authors, hidden attribute).

4. Base-level simple games convincingly emulated
   - At least two mini-games of different styles (one puzzle, one arcade/text).
   - Games must be integrated: their logs or saves can contain clues.

5. Mystery embedded in the OS
   - Multi-step puzzle(s) requiring reading files, using apps, playing mini-games, and combining clues.

6. Mystery difficulty
   - Not trivial; includes red herrings and requires synthesis of multiple clues.
   - Provide optional hint system that can be discovered or unlocked.

7. Hints within the OS
   - Hints distributed across files, system logs, game outcomes, file metadata, and UI Easter eggs.

8. Mystery has an ending
   - A clearly defined conclusion sequence after the final reveal.

9. Ending varies by choices
   - Choices, inventory items, and puzzle solutions influence outcome.

10. Exactly three possible endings
   - Each ending should be distinct in narrative and consequences (e.g., reveal, partial reveal with unresolved threads, and trap/false-positive result).

### Acceptance criteria / Definition of Done
- Visual theme and at least one alternate theme exist and are switchable.
- Boot sequence runs and can be re-triggered.
- File Manager, Text Editor, Image Viewer, and Settings work (open, edit for text editor, save to local storage).
- Two playable mini-games integrated with save/logging.
- Mystery documented in JSON and playable: clues exist in at least 5 unique locations and solving requires combining at least 3 clue types.
- Branching logic implemented and tested for 3 endings with deterministic reproducibility (based on saved state & choices).
- Save/Load and Export/Import save file implemented.
- Automated unit tests for core logic and at least one integration test for save/load + ending determinism.
- Basic performance budget met (initial load < 2MB gzipped assets where possible, responsive UI).
- Keyboard-only access supported for main flows; accessibility mode present.
- Documentation: README.md, copilotinstructions.md, DESIGN.md (puzzle + endings), and dev setup instructions.
- Build scripts produce a static site / PWA and provide instructions for packaging in Tauri/Capacitor.

### Minimum Viable Product (MVP)
- Working browser build with: splash/boot, Window Manager, Terminal, File Manager, Text Editor, 1 mini-game, Mystery with one path to each of the 3 endings (can be gated behind design choices).
- Data-driven content for scenes / hotspots / files.
- Readme + copilotinstructions.md + simple tests.

### Stretch goals
- Multiplayer MUD-style lobby (optional).
- Additional mini-games and Easter eggs.
- Achievements system and cloud save.
- Art polish: animated CRT shader, voiceover logs, advanced audio mixing.

### Tech stack (recommended)
- TypeScript, Vite, React (or Preact/Solid for minimalism) OR Vanilla TypeScript + small component layer.
- DOM for UI chrome, Canvas or PixiJS for pixel art scenes and mini-games.
- Local storage / IndexedDB for saves.
- Node.js for dev tooling. Optional Node server for multiplayer.
- Test: Vitest + Playwright (E2E).

### Folder structure (suggested)
- public/
- src/
  - assets/
  - data/                (scenes, hotspots, file manifests)
  - engine/
    - windowManager/
    - terminal/
    - scene/
    - input/
    - save/
  - apps/                (file-manager, editor, games)
  - ui/                  (components, themes)
  - styles/
  - main.tsx
- tests/
- docs/
  - DESIGN.md
  - puzzles.md
- package.json
- vite.config.ts
- README.md
- copilotinstructions.md

### Milestones & timeline
- Week 0: ✅ Scaffolding + README + copilotinstructions + basic UI theme + story design
- Week 1: ✅ WindowManager, Terminal, Boot sequence, Asset loader
- Week 2: ✅ File Manager, Text Editor, basic save/load
- Week 3: ✅ STARFIELD.EXE + LABRYNTHE.EXE + integration (game logs as clues)
- Week 4: ✅ Mystery implementation, clues placement, branching logic
- Week 5: Implement endings, polish, tests, packaging
- Week 6: Playtest pass, accessibility fixes, release candidate

#### Week 0 Completed Tasks
- ✅ Created project scaffold (package.json, tsconfig.json, vite.config.ts)
- ✅ Created basic folder structure following recommended architecture
- ✅ Implemented basic UI theme with CSS variables and CRT effect
- ✅ Created theme switching system with accessibility options
- ✅ Designed boot sequence with random glitches and Easter eggs
- ✅ Started WindowManager implementation with z-ordering and window controls
- ✅ Created detailed story design documents in /story directory
- ✅ Created DESIGN.md with puzzle flow and ending requirements
- ✅ Implemented initial file system structure in JSON for data-driven content

#### Week 1 Completed Tasks
- ✅ Completed WindowManager with full support for draggable windows, z-ordering, and focus handling
- ✅ Implemented Terminal with command parser, history, and basic system commands
- ✅ Developed Boot Sequence with configurable settings (verbose/fast/normal modes)
- ✅ Created Asset Loader with support for images, audio, and text resources
- ✅ Implemented FileSystem engine with JSON-based file structure and metadata
- ✅ Added keyboard navigation and accessibility focus indicators to windows
- ✅ Developed Desktop interface with clickable icons and taskbar
- ✅ Added glitch effects and CRT overlay with toggle functionality
- ✅ Implemented ThemeContext for global theme switching across components

#### Week 2 Completed Tasks
- ✅ Completed File Manager implementation with directory navigation and file operations
- ✅ Enhanced File Manager with file listing, context menu, and hidden files toggle
- ✅ Improved Text Editor with syntax highlighting and advanced file save/load functionality
- ✅ Added Save Dialog component to TextEditor for saving files to specific locations
- ✅ Implemented SaveManager with game state persistence and progress tracking
- ✅ Added autosave feature to prevent loss of progress
- ✅ Created game state system for tracking discovered clues and puzzle completion
- ✅ Implemented support for file metadata and special file handling
- ✅ Added keyboard shortcuts for common operations in Text Editor
- ✅ Integrated narrative elements with glitch effects and Easter eggs

#### Week 3 Completed Tasks
- ✅ Implemented STARFIELD.EXE arcade-style space shooter with full gameplay mechanics
- ✅ Created StarfieldEngine with ship movement, enemy spawning, and collision detection
- ✅ Added projectile handling, scoring system, and power-ups to Starfield
- ✅ Implemented LABYRINTH.EXE maze navigation game with procedural generation
- ✅ Created symbol collection mechanics and level progression in Labyrinth
- ✅ Developed GameBase abstract class with event logging and clue discovery hooks
- ✅ Integrated both games with SaveManager for game logs and clue discovery
- ✅ Added star pattern generation in Starfield that encodes clues
- ✅ Implemented symbol patterns in Labyrinth that provide narrative clues
- ✅ Created cross-game references and interconnected puzzle elements
- ✅ Added appropriate sound effects and visual feedback to both games
- ✅ Wrote comprehensive tests for both game implementations

#### Week 4 Completed Tasks
- ✅ Implemented MysteryEngine with singleton pattern for core mystery system
- ✅ Developed comprehensive clue discovery and tracking system
- ✅ Created path progress tracking for three distinct ending paths (alpha, beta, gamma)
- ✅ Implemented EndingManager with ending sequence definitions and visualization
- ✅ Developed PatternPuzzleSystem for user action pattern recognition
- ✅ Created FileMetadataSystem for hiding clues in file metadata
- ✅ Implemented RedHerringSystem with misleading but plausible clues
- ✅ Developed Guide application with escalating hint system and clue organization
- ✅ Added terminal commands for ending triggers with required clue verification
- ✅ Implemented maintenance window functionality for special game states
- ✅ Created comprehensive integration between all puzzle systems and mini-games
- ✅ Populated complete clue content with cross-references and triggers
- ✅ Wrote tests for MysteryEngine, EndingManager, PatternPuzzleSystem, and RedHerringSystem

### How to run (dev)
1. npm install
2. npm run dev
- Use the copilotinstructions.md to onboard agentic contributors.

### How to run (dev)
1. npm install
2. npm run dev
3. Open localhost dev server.

### How to build (prod)
1. npm run build
2. Serve `dist/` as static site or wrap in PWA/Tauri

### Contribution
- Follow conventional commit messages.
- Create small PRs per feature.
- Add unit tests for new logic.
- Use the copilotinstructions.md to onboard agentic contributors.