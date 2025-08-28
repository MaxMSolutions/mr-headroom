import React, { useState, useEffect, useRef } from 'react';
import { Nexus9Props, Nexus9State, AccessLevel } from './types';
import Terminal from './components/Terminal';
import StatusDisplay from './components/StatusDisplay';
import VisualizationPanel from './components/VisualizationPanel';
import { MysteryEngine } from '../../engine/mystery/MysteryEngine';
import './Nexus9.css';



// Get the MysteryEngine instance with error handling
let mysteryEngine: any = null;
try {
  mysteryEngine = MysteryEngine.getInstance();
  console.log('Successfully initialized MysteryEngine for Nexus9');
} catch (error) {
  console.error('Error initializing MysteryEngine:', error);
  // Provide a fallback for the mystery engine
  mysteryEngine = {
    discoverClue: (clueId: string) => console.log(`Would discover clue: ${clueId}`),
    hasDiscoveredClue: () => false,
    getDiscoveredClues: () => []
  };
}

const initialState: Nexus9State = {
  accessLevel: 'DEFAULT' as AccessLevel,
  commandHistory: [],
  historyIndex: 0,
  currentInput: '',
  outputHistory: [{
    text: `
    
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗       █████╗ 
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝      ██╔══██╗
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗█████╗╚██████║
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║╚════╝ ╚═══██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║       █████╔╝
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝       ╚════╝ 
                                                          
REALITY SIMULATION ENGINE v9.8.721.4
Copyright (c) 1994-1998 NeuroCorp International
All Rights Reserved

Type 'help' to see available commands.
    `,
    type: 'info'
  }],
  systemStatus: {
    coherence: 94.7,
    memoryUsage: 68.3,
    activeProcesses: 5,
    breachAttempts: 0
  },
  revealedClues: []
};

