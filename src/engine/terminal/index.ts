import Terminal from './Terminal';

export default Terminal;

export interface TerminalCommand {
  name: string;
  description: string;
  execute: (args: string[]) => string | Promise<string>;
}

export type TerminalHistoryEntry = {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: Date;
};
