import { useCallback } from 'react';

/**
 * Custom hook to handle fullscreen functionality for DOS games
 */
export const useDosGameFullscreen = () => {
    const handleFullscreen = useCallback(() => {
        console.log('Fullscreen button clicked');
        // Use the iframe for fullscreen
        if (window.dosbox_Game && window.dosbox_Game.iframe) {
            try {
                if (window.dosbox_Game.requestFullScreen) {
                    window.dosbox_Game.requestFullScreen();
                } else if (window.dosbox_Game.iframe.contentDocument && 
                          window.dosbox_Game.iframe.contentDocument.getElementById('dosGameContainer')) {
                    // Try to find the dosbox element inside the iframe and request fullscreen on it
                    const dosboxElement = window.dosbox_Game.iframe.contentDocument.getElementById('dosGameContainer');
                    if (dosboxElement && dosboxElement.requestFullscreen) {
                        dosboxElement.requestFullscreen();
                    }
                }
            } catch (err) {
                console.error('Error entering fullscreen:', err);
            }
        } else {
            console.warn('Dosbox iframe not found');
        }
    }, []);
    
    return { handleFullscreen };
};
