import FileSystem from '../../engine/fileSystem';

export interface CalculatorWindowProps {
  id: string;
  title?: string;
  fileSystem?: FileSystem;
  onClose?: () => void;
}

export interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  memory: number;
  isMemoryActive: boolean;
  history: HistoryItem[];
  showHistory: boolean;
  currentExpression: string;
  lastOperation: string | null;
}

export type CalculatorOperation = '+' | '-' | '*' | '/' | '=' | 'C' | 'CE' | '±' | '√' | 'x²' | '1/x' | 'MC' | 'MR' | 'MS' | 'M+' | 'M-';

export type CalculatorMode = 'standard' | 'scientific';

export type CalculatorTheme = 'cyberpunk' | 'matrix' | 'amber';
