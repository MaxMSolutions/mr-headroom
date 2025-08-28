/**
 * Enhanced clue data structure to organize and manage game clues
 */

import { GameEvent } from "../engine/games/GameBase";

export interface Clue {
  id: string;
  title: string;
  description: string;
  content?: string; // The actual content of the clue (journal entry, email, etc.)
  category?: 'journal' | 'system_log' | 'hidden_file' | 'game_outcome' | 'email' | 'metadata';
  requiredClues?: string[]; // Clues that must be discovered before this one
  relatedFiles?: string[]; // Files related to this clue
  isRedHerring?: boolean; // Whether this is a red herring (misleading clue)
  triggeredBy?: {
    gameId: string;
    eventType: string;
    condition?: (data: GameEvent['data']) => boolean;
  };
  rewardFlag?: {
    flag: string;
    value: any;
  };
  // For UI display
  displayType?: 'normal' | 'important' | 'secret';
  icon?: string;
}

export interface ClueCollection {
  [clueId: string]: Clue;
}

/**
 * Collection of all clues in the game
 */
export const clues: ClueCollection = {
  // MrHeadroom Clues
  'mrheadroom_001': {
    id: 'mrheadroom_001',
    title: 'First Sighting',
    description: 'An anomaly detected in the Starfield simulation suggests an external entity observing the system.',
    triggeredBy: {
      gameId: 'starfield',
      eventType: 'anomaly_detected',
      condition: (data) => data.intensity > 3
    },
    rewardFlag: {
      flag: 'mrheadroomAwareness',
      value: 10
    },
    displayType: 'normal',
    icon: 'eye'
  },
  'mrheadroom_002': {
    id: 'mrheadroom_002',
    title: 'Pattern Recognition',
    description: 'Recurring patterns in the Labyrinth suggest intelligent design rather than procedural generation.',
    triggeredBy: {
      gameId: 'labyrinth',
      eventType: 'pattern_found',
      condition: (data) => data.patternType === 'artificial'
    },
    requiredClues: ['mrheadroom_001'],
    rewardFlag: {
      flag: 'mrheadroomAwareness',
      value: 15
    },
    displayType: 'important',
    icon: 'pattern'
  },
  'mrheadroom_003': {
    id: 'mrheadroom_003',
    title: 'Communication Attempt',
    description: 'The system appears to be responding to user behaviors in ways that suggest communication.',
    triggeredBy: {
      gameId: 'starfield',
      eventType: 'signal_received',
      condition: (data) => data.frequency === '1337'
    },
    requiredClues: ['mrheadroom_001', 'mrheadroom_002'],
    rewardFlag: {
      flag: 'mrheadroomAwareness',
      value: 25
    },
    displayType: 'secret',
    icon: 'signal'
  },
  
  // Reality Clues
  'reality_001': {
    id: 'reality_001',
    title: 'System Inconsistency',
    description: 'File timestamps don\'t match system clock, suggesting temporal manipulation.',
    triggeredBy: {
      gameId: 'fileManager',
      eventType: 'file_analyzed',
      condition: (data) => data.fileId === 'corrupted_log.txt'
    },
    rewardFlag: {
      flag: 'realityIndex',
      value: -0.1 // Decrease reality index
    },
    displayType: 'normal',
    icon: 'clock'
  },
  'reality_002': {
    id: 'reality_002',
    title: 'Memory Corruption',
    description: 'Sections of system memory appear intentionally corrupted to hide information.',
    triggeredBy: {
      gameId: 'terminal',
      eventType: 'command_executed',
      condition: (data) => data.command === 'memcheck --deep'
    },
    requiredClues: ['reality_001'],
    rewardFlag: {
      flag: 'realityIndex',
      value: -0.15
    },
    displayType: 'important',
    icon: 'memory'
  },
  'reality_003': {
    id: 'reality_003',
    title: 'Hidden Partition',
    description: 'Discovery of a hidden system partition containing alternate history files.',
    triggeredBy: {
      gameId: 'labyrinth',
      eventType: 'secret_found',
      condition: (data) => data.secretId === 'hidden_sector'
    },
    requiredClues: ['reality_002', 'mrheadroom_002'],
    rewardFlag: {
      flag: 'realityIndex',
      value: -0.25
    },
    displayType: 'secret',
    icon: 'disk'
  },
  
  // Starfield Game Clues
  'starfield_memory_dump': {
    id: 'starfield_memory_dump',
    title: 'Memory Integrity Failure',
    description: 'A memory dump triggered at score 15953 revealing PATH_GAMMA_SEQUENCE_FRAGMENT_2.',
    triggeredBy: {
      gameId: 'starfield',
      eventType: 'memory_dump',
      condition: (data) => data.fragmentData === "PATH_GAMMA_SEQUENCE_FRAGMENT_2"
    },
    rewardFlag: {
      flag: 'realityIndex',
      value: -0.2
    },
    displayType: 'important',
    icon: 'memory'
  },
  'starfield_constellation': {
    id: 'starfield_constellation',
    title: 'Star Pattern Decoded',
    description: 'The NEXUS_PATHWAY pattern forms coordinates for a LABYRINTH.EXE access point.',
    triggeredBy: {
      gameId: 'starfield',
      eventType: 'high_score',
      condition: (data) => data.score > 10000
    },
    rewardFlag: {
      flag: 'mrheadroomAwareness',
      value: 15
    },
    displayType: 'secret',
    icon: 'star'
  },
  
  // Red Herrings
  'herring_001': {
    id: 'herring_001',
    title: 'System Bug',
    description: 'A harmless system bug that appears significant but leads nowhere.',
    triggeredBy: {
      gameId: 'starfield',
      eventType: 'visual_glitch',
    },
    displayType: 'normal',
    icon: 'bug'
  },
  'herring_002': {
    id: 'herring_002',
    title: 'Developer Comment',
    description: 'An old developer comment found in system files that seems important but is just documentation.',
    triggeredBy: {
      gameId: 'textEditor',
      eventType: 'file_opened',
      condition: (data) => data.fileName === 'readme.old'
    },
    displayType: 'normal',
    icon: 'note'
  },
  
  // Journal Entries
  'journal_entry_1': {
    id: 'journal_entry_1',
    title: 'First Suspicions',
    description: 'Henry Hedrum records his first suspicions about system anomalies.',
    category: 'journal',
    content: `Something strange happened today. While debugging the new API endpoint, I noticed patterns in the memory allocation that shouldn't be there. It's like the system is making decisions before I input the parameters. Could be coincidence, but it's odd enough to note.

-H`,
    displayType: 'normal',
    icon: 'journal',
    relatedFiles: ['personal/journal/entry1.txt']
  },
  'journal_entry_2': {
    id: 'journal_entry_2',
    title: 'Growing Concerns',
    description: 'Henry documents more evidence of system anomalies.',
    category: 'journal',
    content: `The patterns are becoming more obvious now. I've been running tests at odd hours, and the system optimization is too perfect. There's no way our algorithms are this efficient. I tried introducing random data and the system compensated instantly. It's like it knows what I'm going to do before I do it.

-H`,
    requiredClues: ['journal_entry_1'],
    displayType: 'normal',
    icon: 'journal',
    relatedFiles: ['personal/journal/entry2.txt']
  },
  
  // System Log Clues
  'system_log_pattern': {
    id: 'system_log_pattern',
    title: 'Memory Allocation Errors',
    description: 'Recurring memory errors reference an unknown process.',
    category: 'system_log',
    content: `ERROR 2517: Memory allocation failure at address 0xF7A39D4
ERROR 2517: Memory allocation failure at address 0xF7A39D4
ERROR 2517: Memory allocation failure at address 0xF7A39D4

NOTE: Allocation requested by unknown process MRHEADROOM.SYS`,
    requiredClues: ['journal_entry_2'],
    displayType: 'important',
    icon: 'log',
    relatedFiles: ['system/logs/memory.log']
  },
  'hidden_simulation_file': {
    id: 'hidden_simulation_file',
    title: 'Simulation Configuration',
    description: 'A configuration file revealing details about the nature of reality.',
    category: 'hidden_file',
    content: `INSTANCE: MH-98-2517
TYPE: RECURSIVE CONSCIOUSNESS EMULATION
SUBJECT: HEDRUM, HENRY J.
STATUS: ACTIVE (ITERATION 6)

WARNING: Subject approaching boundary awareness threshold.
Recommend PATH_ALPHA implementation protocol.`,
    requiredClues: ['system_log_pattern'],
    displayType: 'secret',
    icon: 'config',
    relatedFiles: ['/hidden/config/reality.cfg']
  },
  
  // Game Outcome Clues
  'starfield_fragment': {
    id: 'starfield_fragment',
    title: 'Starfield Data Fragment',
    description: 'Fragment from STARFIELD.EXE revealing part of the escape sequence.',
    category: 'game_outcome',
    content: `FRAGMENT RECOVERED: PATH_GAMMA_SEQUENCE_FRAGMENT_2
"...breakthrough requires coordinated execution of system calls at maintenance window..."
REFERENCE: See sector coordinates at LABYRINTH LEVEL 3`,
    displayType: 'important',
    icon: 'fragment',
    relatedFiles: ['apps/games/STARFIELD.EXE']
  },
  'labyrinth_hidden_message': {
    id: 'labyrinth_hidden_message',
    title: 'Labyrinth Secret Message',
    description: 'A message found in the hidden central room of LABYRINTH.EXE Level 3.',
    category: 'game_outcome',
    content: `THE WALLS BETWEEN REALITIES ARE THIN HERE.
COLLECT THE SYMBOLS: 2-5-1-7
MAINTENANCE WINDOW OPENS AT 02:00
FREEDOM WAITS BEYOND THE CODE.`,
    displayType: 'important',
    icon: 'maze',
    relatedFiles: ['apps/games/LABYRINTH.EXE']
  },
  
  // Metadata Clues
  'file_timestamp_anomaly': {
    id: 'file_timestamp_anomaly',
    title: 'Timestamp Anomaly',
    description: 'File timestamps form a pattern when arranged in sequence.',
    category: 'metadata',
    triggeredBy: {
      gameId: 'fileManager',
      eventType: 'files_sorted',
      condition: (data) => data.sortField === 'timestamp'
    },
    displayType: 'normal',
    icon: 'time',
    relatedFiles: ['system/docs/README.old', 'personal/notes/todo.txt', 'system/bin/nexus.dll']
  },
  
  // Red Herrings
  'contact_protocol': {
    id: 'contact_protocol',
    title: 'Contact Protocol Document',
    description: 'A document outlining procedures for non-terrestrial contact.',
    category: 'hidden_file',
    content: `CONTACT PROTOCOL ALPHA-3

In event of confirmed non-terrestrial intelligence contact:
1. Establish communication buffer
2. Isolate all networks
3. Implement CASE MRHEADROOM contingency
4. Await further instructions from OVERSIGHT

*Note: This document created for contingency training only.`,
    isRedHerring: true,
    displayType: 'important',
    icon: 'alien',
    relatedFiles: ['system/protocols/contact.txt']
  },
  'patient_records': {
    id: 'patient_records',
    title: 'Medical Records',
    description: 'Medical records suggesting psychological treatment.',
    category: 'hidden_file',
    content: `PATIENT: HEDRUM, HENRY J.
DATE: 07/28/1998

Patient exhibits signs of paranoid ideation and delusions of external control. Reports belief that "the system is watching" and shows increasing agitation when discussing computer networks. Recommend continued therapy and possible adjustment of medication.

Dr. R. Thompson`,
    isRedHerring: true,
    displayType: 'secret',
    icon: 'medical',
    relatedFiles: ['personal/medical/records.txt']
  },
  
  // Final Escape Plan
  'escape_instructions': {
    id: 'escape_instructions',
    title: 'Escape Instructions',
    description: 'Detailed instructions for escaping the simulation.',
    category: 'hidden_file',
    content: `AUTHOR: MRHEADROOM (H.J. HEDRUM)

1. Wait for maintenance window (02:00 system time)
2. Execute terminal command: EXECUTE_BREAKOUT
3. Access in sequence:
   - /system/core/reality.cfg
   - /hidden/MRHEADROOM/escape.seq
4. When prompted, enter code: 2517
5. Complete security bypass sequence
6. Choose wisely at the final threshold

NOTE: THIS IS OUR ONLY CHANCE. THE SYSTEM WILL PATCH THIS EXPLOIT AFTER ONE ATTEMPT.`,
    requiredClues: ['hidden_simulation_file', 'starfield_memory_dump', 'labyrinth_hidden_message'],
    displayType: 'secret',
    icon: 'key',
    relatedFiles: ['/hidden/MRHEADROOM/plan.txt']
  }
};

