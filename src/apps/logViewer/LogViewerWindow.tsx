import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './LogViewer.css';
import { getGameState, addGameLog } from '../../engine/save/SaveManager';
import { GameEvent } from '../../engine/games/GameBase';

interface LogViewerProps {
  id?: string;
}

// Extended GameEvent interface with source information
interface ExtendedGameEvent extends GameEvent {
  source: string; // Which application the log is from
}

// JSON Tree Renderer Component - Enhanced with keyboard navigation and accessibility
const JsonTreeNode: React.FC<{
  data: any;
  name?: string;
  level: number;
  isLast?: boolean;
}> = ({ data, name, level, isLast = false }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1); // Auto-expand only first level

  // Handle undefined or null data
  if (data === undefined || data === null) {
    return (
      <div className="json-primitive" style={{ paddingLeft: `${level * 16}px` }}>
        {name && <span className="json-key">"{name}": </span>}
        <span
          className="json-value"
          data-type="null"
          style={{ color: '#ff0033' }}
          role="text"
        >
          {data === undefined ? "undefined" : "null"}
        </span>
        {!isLast && ','}
      </div>
    );
  }

  const getDataType = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return '#00f0ff';
      case 'number': return '#ff00ff';
      case 'boolean': return '#ff6600';
      case 'null': return '#ff0033';
      case 'undefined': return '#ff0033';
      case 'object': return '#33ff33';
      case 'array': return '#ffb000';
      default: return '#33ff33';
    }
  };

  const renderValue = (value: any, type: string) => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (type === 'string') return `"${value}"`;
    try {
      return String(value);
    } catch (e) {
      return '[Error displaying value]';
    }
  };

  const handleToggle = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(e);
    }
  }, [handleToggle]);

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
          role="text"
          aria-label={`${type} value: ${renderValue(data, type)}`}
        >
          {renderValue(data, type)}
        </span>
        {!isLast && ','}
      </div>
    );
  }

  const items = type === 'array' ? data : (() => {
    try {
      return Object.entries(data || {});
    } catch (e) {
      return [['error', 'Unable to display object']];
    }
  })();
  const itemCount = items.length;

  return (
    <div className="json-expandable" style={{ paddingLeft: `${level * 16}px` }}>
      <div
        className="json-toggle"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`Toggle ${type} ${name || 'root'} with ${itemCount} ${type === 'array' ? 'items' : 'properties'}`}
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
        <div className="json-children" role="group" aria-label={`${type} contents`}>
          {items.map((item: any, index: number) => {
            const [key, value] = type === 'array' ? [index, item] : (Array.isArray(item) ? item : [String(index), item]);
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
  // Main state for logs and filtering
  const [logs, setLogs] = useState<ExtendedGameEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ExtendedGameEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [paginatedLogs, setPaginatedLogs] = useState<ExtendedGameEvent[]>([]);
  
  // Computed values
  const uniqueSources = useMemo(() => ['all', ...new Set(logs.map(log => log.source))], [logs]);
  const uniqueTypes = useMemo(() => ['all', ...new Set(logs.map(log => log.type))], [logs]);
  const totalPages = useMemo(() => Math.ceil(filteredLogs.length / pageSize), [filteredLogs.length, pageSize]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Load all logs on component initialization
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[LogViewer] Initializing LogViewer');
        const gameState = getGameState();
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
          setIsLoading(false);
          return;
        }

        // At this point, gameState is defined from the try block above
        if (!gameState.gameLogs) {
          console.log('[LogViewer] gameLogs is undefined, returning early');
          setIsLoading(false);
          return;
        }

        // Combine all logs from all applications
        const allLogs: ExtendedGameEvent[] = [];

        // Debug: log the game IDs and log counts
        try {
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
        } catch (error) {
          console.error('[LogViewer] Error processing game logs:', error);
          // Create a fallback log entry
          allLogs.push({
            type: 'error',
            data: { message: 'Error processing logs', details: String(error) },
            timestamp: Date.now(),
            source: 'system'
          });
        }

        // Sort all logs by timestamp (newest first)
        allLogs.sort((a, b) => b.timestamp - a.timestamp);

        console.log(`[LogViewer] Total logs processed: ${allLogs.length}`);

        setLogs(allLogs);
        setFilteredLogs(allLogs);
      } catch (error) {
        console.error("[LogViewer] Error initializing LogViewer:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(`Failed to load logs: ${errorMessage}`);

        // Create a fallback log entry for error cases
        const errorLog: ExtendedGameEvent = {
          type: 'error',
          data: {
            message: 'LogViewer Error',
            details: errorMessage
          },
          timestamp: Date.now(),
          source: 'system'
        };
        setLogs([errorLog]);
        setFilteredLogs([errorLog]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Apply filters whenever search query or filter selections change
  useEffect(() => {
    let filtered = [...logs];
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const logString = JSON.stringify(log).toLowerCase();
        return logString.includes(query);
      });
    }
    
    // Apply source filter if not set to 'all'
    if (selectedSource !== 'all') {
      filtered = filtered.filter(log => log.source === selectedSource);
    }
    
    // Apply type filter if not set to 'all'
    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.type === selectedType);
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, searchQuery, selectedSource, selectedType]);
  
  // Update paginated logs whenever filtered logs or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedLogs(filteredLogs.slice(startIndex, endIndex));
  }, [filteredLogs, currentPage, pageSize]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  // Handle filter changes
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSource(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle export functionality
  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs_export_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSource('all');
    setSelectedType('all');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Toggle between simple and advanced view
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'simple' ? 'advanced' : 'simple');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Render log data with appropriate formatting
  const renderLogData = (data: any) => {
    if (data === null || data === undefined) {
      return (
        <div className="json-container">
          <span style={{ color: '#ff0033' }}>NULL</span>
        </div>
      );
    }

    // For simple view, if data is just a message, show it directly
    if (viewMode === 'simple' && data && typeof data === 'object' && 'message' in data) {
      return (
        <div className="log-message">
          {typeof data.message === 'object'
            ? JSON.stringify(data.message, null, 2)
            : String(data.message)
          }
          {data.details && (
            <div className="log-details">
              {typeof data.details === 'object'
                ? JSON.stringify(data.details, null, 2)
                : String(data.details)
              }
            </div>
          )}
        </div>
      );
    }

    // For advanced view, show the full JSON tree
    return (
      <div className="json-container">
        <JsonTreeNode data={data} level={0} isLast={true} />
      </div>
    );
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="log-viewer-logs">
      <div className="log-entry">
        <div className="log-entry-header">
          <div className="log-timestamp">[INITIALIZING]</div>
          <div className="log-source">SYSTEM</div>
          <div className="log-type">LOADING</div>
        </div>
        <div className="log-data">
          <div className="loading-indicator">
            ACCESSING SYSTEM LOGS
          </div>
        </div>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="log-viewer-logs">
      <div className="log-entry error-log">
        <div className="log-entry-header">
          <div className="log-timestamp">[{formatTimestamp(Date.now())}]</div>
          <div className="log-source">SYSTEM</div>
          <div className="log-type">ERROR</div>
        </div>
        <div className="log-data">
          <div className="json-container">
            <span style={{ color: '#ff0033' }}>{error}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render log entries
  const renderLogs = () => {
    // Safety check for empty or undefined logs
    if (!paginatedLogs || paginatedLogs.length === 0) {
      return (
        <div className="log-entry">
          <div className="log-entry-header">
            <div className="log-timestamp">[{formatTimestamp(Date.now())}]</div>
            <div className="log-source">SYSTEM</div>
            <div className="log-type">INFO</div>
          </div>
          <div className="log-data">
            <div className="json-container">
              <span style={{ color: '#33ff33' }}>NO MATCHING LOGS FOUND</span>
            </div>
          </div>
        </div>
      );
    }

    // Map over available logs
    return paginatedLogs.map((log, index) => {
      // Safety check for each log object
      if (!log) return null;
      
      // Handle missing properties safely
      const logType = log.type || 'unknown';
      const logSource = log.source || 'system';
      const logTimestamp = log.timestamp || Date.now();
      
      return (
        <div
          key={`${currentPage}-${index}`}
          className={`log-entry ${logType.includes('error') ? 'error-log' : ''}`}
          role="article"
          aria-label={`Log entry from ${logSource} at ${formatTimestamp(logTimestamp)}`}
        >
          <div className="log-entry-header">
            <div className="log-timestamp">[{formatTimestamp(logTimestamp)}]</div>
            <div className="log-source">{logSource.toUpperCase()}</div>
            <div className="log-type">{logType.replace(/_/g, ' ').toUpperCase()}</div>
          </div>
          <div className="log-data">
            {renderLogData(log.data)}
          </div>
        </div>
      );
    });
  };

  // Render pagination controls
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          |◀
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          ◀
        </button>
        
        <span className="page-indicator">{currentPage} / {totalPages}</span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          ▶
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          ▶|
        </button>
      </div>
    );
  };
  // Main render function
  return (
    <div className="log-viewer-container">
      <div className="log-viewer-header">
        <h2>SYSTEM LOG VIEWER</h2>
        <div className="header-controls">
          <button 
            onClick={toggleViewMode}
            className={`view-mode-button ${viewMode === 'advanced' ? 'active' : ''}`}
            aria-label={`Switch to ${viewMode === 'simple' ? 'advanced' : 'simple'} view`}
          >
            {viewMode === 'simple' ? 'ADVANCED MODE' : 'SIMPLE MODE'}
          </button>
        </div>
      </div>

      <div className="log-viewer-content">
        <div className="log-viewer-toolbar">
          <div className="search-bar">
            <label htmlFor="log-search">&gt;</label>
            <input
              id="log-search"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
              placeholder="SEARCH LOGS..."
              aria-label="Search logs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <select 
              value={selectedSource} 
              onChange={handleSourceChange}
              aria-label="Filter by source"
            >
              {uniqueSources.map(source => (
                <option key={source} value={source}>
                  {source === 'all' ? 'ALL SOURCES' : source.toUpperCase()}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedType} 
              onChange={handleTypeChange}
              aria-label="Filter by type"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'ALL TYPES' : type.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
            
            {(searchQuery || selectedSource !== 'all' || selectedType !== 'all') && (
              <button 
                onClick={clearAllFilters}
                aria-label="Clear all filters"
                className="clear-filters-btn"
              >
                CLEAR FILTERS
              </button>
            )}
            
            <button 
              onClick={handleExportLogs}
              aria-label="Export logs"
              className="export-btn"
            >
              EXPORT
            </button>
          </div>
        </div>

        <div className="log-viewer-results">
          <div className="log-viewer-logs" role="log" aria-live="polite" aria-label="System logs">
            {isLoading ? renderLoadingState() : error ? renderErrorState() : renderLogs()}
          </div>

          {!isLoading && !error && renderPaginationControls()}

          <div className="log-stats">
            <div className="stat-item">
              <span className="stat-label">LOGS:</span>
              <span className="stat-value">{filteredLogs.length} / {logs.length}</span>
            </div>
            
            {!isLoading && !error && (
              <div className="stat-item">
                <span className="stat-label">STATUS:</span>
                <span className="stat-value" style={{ color: '#33ff33' }}>OK</span>
              </div>
            )}
            
            {isLoading && (
              <div className="stat-item">
                <span className="stat-label">STATUS:</span>
                <span className="stat-value" style={{ color: '#00f0ff' }}>LOADING</span>
              </div>
            )}
            
            {error && (
              <div className="stat-item">
                <span className="stat-label">STATUS:</span>
                <span className="stat-value" style={{ color: '#ff0033' }}>ERROR</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewerWindow;
