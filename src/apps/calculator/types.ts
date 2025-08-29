import FileSystem from '../../engine/fileSystem';

export interface CalculatorWindowProps {
  id: string;
  title?: string;
  fileSystem?: FileSystem;
  onClose?: () => void;
}

export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  memory: number;
  isMemoryActive: boolean;
}

export type CalculatorOperation = '+' | '-' | '*' | '/' | '=' | 'C' | 'CE' | '±' | '√' | 'x²' | '1/x' | 'MC' | 'MR' | 'MS' | 'M+' | 'M-';
