    import React, { useEffect } from 'react';
import { DosGameEngineProps } from '../types';

/**
 * DosGameEngine Component
 * 
 * Simple component that renders an iframe to load DOS games
 */
const DosGameEngine: React.FC<DosGameEngineProps> = ({
    containerId,
    zipFile,
    executablePath,
    gameTitle,
    onLoaded,
    onError
}) => {
    // Initialize the DOS game iframe
    useEffect(() => {
        try {
            const container = document.getElementById(containerId);
            if (container) {
                // Clear any existing content
                container.innerHTML = '';
                
                // Create an iframe that loads our custom HTML file with query parameters
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                
                // Generate URL with parameters to specify which game to load
                const url = new URL('/dos-game.html', window.location.origin);
                url.searchParams.append('zipFile', zipFile);
                url.searchParams.append('executablePath', executablePath);
                url.searchParams.append('gameTitle', gameTitle);
                
                // Set up iframe attributes
                iframe.src = url.toString();
                iframe.title = gameTitle;
                
                // Add iframe to container
                container.appendChild(iframe);
                
                // Store reference to the iframe for fullscreen functionality
                window.dosbox_Game = {
                    iframe: iframe,
                    requestFullScreen: () => {
                        if (iframe.requestFullscreen) {
                            iframe.requestFullscreen();
                        }
                    }
                };
                
                // Simple onload handler
                iframe.onload = () => {
                    console.log(`${gameTitle} iframe loaded`);
                    onLoaded();
                };
                
                // Simple onerror handler
                iframe.onerror = () => {
                    onError('Failed to load game iframe');
                };
            } else {
                throw new Error('Game container not found in DOM');
            }
        } catch (err) {
            console.error(`Error loading ${gameTitle}:`, err);
            onError(err instanceof Error ? err.message : String(err));
        }
        
    }, [containerId, zipFile, executablePath, gameTitle, onLoaded, onError]);

    return null;
};

export default DosGameEngine;