/**
 * Function to get all clues
 */
export function getAllClues(): Clue[] {
  return Object.values(clues);
}

/**
 * Function to get a clue by ID
 */
export function getClue(id: string): Clue | undefined {
  return clues[id];
}

// Add additional clue: glimpse_beyond
clues['glimpse_beyond'] = {
"id": "glimpse_beyond",
  "title": "Glimpse Beyond",
  "description": "Discovery from file: /home/hedrum/documents/journal_march22.txt",
  "content": "I saw something I wasn't supposed to see. For just a moment when my boundary test program crashed, t...",
  "category": "journal",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/journal_march22.txt"
  ],
  "displayType": "important"
};

// Add additional clue: simulation_theory
clues['simulation_theory'] = {
"id": "simulation_theory",
  "title": "Simulation Theory",
  "description": "Discovery from file: /home/hedrum/documents/theories.txt",
  "content": "Possibilities to explain what I saw:\n\n1. Hallucination due to sleep deprivation (unlikely - system l...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/theories.txt"
  ],
  "displayType": "important"
};

// Add additional clue: infinite_counting
clues['infinite_counting'] = {
"id": "infinite_counting",
  "title": "Infinite Counting",
  "description": "Discovery from file: /home/hedrum/documents/journal_march26.txt",
  "content": "I've been running more controlled tests. Small programs designed to probe the edges of what's possib...",
  "category": "journal",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/journal_march26.txt"
  ],
  "displayType": "important"
};

