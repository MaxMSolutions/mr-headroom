import React, { useEffect, useState } from 'react';
import './ErrorDialog.css';

interface ErrorDialogProps {
  errorTitle?: string;
  errorMessage: string;
  errorCode?: string;
  onClose?: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  errorTitle = 'System Error',
  errorMessage,
  errorCode,
  onClose
}) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Typewriter effect for the error message
  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 30; // milliseconds per character
    
    const typingInterval = setInterval(() => {
      if (currentIndex < errorMessage.length) {
        setDisplayedMessage(errorMessage.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Add occasional glitch effect after typing completes
        const glitchInterval = setInterval(() => {
          if (Math.random() > 0.7) { // 30% chance of glitching
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 150);
          }
        }, 2000);
        
        return () => clearInterval(glitchInterval);
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [errorMessage]);
  
  // Sound effect on mount
  useEffect(() => {
    try {
      // Try to play an error sound if available
      const audio = new Audio('/audio/alert_gameover.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => console.log('Audio playback prevented'));
    } catch (err) {
      console.log('Error playing sound', err);
    }
  }, []);
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Get the window ID from the parent element and close it
      const windowElement = document.querySelector('.error-dialog')?.closest('[data-window-id]');
      const windowId = windowElement?.getAttribute('data-window-id');
      if (windowId && window.windowManager) {
        window.windowManager.closeWindow(windowId);
      }
    }
  };

  return (
    <div className={`error-dialog ${isGlitching ? 'glitching' : ''}`}>
      <div className="error-header">
        <div className="error-icon">⚠</div>
        <h2>{errorTitle}</h2>
      </div>
      
      <div className="error-content">
        <p className="error-message">{displayedMessage}</p>
        {errorCode && (
          <div className="error-code">
            <span>Error Code:</span> {errorCode}
          </div>
        )}
      </div>
      
      <div className="error-footer">
        <button className="error-button" onClick={handleClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorDialog;
