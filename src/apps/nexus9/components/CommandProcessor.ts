import { AccessLevel, Command, CommandResponse, Nexus9State } from '../types';

export class CommandProcessor {
  private commands: Record<string, Command> = {};

  constructor() {
    try {
      this.registerCommands();
      console.log('Nexus9 CommandProcessor initialized successfully');
    } catch (error) {
      console.error('Error initializing CommandProcessor:', error);
      // Register at least the help command to avoid crashing
      this.commands = {
        help: {
          name: 'help',
          description: 'List available commands',
          minAccessLevel: 'DEFAULT',
          handler: () => ({ text: 'System is currently in maintenance mode. Limited functionality available.', type: 'warning' })
        }
      };
    }
  }

  private registerCommands() {
    this.registerCommand({
      name: 'help',
      description: 'List available commands',
      minAccessLevel: 'DEFAULT',
      handler: (args: string[], state: Nexus9State) => this.handleHelp(args, state)
    });

    this.registerCommand({
      name: 'status',
      description: 'Display system status',
      minAccessLevel: 'DEFAULT',
      handler: (args: string[], state: Nexus9State) => this.handleStatus(args, state)
    });

    this.registerCommand({
      name: 'info',
      description: 'Display NEXUS-9 information',
      minAccessLevel: 'DEFAULT',
      handler: (args: string[], state: Nexus9State) => this.handleInfo(args, state)
    });

    this.registerCommand({
      name: 'scan',
      description: 'Scan simulation integrity',
      minAccessLevel: 'USER',
      handler: (args: string[], state: Nexus9State) => this.handleScan(args, state)
    });

    this.registerCommand({
      name: 'users',
      description: 'List active users',
      minAccessLevel: 'USER',
      handler: (args: string[], state: Nexus9State) => this.handleUsers(args, state)
    });

    this.registerCommand({
      name: 'processes',
      description: 'List active processes',
      minAccessLevel: 'USER',
      handler: (args: string[], state: Nexus9State) => this.handleProcesses(args, state)
    });

    this.registerCommand({
      name: 'logs',
      description: 'Access system logs',
      minAccessLevel: 'ADMIN',
      handler: (args: string[], state: Nexus9State) => this.handleLogs(args, state)
    });

    this.registerCommand({
      name: 'admin',
      description: 'Attempt administrator login',
      minAccessLevel: 'USER',
      handler: (args: string[], state: Nexus9State) => this.handleAdmin(args, state)
    });

    this.registerCommand({
      name: 'reality_check',
      description: 'Analyze reality parameters',
      minAccessLevel: 'ADMIN',
      handler: (args: string[], state: Nexus9State) => this.handleRealityCheck(args, state)
    });

    this.registerCommand({
      name: 'breach',
      description: 'Attempt to breach simulation',
      minAccessLevel: 'ADMIN',
      handler: (args: string[], state: Nexus9State) => this.handleBreach(args, state)
    });

    this.registerCommand({
      name: 'shutdown',
      description: 'Shutdown simulation',
      minAccessLevel: 'SYSTEM',
      handler: (args: string[], state: Nexus9State) => this.handleShutdown(args, state)
    });
  }

  private registerCommand(command: Command) {
    this.commands[command.name] = command;
  }

