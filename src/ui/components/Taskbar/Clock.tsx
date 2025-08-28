import React from 'react';
import './Clock.css';

interface ClockProps {
  isGlitching: boolean;
}

const Clock: React.FC<ClockProps> = ({ isGlitching }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  
  // Update clock
  React.useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(clockInterval);
  }, []);
  
  // Format time for display (with occasional glitch)
  const getFormattedTime = () => {
    if (isGlitching) {
      const glitchChars = "0123456789:!@#$%^&*";
      return Array(8).fill(0).map(() => 
        glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
    }
    
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${ampm}`;
  };
  
  return (
    <div className={`clock ${isGlitching ? 'glitching' : ''}`}>
      {getFormattedTime()}
    </div>
  );
};

export default Clock;
