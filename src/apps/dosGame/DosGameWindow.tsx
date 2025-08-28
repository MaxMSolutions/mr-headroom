import React, { useState, useRef, useCallback, useEffect } from 'react';
import './DosGame.css';

// Import types
import { DosGameWindowProps, DosGameState } from './types';

// Import components
import { 
    DosGameHeader, 
    DosGameErrorScreen, 
    DosGameControls,
    DosGameEngine
} from './components';

// Import hooks
import { useDosGameLogger, useDosGameFullscreen } from './hooks';

/**
 * DosGameWindow Component
 * 
 * Generic component for running DOS games in the RetroOS environment
 */
const DosGameWindow: React.FC<DosGameWindowProps> = ({
    id,
    title,
    zipFile,
    executablePath,
    fileSystem,
    onClose
}) => {
    // Component state
    const [gameState, setGameState] = useState<DosGameState>({
        isLoading: true,
        isPlayable: false, // Start as false until game is confirmed playable
        isPlaying: false,  // Start as false until game is actually running
        error: null
    });
    
    // Reference to the container div
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Unique container ID for this instance
    const gameContainerId = `dos-game-container-${id}`;
    
    // Use custom hooks
    useDosGameLogger(id, title, fileSystem);
    const { handleFullscreen } = useDosGameFullscreen();

    // Initialize container element
    useEffect(() => {
        // First make sure the container element exists
        if (!document.getElementById(gameContainerId) && containerRef.current) {
            const containerDiv = document.createElement('div');
            containerDiv.id = gameContainerId;
            containerDiv.style.width = '100%';
            containerDiv.style.height = '100%';
            
            const content = containerRef.current.querySelector('.dos-game-content');
            if (content) {
                content.appendChild(containerDiv);
                console.log('Created container element with ID:', gameContainerId);
            }
        }
    }, [gameContainerId]);

    // Handle game loaded event
    const handleGameLoaded = useCallback(() => {
        console.log('Game loaded successfully');
        setGameState({
            isLoading: false,
            isPlayable: true,
            isPlaying: true,
            error: null // Clear any previous error state when game loads successfully
        });
    }, []);

    // Handle game error event
    const handleGameError = useCallback((errorMessage: string) => {
        setGameState({
            isLoading: false,
            isPlayable: false,
            isPlaying: false,
            error: errorMessage
        });
    }, []);

    // Reset game
    const handleReset = useCallback(() => {
        console.log('Reset button clicked');
        
        // First set loading state
        setGameState({
            isLoading: true,
            isPlayable: false,
            isPlaying: false,
            error: null
        });
        
        // Clear the container
        const container = document.getElementById(gameContainerId);
        if (container) {
            container.innerHTML = '';
        }
        
        // Reset the state immediately
        setTimeout(() => {
            setGameState(prev => ({
                ...prev,
                isLoading: false
            }));
        }, 500);
    }, [gameContainerId]);
    
    // Extract game state for easier access
    const { isLoading, error } = gameState;

    // Determine control instructions based on the game
    const getControlsInfo = () => {
        const gameId = zipFile.toLowerCase();
        
        if (gameId.includes('doom') || gameId.includes('wolf3d')) {
            return "Arrow keys to move, Ctrl to fire, Alt for strafe, Spacebar to use doors";
        } else if (gameId.includes('keen')) {
            return "Arrow keys to move, Ctrl to jump/pogo, Alt to fire";
        } else if (gameId.includes('oregon')) {
            return "Use keyboard to make selections, Enter to confirm";
        } else {
            return "Use arrow keys to navigate, Ctrl/Alt for game actions";
        }
    };

    return (
        <div className="dos-game-window" ref={containerRef}>
            {/* Content area */}
            <div className="dos-game-content">
                {/* Loading screen - only shown when loading */}
                {isLoading && (
                    <div className="dos-game-loading">
                        <div className="dos-game-loading-text">Loading {title}...</div>
                        <div className="dos-game-loading-progress">
                            <div 
                                className="dos-game-loading-bar" 
                                style={{ width: '60%' }}
                            ></div>
                        </div>
                    </div>
                )}
                
                {/* Error screen - only shown when there's an error and not loading */}
                {error && !isLoading && (
                    <DosGameErrorScreen 
                        error={error}
                        onRetry={handleReset}
                    />
                )}
                
                {/* Game engine container - direct rendering without overlay divs */}
                <DosGameEngine 
                    id={id}
                    containerId={gameContainerId}
                    zipFile={zipFile}
                    executablePath={executablePath}
                    gameTitle={title}
                    onLoaded={handleGameLoaded}
                    onError={handleGameError}
                />
            </div>
        </div>
    );
};

export default DosGameWindow;
