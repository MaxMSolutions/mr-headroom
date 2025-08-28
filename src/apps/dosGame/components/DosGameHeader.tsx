import React from 'react';
import { DosGameHeaderProps } from '../types';

/**
 * DosGameHeader Component
 * 
 * Renders the header section of the DOS game window with title and close button
 */
const DosGameHeader: React.FC<DosGameHeaderProps> = ({ 
    title, 
    onClose 
}) => {
    return (
        <div className="dos-game-header">
            <div className="dos-game-title">{title}</div>
            {onClose && (
                <button 
                    onClick={onClose}
                    className="dos-game-close-btn"
                    aria-label="Close"
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default DosGameHeader;