const Nexus9Window: React.FC<Nexus9Props> = ({
  id, // Used in logging
  title, // Destructured for future use
  fileSystem,
  onClose
}) => {
  const [state, setState] = useState<Nexus9State>(initialState);
  // Reference to track if this component is mounted
  const isMountedRef = useRef(true);
  
  // Initialize isMountedRef to true when the component is mounted 
  // and set it to false when the component is unmounted
  useEffect(() => {
    console.log(`Nexus9Window (${id}) mounted`);
    isMountedRef.current = true;
    
    return () => {
      console.log(`Nexus9Window (${id}) unmounted`);
      isMountedRef.current = false;
    };
  }, [id]);
  
  // Set window title and log access
  useEffect(() => {
    console.log('Nexus9Window mounted with ID:', id);
    
    // Log access to the system for narrative purposes
    if (fileSystem) {
      try {
        // Create or append to an access log - only if the path exists
        const logEntry = `[${new Date().toISOString()}] NEXUS-9 system accessed by user: MRHEADROOM\n`;
        
        // Check if the directory exists first
        const logsExist = fileSystem.exists('/system/logs');
        if (logsExist) {
          const existingContent = fileSystem.readFile('/system/logs/access.log') || '';
          fileSystem.writeFile('/system/logs/access.log', existingContent + logEntry);
          console.log('Successfully logged Nexus9 access');
        } else {
          console.log('Logs directory does not exist, skipping access logging');
        }
      } catch (error) {
        console.error('Failed to write to access log:', error);
      }
    }
    
  }, [fileSystem, id]);
  
  // Load state from discovered clues
  useEffect(() => {
    const discoveredClues = mysteryEngine.getDiscoveredClues();
    
    // Update initial state based on discovered clues
    let newAccessLevel: AccessLevel = 'DEFAULT';
    let revealedClues: string[] = [];
    
    if (discoveredClues.includes('admin-password')) {
      newAccessLevel = 'USER';
      revealedClues.push('admin-password');
    }
    
    if (discoveredClues.includes('admin-access')) {
      newAccessLevel = 'ADMIN';
      revealedClues.push('admin-access');
    }
    
    setState(prevState => ({
      ...prevState,
      accessLevel: newAccessLevel,
      revealedClues: [...prevState.revealedClues, ...revealedClues]
    }));
  }, []);
  
  // Simulate occasional system degradation
  useEffect(() => {
    const coherenceInterval = setInterval(() => {
      setState(prevState => {
        // Randomly adjust coherence
        let newCoherence = prevState.systemStatus.coherence;
        
        // More dramatic fluctuations at higher access levels
        const fluctuationRange = prevState.accessLevel === 'ADMIN' ? 3 : 1;
        newCoherence += (Math.random() * fluctuationRange * 2) - fluctuationRange;
        
        // Keep within bounds
        newCoherence = Math.min(98, Math.max(60, newCoherence));
        
        return {
          ...prevState,
          systemStatus: {
            ...prevState.systemStatus,
            coherence: newCoherence
          }
        };
      });
    }, 5000);
    
    return () => clearInterval(coherenceInterval);
  }, []);
  
  const handleStateChange = (newStatePartial: Partial<Nexus9State>) => {
    // Check if the component is still mounted before updating state
    // This needs to happen in a more immediate context to avoid race conditions
    if (!isMountedRef.current) {
      console.warn(`Nexus9Window (${id}): Attempted to update state on unmounted component`);
      return;
    }
    
    try {
      console.log(`Nexus9Window (${id}): Updating state with:`, newStatePartial);
      
      // Use a function form of setState to avoid stale closures
      setState(prevState => {
        // Create the new state
        const newState = {
          ...prevState,
          ...newStatePartial,
          // If there are clues to add, merge them properly
          revealedClues: [
            ...prevState.revealedClues, 
            ...(newStatePartial.revealedClues || [])
          ]
        };
        
        console.log(`Nexus9Window (${id}): State updated successfully`);
        return newState;
      });
    } catch (error) {
      console.error(`Nexus9Window (${id}): Error updating state:`, error);
    }
  };
  
  const handleClueDiscovered = (clueId: string) => {
    // Check if component is mounted
    if (!isMountedRef.current) {
      console.warn(`Nexus9Window (${id}): Attempted to discover clue on unmounted component`);
      return;
    }
    
    try {
      // Check if we already have this clue to avoid duplicates
      if (state.revealedClues.includes(clueId)) {
        console.log(`Nexus9Window (${id}): Clue ${clueId} already discovered`);
        return;
      }
      
      console.log(`Nexus9Window (${id}): Discovering clue ${clueId}`);
      
      // Add to state's revealed clues
      setState(prevState => ({
        ...prevState,
        revealedClues: [...prevState.revealedClues, clueId]
      }));
      
      // Inform the mystery engine about the discovery
      mysteryEngine.discoverClue(clueId);
      console.log(`Nexus9Window (${id}): Successfully discovered clue ${clueId}`);
    } catch (error) {
      console.error(`Nexus9Window (${id}): Error discovering clue:`, error);
    }
  };
  
  // Create a wrapped renderer for each component with error handling
  const renderStatusDisplay = () => {
    try {
      return <StatusDisplay status={state.systemStatus} />;
    } catch (error) {
      console.error('Error rendering StatusDisplay:', error);
      return <div className="error-container">Status Display Error</div>;
    }
  };
  
  const renderVisualizationPanel = () => {
    try {
      return (
        <VisualizationPanel 
          coherenceLevel={state.systemStatus.coherence} 
          accessLevel={state.accessLevel}
          glitchFrequency={state.accessLevel === 'ADMIN' ? 2 : 0.5}
        />
      );
    } catch (error) {
      console.error('Error rendering VisualizationPanel:', error);
      return <div className="error-container">Visualization Error</div>;
    }
  };
  
  const renderTerminal = () => {
    try {
      return (
        <Terminal 
          state={state} 
          onStateChange={handleStateChange}
          onClueDiscovered={handleClueDiscovered}
        />
      );
    } catch (error) {
      console.error('Error rendering Terminal:', error);
      return <div className="error-container">Terminal Error</div>;
    }
  };
  
  return (
    <div className="nexus9-container">
      <div className="nexus9-sidebar">
        {renderStatusDisplay()}
        {renderVisualizationPanel()}
      </div>
      <div className="nexus9-main">
        {renderTerminal()}
      </div>
    </div>
  );
};

export default Nexus9Window;