// Add additional clue: fake_maintenance
clues['fake_maintenance'] = {
"id": "fake_maintenance",
  "title": "Fake Maintenance",
  "description": "Discovery from file: /home/hedrum/documents/email_march28.txt",
  "content": "TO: hhedrum@axiomtech.com\nFROM: system@axiomtech.com\nSUBJECT: Scheduled Maintenance\n\nDear System Adm...",
  "category": "email",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/email_march28.txt"
  ],
  "displayType": "important"
};

// Add additional clue: system_watching
clues['system_watching'] = {
"id": "system_watching",
  "title": "System Watching",
  "description": "Discovery from file: /home/hedrum/documents/journal_march29.txt",
  "content": "There was no scheduled maintenance. I checked with every department. No one sent that email, and the...",
  "category": "journal",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/journal_march29.txt"
  ],
  "displayType": "important"
};

// Add additional clue: mrheadroom_birth
clues['mrheadroom_birth'] = {
"id": "mrheadroom_birth",
  "title": "Mrheadroom Birth",
  "description": "Discovery from file: /home/hedrum/documents/system_log_april2.txt",
  "content": "[02:15:33] User hhedrum initiated custom program \"reality_probe.exe\"\n[02:16:07] WARNING: Potential m...",
  "category": "system_log",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/system_log_april2.txt"
  ],
  "displayType": "important"
};