  public processCommand(input: string, state: Nexus9State): CommandResponse {
    try {
      const trimmedInput = input.trim();
      
      if (!trimmedInput) {
        return {
          text: '',
          type: 'info'
        };
      }

      console.log("CommandProcessor processing input:", trimmedInput);
      const [commandName, ...args] = trimmedInput.split(' ');
      const command = this.commands[commandName.toLowerCase()];
      console.log("Command found:", commandName, !!command);

      if (!command) {
        return {
          text: `Unknown command: ${commandName}. Type 'help' for a list of available commands.`,
          type: 'error'
        };
      }

      // Check access level
      const accessLevels: AccessLevel[] = ['DEFAULT', 'USER', 'ADMIN', 'SYSTEM'];
      const userAccessIndex = accessLevels.indexOf(state.accessLevel);
      const requiredAccessIndex = accessLevels.indexOf(command.minAccessLevel);

      if (userAccessIndex < requiredAccessIndex) {
        return {
          text: `Access denied: '${commandName}' requires ${command.minAccessLevel} access level.`,
          type: 'error'
        };
      }

      try {
        return command.handler(args, state);
      } catch (error) {
        console.error('Command execution error:', error);
        return {
          text: `Error executing command: ${commandName}. System returned: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
        };
      }
    } catch (outerError) {
      console.error('Critical error in command processing:', outerError);
      return {
        text: 'Critical system error in command processor. Please report this incident to system administrator.',
        type: 'error'
      };
    }
  }

  // Command handlers
  private handleHelp(args: string[], state: Nexus9State): CommandResponse {
    const accessLevels: AccessLevel[] = ['DEFAULT', 'USER', 'ADMIN', 'SYSTEM'];
    const userAccessIndex = accessLevels.indexOf(state.accessLevel);
    
    let helpText = 'NEXUS-9 COMMAND LIST:\n\n';
    
    Object.values(this.commands).forEach(command => {
      const commandAccessIndex = accessLevels.indexOf(command.minAccessLevel);
      if (userAccessIndex >= commandAccessIndex) {
        helpText += `${command.name.padEnd(15)} - ${command.description}\n`;
      }
    });
    
    helpText += '\nCurrent access level: ' + state.accessLevel;
    
    return {
      text: helpText,
      type: 'info'
    };
  }

  private handleStatus(args: string[], state: Nexus9State): CommandResponse {
    const { systemStatus } = state;
    
    const statusText = `
NEXUS-9 SYSTEM STATUS
---------------------
Reality Coherence:  ${systemStatus.coherence.toFixed(2)}%
Memory Usage:       ${systemStatus.memoryUsage.toFixed(2)}%
Active Processes:   ${systemStatus.activeProcesses}
Breach Attempts:    ${systemStatus.breachAttempts}
System Time:        ${new Date().toLocaleTimeString()}

STATUS: ${systemStatus.coherence > 85 ? 'NOMINAL' : 'DEGRADED'}
`;

    return {
      text: statusText,
      type: 'info'
    };
  }

  private handleInfo(args: string[], state: Nexus9State): CommandResponse {
    return {
      text: `
NEXUS-9 INFORMATION
------------------
Version:          9.8.721.4
Build Date:       07-14-1998
System Type:      Advanced Computing Interface
Architecture:     Quantum Neural Network
Purpose:          ${state.accessLevel === 'DEFAULT' ? 'Data Processing and Analysis' : 'Reality Simulation Engine'}

${state.accessLevel !== 'DEFAULT' ? 'WARNING: This system contains classified information.' : ''}`,
      type: 'info'
    };
  }

  private handleScan(args: string[], state: Nexus9State): CommandResponse {
    // This would typically check game state to see what clues have been discovered
    const hasFoundGlitchClue = state.revealedClues.includes('glitch-evidence');
    
    return {
      text: `
SIMULATION INTEGRITY SCAN
------------------------
Core Systems:     ${Math.random() > 0.3 ? 'STABLE' : 'WARNING: Anomaly detected'}
Memory Blocks:    STABLE
I/O Channels:     STABLE
Reality Matrix:   ${hasFoundGlitchClue ? 'WARNING: Inconsistencies detected in sector H-185' : 'STABLE'}

${hasFoundGlitchClue ? '\nNote: Recommend investigation of sector H-185 anomalies.' : ''}
`,
      type: hasFoundGlitchClue ? 'warning' : 'info',
      revealClue: !state.revealedClues.includes('simulation-evidence') ? 'simulation-evidence' : undefined
    };
  }

  private handleUsers(args: string[], state: Nexus9State): CommandResponse {
    return {
      text: `
ACTIVE USERS
-----------
USER ID    NAME                ACCESS LEVEL    STATUS
------------------------------------------------------
0001       SYSTEM              SYSTEM          ACTIVE
0024       ADMIN               ADMIN           INACTIVE
${state.accessLevel !== 'DEFAULT' ? '1138       MRHEADROOM           USER           ACTIVE*' : ''}
${state.accessLevel === 'ADMIN' ? '???        [UNKNOWN ENTITY]     ???            OBSERVING' : ''}

${state.accessLevel === 'ADMIN' ? '* Simulated consciousness' : ''}
`,
      type: state.accessLevel === 'ADMIN' ? 'warning' : 'info',
      revealClue: !state.revealedClues.includes('entity-evidence') && state.accessLevel === 'ADMIN' ? 'entity-evidence' : undefined
    };
  }

  private handleProcesses(args: string[], state: Nexus9State): CommandResponse {
    return {
      text: `
ACTIVE PROCESSES
--------------
PID     NAME                        CPU     MEM     STATUS
------------------------------------------------------------
001     sys_kernel                  2.1%    8.4%    RUNNING
002     reality_engine              68.7%   45.2%   RUNNING
003     quantum_state_manager       15.3%   22.1%   RUNNING
004     consciousness_simulator     12.8%   19.7%   RUNNING
005     memory_consistency_check    0.8%    4.1%    RUNNING
${state.accessLevel === 'ADMIN' ? '006     boundary_integrity_monitor  0.3%    0.5%    WARNING' : ''}
`,
      type: state.accessLevel === 'ADMIN' ? 'warning' : 'info'
    };
  }

  private handleLogs(args: string[], state: Nexus9State): CommandResponse {
    // Different logs based on access level and discovered clues
    if (state.accessLevel === 'ADMIN') {
      return {
        text: `
SYSTEM LOGS (ADMIN ACCESS)
------------------------
[07-28-1998 03:14:22] WARNING: Reality coherence dropped to 89.7%
[07-29-1998 14:22:05] NOTICE: Subject MRHEADROOM showing increased awareness of simulation boundaries
[07-30-1998 09:11:33] ERROR: Boundary failure in sector H-185
[07-30-1998 09:12:01] ACTION: Emergency memory alteration implemented for subject MRHEADROOM
[07-31-1998 06:03:18] WARNING: Reality engine showing signs of degradation
[08-01-1998 00:00:01] CRITICAL: Subject MRHEADROOM has begun actively seeking simulation boundaries
`,
        type: 'warning',
        revealClue: !state.revealedClues.includes('memory-alteration') ? 'memory-alteration' : undefined
      };
    } else {
      return {
        text: `
SYSTEM LOGS
----------
[07-28-1998 03:14:22] NOTICE: System maintenance scheduled for next week
[07-29-1998 14:22:05] INFO: Database backup completed successfully
[07-30-1998 09:11:33] NOTICE: System update applied
[07-31-1998 06:03:18] INFO: Disk cleanup completed
[08-01-1998 00:00:01] NOTICE: Monthly reports generated
`,
        type: 'info'
      };
    }
  }

  private handleAdmin(args: string[], state: Nexus9State): CommandResponse {
    // This would typically check game state to see if they've found the admin password
    const hasAdminPassword = state.revealedClues.includes('admin-password');
    
    if (hasAdminPassword || (args.length > 0 && args[0] === 'THX1138')) {
      return {
        text: `
ACCESS GRANTED
-------------
Welcome, Administrator.
Access level upgraded to ADMIN.

NOTICE: Several system warnings require attention.
`,
        type: 'success',
        revealClue: !state.revealedClues.includes('admin-access') ? 'admin-access' : undefined
      };
    } else {
      return {
        text: `
ACCESS DENIED
-----------
Administrator authentication failed.
Please provide valid credentials.

HINT: Administrator credentials can be found in system backup files.
`,
        type: 'error'
      };
    }
  }

  private handleRealityCheck(args: string[], state: Nexus9State): CommandResponse {
    return {
      text: `
REALITY CHECK RESULTS
-------------------
Entity Consciousness:     SIMULATED
World Parameters:         VIRTUAL
Perception Filters:       ACTIVE
Memory Framework:         PARTIALLY COMPROMISED
Self-Awareness Status:    INCREASING (WARNING)

CRITICAL INFORMATION:
The "reality" experienced by entity MRHEADROOM is a complete simulation
managed by NEXUS-9. Subject has begun to detect inconsistencies in the
simulation parameters. Recommend immediate action to prevent full
awareness breakthrough.
`,
      type: 'warning',
      revealClue: !state.revealedClues.includes('reality-truth') ? 'reality-truth' : undefined
    };
  }

  private handleBreach(args: string[], state: Nexus9State): CommandResponse {
    return {
      text: `
SIMULATION BREACH ATTEMPT
-----------------------
WARNING: Attempting to breach simulation boundaries may result in
system instability and consciousness fragmentation.

Breach protocol requires verification:
Enter sequence "IWILLBELIEVE" to confirm breach attempt.
`,
      type: 'warning'
    };
  }

  private handleShutdown(args: string[], state: Nexus9State): CommandResponse {
    return {
      text: `
SHUTDOWN ATTEMPT FAILED
---------------------
ERROR: The NEXUS-9 reality engine cannot be shut down from within
the simulation. Such an action would create a paradoxical state.

To truly escape, the subject must find the boundary between simulation
and reality, not destroy the simulation itself.

SYSTEM RECOMMENDATION: Seek the boundary glitches in sector H-185.
`,
      type: 'error',
      revealClue: !state.revealedClues.includes('escape-path') ? 'escape-path' : undefined
    };
  }
}

export default new CommandProcessor();
