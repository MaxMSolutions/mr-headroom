import React, { useEffect, useRef } from 'react';

interface LabyrinthAudioProps {
  isActive: boolean;
  level: number;
  playerAction?: 'move' | 'collect' | 'exit' | 'collision';
  victory?: boolean;
}

/**
 * Component to handle all audio effects for the Labyrinth game
 */
const LabyrinthAudio: React.FC<LabyrinthAudioProps> = ({ 
  isActive, 
  level, 
  playerAction, 
  victory 
}) => {
  const moveAudioRef = useRef<HTMLAudioElement | null>(null);
  const collectAudioRef = useRef<HTMLAudioElement | null>(null);
  const exitAudioRef = useRef<HTMLAudioElement | null>(null);
  const collisionAudioRef = useRef<HTMLAudioElement | null>(null);
  const victoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio references
  useEffect(() => {
    moveAudioRef.current = new Audio();
    collectAudioRef.current = new Audio();
    exitAudioRef.current = new Audio();
    collisionAudioRef.current = new Audio();
    victoryAudioRef.current = new Audio();
    ambientAudioRef.current = new Audio();
    
    // Set audio sources
    if (moveAudioRef.current) moveAudioRef.current.src = '/audio/laser_small.mp3';
    if (collectAudioRef.current) collectAudioRef.current.src = '/audio/force_field_1.mp3';
    if (exitAudioRef.current) exitAudioRef.current.src = '/audio/force_field_2.mp3';
    if (collisionAudioRef.current) collisionAudioRef.current.src = '/audio/ship_hit.mp3';
    if (victoryAudioRef.current) victoryAudioRef.current.src = '/audio/alert_gameover.mp3';
    
    // Set ambient audio based on level
    if (ambientAudioRef.current) {
      if (level >= 4) {
        ambientAudioRef.current.src = '/audio/ambient_glitch02.mp3';
      } else if (level >= 2) {
        ambientAudioRef.current.src = '/audio/ambiend_glitch_01.mp3';
      } else {
        ambientAudioRef.current.src = '/audio/ambient_hum.mp3';
      }
      
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.3;
    }
    
    // Clean up audio on unmount
    return () => {
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
    };
  }, []);
  
  // Handle level changes
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      
      if (level >= 4) {
        ambientAudioRef.current.src = '/audio/ambient_glitch02.mp3';
      } else if (level >= 2) {
        ambientAudioRef.current.src = '/audio/ambiend_glitch_01.mp3';
      } else {
        ambientAudioRef.current.src = '/audio/ambient_hum.mp3';
      }
      
      if (isActive) {
        ambientAudioRef.current.play().catch(() => {
          // Handle autoplay restrictions
          console.log('Ambient audio play prevented by browser policy');
        });
      }
    }
  }, [level, isActive]);
  
  // Handle active state changes
  useEffect(() => {
    if (ambientAudioRef.current) {
      if (isActive) {
        ambientAudioRef.current.play().catch(() => {
          // Handle autoplay restrictions
          console.log('Ambient audio play prevented by browser policy');
        });
      } else {
        ambientAudioRef.current.pause();
      }
    }
  }, [isActive]);
  
  // Handle player actions
  useEffect(() => {
    if (!isActive) return;
    
    switch (playerAction) {
      case 'move':
        if (moveAudioRef.current) {
          moveAudioRef.current.currentTime = 0;
          moveAudioRef.current.volume = 0.2;
          moveAudioRef.current.play().catch(() => {});
        }
        break;
      case 'collect':
        if (collectAudioRef.current) {
          collectAudioRef.current.currentTime = 0;
          collectAudioRef.current.volume = 0.4;
          collectAudioRef.current.play().catch(() => {});
        }
        break;
      case 'exit':
        if (exitAudioRef.current) {
          exitAudioRef.current.currentTime = 0;
          exitAudioRef.current.volume = 0.5;
          exitAudioRef.current.play().catch(() => {});
        }
        break;
      case 'collision':
        if (collisionAudioRef.current) {
          collisionAudioRef.current.currentTime = 0;
          collisionAudioRef.current.volume = 0.3;
          collisionAudioRef.current.play().catch(() => {});
        }
        break;
    }
  }, [playerAction, isActive]);
  
  // Handle victory
  useEffect(() => {
    if (isActive && victory && victoryAudioRef.current) {
      victoryAudioRef.current.currentTime = 0;
      victoryAudioRef.current.volume = 0.5;
      victoryAudioRef.current.play().catch(() => {});
      
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    }
  }, [victory, isActive]);
  
  // This component doesn't render anything
  return null;
};

export default LabyrinthAudio;
