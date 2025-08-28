import React, { useState, useEffect } from 'react';
import './StartButton.css';

interface StartButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ isActive, onClick }) => {
  const [glitchActive, setGlitchActive] = useState(false);
  
  // Randomly trigger a brief glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // 1% chance of glitching
      if (Math.random() < 0.01) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 5000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  return (
    <div 
      className={`start-button ${isActive ? 'active' : ''} ${glitchActive ? 'glitch-effect' : ''}`}
      onClick={onClick}
    >
      <span className="start-icon">⌬</span>
      <span>START</span>
    </div>
  );
};

export default StartButton;
