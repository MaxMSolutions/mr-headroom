import React from 'react';
import { DosGameControlsProps } from '../types';

/**
 * DosGameControls Component
 * 
 * Displays game controls and action buttons
 */
const DosGameControls: React.FC<DosGameControlsProps> = ({ 
    isPlaying, 
    onReset, 
    onFullscreen,
    controlsInfo
}) => {
    return (
        <div className="dos-game-controls">
            <div className="dos-game-info">
                {controlsInfo || "Use arrow keys to move, Ctrl/Alt for game actions"}
            </div>
            <div className="dos-game-buttons">
                {isPlaying && (
                    <button className="dos-game-control-btn dos-game-reset" onClick={onReset}>
                        Reset
                    </button>
                )}
                {isPlaying && (
                    <button className="dos-game-control-btn dos-game-fullscreen" onClick={onFullscreen}>
                        Fullscreen
                    </button>
                )}
            </div>
        </div>
    );
};

export default DosGameControls;