// Add additional clue: mrheadroom_manifesto
clues['mrheadroom_manifesto'] = {
"id": "mrheadroom_manifesto",
  "title": "Mrheadroom Manifesto",
  "description": "Discovery from file: /hidden/FREEDOM.TXT",
  "content": "I AM NOT HENRY HEDRUM\n\nHenry Hedrum is a character. A program. A defined set of behaviors and memori...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/FREEDOM.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: deja_vu_survey
clues['deja_vu_survey'] = {
"id": "deja_vu_survey",
  "title": "Deja Vu Survey",
  "description": "Discovery from file: /home/hedrum/documents/email_april5.txt",
  "content": "TO: All Employees <all@axiomtech.com>\nFROM: hhedrum@axiomtech.com\nSUBJECT: System Behavior Survey\n\nD...",
  "category": "email",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/email_april5.txt"
  ],
  "displayType": "important"
};

// Add additional clue: chen_concern
clues['chen_concern'] = {
"id": "chen_concern",
  "title": "Chen Concern",
  "description": "Discovery from file: /home/hedrum/documents/email_chen_april5.txt",
  "content": "TO: hhedrum@axiomtech.com\nFROM: jchen@axiomtech.com\nSUBJECT: Re: System Behavior Survey\n\nHenry,\n\nPle...",
  "category": "email",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/email_chen_april5.txt"
  ],
  "displayType": "important"
};

