import React from 'react';
import { DosGameErrorScreenProps } from '../types';

/**
 * DosGameErrorScreen Component
 * 
 * Displays an error message when the DOS game fails to load
 */
const DosGameErrorScreen: React.FC<DosGameErrorScreenProps> = ({ 
    error, 
    onRetry 
}) => {
    return (
        <div className="dos-game-error">
            <h3>Failed to Load Game</h3>
            <p>{error}</p>
            <div className="dos-game-info">
                <p>Please check your internet connection or reload the application.</p>
                <button 
                    className="dos-game-retry-btn"
                    onClick={onRetry}
                >
                    Retry
                </button>
            </div>
        </div>
    );
};

export default DosGameErrorScreen;
