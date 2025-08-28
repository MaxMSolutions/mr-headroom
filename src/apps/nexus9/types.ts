import FileSystem from '../../engine/fileSystem';

export type AccessLevel = 'DEFAULT' | 'USER' | 'ADMIN' | 'SYSTEM';

export interface CommandResponse {
  text: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'input';
  revealClue?: string;
}

export interface Command {
  name: string;
  description: string;
  minAccessLevel: AccessLevel;
  handler: (args: string[], state: Nexus9State) => CommandResponse;
}

export interface SystemStatus {
  coherence: number;
  memoryUsage: number;
  activeProcesses: number;
  breachAttempts: number;
}

export interface Nexus9State {
  accessLevel: AccessLevel;
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  outputHistory: CommandResponse[];
  systemStatus: SystemStatus;
  revealedClues: string[];
}

export interface Nexus9Props {
  id: string;
  title?: string;
  fileSystem?: FileSystem;
  onClose?: () => void;
}