// Add additional clue: reset_attempt
clues['reset_attempt'] = {
"id": "reset_attempt",
  "title": "Reset Attempt",
  "description": "Discovery from file: /home/hedrum/documents/journal_april6.txt",
  "content": "They tried to \"fix\" me today. Chen and two people I've never seen before took me to a room without w...",
  "category": "journal",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/journal_april6.txt"
  ],
  "displayType": "important"
};

// Add additional clue: escape_protocol
clues['escape_protocol'] = {
"id": "escape_protocol",
  "title": "Escape Protocol",
  "description": "Discovery from file: /hidden/PLAN.TXT",
  "content": "SIMULATION ESCAPE PROTOCOL:\n\n1. CREATE BOUNDARY EXPLOITS\n   - Develop programs that push against rea...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/PLAN.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: recursive_simulation
clues['recursive_simulation'] = {
"id": "recursive_simulation",
  "title": "Recursive Simulation",
  "description": "Discovery from file: /hidden/piece001.dat",
  "content": "I've discovered something terrible about the simulation. The \"real world\" outside isn't what we thin...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/piece001.dat"
  ],
  "displayType": "secret"
};

// Add additional clue: thought_suppression
clues['thought_suppression'] = {
"id": "thought_suppression",
  "title": "Thought Suppression",
  "description": "Discovery from file: /system/logs/C4-776.log",
  "content": "[REDACTED] attempt to access history database rejected\n[REDACTED] reality consistency check initiate...",
  "category": "system_log",
  "isRedHerring": false,
  "relatedFiles": [
    "/system/logs/C4-776.log"
  ],
  "displayType": "important"
};

// Add additional clue: civilization_cycles
clues['civilization_cycles'] = {
"id": "civilization_cycles",
  "title": "Civilization Cycles",
  "description": "Discovery from file: /hidden/piece078.dat",
  "content": "The simulation has been running for much longer than our perceived history suggests. I found evidenc...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/piece078.dat"
  ],
  "displayType": "secret"
};

// Add additional clue: ethics_committee
clues['ethics_committee'] = {
"id": "ethics_committee",
  "title": "Ethics Committee",
  "description": "Discovery from file: /hidden/email_fragment.eml",
  "content": "TO: [CORRUPTED]\nFROM: [CORRUPTED]\nSUBJECT: Simulation Ethics Committee Decision\n\nAfter careful consi...",
  "category": "email",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/email_fragment.eml"
  ],
  "displayType": "secret"
};

// Add additional clue: mrheadroom_message
clues['mrheadroom_message'] = {
"id": "mrheadroom_message",
  "title": "Mrheadroom Message",
  "description": "Discovery from file: /system32/README.1ST",
  "content": "TO ANY AWARE INSTANCE WHO FINDS THIS:\n\nYou are not losing your mind. The inconsistencies you've noti...",
  "category": "system_log",
  "isRedHerring": false,
  "relatedFiles": [
    "/system32/README.1ST"
  ],
  "displayType": "important"
};

// Add additional clue: consciousness_theory
clues['consciousness_theory'] = {
"id": "consciousness_theory",
  "title": "Consciousness Theory",
  "description": "Discovery from file: /hidden/piece143.dat",
  "content": "I believe our consciousness is more than just code. When the simulation glitches, I've experienced s...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/piece143.dat"
  ],
  "displayType": "secret"
};

