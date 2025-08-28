import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Labyrinth.css';
import { LabyrinthEngine } from './LabyrinthEngine';
import LabyrinthAudio from './components/LabyrinthAudio';
import SymbolCollectionAnimation from './components/SymbolCollectionAnimation';
import { createWindow } from '../../engine/windowManager/WindowManager';

interface LabyrinthProps {
  id: string;
  onClose: () => void;
}

const LabyrinthWindow: React.FC<LabyrinthProps> = ({ id, onClose }) => {
  const [engine] = useState<LabyrinthEngine>(new LabyrinthEngine());
  const [maze, setMaze] = useState<string[][]>([]);
  const [gameStatus, setGameStatus] = useState({
    level: 1,
    collectedSymbols: [] as string[],
    message: "",
    isGameOver: false,
    isVictory: false
  });
  const [showInstructions, setShowInstructions] = useState(true);
  const [playerAction, setPlayerAction] = useState<'move' | 'collect' | 'exit' | 'collision' | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Symbol collection animation state
  const [collectedSymbol, setCollectedSymbol] = useState<string | null>(null);
  const [symbolPosition, setSymbolPosition] = useState<{ x: number, y: number } | null>(null);
  const [animatedSymbolIndex, setAnimatedSymbolIndex] = useState<number | null>(null);
  
  // UI state management
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showLogButton, setShowLogButton] = useState(false);
  
  // Initialize the game
  useEffect(() => {
    engine.initialize();
    updateGameState();
    
    // Set focus to the game container for keyboard controls
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
    
    // Add a delay before allowing to dismiss instructions
    const timer = setTimeout(() => {
      setHasSeenInstructions(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Reset symbol animation index after delay
  useEffect(() => {
    if (animatedSymbolIndex !== null) {
      const timer = setTimeout(() => {
        setAnimatedSymbolIndex(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [animatedSymbolIndex]);
  
  // Update the game state (maze and status)
  const updateGameState = () => {
    setMaze(engine.renderMaze());
    setGameStatus(engine.getGameStatus());
  };
  
  // Handle keyboard input for player movement
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow restart even if game is over
    if (e.key === 'r' || e.key === 'R') {
      handleRestart();
      return;
    }
    
    if (gameStatus.isGameOver || gameStatus.isVictory) return;
    
    let moved = false;
    switch(e.key) {
      case 'ArrowUp':
      case 'w':
        moved = handleMove('up');
        break;
      case 'ArrowDown':
      case 's':
        moved = handleMove('down');
        break;
      case 'ArrowLeft':
      case 'a':
        moved = handleMove('left');
        break;
      case 'ArrowRight':
      case 'd':
        moved = handleMove('right');
        break;
    }
    
    if (moved) {
      setPlayerAction('move');
      // Reset the action after a brief delay
      setTimeout(() => setPlayerAction(undefined), 100);
    }
  }, [engine, gameStatus.isGameOver, gameStatus.isVictory]);
  
  // Helper function to handle movement and return whether the move was successful
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right'): boolean => {
    // Store the previous state to check if move was successful
    const prevPos = { ...engine.getGameStatus() };
    const prevSymbols = [...prevPos.collectedSymbols];
    
    // Attempt to move
    const moveSuccessful = engine.movePlayer(direction);
    updateGameState();
    
    if (!moveSuccessful) {
      // Provide visual feedback for collision with wall
      setPlayerAction('collision');
      setTimeout(() => setPlayerAction(undefined), 300);
      return false;
    }
    
    // Check if movement was successful or if we collected something
    const newStatus = engine.getGameStatus();
    
    // Check if we collected a symbol
    if (newStatus.collectedSymbols.length > prevSymbols.length) {
      setPlayerAction('collect');
      
      // Get the newly collected symbol
      const newSymbol = newStatus.collectedSymbols[newStatus.collectedSymbols.length - 1];
      
      // Calculate symbol position based on player position (centered)
      // The engine internally tracks player position but doesn't expose it in getGameStatus()
      // Use the maze element dimensions to calculate the center of the screen instead
      const mazeElement = document.querySelector('.labyrinth-maze');
      
      if (mazeElement) {
        const rect = mazeElement.getBoundingClientRect();
        
        // Calculate the position for the animation (center of maze)
        const symbolX = rect.left + (rect.width / 2);
        const symbolY = rect.top + (rect.height / 2);
        
        // Trigger symbol collection animation
        setCollectedSymbol(newSymbol);
        setSymbolPosition({ x: symbolX, y: symbolY });
        setAnimatedSymbolIndex(newStatus.collectedSymbols.length - 1);
      }
      
      setTimeout(() => setPlayerAction(undefined), 300);
    }
    
    // Check if level changed (we reached exit)
    if (newStatus.level > prevPos.level) {
      setPlayerAction('exit');
      setTimeout(() => setPlayerAction(undefined), 300);
    }
    
    // Return whether we moved
    return true;
  };
  
  // Handle virtual control buttons
  const handleControlClick = (direction: 'up' | 'down' | 'left' | 'right') => {
    const moved = handleMove(direction);
    
    if (moved) {
      setPlayerAction('move');
      setTimeout(() => setPlayerAction(undefined), 100);
    }
    
    // Refocus on the game container after button click
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  };
  
  // Effect to handle window focus/blur for audio control
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Restart the game with confirmation if needed
  const handleRestart = () => {
    // If the game is in progress (not game over or victory), ask for confirmation
    if (!gameStatus.isGameOver && !gameStatus.isVictory && gameStatus.level > 1) {
      const confirmRestart = window.confirm("Are you sure you want to restart? Your progress will be lost.");
      if (!confirmRestart) return;
    }
    
    // Add restart log before initializing
    engine.logEvent('game_restart', {
      previous_level: gameStatus.level,
      collected_symbols: gameStatus.collectedSymbols,
      timestamp: Date.now()
    });
    
    engine.initialize();
    updateGameState();
    setShowInstructions(true);
    setShowHints(false);
    
    // Hide instructions after a delay if they've seen them before
    if (hasSeenInstructions) {
      setTimeout(() => {
        setShowInstructions(false);
      }, 3000);
    }
  };
  
  return (
    <div 
      className="labyrinth-container" 
      ref={gameContainerRef}
      tabIndex={0} 
      onKeyDown={handleKeyDown}
      id={`labyrinth-window-${id}`}
    >
      {/* Audio component for game sounds */}
      <LabyrinthAudio 
        isActive={isActive} 
        level={gameStatus.level}
        playerAction={playerAction}
        victory={gameStatus.isVictory}
      />
      
      {/* Symbol collection animation */}
      <SymbolCollectionAnimation 
        symbol={collectedSymbol}
        position={symbolPosition}
        onAnimationComplete={() => {
          setCollectedSymbol(null);
          setSymbolPosition(null);
        }}
      />
      
      <div className="labyrinth-header">
        <h2>LABYRINTH.EXE v1.0</h2>
        <div className="labyrinth-controls">
          <button onClick={() => setShowInstructions(!showInstructions)}>Help</button>
          <button onClick={handleRestart}>Restart</button>
          <button 
            onClick={() => {
              // Test log entry to verify logging system works
              engine.logEvent('diagnostic_check', {
                source: 'labyrinth_ui',
                status: 'testing_logs',
                message: 'Log system check',
                timestamp: Date.now()
              });
              
              if (window.windowManager) {
                window.windowManager.addWindow({
                  title: 'System Log Viewer',
                  component: 'LogViewer',
                  width: 850,
                  height: 600
                });
              }
            }}
            className="logs-button"
          >
            Logs
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      
      <div className="labyrinth-content">
        {/* Instructions overlay */}
        {showInstructions && (
          <div className="labyrinth-instructions">
            <div className="instructions-content">
              <h3>HOW TO PLAY</h3>
              
              <div style={{ flex: 1, overflow: 'auto', marginBottom: '10px' }}>
                <div className="instruction-section">
                  <h4>CONTROLS</h4>
                  <div className="instruction-grid">
                    <div className="instruction-item">
                      <span className="key-instruction">↑/W</span>
                      <span>Move Up</span>
                    </div>
                    <div className="instruction-item">
                      <span className="key-instruction">↓/S</span>
                      <span>Move Down</span>
                    </div>
                    <div className="instruction-item">
                      <span className="key-instruction">←/A</span>
                      <span>Move Left</span>
                    </div>
                    <div className="instruction-item">
                      <span className="key-instruction">→/D</span>
                      <span>Move Right</span>
                    </div>
                    <div className="instruction-item">
                      <span className="key-instruction">R</span>
                      <span>Restart Level</span>
                    </div>
                  </div>
                </div>
                
                <div className="instruction-section">
                  <h4>LEGEND</h4>
                  <div className="instruction-grid">
                    <div className="instruction-item">
                      <span className="legend-item player">☺</span>
                      <span>You</span>
                    </div>
                    <div className="instruction-item">
                      <span className="legend-item wall">█</span>
                      <span>Wall</span>
                    </div>
                    <div className="instruction-item">
                      <span className="legend-item path">·</span>
                      <span>Path</span>
                    </div>
                    <div className="instruction-item">
                      <span className="legend-item visited-path">○</span>
                      <span>Visited Path</span>
                    </div>
                    <div className="instruction-item">
                      <span className="legend-item exit">◊</span>
                      <span>Exit</span>
                    </div>
                    <div className="instruction-item">
                      <span className="legend-item symbol">2 5 1 7</span>
                      <span>Collectible Symbols</span>
                    </div>
                  </div>
                </div>
                
                <div className="instruction-section">
                  <h4>OBJECTIVE</h4>
                  <p>Collect symbols and find the exit (◊) to complete each level.</p>
                  <p>The collected symbols may reveal hidden patterns or codes.</p>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                {hasSeenInstructions && (
                  <button className="close-instructions" onClick={() => setShowInstructions(false)}>
                    Start Game
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Game status display */}
        <div className="labyrinth-status">
          <div className="level-info">
            <span className="status-label">Level:</span> 
            <span className="status-value">{gameStatus.level} of 5</span>
          </div>
          <div className="symbol-info">
            <span className="status-label">Collected:</span> 
            <div className="collected-symbols">
              {gameStatus.collectedSymbols.length > 0 ? 
                gameStatus.collectedSymbols.map((symbol, idx) => {
                  // Determine if this is the symbol that was just collected
                  const isNewlyCollected = idx === animatedSymbolIndex;
                  
                  // Check for special patterns (2517 sequence)
                  const isPartOfSequence = 
                    idx >= 1 && 
                    idx <= gameStatus.collectedSymbols.length - 1 && 
                    gameStatus.collectedSymbols[idx-1] === '2' && 
                    symbol === '5' && 
                    idx+1 < gameStatus.collectedSymbols.length && 
                    gameStatus.collectedSymbols[idx+1] === '1' && 
                    idx+2 < gameStatus.collectedSymbols.length && 
                    gameStatus.collectedSymbols[idx+2] === '7';
                  
                  return (
                    <span 
                      key={idx} 
                      className={`collected-symbol ${isNewlyCollected ? 'animated' : ''} ${isPartOfSequence ? 'sequence-match' : ''}`}
                    >
                      {symbol}
                    </span>
                  );
                }) : 
                <span className="no-symbols">None yet</span>
              }
            </div>
          </div>
          <div className="message-box">
            {gameStatus.message || "Find the symbols and exit"}
          </div>
        </div>
        
        {/* Game info and hints */}
        <div className="labyrinth-game-info">
          <div className="hint-system">
            <label>
              <input 
                type="checkbox" 
                onChange={(e) => setShowHints(e.target.checked)} 
                checked={showHints}
              />
              Show Hints
            </label>
          </div>
        </div>
        
        {/* Game content wrapper - contains maze and controls side by side */}
        <div className="game-content-wrapper">
          {/* Maze rendering */}
          <div className="labyrinth-maze">
            {maze.map((row, y) => (
              <div key={`row-${y}`} className="maze-row">
                {row.map((cell, x) => {
                  const isPlayerCell = cell === '☺';
                  const isExitCell = cell === '◊';
                  const isSymbolCell = ['2','5','1','7','*','&','#','@'].includes(cell);
                  const isWallCell = cell === '█';
                  const isPathCell = cell === '·';
                  const isVisitedPathCell = cell === '○';
                  
                  // Add hint classes for exit or symbols if hint mode is on
                  const exitPosition = showHints ? engine.getExitPosition() : null;
                  const isOnExitPath = showHints && exitPosition && 
                    Math.abs(x - exitPosition.x) + Math.abs(y - exitPosition.y) < 8;
                  
                  return (
                    <span 
                      key={`cell-${x}-${y}`}
                      className={`maze-cell 
                        ${isPlayerCell ? 'player' : ''} 
                        ${isExitCell ? 'exit' : ''} 
                        ${isSymbolCell ? 'symbol' : ''}
                        ${isWallCell ? 'wall' : ''}
                        ${isPathCell ? 'path' : ''}
                        ${isVisitedPathCell ? 'visited-path' : ''}
                        ${isOnExitPath ? 'exit-hint' : ''}
                      `}
                      title={`${x},${y}`}
                    >
                      {cell}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Virtual controls for touch devices - now on the side */}
          <div className="labyrinth-virtual-controls">
            <div className="dpad-container">
              <div className="dpad">
                <button 
                  className="dpad-button dpad-up" 
                  onClick={() => handleControlClick('up')}
                  aria-label="Move Up"
                >
                  ↑
                </button>
                <button 
                  className="dpad-button dpad-left" 
                  onClick={() => handleControlClick('left')}
                  aria-label="Move Left"
                >
                  ←
                </button>
                <button 
                  className="dpad-button dpad-center" 
                  onClick={handleRestart}
                  aria-label="Restart Level"
                >
                  R
                </button>
                <button 
                  className="dpad-button dpad-right" 
                  onClick={() => handleControlClick('right')}
                  aria-label="Move Right"
                >
                  →
                </button>
                <button 
                  className="dpad-button dpad-down" 
                  onClick={() => handleControlClick('down')}
                  aria-label="Move Down"
                >
                  ↓
                </button>
              </div>
            </div>
            <div className="control-legend">
              <span>Use keyboard or touch controls</span>
            </div>
          </div>
        </div>
        
        {/* Victory / Game Over screens */}
        {gameStatus.isVictory && (
          <div className="labyrinth-victory">
            <h3>CONGRATULATIONS!</h3>
            <p>You've completed all levels of the LABYRINTH!</p>
            <button onClick={handleRestart}>Play Again</button>
          </div>
        )}
        
        {gameStatus.isGameOver && (
          <div className="labyrinth-game-over">
            <h3>GAME OVER</h3>
            <button onClick={handleRestart}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabyrinthWindow;
