import React, { useEffect, useState, useRef } from 'react';
import './StarfieldHUD.css';

interface StarfieldHUDProps {
  score: number;
  lives: number;
  targetScore: number;
  shieldActive: boolean;
  rapidFireActive: boolean;
}

const StarfieldHUD: React.FC<StarfieldHUDProps> = ({
  score,
  lives,
  targetScore,
  shieldActive,
  rapidFireActive
}) => {
  // State for score animation effect
  const [isScoreAnimating, setIsScoreAnimating] = useState<boolean | string>(false);
  const scoreRef = useRef(score);
  
  // Determine if we're approaching the target score
  const isNearTarget = targetScore - score < 500 && targetScore - score > 0;
  const [glitching, setGlitching] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [hexGrid, setHexGrid] = useState<Array<{x: number, y: number, size: number, opacity: number, color: string}>>([]);
  
  // State for showing score increment
  const [scoreIncrement, setScoreIncrement] = useState<number | null>(null);
  
  // Animate score changes - enhanced with milestone animations
  useEffect(() => {
    if (score !== scoreRef.current) {
      // Calculate the score difference
      const diff = score - scoreRef.current;
      
      // Only show positive increments
      if (diff > 0) {
        setScoreIncrement(diff);
      }
      
      // Special milestone animations
      const milestones = [1000, 2500, 5000, 7500, 10000, 12500, 15000];
      const isMilestone = milestones.some(milestone => 
        scoreRef.current < milestone && score >= milestone
      );
      
      // Special animation when hitting 15953 (critical target)
      const isTargetMilestone = scoreRef.current < targetScore && score >= targetScore;
      
      // Start the animation effect when the score changes
      scoreRef.current = score;
      setIsScoreAnimating(true);
      
      // Enhanced animation for milestones
      if (isMilestone || isTargetMilestone) {
        // Create a more dramatic animation for milestones
        document.documentElement.style.setProperty('--score-pulse-color', 
          isTargetMilestone ? 'var(--critical-color, #ff00ff)' : 'var(--milestone-color, #00ffff)');
        
        document.documentElement.style.setProperty('--score-pulse-duration', 
          isTargetMilestone ? '1.5s' : '1s');
        
        // Add milestone class for enhanced animation
        setIsScoreAnimating(false); // Reset to ensure new class is applied
        setTimeout(() => {
          setIsScoreAnimating(isTargetMilestone ? 'milestone-critical' : 'milestone');
        }, 10);
      }
      
      // Turn off animation effect after a short period
      const animationTimeout = setTimeout(() => {
        setIsScoreAnimating(false);
        setScoreIncrement(null);
      }, isTargetMilestone ? 2000 : isMilestone ? 1500 : 800);
      
      return () => {
        clearTimeout(animationTimeout);
      };
    }
  }, [score, targetScore]);
  
  // Create random glitch effects when near target score
  useEffect(() => {
    if (isNearTarget) {
      const glitchInterval = setInterval(() => {
        setGlitching(prev => !prev);
      }, 700 + Math.random() * 1000);
      
      // Generate hex grid pattern for cyberpunk effect
      const newHexGrid = [];
      for (let i = 0; i < 20; i++) {
        newHexGrid.push({
          x: Math.random() * 640,
          y: Math.random() * 480,
          size: 10 + Math.random() * 15,
          opacity: 0.1 + Math.random() * 0.4,
          color: Math.random() > 0.5 ? 'var(--accent-primary)' : 'var(--accent-secondary)'
        });
      }
      setHexGrid(newHexGrid);
      
      return () => clearInterval(glitchInterval);
    }
  }, [isNearTarget]);
  
  // Show occasional flash messages with improved cyberpunk aesthetic
  useEffect(() => {
    if (isNearTarget && Math.random() > 0.8) {
      const messages = [
        "MEMORY BREACH IMMINENT",
        "SYSTEM UNSTABLE",
        "NEURAL SYNC AT RISK",
        "REALITY MATRIX FLUX",
        "DECRYPT SEQUENCE READY",
        "DATA CORRUPTION DETECTED",
        "FIREWALL BREACH DETECTED",
        "CORE SYSTEMS COMPROMISED"
      ];
      
      setFlashMessage(messages[Math.floor(Math.random() * messages.length)]);
      const timer = setTimeout(() => setFlashMessage(''), 2000);
      
      return () => clearTimeout(timer);
    }
  }, [score, isNearTarget]);
  
  // Generate more stylized ship indicators with cyberpunk aesthetic
  const renderLivesIndicator = () => {
    const shipIcons = [];
    for (let i = 0; i < lives; i++) {
      // Each ship icon has different animation delay for a wave effect
      shipIcons.push(
        <div 
          key={i} 
          className="ship-icon-container"
          style={{ 
            animationDelay: `${i * 0.2}s`,
            opacity: 1 - (i * 0.15) // Fade effect for distant ships
          }}
        >
          <div className="ship-icon-hexagon">
            <div className="ship-icon">
              <span className="ship-arrow">▲</span>
              <span className="ship-glow"></span>
            </div>
          </div>
        </div>
      );
    }
    return shipIcons;
  };
  
  // Create progress bar to target score
  const progressPercentage = Math.min(100, (score / targetScore) * 100);
  
  return (
    <>
      <div className="starfield-hud">
        <div className="hud-section hud-left">
          <div className={`score-container ${isNearTarget ? 'pulse-warning' : ''}`}>
            <div className="score-label">
              <span className="label-icon">⬢</span>
              SCORE
              <span className="label-icon">⬢</span>
            </div>
            <div className={`score-value ${isNearTarget ? 'critical-hint' : ''} ${isScoreAnimating ? 'animating' : ''}`}>
              {score.toString().padStart(6, '0')}
              {isScoreAnimating && (
                <>
                  <span className="score-increment-animation"></span>
                  {scoreIncrement && 
                    <span className="score-increment-value">+{scoreIncrement}</span>
                  }
                </>
              )}
            </div>
            <div className="target-label">
              <span className="label-icon target-icon">⟡</span>
              TARGET
              <span className="label-icon target-icon">⟡</span>
            </div>
            <div className={`target-value ${glitching ? 'glitching-text' : ''}`}>
              {targetScore.toString().padStart(6, '0')}
            </div>
          </div>
          
          <div className="progress-container">
            <div className="progress-track"></div>
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 5 && (
                <div className="progress-glow"></div>
              )}
            </div>
            {isNearTarget && (
              <div className="progress-warning">
                <span className="warning-icon">!</span>
                APPROACHING MEMORY DUMP THRESHOLD
                <span className="warning-icon">!</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="hud-section hud-center">
          {flashMessage && (
            <div className="flash-message">
              <div className="flash-icon">⚠</div>
              <div className="flash-text">{flashMessage}</div>
              <div className="flash-icon">⚠</div>
            </div>
          )}
          {hexGrid.length > 0 && (
            <div className="hex-grid-container">
              {hexGrid.map((hex, index) => (
                <div 
                  key={index} 
                  className="hex-grid-item" 
                  style={{ 
                    left: `${hex.x}px`, 
                    top: `${hex.y}px`,
                    width: `${hex.size}px`,
                    height: `${hex.size}px`,
                    opacity: hex.opacity,
                    backgroundColor: hex.color
                  }} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="hud-section hud-right">
          <div className="lives-container">
            <div className="lives-header">
              <div className="lives-label">
                <span className="sys-icon">⬢</span>
                FLEET STATUS
              </div>
              <div className="lives-count">{lives} ACTIVE</div>
            </div>
            <div className="lives-icons-container">
              <div className="lives-icons-grid">{renderLivesIndicator()}</div>
            </div>
          </div>
          
          <div className="power-ups">
            {shieldActive && (
              <div className="power-up shield">
                <div className="power-icon-container">
                  <div className="power-icon-circle"></div>
                  <div className="power-icon">◉</div>
                </div>
                <div className="power-label">
                  <span className="power-status active"></span>
                  SHIELD
                </div>
              </div>
            )}
            
            {rapidFireActive && (
              <div className="power-up rapid-fire">
                <div className="power-icon-container">
                  <div className="power-icon">⁍⁍</div>
                </div>
                <div className="power-label">
                  <span className="power-status active"></span>
                  RAPID
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Grid overlay for cyberpunk effect */}
      <div className="hud-grid-overlay">
        <div className="grid-line horizontal"></div>
        <div className="grid-line horizontal"></div>
        <div className="grid-line vertical"></div>
        <div className="grid-line vertical"></div>
      </div>
      
      {/* Corner accents for enhanced cyberpunk feel */}
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>
    </>
  );
};

export default StarfieldHUD;
