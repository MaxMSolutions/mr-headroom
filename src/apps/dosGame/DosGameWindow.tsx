import React, { useState, useCallback } from 'react';
import './DosGame.css';

// Import types
import { DosGameWindowProps } from './types';

// Import components
import { DosGameErrorScreen, DosGameEngine } from './components';

// Import hooks
import { useDosGameLogger } from './hooks';

/**
 * DosGameWindow Component
 * 
 * Simple component for running DOS games in the RetroOS environment
 */
const DosGameWindow: React.FC<DosGameWindowProps> = ({
    id,
    title,
    zipFile,
    executablePath,
    fileSystem
}) => {
    // Minimal state - just track errors
    const [error, setError] = useState<string | null>(null);
    
    // Unique container ID for this instance
    const gameContainerId = `dos-game-container-${id}`;
    
    // Use logger hook for game events
    useDosGameLogger(id, title, fileSystem);
    
    // Handle game loaded event
    const handleGameLoaded = useCallback(() => {
        console.log('Game loaded successfully');
        setError(null);
    }, []);

    // Handle game error event
    const handleGameError = useCallback((errorMessage: string) => {
        console.error(`Game error: ${errorMessage}`);
        setError(errorMessage);
    }, []);

    // Reset game on error
    const handleReset = useCallback(() => {
        console.log('Resetting game');
        setError(null);
        
        // Force reload the iframe by updating a key or recreating it
        const container = document.getElementById(gameContainerId);
        if (container) {
            container.innerHTML = '';
        }
    }, [gameContainerId]);

    return (
        <div className="dos-game-window">
            <div className="dos-game-content">
                {/* Error screen - only shown when there's an error */}
                {error && (
                    <DosGameErrorScreen 
                        error={error}
                        onRetry={handleReset}
                    />
                )}
                
                {/* Game engine container */}
                <div id={gameContainerId} className="dos-game-container" style={{ width: '100%', height: '100%' }}>
                    {/* The iframe will be injected here by DosGameEngine */}
                </div>
                
                {/* DosGameEngine handles the actual iframe creation */}
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
