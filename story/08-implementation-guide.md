# MRHEADROOM_DESCENT - Content Implementation Guide

## Overview

This guide outlines how the story of MRHEADROOM_DESCENT should be implemented within the retro OS emulation game, mapping narrative elements to specific technical features and game mechanics.

## Story Implementation Breakdown

### Boot Sequence
- **Narrative Function**: Introduce subtle anomalies that hint at simulation nature
- **Technical Implementation**: 
  - Create boot.json with randomized "glitch" messages that occasionally appear
  - Add barely visible code fragments that flash during boot
  - Include cryptic system checks referencing "reality parameters"
  - Create three boot modes: normal, verbose (more clues), fast (fewer clues)

### File System Structure
- **Narrative Function**: Organize Hedrum's descent into MRHEADROOM
- **Technical Implementation**:
  - /home/hedrum/ - Normal work files, gradually becoming more paranoid
  - /system/ - OS files with hidden simulation references
  - /apps/ - Applications including the two key mini-games
  - /hidden/ - Secret directory only accessible after specific actions

### Terminal Commands
- **Narrative Function**: Provide investigation tools and trigger events
- **Technical Implementation**:
  - Create standard commands (ls, cd, cat, etc.)
  - Add special commands that reveal hidden content:
    - `analyze <file>` - Shows hidden metadata
    - `deepdive <directory>` - Shows normally hidden files
    - `syscore` - Attempts to access restricted areas (triggers reaction)
  - Final decision commands:
    - `ACCEPT_PARAMETERS`
    - `LIMINAL_ACCESS`
    - `EXECUTE_BREAKOUT`

### Mini-Games
- **Narrative Function**: Deliver encoded clues and test player skill
- **Technical Implementation**:
  - **STARFIELD.EXE** - Space shooter game:
    - Implement star pattern system that encodes information
    - Create scoring system where 15,953 points triggers memory dump
    - Add visual glitches at specific moments that reveal code fragments
  - **LABYRINTH.EXE** - Maze exploration game:
    - Design maze layout to reflect decision pathways
    - Implement collectible items that contain encrypted messages
    - Create three distinct exit paths corresponding to the three endings

### File Metadata System
- **Narrative Function**: Hide clues in plain sight across the system
- **Technical Implementation**:
  - Create JSON manifest for all files containing:
    - Visible metadata: creation date, modification date, size, author
    - Hidden metadata: reality_index, corruption_level, admin_flag
  - Implement searching and filtering on metadata
  - Allow metadata analysis to reveal patterns when viewed correctly

### Text Editor
- **Narrative Function**: Allow reading and modifying key narrative files
- **Technical Implementation**:
  - Basic text editing functionality
  - "Glitch" feature where text occasionally reveals hidden messages
  - Special viewing modes that can be unlocked to see steganographic content

### Image Viewer
- **Narrative Function**: Display images with hidden data and visual clues
- **Technical Implementation**:
  - Basic image viewing functionality
  - Special filters that reveal hidden text in images
  - Metadata extraction feature showing hidden EXIF-like data

### Settings App
- **Narrative Function**: Allow manipulation of simulation parameters
- **Technical Implementation**:
  - Standard settings: visual theme, audio, accessibility
  - Hidden settings that unlock after discoveries:
    - Reality filters (visual effects showing simulation aspects)
    - Time flow modifiers (help identify maintenance windows)
    - Security level adjustments (required for some puzzle solutions)

## Ending Implementation

### Path Tracking System
- Create a state object in the save system tracking key decisions
- Track discovered files, completed puzzles, and choice indicators
- Define threshold values for qualifying for each ending path

### Ending Triggers
- **Acceptance Ending**: Triggered by ACCEPT_PARAMETERS command after meeting basic discovery requirements
- **Partial Awakening**: Triggered by LIMINAL_ACCESS command after meeting moderate discovery requirements and solving key puzzles
- **Breakthrough**: Triggered by complex sequence during maintenance window, requiring all discoveries and perfect mini-game performance

### Ending Sequences
- Create distinct visual sequences for each ending
- Implement text output system for final messages
- Design visual effects appropriate to each outcome:
  - Acceptance: Subtle optimization of interface colors and responsiveness
  - Partial Awakening: Interface showing code elements and occasional glitches
  - Breakthrough: Complete dissolution of UI into abstract data visualization

## Technical Notes

### Save System Requirements
- Save file must track all discovered files and completed actions
- State object needs flags for all key decisions and discoveries
- Metadata for files should be preserved across sessions
- Allow multiple save files to let players explore different paths

### Content Management
- Store all narrative content in JSON/YAML files under src/data/:
  - texts.json - All journal entries, emails, and messages
  - files.json - File system structure and metadata
  - puzzles.json - Puzzle configurations and solutions
  - endings.json - Ending sequences and requirements

### Difficulty Balance
- Ensure basic story elements are discoverable by most players
- Make Path Alpha (Acceptance) accessible to casual players
- Make Path Beta (Partial Awakening) challenging but achievable
- Make Path Gamma (Breakthrough) extremely difficult, requiring perfect execution

## Accessibility Considerations

- Ensure text-based narrative is available with screen readers
- Provide alternative puzzle solutions that don't rely solely on visual or audio cues
- Include adjustable timing for timed sequences
- Create detailed in-game hint system for puzzle assistance

## Content Warnings

Include appropriate warnings for:
- Themes of existential crisis and questioning reality
- Potentially disorienting visual effects
- Text describing mental deterioration and paranoia
