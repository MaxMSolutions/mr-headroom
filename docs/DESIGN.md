# MRHEADROOM_DESCENT - Design Document

## Overview

MRHEADROOM_DESCENT is a stylized retro OS emulation game that tells the story of Henry Hedrum, a system administrator who discovers that his reality is actually a simulation. As he delves deeper into this revelation, his mental state deteriorates, eventually adopting the persona "MRHEADROOM" as he attempts to break free from the simulation's constraints.

## Story Summary: The Reality Simulation Collapse

System administrator Henry Hedrum discovers his company's supercomputer (NEXUS-9) is actually running a complex reality simulation—our reality—and he was merely a program within it. His logs show his increasing paranoia as he found evidence his world was synthetic, eventually adopting the handle "MRHEADROOM" as he attempted to hack the system constraints.

The player navigates through Hedrum's corrupted computer system, finding fragmented code exploits, simulation boundary tests, and increasingly erratic personal journals documenting his attempts to "see beyond the walls of reality."

## Three Endings

1. **Acceptance (PATH_ALPHA)** - The player chooses to accept the simulation, gaining privileges within it but remaining contained.
   - Difficulty: Moderate
   - Requirements: Discover at least 60% of journal entries, understand the basic nature of the simulation
   - Trigger: Execute ACCEPT_PARAMETERS command

2. **Partial Awakening (PATH_BETA)** - The player achieves a liminal state between the simulation and reality.
   - Difficulty: High
   - Requirements: Discover at least 80% of journal entries, decode at least one system log pattern
   - Trigger: Execute LIMINAL_ACCESS command

3. **Complete Breakthrough (PATH_GAMMA)** - The player fully breaks free of the simulation.
   - Difficulty: Very high (intentionally challenging)
   - Requirements: Discover 100% of journal entries, decode all system log patterns, perfect mini-game scores
   - Trigger: Execute EXECUTE_BREAKOUT command during a maintenance window

## Core Mystery Elements

1. **Journal Entries** - Henry's personal logs showing his descent into paranoia and transformation into MRHEADROOM.

2. **System Logs** - Technical logs showing anomalies that hint at simulation boundaries.

3. **Hidden Files** - Fragmented pieces of MRHEADROOM's research and escape plans.

4. **Mini-Games** - Two games that contain critical clues:
   - **STARFIELD.EXE** - Space shooter where star patterns encode information
   - **LABYRINTH.EXE** - Maze game where the layout maps to decision pathways

5. **Email Correspondence** - Communications between Hedrum and colleagues, plus system messages.

## Red Herrings

1. **Project Bluebook Files** - Files appearing to relate to UFO phenomena.

2. **Personal Crisis Evidence** - Evidence suggesting Hedrum had a mental breakdown.

## Puzzle Flow

1. **Initial Discovery Phase** - Boot sequence reveals subtle anomalies, basic file exploration.

2. **Investigation Phase** - Piecing together journal chronology, finding hidden files, completing mini-games.

3. **Breakthrough Phase** - Combining all evidence, executing precise sequences for specific endings.

## Technical Implementation Notes

- All narrative content stored in JSON files under src/data/
- File metadata contains hidden clues (creation dates forming patterns, author fields with encoded messages)
- Glitch effects that increase near important discoveries
- Mini-games with specific achievement requirements that unlock clues
- Terminal commands that trigger events or reveal hidden information

## Content Warning

The game contains themes of existential crisis, questioning reality, and depictions of paranoia and mental deterioration.
