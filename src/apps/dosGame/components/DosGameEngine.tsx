    import React, { useEffect } from 'react';
import { DosGameEngineProps } from '../types';

/**
 * DosGameEngine Component
 * 
 * Handles the core game engine initialization and loading
 */
const DosGameEngine: React.FC<DosGameEngineProps> = ({
    id,
    containerId,
    zipFile,
    executablePath,
    gameTitle,
    onLoaded,
    onError
}) => {
    // Initialize the DOS game engine
    useEffect(() => {
        let timeoutId: number;
        
        try {
            const container = document.getElementById(containerId);
            if (container) {
                // Clear any existing content
                container.innerHTML = '';
                
                console.log(`Creating Dosbox instance for ${gameTitle}`);
                
                // Create an iframe that loads our custom HTML file with query parameters
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.pointerEvents = 'auto'; // Ensure clicks are registered
                iframe.style.position = 'absolute'; // Absolute positioning
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.zIndex = '100'; // Make sure it's on top of everything
                
                // Generate URL with parameters to specify which game to load
                const url = new URL('/dos-game.html', window.location.origin);
                url.searchParams.append('zipFile', zipFile);
                url.searchParams.append('executablePath', executablePath);
                url.searchParams.append('gameTitle', gameTitle);
                
                // Use our generic HTML implementation with parameters
                iframe.src = url.toString();
                container.appendChild(iframe);
                
                // Store reference to the iframe for fullscreen
                window.dosbox_Game = {
                    iframe: iframe,
                    requestFullScreen: function() {
                        // Try to access the iframe's dosbox
                        try {
                            if (iframe.contentWindow && iframe.contentWindow.dosbox_Game) {
                                iframe.contentWindow.dosbox_Game.requestFullScreen();
                            } else if (iframe.requestFullscreen) {
                                iframe.requestFullscreen();
                            }
                        } catch (err) {
                            console.error('Error requesting fullscreen:', err);
                            // Fallback to iframe fullscreen
                            if (iframe.requestFullscreen) {
                                iframe.requestFullscreen();
                            }
                        }
                    }
                };
                
                // Once the iframe is loaded, we're ready
                iframe.onload = function() {
                    console.log(`${gameTitle} iframe loaded`);
                };
                
                // Set up a timeout in case the iframe fails to load
                // Create a reference we can clear in the cleanup function
                timeoutId = window.setTimeout(() => {
                    // This is a fallback for when the game doesn't load within the timeout period
                    // Only show error if iframe exists but no game loaded message was received
                    if (document.getElementById(containerId)?.querySelector('iframe')) {
                        try {
                            // Check if game is actually running by looking for canvas element or start button
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                            
                            if (iframeDoc) {
                                const canvas = iframeDoc.querySelector('canvas');
                                const startButton = iframeDoc.querySelector('.dosbox-start');
                                
                                if (canvas || startButton) {
                                    // Game is loading correctly
                                    console.log('Game elements found - game appears to be loading correctly');
                                    // Force the loaded state just in case the message was missed
                                    onLoaded();
                                } else {
                                    // No game elements found after timeout
                                    console.warn('Game loading timeout - no game elements found after 15 seconds');
                                    onError('Game loading timeout - please try again');
                                }
                            } else {
                                // Can't access iframe content - probably due to cross-origin restrictions
                                console.warn('Cannot access iframe content - assuming game is loading');
                                // Don't show error as game might still be loading
                            }
                        } catch (err) {
                            // Error accessing iframe content - likely cross-origin restrictions
                            console.error('Error checking game state:', err);
                            // Don't show error as game might still be loading
                        }
                    } else {
                        onError('Failed to load game iframe');
                    }
                }, 15000); // Increased to 15 seconds for more reliable loading
                
                console.log('Dosbox instance created');
            } else {
                throw new Error('Game container not found in DOM');
            }
        } catch (err) {
            console.error(`Error loading ${gameTitle}:`, err);
            onError(err instanceof Error ? err.message : String(err));
        }

        // Message listener for iframe communication
        const messageHandler = (event: MessageEvent) => {
            if (event.data === 'dos-game-started') {
                console.log('Received dos-game-started message');
                // Ensure we clear any error state when game loads successfully
                onLoaded();
                
                // Clear any loading or error messages in the container
                const container = document.getElementById(containerId);
                if (container) {
                    const errorElements = container.querySelectorAll('.error-message');
                    errorElements.forEach(el => el.remove());
                }
            } else if (event.data === 'dos-game-ready') {
                console.log('Received dos-game-ready message');
                // Game is ready to play (click to start screen)
                onLoaded();
            } else if (event.data && event.data.error) {
                console.error('Received error message:', event.data.error);
                onError(event.data.error);
            }
        };
        
        window.addEventListener('message', messageHandler);
        return () => {
            window.removeEventListener('message', messageHandler);
            if (timeoutId) window.clearTimeout(timeoutId);
        };
    }, [id, containerId, zipFile, executablePath, gameTitle, onLoaded, onError]);

    return null;
};

export default DosGameEngine;