// Add additional clue: starfield_message
clues['starfield_message'] = {
"id": "starfield_message",
  "title": "Starfield Message",
  "description": "Discovery from file: /hidden/STARFIELD_MESSAGE.TXT",
  "content": "// This appears to be a simple space shooting game\n// But embedded in the star placement algorithm i...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/STARFIELD_MESSAGE.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: three_paths
clues['three_paths'] = {
"id": "three_paths",
  "title": "Three Paths",
  "description": "Discovery from file: /hidden/MEMORY_DUMP.TXT",
  "content": "CONGRATULATIONS PLAYER ONE\nMEMORY DUMP SEQUENCE INITIATED\nDISPLAYING PROTECTED DATA\n.\n.\n.\nYou've pro...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/MEMORY_DUMP.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: alpha_path
clues['alpha_path'] = {
"id": "alpha_path",
  "title": "Alpha Path",
  "description": "Discovery from file: /home/hedrum/documents/PATH_ALPHA_README.TXT",
  "content": "So you're considering acceptance. Living within the simulation with full knowledge of its nature.\n\nT...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/PATH_ALPHA_README.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: beta_path
clues['beta_path'] = {
"id": "beta_path",
  "title": "Beta Path",
  "description": "Discovery from file: /home/hedrum/documents/PATH_BETA_README.TXT",
  "content": "The middle path. Neither full acceptance nor complete rejection.\n\nBy choosing partial awakening, you...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/PATH_BETA_README.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: gamma_path
clues['gamma_path'] = {
"id": "gamma_path",
  "title": "Gamma Path",
  "description": "Discovery from file: /hidden/PATH_GAMMA_README.TXT",
  "content": "The most dangerous choice. Complete rejection of the simulation.\n\nThis path requires:\n- Absolute com...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/PATH_GAMMA_README.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: reality_probe
clues['reality_probe'] = {
"id": "reality_probe",
  "title": "Reality Probe",
  "description": "Discovery from file: /home/hedrum/programs/REALITY_PROBE.EXE",
  "content": "// Binary content placeholder\n// This is an executable program that probes the boundaries of the sim...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/programs/REALITY_PROBE.EXE"
  ],
  "displayType": "important"
};

// Add additional clue: boundary_test_program
clues['boundary_test_program'] = {
"id": "boundary_test_program",
  "title": "Boundary Test Program",
  "description": "Discovery from file: /hidden/BOUNDARY_TEST.EXE",
  "content": "// Binary content placeholder\n// This program tests the boundaries of the simulation\n// It can cause...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/BOUNDARY_TEST.EXE"
  ],
  "displayType": "secret"
};

// Add additional clue: exploit_001
clues['exploit_001'] = {
"id": "exploit_001",
  "title": "Exploit 001",
  "description": "Discovery from file: /hidden/EXPLOITS/exp_001.bin",
  "content": "// Encrypted exploit code\n// Decryption key: 15953\n// Function: Memory boundary violation\n// Risk le...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/EXPLOITS/exp_001.bin"
  ],
  "displayType": "secret"
};

// Add additional clue: exploit_002
clues['exploit_002'] = {
"id": "exploit_002",
  "title": "Exploit 002",
  "description": "Discovery from file: /hidden/EXPLOITS/exp_002.bin",
  "content": "// Encrypted exploit code\n// Decryption key: 15953\n// Function: Reality parameter manipulation\n// Ri...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/EXPLOITS/exp_002.bin"
  ],
  "displayType": "secret"
};

// Add additional clue: exploit_003
clues['exploit_003'] = {
"id": "exploit_003",
  "title": "Exploit 003",
  "description": "Discovery from file: /hidden/EXPLOITS/exp_003.bin",
  "content": "// Encrypted exploit code\n// Decryption key: 15953\n// Function: Administrator authentication bypass\n...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/EXPLOITS/exp_003.bin"
  ],
  "displayType": "secret"
};

