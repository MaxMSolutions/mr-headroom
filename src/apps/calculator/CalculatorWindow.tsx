import React, { useState, useCallback, useEffect, useRef } from 'react';
import './CalculatorWindow.css';
import { CalculatorWindowProps, CalculatorState, CalculatorOperation, CalculatorMode, CalculatorTheme, HistoryItem } from './types';

const CalculatorWindow: React.FC<CalculatorWindowProps> = ({
  id,
  onClose
}) => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    memory: 0,
    isMemoryActive: false,
    history: [],
    showHistory: false,
    currentExpression: '',
    lastOperation: null
  });

  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('standard');
  const [calculatorTheme, setCalculatorTheme] = useState<CalculatorTheme>('cyberpunk');
  const [isGlitching, setIsGlitching] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);
  
  // Refs for animations and focus management
  const displayRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Calculator operations
  const performCalculation = useCallback((left: number, right: number, operation: string): number => {
    switch (operation) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right !== 0 ? left / right : NaN;
      default: return right;
    }
  }, []);

  const handleNumber = useCallback((num: string) => {
    setState(prevState => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: num,
          waitingForOperand: false
        };
      }

      return {
        ...prevState,
        display: prevState.display === '0' ? num : prevState.display + num
      };
    });
  }, []);

  const handleOperation = useCallback((nextOperation: CalculatorOperation) => {
    const inputValue = parseFloat(state.display);

    if (nextOperation === '=') {
      if (state.previousValue !== null && state.operation) {
        const result = performCalculation(state.previousValue, inputValue, state.operation);

        // Brief glitch effect for calculation
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);

        setState({
          display: String(result),
          previousValue: null,
          operation: null,
          waitingForOperand: true,
          memory: state.memory,
          isMemoryActive: state.isMemoryActive
        });
      }
      return;
    }

    if (state.previousValue === null) {
      setState({
        ...state,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForOperand: true
      });
    } else if (state.operation) {
      const currentValue = state.previousValue || 0;
      const result = performCalculation(currentValue, inputValue, state.operation);

      setState({
        display: String(result),
        previousValue: result,
        operation: nextOperation,
        waitingForOperand: true,
        memory: state.memory,
        isMemoryActive: state.isMemoryActive
      });
    }
  }, [state, performCalculation]);

  const handleClear = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      memory: state.memory,
      isMemoryActive: state.isMemoryActive
    });
  }, [state.memory, state.isMemoryActive]);

  const handleClearEntry = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      display: '0',
      waitingForOperand: false
    }));
  }, []);

  const handleDecimal = useCallback(() => {
    setState(prevState => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: '0.',
          waitingForOperand: false
        };
      }

      if (prevState.display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: prevState.display + '.'
        };
      }

      return prevState;
    });
  }, []);

  const handleNegate = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      display: String(-parseFloat(prevState.display))
    }));
  }, []);

  const handleSquareRoot = useCallback(() => {
    const value = parseFloat(state.display);
    if (value >= 0) {
      setState(prevState => ({
        ...prevState,
        display: String(Math.sqrt(value))
      }));
    }
  }, [state.display]);

  const handleSquare = useCallback(() => {
    const value = parseFloat(state.display);
    setState(prevState => ({
      ...prevState,
      display: String(value * value)
    }));
  }, [state.display]);

  const handleReciprocal = useCallback(() => {
    const value = parseFloat(state.display);
    if (value !== 0) {
      setState(prevState => ({
        ...prevState,
        display: String(1 / value)
      }));
    }
  }, [state.display]);

  const handleMemoryStore = useCallback(() => {
    const value = parseFloat(state.display);
    setState(prevState => ({
      ...prevState,
      memory: value,
      isMemoryActive: true
    }));
  }, [state.display]);

  const handleMemoryRecall = useCallback(() => {
    if (state.isMemoryActive) {
      setState(prevState => ({
        ...prevState,
        display: String(prevState.memory),
        waitingForOperand: true
      }));
    }
  }, [state.isMemoryActive, state.memory]);

  const handleMemoryClear = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      memory: 0,
      isMemoryActive: false
    }));
  }, []);

  const handleMemoryAdd = useCallback(() => {
    const value = parseFloat(state.display);
    setState(prevState => ({
      ...prevState,
      memory: prevState.memory + value,
      isMemoryActive: true
    }));
  }, [state.display]);

  const handleMemorySubtract = useCallback(() => {
    const value = parseFloat(state.display);
    setState(prevState => ({
      ...prevState,
      memory: prevState.memory - value,
      isMemoryActive: true
    }));
  }, [state.display]);

  const handleSpecialOperation = useCallback((operation: CalculatorOperation) => {
    switch (operation) {
      case 'C': handleClear(); break;
      case 'CE': handleClearEntry(); break;
      case '±': handleNegate(); break;
      case '√': handleSquareRoot(); break;
      case 'x²': handleSquare(); break;
      case '1/x': handleReciprocal(); break;
      case 'MS': handleMemoryStore(); break;
      case 'MR': handleMemoryRecall(); break;
      case 'MC': handleMemoryClear(); break;
      case 'M+': handleMemoryAdd(); break;
      case 'M-': handleMemorySubtract(); break;
    }
  }, [handleClear, handleClearEntry, handleNegate, handleSquareRoot, handleSquare, handleReciprocal, handleMemoryStore, handleMemoryRecall, handleMemoryClear, handleMemoryAdd, handleMemorySubtract]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Prevent default behavior for calculator keys
      if (/^[0-9+\-*/.=]$/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
      }

      // Number keys
      if (/^[0-9]$/.test(key)) {
        handleNumber(key);
        return;
      }

      // Operation keys
      switch (key) {
        case '+':
          handleOperation('+');
          break;
        case '-':
          handleOperation('-');
          break;
        case '*':
          handleOperation('*');
          break;
        case '/':
          handleOperation('/');
          break;
        case 'Enter':
        case '=':
          handleOperation('=');
          break;
        case '.':
          handleDecimal();
          break;
        case 'Escape':
          handleClear();
          break;
        case 'Backspace':
          // Handle backspace for clearing last digit
          if (state.display !== '0' && state.display.length > 1) {
            setState(prevState => ({
              ...prevState,
              display: prevState.display.slice(0, -1)
            }));
          } else {
            setState(prevState => ({
              ...prevState,
              display: '0'
            }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.display, handleNumber, handleOperation, handleDecimal, handleClear]);

  return (
    <div className={`calculator-window ${isGlitching ? 'glitching' : ''}`} id={`calculator-${id}`}>
      <div className="calculator-content">
        <div className="calculator-header">
          <h2>:: CALCULATOR ::</h2>
          <div className="memory-indicator">
            {state.isMemoryActive && <span className="memory-active">M</span>}
          </div>
        </div>

        <div className="calculator-display" role="textbox" aria-label="Calculator display" aria-readonly="true">
          <div className="display-value" aria-live="polite">
            {state.display}
          </div>
          {state.operation && (
            <div className="operation-indicator" aria-label={`Current operation: ${state.previousValue} ${state.operation}`}>
              {state.previousValue} {state.operation}
            </div>
          )}
        </div>

        <div className="calculator-keypad" role="grid" aria-label="Calculator keypad">
          {/* Memory row */}
          <div className="keypad-row" role="row">
            <button 
              className="calc-button memory" 
              onClick={() => handleSpecialOperation('MC')}
              aria-label="Memory clear"
              title="Clear memory (MC)"
            >
              MC
            </button>
            <button 
              className="calc-button memory" 
              onClick={() => handleSpecialOperation('MR')}
              aria-label="Memory recall"
              title="Recall from memory (MR)"
              disabled={!state.isMemoryActive}
            >
              MR
            </button>
            <button 
              className="calc-button memory" 
              onClick={() => handleSpecialOperation('MS')}
              aria-label="Memory store"
              title="Store to memory (MS)"
            >
              MS
            </button>
            <button 
              className="calc-button memory" 
              onClick={() => handleSpecialOperation('M+')}
              aria-label="Memory add"
              title="Add to memory (M+)"
            >
              M+
            </button>
            <button 
              className="calc-button memory" 
              onClick={() => handleSpecialOperation('M-')}
              aria-label="Memory subtract"
              title="Subtract from memory (M-)"
            >
              M-
            </button>
          </div>

          {/* Scientific functions row */}
          <div className="keypad-row" role="row">
            <button 
              className="calc-button scientific" 
              onClick={() => handleSpecialOperation('√')}
              aria-label="Square root"
              title="Square root (√)"
            >
              √
            </button>
            <button 
              className="calc-button scientific" 
              onClick={() => handleSpecialOperation('x²')}
              aria-label="Square"
              title="Square (x²)"
            >
              x²
            </button>
            <button 
              className="calc-button scientific" 
              onClick={() => handleSpecialOperation('1/x')}
              aria-label="Reciprocal"
              title="Reciprocal (1/x)"
            >
              1/x
            </button>
            <button 
              className="calc-button scientific" 
              onClick={() => handleSpecialOperation('±')}
              aria-label="Change sign"
              title="Change sign (±)"
            >
              ±
            </button>
            <button 
              className="calc-button clear" 
              onClick={() => handleSpecialOperation('C')}
              aria-label="Clear all"
              title="Clear all (C)"
            >
              C
            </button>
          </div>

          {/* Numbers and operations */}
          <div className="keypad-row" role="row">
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('7')}
              aria-label="Seven"
            >
              7
            </button>
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('8')}
              aria-label="Eight"
            >
              8
            </button>
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('9')}
              aria-label="Nine"
            >
              9
            </button>
            <button 
              className="calc-button operation" 
              onClick={() => handleOperation('/')}
              aria-label="Divide"
              title="Divide (/)"
            >
              /
            </button>
            <button 
              className="calc-button clear" 
              onClick={() => handleSpecialOperation('CE')}
              aria-label="Clear entry"
              title="Clear entry (CE)"
            >
              CE
            </button>
          </div>

          <div className="keypad-row" role="row">
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('4')}
              aria-label="Four"
            >
              4
            </button>
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('5')}
              aria-label="Five"
            >
              5
            </button>
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('6')}
              aria-label="Six"
            >
              6
            </button>
            <button 
              className="calc-button operation" 
              onClick={() => handleOperation('*')}
              aria-label="Multiply"
              title="Multiply (*)"
            >
              *
            </button>
            <button 
              className="calc-button operation" 
              onClick={() => handleOperation('=')}
              aria-label="Equals"
              title="Calculate (=)"
            >
              =
            </button>
          </div>

          <div className="keypad-row" role="row">
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('1')}
              aria-label="One"
            >
              1
            </button>
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('2')}
              aria-label="Two"
            >
              2
            </button>
            <button 
              className="calc-button number" 
              onClick={() => handleNumber('3')}
              aria-label="Three"
            >
              3
            </button>
            <button 
              className="calc-button operation" 
              onClick={() => handleOperation('-')}
              aria-label="Subtract"
              title="Subtract (-)"
            >
              -
            </button>
            <div className="keypad-spacer"></div>
          </div>

          <div className="keypad-row" role="row">
            <button 
              className="calc-button number zero" 
              onClick={() => handleNumber('0')}
              aria-label="Zero"
            >
              0
            </button>
            <button 
              className="calc-button number" 
              onClick={handleDecimal}
              aria-label="Decimal point"
              title="Decimal point (.)"
            >
              .
            </button>
            <button 
              className="calc-button operation" 
              onClick={() => handleOperation('+')}
              aria-label="Add"
              title="Add (+)"
            >
              +
            </button>
            <div className="keypad-spacer"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorWindow;
