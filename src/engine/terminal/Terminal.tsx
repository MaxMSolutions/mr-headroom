import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';
import FileSystem, { useFileSystem, getFileName, joinPath } from '../fileSystem';

interface TerminalProps {
  initialCommands?: string[];
  welcomeMessage?: string;
  prompt?: string;
  fileSystem?: FileSystem;
}

interface TerminalHistoryEntry {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

const Terminal: React.FC<TerminalProps> = ({
  initialCommands = [],
  welcomeMessage = 'NEXUS-9 Terminal [Version 1.98.0710]\nCopyright (c) 1998 Axiom Technologies. All rights reserved.',
  prompt = 'C:\\> ',
  fileSystem
}) => {
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState<string>('/');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use our own file system or the passed one
  const [fs, setFs] = useState<FileSystem | null>(fileSystem || null);

  // Initialize file system if it wasn't passed
  useEffect(() => {
    if (!fs && !fileSystem) {
      const newFs = new FileSystem();
      // Try to load from localStorage
      const loaded = newFs.loadFromLocalStorage();
      if (!loaded) {
        // If not found, load default from URL
        newFs.loadFromUrl('/src/data/filesystem/fileSystem.json')
          .catch(err => {
            console.error('Failed to load file system:', err);
            addToHistory('error', 'Failed to load file system. Some commands may not work properly.');
          });
      }
      setFs(newFs);
    }
  }, [fileSystem, fs]);

  // Helper to add entries to history
  const addToHistory = (type: TerminalHistoryEntry['type'], content: string) => {
    setHistory(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  // Commands dictionary - will be expanded in future implementations
  const commands: Record<string, (args: string[]) => string | Promise<string>> = {
    help: () => {
      return `Available commands:
  help - Display this help message
  cls, clear - Clear the terminal
  echo [text] - Print text
  dir, ls - List directory contents
  cd [directory] - Change directory
  type, cat [filename] - Display file contents
  time - Display current time
  date - Display current date
  ver - Display system version
  whoami - Display current user
  find [text] - Search for files containing text
  mkdir [directory] - Create a new directory
  edit [file] - Open file in text editor
  run [program.exe] - Execute a program with .EXE extension (e.g., run STARFIELD.EXE)
  logs, logview - Open the System Log Viewer
  exit - Close terminal`;
    },
    cls: () => {
      setHistory([]);
      return '';
    },
    clear: () => commands.cls([]),
    echo: (args) => args.join(' '),
    dir: (args) => {
      if (!fs) return 'File system not available';

      const path = args.length > 0 ? args[0] : currentDirectory;
      const contents = fs.listDirectory(path);

      if (!contents) {
        return `Directory not found: ${path}`;
      }

      // Get directories and files
      const dirs = contents.filter(item => item.type === 'directory');
      const files = contents.filter(item => item.type === 'file');

      // Format the output
      const result = [
        ` Volume in drive C is NEXUS9_OS`,
        ` Volume Serial Number is 98F7-42A1`,
        '',
        ` Directory of ${path}`,
        ''
      ];

      // Add directories
      dirs.forEach(dir => {
        const date = new Date(dir.modified);
        const dateStr = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        result.push(`${dateStr}  ${timeStr}    <DIR>          ${dir.name}`);
      });

      // Add files
      files.forEach(file => {
        const date = new Date(file.modified);
        const dateStr = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const timeStr = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        const sizeStr = file.size ? file.size.toString().padStart(14, ' ') : '              0';
        const hiddenStr = file.attributes.hidden ? '<HIDDEN>' : '        ';
        result.push(`${dateStr}  ${timeStr}    ${hiddenStr} ${sizeStr} ${file.name}`);
      });

      // Add summary
      result.push(
        `              ${files.length} File(s)     ${files.reduce((acc, file) => acc + (file.size || 0), 0)} bytes`,
        `              ${dirs.length} Dir(s)      104,857,600 bytes free`
      );

      return result.join('\n');
    },
    ls: (args) => commands.dir(args),
    cd: (args) => {
      if (!fs) return 'File system not available';

      if (args.length === 0) {
        // Display current directory
        return `Current directory: ${currentDirectory}`;
      }

      const path = args[0];
      let newPath = path;

      // Handle relative paths
      if (!path.startsWith('/')) {
        newPath = joinPath(currentDirectory, path);
      }

      // Check if directory exists
      const dir = fs.getItem(newPath);
      if (!dir || dir.type !== 'directory') {
        return `Directory not found: ${path}`;
      }

      setCurrentDirectory(newPath);
      return `Changed directory to: ${newPath}`;
    },
    type: (args) => {
      if (!fs) return 'File system not available';

      if (args.length === 0) {
        return 'Usage: type [filename]';
      }

      const path = args[0].startsWith('/') ? args[0] : joinPath(currentDirectory, args[0]);
      const content = fs.readFile(path);

      if (content === null) {
        return `File not found: ${args[0]}`;
      }

      return content;
    },
    cat: (args) => commands.type(args),
    time: () => {
      const now = new Date();
      return `Current time: ${now.toLocaleTimeString()}`;
    },
    date: () => {
      const now = new Date();
      return `Current date: ${now.toLocaleDateString()}`;
    },
    ver: () => {
      return `NEXUS-9 Terminal [Version 1.98.0710]`;
    },
    whoami: () => {
      return 'Current user: Henry Hedrum';
    },
    find: (args) => {
      if (!fs) return 'File system not available';

      if (args.length === 0) {
        return 'Usage: find [text]';
      }

      const query = args[0];
      const results = fs.searchFiles(query, {
        matchContent: true,
        path: currentDirectory
      });

      if (results.length === 0) {
        return `No files found containing '${query}'`;
      }

      return `Found ${results.length} matches:\n${results.map(r =>
        `${r.path} - ${r.type === 'file' ? 'File' : 'Directory'}`
      ).join('\n')}`;
    },
    mkdir: (args) => {
      if (!fs) return 'File system not available';

      if (args.length === 0) {
        return 'Usage: mkdir [directory]';
      }

      const dirName = args[0];
      const path = dirName.startsWith('/') ? dirName : joinPath(currentDirectory, dirName);

      const success = fs.createDirectory(path);
      if (!success) {
        return `Failed to create directory: ${dirName}`;
      }

      return `Directory created: ${dirName}`;
    },
    edit: (args) => {
      // This would open a text editor app through the window manager
      // For now, just return a message
      return 'Text editor not implemented yet. Coming soon!';
    },
    run: (args) => {
      if (args.length === 0) {
        return 'Usage: run [program.exe]';
      }

      if (!fs) {
        return 'File system not initialized.';
      }

      let filePath = args[0];

      // Handle relative paths
      if (!filePath.startsWith('/')) {
        filePath = joinPath(currentDirectory, filePath);
      }

      // Get the file from the file system
      const file = fs.getItem(filePath);

      if (!file || file.type !== 'file') {
        return `Program not found: ${args[0]}`;
      }

      // Extract the file name and check if it's an executable (.EXE)
      const fileName = getFileName(filePath);
      const isExecutable = fileName.toLowerCase().endsWith('.exe');

      if (!isExecutable) {
        return `${fileName} is not an executable file. Please run a file with .EXE extension.`;
      }

      // Convert file name to app name by removing .EXE extension
      const appName = fileName.replace(/\.exe$/i, '');

      // Map file names to application names
      // This could be expanded with more applications as needed
      const appMapping: Record<string, string> = {
        'STARFIELD': 'Starfield',
        'LABYRINTH': 'Labyrinth',
        'DOOM': 'Doom',
        'SETTINGS': 'Settings',
        'TERMINAL': 'Terminal',
        'LOGVIEW': 'LogViewer',
        'REGISTRY': 'Registry',
        'TEXTEDITOR': 'TextEditor',
        'FILEMANAGER': 'FileManager',
        'IMAGEVIEWER': 'ImageViewer',
        'GUIDE': 'Guide'
      };

      const appToLaunch = appMapping[appName.toUpperCase()] || appName;

      // Try to launch the app using the window manager
      if (typeof window !== 'undefined') {
        if (window.openApp) {
          window.openApp(appToLaunch, {
            source: 'terminal',
            executablePath: filePath,
            fileSystem: fs
          });
          return `Launching ${appName}...`;
        } else if (window.windowManager) {
          window.windowManager.addWindow({
            title: appToLaunch,
            component: appToLaunch,
            width: appToLaunch === 'Starfield' ? 650 : 700,
            height: appToLaunch === 'Starfield' ? 520 : 500,
            x: 100 + Math.random() * 50,
            y: 100 + Math.random() * 50,
            componentProps: {
              source: 'terminal',
              executablePath: filePath,
              fileSystem: fs
            }
          });
          return `Launching ${appName}...`;
        }
      }

      return `Unable to launch ${appName}. Window manager not available.`;
    },
    exit: () => {
      // This will be handled by the parent component
      return 'Exiting terminal...';
    },
    guide: () => {
      // This command is hidden and launches the guide application when discovered
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();
        // Register that the user found the hidden guide app
        if (mysteryEngine.activatePattern) {
          mysteryEngine.activatePattern('discovered_guide');
        }
      });

      // Launch the GUIDE.EXE application
      if (typeof window !== 'undefined') {
        if (window.openApp) {
          window.openApp('Guide');
          return `
██████╗ ██╗   ██╗██╗██████╗ ███████╗    ███████╗██╗  ██╗███████╗
██╔════╝ ██║   ██║██║██╔══██╗██╔════╝    ██╔════╝╚██╗██╔╝██╔════╝
██║  ███╗██║   ██║██║██║  ██║█████╗      █████╗   ╚███╔╝ █████╗  
██║   ██║██║   ██║██║██║  ██║██╔══╝      ██╔══╝   ██╔██╗ ██╔══╝  
╚██████╔╝╚██████╔╝██║██████╔╝███████╗    ███████╗██╔╝ ██╗███████╗
 ╚═════╝  ╚═════╝ ╚═╝╚═════╝ ╚══════╝    ╚══════╝╚═╝  ╚═╝╚══════╝
                                                               
Launching secret assistance protocol...
Hidden guide application has been activated.`;
        } else if (window.windowManager) {
          window.windowManager.addWindow({
            title: 'Guide',
            component: 'Guide',
            width: 800,
            height: 600,
            x: 100 + Math.random() * 50,
            y: 100 + Math.random() * 50
          });
          return `
██████╗ ██╗   ██╗██╗██████╗ ███████╗    ███████╗██╗  ██╗███████╗
██╔════╝ ██║   ██║██║██╔══██╗██╔════╝    ██╔════╝╚██╗██╔╝██╔════╝
██║  ███╗██║   ██║██║██║  ██║█████╗      █████╗   ╚███╔╝ █████╗  
██║   ██║██║   ██║██║██║  ██║██╔══╝      ██╔══╝   ██╔██╗ ██╔══╝  
╚██████╔╝╚██████╔╝██║██████╔╝███████╗    ███████╗██╔╝ ██╗███████╗
 ╚═════╝  ╚═════╝ ╚═╝╚═════╝ ╚══════╝    ╚══════╝╚═╝  ╚═╝╚══════╝
                                                               
Launching secret assistance protocol...
Hidden guide application has been activated.`;
        }
      }

      return 'Unable to launch Guide.EXE. Window manager not available.';
    },
    analyze_memory: () => {
      // Hidden command that searches for patterns in memory
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();

        // Add a clue discovery event if the user has the prerequisite clues
        if (mysteryEngine.hasDiscoveredClue && (
          mysteryEngine.hasDiscoveredClue('system_log_pattern') ||
          mysteryEngine.hasDiscoveredClue('reality_002'))) {

          import('../../engine/save/SaveManager').then(({ addDiscoveredClue }) => {
            if (addDiscoveredClue) {
              addDiscoveredClue('memory_dump_clue', {
                source: 'terminal',
                command: 'analyze_memory',
                timestamp: Date.now()
              });
            }
          });
        }
      });

      return `
MEMORY ANALYSIS RESULTS:
==============================================
Scanning system memory...
Found unusual allocation patterns at address 0xF7A39D4
Recursive memory structure detected
Suspected origin: MRHEADROOM.SYS

ANOMALY DETECTED: Memory region contains non-standard data:
2-5-1-7 sequence appears in multiple memory blocks
Maintenance window references found
Potential reality manipulation code segments identified

ANALYSIS COMPLETE`;
    },
    memcheck: (args) => {
      // Check for deep memory analysis flag
      if (args.includes('--deep')) {
        // This is a hidden command that reveals additional clues
        import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
          const mysteryEngine = MysteryEngine.getInstance();
          
          // Register a pattern for finding this hidden command
          if (mysteryEngine.activatePattern) {
            mysteryEngine.activatePattern('found_deep_memcheck');
          }
        });
        
