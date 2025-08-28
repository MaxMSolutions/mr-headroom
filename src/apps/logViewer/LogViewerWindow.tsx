import React, { useState, useEffect, useRef } from 'react';
import './LogViewer.css';
import { getGameState, addGameLog, GameState } from '../../engine/save/SaveManager';
import { GameEvent } from '../../engine/games/GameBase';

interface LogViewerProps {
  id?: string;
  onClose: () => void;
}

// Extended GameEvent interface with source information
interface ExtendedGameEvent extends GameEvent {
  source: string; // Which application the log is from
}

/**
 * A simple log viewer component that displays all logs
 * with a basic text search filter.
 */
const LogViewerWindow: React.FC<LogViewerProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<ExtendedGameEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ExtendedGameEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const exportLinkRef = useRef<HTMLAnchorElement>(null);
  
  // Load all logs on component initialization
  useEffect(() => {
    let gameState: GameState;
    
    try {
      console.log('[LogViewer] Initializing LogViewer');
      gameState = getGameState();
      console.log('[LogViewer] Retrieved game state:', 
        gameState.gameLogs ? `Found ${Object.keys(gameState.gameLogs).length} game(s) with logs` : 'No logs found');
      
      // Create a sample log if none exists - this helps with debugging
      if (!gameState.gameLogs || Object.keys(gameState.gameLogs).length === 0) {
        console.log("[LogViewer] No logs found, creating default log entry");
        
        // Add a default log entry if no logs exist
        const defaultLog: ExtendedGameEvent = {
          type: 'system_message',
          data: {
            message: 'Log system initialized',
            details: 'This is a default log entry created when no logs were found in LogViewerWindow'
          },
          timestamp: Date.now(),
          source: 'system'
        };
        
        // Also add this to the actual game state
        addGameLog('system', {
          type: 'system_message',
          data: {
            message: 'Log system initialized',
            details: 'Default log added from LogViewerWindow component'
          },
          timestamp: Date.now()
        });
        
        setLogs([defaultLog]);
        setFilteredLogs([defaultLog]);
        return;
      }
    } catch (error) {
      console.error("[LogViewer] Error initializing LogViewer:", error);
      // Create a fallback log entry for error cases
      const errorLog: ExtendedGameEvent = {
        type: 'error',
        data: {
          message: 'LogViewer Error',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: Date.now(),
        source: 'system'
      };
      setLogs([errorLog]);
      setFilteredLogs([errorLog]);
      return;
    }
    
    // At this point, gameState is defined from the try block above
    if (!gameState.gameLogs) {
      console.log('[LogViewer] gameLogs is undefined, returning early');
      return;
    }
    
    // Combine all logs from all applications
    const allLogs: ExtendedGameEvent[] = [];
    
    // Debug: log the game IDs and log counts
    console.log('[LogViewer] Found logs for these games:', 
      Object.keys(gameState.gameLogs).map(id => `${id}: ${gameState.gameLogs![id].length} logs`));
    
    Object.entries(gameState.gameLogs).forEach(([gameId, gameLogs]) => {
      const logs = gameLogs as GameEvent[];
      console.log(`[LogViewer] Processing ${logs.length} logs for ${gameId}`);
      logs.forEach((log: GameEvent) => {
        allLogs.push({
          ...log,
          source: gameId
        });
      });
    });
    
    // Sort all logs by timestamp (newest first)
    allLogs.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`[LogViewer] Total logs processed: ${allLogs.length}`);
    
    setLogs(allLogs);
    setFilteredLogs(allLogs);
  }, []);
  
  // Apply search filter
  useEffect(() => {
    if (!logs || logs.length === 0) {
      setFilteredLogs([]);
      return;
    }
    
    if (!searchQuery) {
      setFilteredLogs(logs);
      return;
    }
    
    // Apply simple text search
    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(log => {
      const logString = JSON.stringify(log).toLowerCase();
      return logString.includes(query);
    });
    
    setFilteredLogs(filtered);
  }, [logs, searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const renderLogData = (data: any) => {
    return JSON.stringify(data, null, 2);
  };
  
  const handleExportLogs = () => {
    const logsToExport = filteredLogs.length > 0 ? filteredLogs : logs;
    const exportData = JSON.stringify(logsToExport, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    if (exportLinkRef.current) {
      exportLinkRef.current.href = url;
      exportLinkRef.current.download = `system-logs-${new Date().toISOString().slice(0, 10)}.json`;
      exportLinkRef.current.click();
      URL.revokeObjectURL(url);
    }
  };
  
  const renderLogs = () => {
    if (filteredLogs.length === 0) {
      return <p className="no-logs">No logs available</p>;
    }
    
    return filteredLogs.map((log, index) => (
      <div 
        key={index} 
        className={`log-entry ${log.type.includes('error') ? 'error-log' : ''}`}
      >
        <div className="log-timestamp">{formatTimestamp(log.timestamp)}</div>
        <div className="log-source">{log.source.toUpperCase()}</div>
        <div className="log-type">{log.type}</div>
        <div className="log-data">
          <pre>{renderLogData(log.data)}</pre>
        </div>
      </div>
    ));
  };
  
  return (
    <div className="log-viewer-container">
      <div className="log-viewer-header">
        <h2>SYSTEM LOG VIEWER</h2>
        <div className="log-viewer-controls">
          <button onClick={onClose}>X</button>
        </div>
      </div>
      
      <div className="log-viewer-content">
        <div className="log-viewer-toolbar">
          <div className="toolbar-row">
            <label>
              SEARCH:
              <input 
                type="text" 
                value={searchQuery} 
                onChange={handleSearchChange} 
                placeholder="ENTER SEARCH QUERY" 
              />
            </label>
            
            <button onClick={handleExportLogs} className="export-button">
              EXPORT
            </button>
            <a ref={exportLinkRef} style={{ display: 'none' }} />
          </div>
        </div>
        
        <div className="log-viewer-results">
          <div className="log-viewer-logs">
            {renderLogs()}
          </div>
          
          <div className="log-stats">
            <div className="stat-item">
              <span className="stat-label">TOTAL LOGS:</span>
              <span className="stat-value">{logs.length}</span>
            </div>
            {filteredLogs.length !== logs.length && (
              <div className="stat-item">
                <span className="stat-label">FILTERED:</span>
                <span className="stat-value">{filteredLogs.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewerWindow;
