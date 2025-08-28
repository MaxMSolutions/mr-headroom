import React, { useState, useEffect, useRef } from 'react';
import './SymbolCollectionAnimation.css';

interface SymbolCollectionAnimationProps {
  symbol: string | null;
  position: { x: number, y: number } | null;
  onAnimationComplete: () => void;
}

/**
 * Component that handles symbol collection animation in the Labyrinth game
 * This provides visual feedback when a player collects a symbol
 */
const SymbolCollectionAnimation: React.FC<SymbolCollectionAnimationProps> = ({ 
  symbol, 
  position, 
  onAnimationComplete 
}) => {
  const [visible, setVisible] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up the animation when a symbol is collected
  useEffect(() => {
    if (symbol && position) {
      // Show the animation
      setVisible(true);
      
      // Clean up previous timeout if it exists
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Hide the animation after it completes
      animationTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        onAnimationComplete();
      }, 1200); // Animation takes 1.2 seconds
    }
    
    // Clean up on component unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [symbol, position, onAnimationComplete]);
  
  if (!visible || !symbol || !position) {
    return null;
  }
  
  // Determine if this is a special sequence symbol (2, 5, 1, or 7)
  const isSpecialSymbol = ['2', '5', '1', '7'].includes(symbol);
  
  return (
    <div 
      className="symbol-collection-animation"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    >
      <div className={`symbol ${isSpecialSymbol ? 'special' : ''}`}>
        {symbol}
      </div>
      <div className="collection-effect"></div>
      <div className="glow-effect"></div>
    </div>
  );
};

export default SymbolCollectionAnimation;
