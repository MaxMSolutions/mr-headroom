import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { AccessLevel, CommandResponse, Nexus9State } from '../types';
import commandProcessor from './CommandProcessor';
import './Terminal.css';

interface TerminalProps {
  state: Nexus9State;
  onStateChange: (newState: Partial<Nexus9State>) => void;
  onClueDiscovered?: (clueId: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ state, onStateChange, onClueDiscovered }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Re-focus when component re-renders or on click in terminal
    const handleClickAnywhere = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    document.addEventListener('click', handleClickAnywhere);
    return () => document.removeEventListener('click', handleClickAnywhere);
  }, []);

  // Scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [state.outputHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Function to submit a command programmatically
  const submitCommand = (commandText: string) => {
    if (!commandText.trim()) return;
    
    try {
      console.log("Submitting command:", commandText);
      
      // Process the command
      const result = commandProcessor.processCommand(commandText, state);
      
      // Build state updates in a single object
      const stateUpdates: Partial<Nexus9State> = {
        // Update command history
        commandHistory: [...state.commandHistory, commandText],
        historyIndex: state.commandHistory.length + 1,
        // Update output history
        outputHistory: [
          ...state.outputHistory,
          { text: `${getPrompt()} ${commandText}`, type: 'input' } as CommandResponse,
          result
        ],
        currentInput: ''
      };
      
      // Special case for admin command to update access level
      if (commandText.toLowerCase().startsWith('admin') && result.type === 'success') {
        stateUpdates.accessLevel = 'ADMIN' as AccessLevel;
      }
      
      // Increment breach attempts for breach command
      if (commandText.toLowerCase() === 'breach') {
        stateUpdates.systemStatus = {
          ...state.systemStatus,
          breachAttempts: state.systemStatus.breachAttempts + 1
        };
      }
      
      // Update state
      onStateChange(stateUpdates);
      
      // Handle clue discovery separately after state update
      if (result.revealClue && onClueDiscovered) {
        setTimeout(() => {
          onClueDiscovered(result.revealClue!);
        }, 100);
      }
      
      // Clear input
      setInput('');
    } catch (error) {
      console.error("Error processing command:", error);
      // Add error message to terminal
      onStateChange({
        outputHistory: [
          ...state.outputHistory,
          { text: `${getPrompt()} ${commandText}`, type: 'input' } as CommandResponse,
          { text: `Error processing command: ${error}`, type: 'error' } as CommandResponse
        ]
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Prevent the event from opening a new window
    e.stopPropagation();
    
    if (e.key === 'Enter' && input.trim()) {
      // Prevent default behavior and event bubbling
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Use our submit function with a timeout to avoid React batching issues
        // This ensures the command is processed after the current render cycle
        setTimeout(() => {
          submitCommand(input);
        }, 0);
      } catch (error) {
        console.error("Error handling Enter key press:", error);
      }
      return false;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory(1);
    }
    // Allow default behavior for other keys
  };
  
  const navigateHistory = (direction: number) => {
    const { commandHistory, historyIndex } = state;
    
    // Calculate new index
    let newIndex = historyIndex + direction;
    
    // Keep index within bounds
    if (newIndex < 0) newIndex = 0;
    if (newIndex > commandHistory.length) newIndex = commandHistory.length;
    
    // Set input to command from history, or empty if at end
    const newInput = newIndex === commandHistory.length 
      ? state.currentInput 
      : commandHistory[newIndex];
    
    setInput(newInput || '');
    onStateChange({ historyIndex: newIndex, currentInput: newIndex === commandHistory.length ? input : '' });
  };
  
  const getPrompt = () => {
    switch (state.accessLevel) {
      case 'SYSTEM': return 'NEXUS9#';
      case 'ADMIN': return 'NEXUS9$';
      case 'USER': return 'NEXUS9>';
      default: return 'NEXUS9:';
    }
  };
  
  const getTypeClass = (type: string) => {
    switch (type) {
      case 'error': return 'terminal-error';
      case 'warning': return 'terminal-warning';
      case 'success': return 'terminal-success';
      case 'input': return 'terminal-input';
      default: return 'terminal-info';
    }
  };

  return (
    <div 
      className="nexus9-terminal" 
      onClick={(e) => {
        // Prevent event bubbling that might cause issues with window focus
        e.stopPropagation();
        
        // Focus on the input field when clicking anywhere in the terminal
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      <div className="terminal-output" ref={outputRef}>
        {state.outputHistory.map((output, index) => (
          <pre key={index} className={getTypeClass(output.type)}>
            {output.text}
          </pre>
        ))}
      </div>
      <form 
        className="terminal-input-line"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (input.trim()) {
            submitCommand(input);
          }
        }}
      >
        <span className="terminal-prompt">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input-field"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal input"
        />
        <button 
          type="submit"
          className="terminal-submit-button"
          aria-label="Execute command"
        >
          ►
        </button>
      </form>
    </div>
  );
};

export default Terminal;