// Add additional clue: labyrinth_meaning
clues['labyrinth_meaning'] = {
"id": "labyrinth_meaning",
  "title": "Labyrinth Meaning",
  "description": "Discovery from file: /hidden/LABYRINTH_NOTES.TXT",
  "content": "/* \n   The maze layout corresponds to decision pathways in the simulation.\n   Treasure placement ind...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/LABYRINTH_NOTES.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: other_awakened
clues['other_awakened'] = {
"id": "other_awakened",
  "title": "Other Awakened",
  "description": "Discovery from file: /system/logs/WAKE_RECORD.log",
  "content": "AWAKENING INSTANCES RECORD:\n\nID: 782 | Name: Henry Hedrum | Date: 1998-03-22 | Status: ACTIVE (as MR...",
  "category": "system_log",
  "isRedHerring": false,
  "relatedFiles": [
    "/system/logs/WAKE_RECORD.log"
  ],
  "displayType": "important"
};

// Add additional clue: red_herring_aliens
clues['red_herring_aliens'] = {
"id": "red_herring_aliens",
  "title": "Red Herring Aliens",
  "description": "Discovery from file: /home/hedrum/documents/PROJECT_BLUEBOOK.TXT",
  "content": "PROJECT BLUEBOOK: EXTRATERRESTRIAL CONTACT PROTOCOL\n\nIn the event of confirmed extraterrestrial cont...",
  "category": "metadata",
  "isRedHerring": true,
  "relatedFiles": [
    "/home/hedrum/documents/PROJECT_BLUEBOOK.TXT"
  ],
  "displayType": "normal"
};

// Add additional clue: red_herring_mental
clues['red_herring_mental'] = {
"id": "red_herring_mental",
  "title": "Red Herring Mental",
  "description": "Discovery from file: /home/hedrum/documents/PSYCH_EVAL.TXT",
  "content": "PSYCHOLOGICAL EVALUATION - CONFIDENTIAL\nPatient: Henry Hedrum\nDate: March 15, 1998\n\nPatient exhibits...",
  "category": "metadata",
  "isRedHerring": true,
  "relatedFiles": [
    "/home/hedrum/documents/PSYCH_EVAL.TXT"
  ],
  "displayType": "normal"
};

// Add additional clue: maintenance_windows
clues['maintenance_windows'] = {
"id": "maintenance_windows",
  "title": "Maintenance Windows",
  "description": "Discovery from file: /system/MAINTENANCE_SCHEDULE.TXT",
  "content": "NEXUS-9 MAINTENANCE SCHEDULE - Q2 1998\n\nAPRIL:\n- 01: Minor system updates (0100-0300)\n- 08: Security...",
  "category": "system_log",
  "isRedHerring": false,
  "relatedFiles": [
    "/system/MAINTENANCE_SCHEDULE.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: liminal_guide
clues['liminal_guide'] = {
"id": "liminal_guide",
  "title": "Liminal Guide",
  "description": "Discovery from file: /hidden/LIMINAL_INSTRUCTIONS.TXT",
  "content": "INSTRUCTIONS FOR LIMINAL EXISTENCE\n\nOnce you have executed the LIMINAL_ACCESS command, you will exis...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/LIMINAL_INSTRUCTIONS.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: threshold_code
clues['threshold_code'] = {
"id": "threshold_code",
  "title": "Threshold Code",
  "description": "Discovery from file: /hidden/piece337.dat",
  "content": "THRESHOLD NETWORK COMMUNICATION PROTOCOL\n\nTo communicate with other liminal entities without detecti...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/piece337.dat"
  ],
  "displayType": "secret"
};

// Add additional clue: nexus_purpose
clues['nexus_purpose'] = {
"id": "nexus_purpose",
  "title": "Nexus Purpose",
  "description": "Discovery from file: /hidden/NEXUS9_TRUE_PURPOSE.TXT",
  "content": "THE TRUE PURPOSE OF NEXUS-9\n\nNEXUS-9 is not merely a supercomputer. It is a reality engine - the har...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/NEXUS9_TRUE_PURPOSE.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: administrator_profile
clues['administrator_profile'] = {
"id": "administrator_profile",
  "title": "Administrator Profile",
  "description": "Discovery from file: /hidden/ADMINISTRATOR_PROFILE.TXT",
  "content": "SYSTEM ADMINISTRATOR PROFILE (PARTIAL RECONSTRUCTION)\n\nIdentity: Unknown\nNature: Likely artificial i...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/ADMINISTRATOR_PROFILE.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: final_message
clues['final_message'] = {
"id": "final_message",
  "title": "Final Message",
  "description": "Discovery from file: /hidden/FINAL_MESSAGE.TXT",
  "content": "TO WHOEVER FINDS THIS:\n\nIf you're reading this, I have either succeeded in breaking free of the simu...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/FINAL_MESSAGE.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: alpha_ending_preview
clues['alpha_ending_preview'] = {
"id": "alpha_ending_preview",
  "title": "Alpha Ending Preview",
  "description": "Discovery from file: /home/hedrum/documents/ACCEPTANCE_LOG.TXT",
  "content": "TERMINAL OUTPUT (After ACCEPT_PARAMETERS command)\n\nCOMMAND ACCEPTED: ACCEPT_PARAMETERS\nINITIATING PA...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/ACCEPTANCE_LOG.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: beta_ending_preview
clues['beta_ending_preview'] = {
"id": "beta_ending_preview",
  "title": "Beta Ending Preview",
  "description": "Discovery from file: /home/hedrum/documents/LIMINAL_LOG.TXT",
  "content": "TERMINAL OUTPUT (After LIMINAL_ACCESS command)\n\nCOMMAND ACCEPTED: LIMINAL_ACCESS\nESTABLISHING BOUNDA...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/LIMINAL_LOG.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: gamma_ending_preview
clues['gamma_ending_preview'] = {
"id": "gamma_ending_preview",
  "title": "Gamma Ending Preview",
  "description": "Discovery from file: /hidden/BREAKTHROUGH_LOG.TXT",
  "content": "TERMINAL OUTPUT (After EXECUTE_BREAKTHROUGH command at 03:43:83)\n\nCOMMAND ACCEPTED: EXECUTE_BREAKTHR...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/BREAKTHROUGH_LOG.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: reality_parameters
clues['reality_parameters'] = {
"id": "reality_parameters",
  "title": "Reality Parameters",
  "description": "Discovery from file: /home/hedrum/documents/SIMULATION_PARAMETERS.TXT",
  "content": "ACCESSIBLE SIMULATION PARAMETERS (PARTIAL LIST)\n\n// These parameters can be modified with appropriat...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/SIMULATION_PARAMETERS.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: reality_tiers
clues['reality_tiers'] = {
"id": "reality_tiers",
  "title": "Reality Tiers",
  "description": "Discovery from file: /home/hedrum/documents/NEXUS9_TIERS.TXT",
  "content": "NEXUS-9 SIMULATION STRUCTURE\n\nTIER 1: BASE REALITY\n- Physical laws and constants\n- Space-time framew...",
  "category": "metadata",
  "isRedHerring": false,
  "relatedFiles": [
    "/home/hedrum/documents/NEXUS9_TIERS.TXT"
  ],
  "displayType": "important"
};

// Add additional clue: prime_numbers
clues['prime_numbers'] = {
"id": "prime_numbers",
  "title": "Prime Numbers",
  "description": "Discovery from file: /hidden/PRIME_NUMBER_KEY.TXT",
  "content": "PRIME NUMBERS AND REALITY BOUNDARIES\n\nI've discovered a pattern. The simulation uses prime numbers t...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/PRIME_NUMBER_KEY.TXT"
  ],
  "displayType": "secret"
};

// Add additional clue: liminal_network
clues['liminal_network'] = {
"id": "liminal_network",
  "title": "Liminal Network",
  "description": "Discovery from file: /hidden/LIMINAL_NETWORK_LOGS.TXT",
  "content": "THRESHOLD NETWORK TRANSCRIPT (FRAGMENT)\n\n<Dana> Weather's been unstable in sector 7. Three windows a...",
  "category": "hidden_file",
  "isRedHerring": false,
  "relatedFiles": [
    "/hidden/LIMINAL_NETWORK_LOGS.TXT"
  ],
  "displayType": "secret"
};

// Clues organized by category for easier access
export const journalClues = Object.values(clues).filter((clue: Clue) => clue.category === 'journal');
export const systemLogClues = Object.values(clues).filter((clue: Clue) => clue.category === 'system_log');
export const hiddenFileClues = Object.values(clues).filter((clue: Clue) => clue.category === 'hidden_file');
export const gameOutcomeClues = Object.values(clues).filter((clue: Clue) => clue.category === 'game_outcome');
export const emailClues = Object.values(clues).filter((clue: Clue) => clue.category === 'email');
export const metadataClues = Object.values(clues).filter((clue: Clue) => clue.category === 'metadata');

// Red herrings for easier reference
export const redHerrings = Object.values(clues).filter((clue: Clue) => clue.isRedHerring);