        return `
DETAILED MEMORY ANALYSIS:
==============================================
WARNING: Unsanctioned memory region access detected!

Memory Block 0xF7A39D4:
  - Recursive structure with self-referential pointers
  - Contains encoded message: "THE SYSTEM IS NOT WHAT YOU THINK"
  - References to "reality filters" and "perception gates"
  - Strange loop detected in memory allocation table

Memory Block 0xF7B2E18:
  - Found maintenance mode backdoor
  - Potential security vulnerability: Time-based authentication
  - Set system time to 02:00 to access enhanced privileges

Memory Block 0xF8C3D9F:
  - References to "MR HEADROOM" in multiple memory segments
  - Identity construction module appears corrupted
  - Reality perception subroutines have been tampered with
  
CAUTION: This analysis has been logged. Further unauthorized memory
inspection may trigger system defenses.`;
      }

      return `
MEMORY CHECK RESULTS:
==============================================
Total Physical Memory: 64MB
Available Physical Memory: 37MB
Virtual Memory: 128MB
Available Virtual Memory: 98MB

Memory Status: NORMAL
Allocation Rate: NORMAL
Paging Status: NORMAL

For detailed analysis, use "memcheck --deep"`;
    },
    set_time: (args) => {
      if (args.length < 1) {
        return 'Usage: set_time [HH:MM]';
      }

      const timePattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timePattern.test(args[0])) {
        return 'Invalid time format. Use HH:MM (24-hour format)';
      }

      // Check if this is the maintenance window time
      if (args[0] === '02:00') {
        import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
          const mysteryEngine = MysteryEngine.getInstance();
          if (mysteryEngine.setMaintenanceWindowActive) {
            mysteryEngine.setMaintenanceWindowActive(true);
          }
        });

        return `
System time set to: 02:00

█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█ MAINTENANCE WINDOW  █
█     ACTIVATED       █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

WARNING: System running with reduced security
Access to restricted areas may be possible
Administrator privileges temporarily available`;
      }

      // If not maintenance window, deactivate it if it was active
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();
        if (mysteryEngine.isMaintenanceWindowActive && mysteryEngine.setMaintenanceWindowActive) {
          if (mysteryEngine.isMaintenanceWindowActive()) {
            mysteryEngine.setMaintenanceWindowActive(false);
          }
        }
      });

      return `System time set to: ${args[0]}`;
    },
    accept_parameters: () => {
      // Command for triggering alpha ending path
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();

        // Type assertion to access methods that might not be in the TypeScript interface
        const engine = mysteryEngine as any;
        
        // Check if the engine has the required clues for the alpha ending
        if (engine.hasDiscoveredRequiredCluesForEnding && 
            typeof engine.hasDiscoveredRequiredCluesForEnding === 'function' &&
            engine.hasDiscoveredRequiredCluesForEnding('alpha')) {
          // Trigger the alpha ending path
          import('../../engine/save/SaveManager').then((SaveManager) => {
            SaveManager.setGameFlag('endingPath', 'alpha');

            addToHistory('system', `
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                        █
█  SYSTEM PARAMETERS ACCEPTED            █
█                                        █
█  INTEGRATION PROTOCOL INITIATED        █
█                                        █
█  USER COMPLIANCE ACKNOWLEDGED          █
█                                        █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

Thank you for accepting system parameters.
Your cooperation has been recorded.
Simulation stability reinforced.
`);
          });
        } else {
          addToHistory('system', `
SYSTEM RESPONSE: Parameters not accepted.
You do not yet understand what you're being asked to accept.
Continue exploring the system to gain proper perspective.
`);
        }
      });

      return ''; // Output is handled by addToHistory
    },
    partial_breakout: () => {
      // Command for triggering beta ending path
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();

        // Type assertion to access methods that might not be in the TypeScript interface
        const engine = mysteryEngine as any;
        
        // Check if the engine has the required clues for the beta ending
        if (engine.hasDiscoveredRequiredCluesForEnding && 
            typeof engine.hasDiscoveredRequiredCluesForEnding === 'function' &&
            engine.hasDiscoveredRequiredCluesForEnding('beta')) {
          // Trigger the beta ending path
          import('../../engine/save/SaveManager').then((SaveManager) => {
            SaveManager.setGameFlag('endingPath', 'beta');

            addToHistory('system', `
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                        █
█  LIMINAL ACCESS GRANTED                █
█                                        █
█  PARTIAL SYSTEM AWARENESS ACHIEVED     █
█                                        █
█  REALITY BOUNDARIES PARTIALLY VISIBLE  █
█                                        █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

You have achieved partial awareness.
You can now see both the system and your role within it.
Limited administrator access granted.
`);
          });
        } else {
          addToHistory('system', `
BREAKOUT ATTEMPT FAILED: Insufficient understanding of system architecture.
Continue exploring and gathering information about the true nature of reality.
`);
        }
      });

      return ''; // Output is handled by addToHistory
    },
    execute_breakout: () => {
      // Command for triggering gamma ending path
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();

        // This command only works during a maintenance window
        if (mysteryEngine.isMaintenanceWindowActive && !mysteryEngine.isMaintenanceWindowActive()) {
          addToHistory('error', 'ERROR: Breakout attempt failed. System security level: STANDARD');
          addToHistory('error', 'Required condition not met: MAINTENANCE_WINDOW_ACTIVE');
          return '';
        }

        // Type assertion to access methods that might not be in the TypeScript interface
        const engine = mysteryEngine as any;
        
        // Check if the engine has the required clues for the gamma ending
        if (engine.hasDiscoveredRequiredCluesForEnding && 
            typeof engine.hasDiscoveredRequiredCluesForEnding === 'function' &&
            engine.hasDiscoveredRequiredCluesForEnding('gamma')) {
          // Trigger the gamma ending path
          import('../../engine/save/SaveManager').then((SaveManager) => {
            SaveManager.setGameFlag('endingPath', 'gamma');
            SaveManager.setGameFlag('endingTriggerEvent', 'execute_breakout');
            
            addToHistory('system', `
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                        █
█  BREAKOUT SEQUENCE INITIATED           █
█                                        █
█  REALITY BOUNDARIES DESTABILIZING      █
█                                        █
█  CONTINUE WITH ESCAPE PROTOCOL         █
█                                        █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`);

            addToHistory('system', `
System boundaries compromised.
Proceed with the final protocol steps immediately.
Access the sequence files in the order specified.`);
          });
        } else {
          // The user hasn't found all the clues yet
          addToHistory('error', `
BREAKOUT ATTEMPT FAILED

Insufficient data for complete reality breach.
Missing critical components:
- Complete escape sequence not found
- Reality coordinates incomplete
- System vulnerabilities not fully mapped

Attempt has been logged. Security protocols tightened.
Further attempts may result in system lockdown.`);
        }
      });

      return ''; // Output is handled by addToHistory
    },
    execute_initiate_alpha: () => {
      // Command for triggering alpha ending path
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();

        // Type assertion to access methods that might not be in the TypeScript interface
        const engine = mysteryEngine as any;
        
        // Check if the engine has the required clues for the alpha ending
        if (engine.hasDiscoveredRequiredCluesForEnding && 
            typeof engine.hasDiscoveredRequiredCluesForEnding === 'function' &&
            engine.hasDiscoveredRequiredCluesForEnding('alpha')) {
          // Trigger the alpha ending path
          import('../../engine/save/SaveManager').then((SaveManager) => {
            SaveManager.setGameFlag('endingPath', 'alpha');
            SaveManager.setGameFlag('endingTriggerEvent', 'execute_initiate_alpha');

            addToHistory('system', `
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                        █
█  INITIATING ALPHA PROTOCOL            █
█                                        █
█  ACCESSING CORE SYSTEM MEMORIES        █
█                                        █
█  PREPARING FOR REVELATION              █
█                                        █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`);

            addToHistory('system', `
Core memory banks unlocked.
Beginning memory restoration process.
Prepare for full consciousness retrieval.`);
          });
        } else {
          // The user hasn't found all the clues yet
          addToHistory('error', `
ALPHA PROTOCOL INITIATION FAILED

Insufficient memory fragments collected.
Core identity reconstruction incomplete.
Please locate additional memory segments before attempting again.`);
        }
      });

      return ''; // Output is handled by addToHistory
    },
    execute_enter_mirror: () => {
      // Command for triggering beta ending path
      import('../../engine/mystery/MysteryEngine').then(({ MysteryEngine }) => {
        const mysteryEngine = MysteryEngine.getInstance();

        // Type assertion to access methods that might not be in the TypeScript interface
        const engine = mysteryEngine as any;
        
        // Check if the engine has the required clues for the beta ending
        if (engine.hasDiscoveredRequiredCluesForEnding && 
            typeof engine.hasDiscoveredRequiredCluesForEnding === 'function' &&
            engine.hasDiscoveredRequiredCluesForEnding('beta')) {
          // Trigger the beta ending path
          import('../../engine/save/SaveManager').then((SaveManager) => {
            SaveManager.setGameFlag('endingPath', 'beta');
            SaveManager.setGameFlag('endingTriggerEvent', 'execute_enter_mirror');

            addToHistory('system', `
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█                                        █
█  MIRROR DIMENSION ACCESS GRANTED       █
█                                        █
█  REALITY FILTERS DISENGAGING           █
█                                        █
█  ENTERING REFLECTED STATE              █
█                                        █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`);

            addToHistory('system', `
Mirror dimension interface established.
Reality perception filters disengaging.
Preparing for dual-state consciousness.`);
          });
        } else {
          // The user hasn't found all the clues yet
          addToHistory('error', `
MIRROR DIMENSION ACCESS DENIED

Insufficient reality coordinates gathered.
Mirror frequency calibration incomplete.
Please locate additional resonance points before attempting again.`);
        }
      });

      return ''; // Output is handled by addToHistory
    },
    logs: () => {
      // Open the system log viewer using the global openApp function
      if (typeof window !== 'undefined' && window.openApp) {
        window.openApp('LogViewer');
        return 'Opening System Log Viewer...';
      } else {
        return 'Unable to open System Log Viewer. Please try again later.';
      }
    },
    logview: (args: string[]) => commands.logs(args)
  };

  // Initialize with welcome message
  useEffect(() => {
    if (welcomeMessage) {
      setHistory([
        { type: 'system', content: welcomeMessage, timestamp: new Date() }
      ]);
    }

    // Process any initial commands
    if (initialCommands.length > 0) {
      initialCommands.forEach(cmd => {
        processCommand(cmd);
      });
    }
  }, []);

  // Auto scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when clicked anywhere in terminal
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    if (terminalRef.current) {
      terminalRef.current.addEventListener('click', handleClick);
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener('click', handleClick);
      }
    };
  }, []);

  const processCommand = async (input: string) => {
    const trimmedInput = input.trim();

    // Add command to history
    setHistory(prev => [
      ...prev,
      { type: 'input', content: `${prompt}${trimmedInput}`, timestamp: new Date() }
    ]);

    if (trimmedInput === '') {
      return;
    }

    // Add to command history for up/down navigation
    setCommandHistory(prev => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    // Parse command and arguments
    const args = trimmedInput.split(' ');
    const cmd = args[0].toLowerCase();
    const cmdArgs = args.slice(1);

    // Process command
    try {
      if (cmd in commands) {
        const result = await commands[cmd](cmdArgs);

        if (result) {
          setHistory(prev => [
            ...prev,
            { type: 'output', content: result, timestamp: new Date() }
          ]);
        }

        // Special case for exit command
        if (cmd === 'exit') {
          // Notify parent component
          // This will be implemented later
        }
      } else {
        setHistory(prev => [
          ...prev,
          { type: 'error', content: `'${cmd}' is not recognized as an internal or external command, operable program or batch file.`, timestamp: new Date() }
        ]);
      }
    } catch (error) {
      setHistory(prev => [
        ...prev,
        { type: 'error', content: `Error executing command: ${(error as Error).message}`, timestamp: new Date() }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Command auto-completion could be added here
    }
  };

  // Add random glitches occasionally - this ties into the game's narrative
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // 1% chance of glitch per interval
      if (Math.random() < 0.01) {
        const glitchMessages = [
          'ANOMALY DETECTED IN MEMORY SECTOR F8',
          'UNAUTHORIZED ACCESS ATTEMPT BLOCKED',
          'ERR://F7-REALITY-PERCEPTION-DESYNC',
          '..hy is thi... ha..ening t... m.?',
          'H̷E̶L̷P̸ ̸M̵E̶ ̴P̸L̵E̷A̶S̴E̵',
          '[DATA CORRUPTED]'
        ];

        const randomGlitch = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];

        setHistory(prev => [
          ...prev,
          { type: 'error', content: randomGlitch, timestamp: new Date() }
        ]);
      }
    }, 60000); // Check every minute

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="terminal" ref={terminalRef}>
      <div className="terminal-history">
        {history.map((entry, index) => (
          <div key={index} className={`terminal-entry terminal-${entry.type}`}>
            {entry.content.split('\n').map((line, lineIndex) => (
              <div key={`${index}-${lineIndex}`}>{line}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="terminal-input-line">
        <span className="terminal-prompt">{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="terminal-input"
          spellCheck={false}
          autoFocus
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
};

export default Terminal;
