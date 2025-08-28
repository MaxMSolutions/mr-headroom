import React, { useState, useEffect } from 'react';
import './LogViewer.css';
import { getGameState, addGameLog, GameState } from '../../engine/save/SaveManager';
import { GameEvent } from '../../engine/games/GameBase';

interface LogViewerProps {
  id?: string;
}

// Extended GameEvent interface with source information
interface ExtendedGameEvent extends GameEvent {
  source: string; // Which application the log is from
}

// JSON Tree Renderer Component - Moved outside main component for stability
const JsonTreeNode: React.FC<{
  data: any;
  name?: string;
  level: number;
  isLast?: boolean;
}> = ({ data, name, level, isLast = false }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1); // Auto-expand only first level

  const getDataType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return '#00f0ff';
      case 'number': return '#ff00ff';
      case 'boolean': return '#ff6600';
      case 'null': return '#ff0033';
      case 'object': return '#33ff33';
      case 'array': return '#ffb000';
      default: return '#33ff33';
    }
  };

  const renderValue = (value: any, type: string) => {
    if (type === 'string') return `"${value}"`;
    if (type === 'null') return 'null';
    return String(value);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const type = getDataType(data);
  const isExpandable = type === 'object' || type === 'array';

  if (!isExpandable) {
    return (
      <div className="json-primitive" style={{ paddingLeft: `${level * 16}px` }}>
        {name && <span className="json-key">"{name}": </span>}
        <span
          className="json-value"
          data-type={type}
          style={{ color: getTypeColor(type) }}
        >
          {renderValue(data, type)}
        </span>
        {!isLast && ','}
      </div>
    );
  }

  const items = type === 'array' ? data : Object.entries(data);
  const itemCount = items.length;

  return (
    <div className="json-expandable" style={{ paddingLeft: `${level * 16}px` }}>
      <div
        className="json-toggle"
        onClick={handleToggle}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <span className="json-expand-icon" style={{ color: '#33ff33', marginRight: '4px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="json-bracket" style={{ color: getTypeColor(type) }}>
          {isExpanded ? (type === 'array' ? '[' : '{') : (type === 'array' ? '[...]' : '{...}')}
        </span>
        {name && <span className="json-key">"{name}": </span>}
        <span className="json-meta" style={{ color: '#00cc00', fontSize: '12px' }}>
          {itemCount} {type === 'array' ? 'items' : 'properties'}
        </span>
        {!isLast && ','}
      </div>

      {isExpanded && (
        <div className="json-children">
          {items.map((item: any, index: number) => {
            const [key, value] = type === 'array' ? [index, item] : item;
            const isLastItem = index === items.length - 1;

            return (
              <JsonTreeNode
                key={`${key}-${level}-${index}`}
                data={value}
                name={type === 'array' ? undefined : key}
                level={level + 1}
                isLast={isLastItem}
              />
            );
          })}
          <div style={{ paddingLeft: `${(level + 1) * 16}px` }}>
            <span className="json-bracket" style={{ color: getTypeColor(type) }}>
              {type === 'array' ? ']' : '}'}
            </span>
            {!isLast && ','}
          </div>
        </div>
      )}
    </div>
  );
};

const LogViewerWindow: React.FC<LogViewerProps> = () => {
  const [logs, setLogs] = useState<ExtendedGameEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ExtendedGameEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    if (data === null || data === undefined) {
      return (
        <div className="json-container">
          <span style={{ color: '#ff0033' }}>null</span>
        </div>
      );
    }

    return (
      <div className="json-container">
        <JsonTreeNode data={data} level={0} isLast={true} />
      </div>
    );
  };
  
  const renderLogs = () => {
    if (filteredLogs.length === 0) {
      return <p className="no-logs">&gt; NO LOGS AVAILABLE_</p>;
    }
    
    return filteredLogs.map((log, index) => (
      <div 
        key={index} 
        className={`log-entry ${log.type.includes('error') ? 'error-log' : ''}`}
      >
        <div className="log-timestamp">[{formatTimestamp(log.timestamp)}]</div>
        <div className="log-source">{log.source.toUpperCase()}</div>
        <div className="log-type">{log.type.replace(/_/g, ' ')}</div>
        <div className="log-data">
          {renderLogData(log.data)}
        </div>
      </div>
    ));
  };
  
  return (
    <div className="log-viewer-container">
      <div className="log-viewer-header">
        <h2>█ SYSTEM LOG VIEWER █</h2>
      </div>
      
      <div className="log-viewer-content">
        <div className="log-viewer-toolbar">
          <div className="toolbar-row">
            <label>
              &gt; SEARCH:
              <input 
                type="text" 
                value={searchQuery} 
                onChange={handleSearchChange} 
                placeholder="ENTER QUERY..." 
              />
            </label>
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
