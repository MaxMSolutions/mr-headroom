import React, { useEffect, useRef, useState } from 'react';
import { StarfieldEngine } from '../StarfieldEngine';
import StarfieldHUD from './StarfieldHUD';

interface StarfieldGameProps {
  engine: StarfieldEngine;
  onClose?: () => void;
}

const StarfieldGame: React.FC<StarfieldGameProps> = ({ engine, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Audio references
  const laserSoundRef = useRef<HTMLAudioElement | null>(null);
  const enemyLaserSoundRef = useRef<HTMLAudioElement | null>(null);
  const shipHitSoundRef = useRef<HTMLAudioElement | null>(null);
  const shipEnginesSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [rapidFireActive, setRapidFireActive] = useState<boolean>(false);
  const [keysPressed] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [glitchExplosionActive, setGlitchExplosionActive] = useState<boolean>(false);
  const [shipHitActive, setShipHitActive] = useState<boolean>(false);
  const [hitPosition, setHitPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showExplosionOverlay, setShowExplosionOverlay] = useState<boolean>(false); // Simple overlay for hit
  const [hitParticles, setHitParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
  }>>([]);
  const [screenFlash, setScreenFlash] = useState<number>(0); // 0 to 1 intensity
  const [cameraShake, setCameraShake] = useState<{active: boolean, intensity: number, duration: number, timeLeft: number}>({
    active: false, 
    intensity: 0,
    duration: 0,
    timeLeft: 0
  });
  const [glitchParticles, setGlitchParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
  }>>([]);
  
  // Initialize and play background engine sound
  useEffect(() => {
    // Start playing ship engines sound when component mounts
    if (shipEnginesSoundRef.current) {
      shipEnginesSoundRef.current.volume = 0.3; // Set lower volume for background sound
      shipEnginesSoundRef.current.play().catch(e => {
        console.log("Audio playback failed:", e);
        // This is often due to browser autoplay policy requiring user interaction
      });
    }
    
    // Clean up when component unmounts
    return () => {
      if (shipEnginesSoundRef.current) {
        shipEnginesSoundRef.current.pause();
        shipEnginesSoundRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // Create reference for game over sound
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  // Add key binding for debugging - press 'H' to trigger hit animation
  useEffect(() => {
    const debugKeyHandler = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        console.log("DEBUG: Manual hit animation triggered by H key");
        
        // Direct approach with simple explosion overlay
        const ship = engine.getShip();
        setShipHitActive(true);
        setHitPosition({ x: ship.x, y: ship.y });
        
        // Play ship hit sound
        if (shipHitSoundRef.current) {
          shipHitSoundRef.current.currentTime = 0;
          shipHitSoundRef.current.play().catch(e => console.log("Audio playback failed:", e));
        }
        
        // Show the explosion overlay
        setShowExplosionOverlay(true);
        
        // Hide the overlay after 500ms
        setTimeout(() => {
          setShowExplosionOverlay(false);
        }, 500);
        
        // Add screen flash effect - stronger
        setScreenFlash(1.0);
        setTimeout(() => setScreenFlash(0), 300);
        
        // Add camera shake
        setCameraShake({
          active: true,
          intensity: 15,
          duration: 0.4,
          timeLeft: 0.4
        });
      }
    };
    
    window.addEventListener('keydown', debugKeyHandler);
    return () => window.removeEventListener('keydown', debugKeyHandler);
  }, [engine]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Initialize engine
    engine.initialize();
    
    // Set up game loop
    let lastTime = 0;
    let animationFrameId: number;
    
    const render = (time: number) => {
      // Calculate delta time in seconds
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      
      // Process all active key presses
      processInput();
      
      // Check for enemy fire events
      const enemyFiredEvent = engine.checkForEnemyFireEvent && engine.checkForEnemyFireEvent();
      if (enemyFiredEvent) {
        // Play enemy laser sound
        if (enemyLaserSoundRef.current) {
          // Set volume slightly lower than player laser
          enemyLaserSoundRef.current.volume = 0.4;
          enemyLaserSoundRef.current.currentTime = 0;
          enemyLaserSoundRef.current.play().catch(e => console.log("Enemy laser audio playback failed:", e));
        }
      }
      
      // Check for ship hit events from previous frame
      const shipHitEvent = engine.checkForShipHitEvent && engine.checkForShipHitEvent();
      if (shipHitEvent && !shipHitActive) {
        console.log("Ship hit detected! Creating animation at:", engine.getShip().x, engine.getShip().y);
        setShipHitActive(true);
        setHitPosition({ x: engine.getShip().x, y: engine.getShip().y });
        createHitAnimation(engine.getShip().x, engine.getShip().y);
        
        // Play ship hit sound
        if (shipHitSoundRef.current) {
          shipHitSoundRef.current.currentTime = 0;
          shipHitSoundRef.current.play().catch(e => console.log("Audio playback failed:", e));
        }
        
        // Create screen flash effect
        setScreenFlash(1.0);
        setTimeout(() => setScreenFlash(0), 200); // Flash duration
        
        // Add camera shake effect
        setCameraShake({
          active: true,
          intensity: 15, // Max pixels to shake
          duration: 0.4, // Seconds
          timeLeft: 0.4 // Initial value equals duration
        });
      }
      
      // Update game state
      engine.update(deltaTime);
      
      // Update UI state
      setScore(engine.getScore());
      setLives(engine.getLives());
      
      // Check for game over state
      if (engine.isGameOver() && !isGameOver) {
        setIsGameOver(true);
        setGlitchExplosionActive(true);
        // Get ship position for explosion origin
        const ship = engine.getShip();
        createGlitchExplosion(ship.x, ship.y);
        
        // Play game over sound
        if (gameOverSoundRef.current) {
          // Stop engine sound first
          if (shipEnginesSoundRef.current) {
            shipEnginesSoundRef.current.pause();
          }
          
          // Play game over sound
          gameOverSoundRef.current.volume = 0.7;
          gameOverSoundRef.current.play().catch(e => console.log("Audio playback failed:", e));
        }
      }
      
      // Update animations if active
      if (glitchExplosionActive) {
        updateGlitchExplosion(deltaTime);
      }
      
      if (shipHitActive) {
        updateHitAnimation(deltaTime);
      }
      
      // Update camera shake
      if (cameraShake.active) {
        setCameraShake(prevShake => {
          const newTimeLeft = prevShake.timeLeft - deltaTime;
          return {
            ...prevShake,
            timeLeft: newTimeLeft,
            active: newTimeLeft > 0
          };
        });
      }
      
      // Render game
      renderGame(ctx);
      
      // Continue game loop
      animationFrameId = requestAnimationFrame(render);
      
      // If glitch explosion is done and we're in game over, close the window
      if (isGameOver && glitchParticles.length === 0 && glitchExplosionActive === false && onClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    };
    
    // Creates a glitch explosion effect for game over
    const createGlitchExplosion = (x: number, y: number) => {
      const numParticles = 100;
      const newParticles = [];
      
      // Colors for the cyberpunk glitch explosion
      const glitchColors = [
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#33FF33', // Green
        '#FF3333', // Red
        '#FFFFFF', // White
        '#0000FF', // Blue
      ];
      
      // Create particles for the explosion
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 300;
        const size = 5 + Math.random() * 15;
        const maxLife = 3 + Math.random() * 2;
        
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: glitchColors[Math.floor(Math.random() * glitchColors.length)],
          life: maxLife,
          maxLife
        });
      }
      
      setGlitchParticles(newParticles);
    };
    
    // Creates a hit animation effect when ship is hit
    const createHitAnimation = (x: number, y: number) => {
      console.log(`DEBUG: Creating hit animation at x:${x}, y:${y}`);
      const numParticles = 80; // More particles for enhanced cyberpunk effect
      const newParticles = [];
      
      // Expanded cyberpunk color palette with more variation
      const hitColors = [
        '#FF0000', // Bright Red
        '#FF5500', // Orange
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#FFFFFF', // White
        '#00FFFF', // Cyan
        '#33FF33', // Green
        '#0033FF', // Blue
        '#FF33FF', // Pink
        '#FFCC00', // Gold
      ];
      
      // Particle burst with multiple layers for more visual complexity
      
      // Layer 1: Core explosion particles - standard radial burst
      for (let i = 0; i < numParticles * 0.5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 350; // Faster for more dramatic effect
        const size = 4 + Math.random() * 12; // Various sized particles
        const maxLife = 0.7 + Math.random() * 1.3; // Longer life for better visibility
        
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: hitColors[Math.floor(Math.random() * hitColors.length)],
          life: maxLife,
          maxLife
        });
      }
      
      // Layer 2: Horizontal streak particles - simulate electrical circuit disruption
      for (let i = 0; i < numParticles * 0.2; i++) {
        // Horizontal streaks with some vertical variance
        const angle = Math.random() > 0.5 ? 0 : Math.PI;
        const verticalVariance = -0.3 + Math.random() * 0.6;
        const speed = 200 + Math.random() * 400; // Very fast horizontal movement
        const size = 2 + Math.random() * 8; // Smaller streaking particles
        const maxLife = 0.3 + Math.random() * 0.7; // Shorter life for streaks
        
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle + verticalVariance) * speed * 0.3, // Less vertical movement
          size,
          color: '#00FFFF', // Cyan for electrical effect
          life: maxLife,
          maxLife
        });
      }
      
      // Layer 3: Digital corruption particles - pixelated squares
      for (let i = 0; i < numParticles * 0.15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 200;
        const size = 8 + Math.random() * 14; // Larger square particles
        const maxLife = 0.5 + Math.random() * 1;
        
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: '#FF00FF', // Magenta for digital corruption
          life: maxLife,
          maxLife
        });
      }
      
      // Layer 4: Glowing core particles - stay near the impact point
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 80; // Slower, staying closer to center
        const size = 15 + Math.random() * 20; // Much larger glowing particles
        const maxLife = 0.8 + Math.random() * 1.2; // Longer life for core glow
        
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: i % 2 === 0 ? '#FFFFFF' : '#00FFFF', // Alternating white and cyan for glow
          life: maxLife,
          maxLife
        });
      }
      
      // Layer 5: Binary data particles - ones and zeros flying out
      for (let i = 0; i < numParticles * 0.15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 250;
        const size = 3 + Math.random() * 8;
        const maxLife = 0.6 + Math.random() * 0.8;
        
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          color: '#33FF33', // Matrix green for binary data
          life: maxLife,
          maxLife
        });
      }
      
      console.log(`Created ${newParticles.length} hit particles`);
      setHitParticles(newParticles);
      
      // Show the new explosion overlay with cyberpunk effects
      setShowExplosionOverlay(true);
      setHitPosition({ x, y });
      
      // Hide the explosion overlay after animation completes
      setTimeout(() => {
        setShowExplosionOverlay(false);
      }, 500); // Match the animation duration (0.5s)
    };
    
    // Update glitch explosion particles
    const updateGlitchExplosion = (deltaTime: number) => {
      if (glitchParticles.length === 0) return;
      
      const updatedParticles = glitchParticles.map(particle => {
        return {
          ...particle,
          x: particle.x + particle.vx * deltaTime,
          y: particle.y + particle.vy * deltaTime,
          life: particle.life - deltaTime,
          size: particle.size * (particle.life / particle.maxLife)
        };
      }).filter(particle => particle.life > 0);
      
      setGlitchParticles(updatedParticles);
      
      if (updatedParticles.length === 0 && glitchExplosionActive) {
        setGlitchExplosionActive(false);
      }
    };
    
    // Update hit animation particles
    const updateHitAnimation = (deltaTime: number) => {
      if (hitParticles.length === 0) return;
      
      // Update existing particles physics
      const updatedParticles = hitParticles.map(particle => {
        return {
          ...particle,
          x: particle.x + particle.vx * deltaTime,
          y: particle.y + particle.vy * deltaTime,
          life: particle.life - deltaTime,
          // Non-linear size reduction for more dynamic effect
          size: particle.size * Math.pow(particle.life / particle.maxLife, 0.7)
        };
      }).filter(particle => particle.life > 0);
      
      setHitParticles(updatedParticles);
      
      // Hide overlay after animation time (slightly longer than the CSS animations)
      if (showExplosionOverlay) {
        setTimeout(() => {
          setShowExplosionOverlay(false);
        }, 1200); // Match this to the longest animation duration
      }
      
      // Reset ship hit state when animations are complete
      if (updatedParticles.length === 0 && shipHitActive) {
        setShipHitActive(false);
      }
    };
    
    const renderGame = (ctx: CanvasRenderingContext2D) => {
      // Apply camera shake if active
      ctx.save();
      if (cameraShake.active) {
        const shakeIntensity = cameraShake.intensity * (cameraShake.timeLeft / cameraShake.duration);
        const shakeX = (Math.random() * 2 - 1) * shakeIntensity;
        const shakeY = (Math.random() * 2 - 1) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
      }
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply screen flash effect when hit - more intense
      if (screenFlash > 0) {
        console.log("Rendering screen flash effect:", screenFlash);
        
        // Create a gradient for a more dynamic flash effect
        const gradient = ctx.createRadialGradient(
          hitPosition.x, hitPosition.y, 0,
          hitPosition.x, hitPosition.y, canvas.width
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${screenFlash * 0.8})`);
        gradient.addColorStop(0.3, `rgba(255, 0, 0, ${screenFlash * 0.6})`);
        gradient.addColorStop(0.6, `rgba(255, 0, 255, ${screenFlash * 0.4})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Also add a white flash border for extra effect
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw stars
      const stars = engine.getStars();
      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.brightness * 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw hit animation particles
      if (hitParticles.length > 0) {
        console.log(`DEBUG: Rendering ${hitParticles.length} hit particles`);
        
        // Draw a big explosion circle as fallback (guaranteed to be visible)
        ctx.globalAlpha = 0.7;
        const gradient = ctx.createRadialGradient(
          hitPosition.x, hitPosition.y, 0,
          hitPosition.x, hitPosition.y, 50
        );
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.3, 'red');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hitPosition.x, hitPosition.y, 50, 0, Math.PI * 2);
        ctx.fill();
      }
      
      hitParticles.forEach(particle => {
        const opacity = particle.life / particle.maxLife;
        ctx.globalAlpha = opacity;
        
        // Calculate particle properties with more variation
        const particleSize = particle.size * (opacity * 0.8 + 0.2) * 1.5; // 50% larger
        const time = Date.now() * 0.001; // For animation effects
        
        // Different particle styles based on color - gives varied cyberpunk aesthetic
        if (particle.color === '#33FF33') { // Binary data particles (green)
          // Draw as 1s and 0s
          ctx.fillStyle = particle.color;
          ctx.font = `${particleSize * 2}px 'VT323', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', particle.x, particle.y);
          
          // Add glow effect
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = particleSize * 2;
          ctx.fillText(Math.random() > 0.5 ? '1' : '0', particle.x, particle.y);
          ctx.shadowBlur = 0;
          
        } else if (particle.color === '#FF00FF') { // Digital corruption (magenta)
          // Draw as glitchy squares
          ctx.fillStyle = particle.color;
          ctx.fillRect(
            particle.x - particleSize/2, 
            particle.y - particleSize/2, 
            particleSize, 
            particleSize
          );
          
          // Add scan line effect within the square
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          for (let i = 0; i < particleSize; i += 3) {
            ctx.fillRect(
              particle.x - particleSize/2, 
              particle.y - particleSize/2 + i, 
              particleSize, 
              1
            );
          }
          
          // Glow effect
          ctx.shadowColor = '#FF00FF';
          ctx.shadowBlur = particleSize * 2;
          ctx.fillRect(
            particle.x - particleSize/2, 
            particle.y - particleSize/2, 
            particleSize, 
            particleSize
          );
          ctx.shadowBlur = 0;
          
        } else if (particle.color === '#00FFFF') { // Electric particles (cyan)
          // Draw as lightning-like streak
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particleSize / 2;
          ctx.beginPath();
          
          // Create zigzag lightning pattern
          const segmentLength = particleSize / 2;
          const segments = 4;
          ctx.moveTo(particle.x, particle.y);
          
          for (let i = 0; i < segments; i++) {
            const angle = (particle.vx > 0 ? 0 : Math.PI) + (Math.random() * 0.5 - 0.25);
            const length = segmentLength * (0.7 + Math.random() * 0.6);
            const endX = particle.x + Math.cos(angle) * length * (i + 1);
            const endY = particle.y + Math.sin(angle) * length * (i + 1);
            ctx.lineTo(endX, endY);
          }
          
          ctx.stroke();
          
          // Add glow effect
          ctx.shadowColor = '#00FFFF';
          ctx.shadowBlur = particleSize * 3;
          ctx.stroke();
          ctx.shadowBlur = 0;
          
        } else if (particle.color === '#FFFFFF') { // Core explosion (white)
          // Draw as pulsing circle with strong glow
          const pulseSize = particleSize * (1 + 0.2 * Math.sin(time * 10));
          
          // Strong glow effect
          const glowRadius = pulseSize * 4;
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowRadius
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(0.3, 'rgba(200, 200, 255, 0.7)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, pulseSize / 2, 0, Math.PI * 2);
          ctx.fill();
          
        } else { // Standard particles (other colors)
          // Draw with directional motion blur effect
          const blurLength = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy) * 0.05;
          const angle = Math.atan2(particle.vy, particle.vx);
          
          // Create motion blur gradient
          const gradient = ctx.createLinearGradient(
            particle.x - Math.cos(angle) * blurLength, 
            particle.y - Math.sin(angle) * blurLength,
            particle.x + Math.cos(angle) * blurLength, 
            particle.y + Math.sin(angle) * blurLength
          );
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(0.3, particle.color + '80'); // semi-transparent
          gradient.addColorStop(1, particle.color);
          
          // Draw motion-blurred particle
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.ellipse(
            particle.x, 
            particle.y, 
            particleSize + blurLength, 
            particleSize,
            angle, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
          
          // Draw particle core
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particleSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Reset global alpha
      ctx.globalAlpha = 1.0;
      
      // Draw ship trail for a motion blur effect
      const shipTrail = engine.getShipTrail();
      shipTrail.forEach(trail => {
        const trailColor = engine.hasShield() ? 
          `rgba(0, 170, 255, ${trail.alpha * 0.4})` : 
          `rgba(255, 0, 255, ${trail.alpha * 0.4})`;
        
        ctx.fillStyle = trailColor;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw ship - Cyberpunk enhanced version
      const ship = engine.getShip();
      
      // Create outer glow
      const glowIntensity = 0.5 + Math.sin(Date.now() / 300) * 0.2; // Pulsating glow - used for visual effects
      const gradient = ctx.createRadialGradient(
        ship.x, ship.y, 5,
        ship.x, ship.y, 30
      );
      gradient.addColorStop(0, engine.hasShield() ? 
        `rgba(0, 170, 255, ${0.7 + glowIntensity * 0.3})` : 
        `rgba(255, 0, 255, ${0.7 + glowIntensity * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw the cyberpunk ship body with aggressive styling
      ctx.save();
      
      // Ship animation - slight hover effect
      const hoverOffset = Math.sin(Date.now() / 200) * 2;
      
      // Enhanced aggressive ship body
      const primaryColor = engine.hasShield() ? '#00CCFF' : '#FF00FF';
      const secondaryColor = engine.hasShield() ? '#0088AA' : '#CC00CC';
      
      // Draw main body with shadow effect for depth
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      // Larger, more aggressive shape with sharper angles
      ctx.moveTo(ship.x, ship.y - 25 + hoverOffset); // Extended nose
      ctx.lineTo(ship.x - 22, ship.y + 5 + hoverOffset); // Extended left wing
      ctx.lineTo(ship.x - 18, ship.y + 10 + hoverOffset); // Left wing detail
      ctx.lineTo(ship.x - 10, ship.y + hoverOffset); // Left body indent
      ctx.lineTo(ship.x - 12, ship.y + 18 + hoverOffset); // Left engine
      ctx.lineTo(ship.x, ship.y + 10 + hoverOffset); // Center indent
      ctx.lineTo(ship.x + 12, ship.y + 18 + hoverOffset); // Right engine
      ctx.lineTo(ship.x + 10, ship.y + hoverOffset); // Right body indent
      ctx.lineTo(ship.x + 18, ship.y + 10 + hoverOffset); // Right wing detail
      ctx.lineTo(ship.x + 22, ship.y + 5 + hoverOffset); // Extended right wing
      ctx.closePath();
      ctx.fill();
      
      // Foreground layer for depth
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(ship.x, ship.y - 22 + hoverOffset); // Nose
      ctx.lineTo(ship.x - 20, ship.y + 5 + hoverOffset); // Left wing
      ctx.lineTo(ship.x - 8, ship.y - 2 + hoverOffset); // Left body indent
      ctx.lineTo(ship.x - 10, ship.y + 16 + hoverOffset); // Left engine
      ctx.lineTo(ship.x, ship.y + 8 + hoverOffset); // Center indent
      ctx.lineTo(ship.x + 10, ship.y + 16 + hoverOffset); // Right engine
      ctx.lineTo(ship.x + 8, ship.y - 2 + hoverOffset); // Right body indent
      ctx.lineTo(ship.x + 20, ship.y + 5 + hoverOffset); // Right wing
      ctx.closePath();
      ctx.fill();
      
      // Aggressive wing details/fins
      ctx.fillStyle = engine.hasShield() ? '#80FFFF' : '#FF80FF';
      // Left fin
      ctx.beginPath();
      ctx.moveTo(ship.x - 15, ship.y + 5 + hoverOffset);
      ctx.lineTo(ship.x - 28, ship.y + 10 + hoverOffset);
      ctx.lineTo(ship.x - 20, ship.y + 5 + hoverOffset);
      ctx.fill();
      // Right fin
      ctx.beginPath();
      ctx.moveTo(ship.x + 15, ship.y + 5 + hoverOffset);
      ctx.lineTo(ship.x + 28, ship.y + 10 + hoverOffset);
      ctx.lineTo(ship.x + 20, ship.y + 5 + hoverOffset);
      ctx.fill();
      
      // Advanced cockpit with glowing effect
      const cockpitGlow = 0.7 + Math.sin(Date.now() / 350) * 0.3;
      const cockpitColor = engine.hasShield() ? 
        `rgba(160, 255, 255, ${cockpitGlow})` : 
        `rgba(255, 160, 255, ${cockpitGlow})`;
      
      // Main cockpit
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.ellipse(ship.x, ship.y - 8 + hoverOffset, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Cockpit glow
      ctx.fillStyle = cockpitColor;
      ctx.beginPath();
      ctx.ellipse(ship.x, ship.y - 8 + hoverOffset, 3, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Enhanced engine effects - more dramatic
      const engineBaseColor = engine.hasRapidFire() ? '#FFFF00' : '#FF3300';
      const engineGlowColor = engine.hasRapidFire() ? 'rgba(255, 255, 0, 0.7)' : 'rgba(255, 51, 0, 0.7)';
      const enginePulse = Date.now() / 50; // Faster pulse for more aggressive feel
      const engineGlowSize = 4 + Math.sin(enginePulse) * 2;
      
      // Engine base
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.rect(ship.x - 12, ship.y + 16 + hoverOffset, 24, 5);
      ctx.fill();
      
      // Engine flames - animated with randomness for aggressive feel
      for (let i = 0; i < 8; i++) {
        const flameX = ship.x + Math.random() * 16 - 8;
        const flameLength = 5 + Math.random() * 10 + (engine.hasRapidFire() ? 8 : 0);
        const flameWidth = 1 + Math.random() * 2;
        
        ctx.fillStyle = engineBaseColor;
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        ctx.beginPath();
        ctx.rect(flameX, ship.y + 21 + hoverOffset, flameWidth, flameLength);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      
      // Left thruster glow
      ctx.fillStyle = engineGlowColor;
      ctx.beginPath();
      ctx.arc(ship.x - 8, ship.y + 20 + hoverOffset, engineGlowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Right thruster glow
      ctx.beginPath();
      ctx.arc(ship.x + 8, ship.y + 20 + hoverOffset, engineGlowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Add cyberpunk details/accent lines with glow effect
      ctx.strokeStyle = engine.hasShield() ? '#80FFFF' : '#FF80FF';
      ctx.lineWidth = 1.5;
      
      // Wing detail lines
      ctx.beginPath();
      ctx.moveTo(ship.x - 15, ship.y + 5 + hoverOffset);
      ctx.lineTo(ship.x - 5, ship.y - 8 + hoverOffset);
      ctx.lineTo(ship.x + 5, ship.y - 8 + hoverOffset);
      ctx.lineTo(ship.x + 15, ship.y + 5 + hoverOffset);
      ctx.stroke();
      
      // Additional tech details
      ctx.beginPath();
      ctx.moveTo(ship.x - 10, ship.y + 3 + hoverOffset);
      ctx.lineTo(ship.x - 12, ship.y + 10 + hoverOffset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(ship.x + 10, ship.y + 3 + hoverOffset);
      ctx.lineTo(ship.x + 12, ship.y + 10 + hoverOffset);
      ctx.stroke();
      
      ctx.restore();
      
      // Draw engine particles
      const engineParticles = engine.getEngineParticles();
      engineParticles.forEach(particle => {
        const opacity = particle.life / particle.maxLife;
        ctx.globalAlpha = opacity;
        
        // Draw particle with glow effect
        const particleSize = 2 + (opacity * 3);
        
        // Particle base
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Particle glow
        const glowRadius = particleSize * 2;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Reset global alpha
      ctx.globalAlpha = 1.0;
      
      // Draw shield if active - Enhanced cyberpunk shield with dramatic effects
      if (engine.hasShield()) {
        // Create dramatic pulsating shield effect
        const shieldTime = Date.now();
        const shieldPulse = 0.6 + Math.sin(shieldTime / 500) * 0.4;
        const shieldSize = 35 + Math.sin(shieldTime / 300) * 3;
        
        // Hex shield with rotating elements
        const shieldSegments = 6;
        const rotationSpeed = shieldTime / 2000;
        
        // Draw shield outline with dynamic rotation
        ctx.strokeStyle = `rgba(0, 200, 255, ${shieldPulse * 0.8})`;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < shieldSegments; i++) {
          const angle = (Math.PI * 2 / shieldSegments) * i + rotationSpeed;
          const nextAngle = (Math.PI * 2 / shieldSegments) * (i + 1) + rotationSpeed;
          
          const innerSize = shieldSize - 5 + Math.sin(shieldTime / 200 + i) * 3;
          
          ctx.beginPath();
          ctx.moveTo(
            ship.x + Math.cos(angle) * innerSize,
            ship.y + Math.sin(angle) * innerSize
          );
          ctx.lineTo(
            ship.x + Math.cos(nextAngle) * innerSize,
            ship.y + Math.sin(nextAngle) * innerSize
          );
          ctx.stroke();
        }
        
        // Inner shield glow
        const shieldGradient = ctx.createRadialGradient(
          ship.x, ship.y, 10,
          ship.x, ship.y, shieldSize + 10
        );
        shieldGradient.addColorStop(0, `rgba(0, 170, 255, 0)`);
        shieldGradient.addColorStop(0.5, `rgba(0, 170, 255, ${shieldPulse * 0.2})`);
        shieldGradient.addColorStop(0.8, `rgba(0, 200, 255, ${shieldPulse * 0.1})`);
        
        ctx.fillStyle = shieldGradient;
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, shieldSize + 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield energy nodes at vertices
        for (let i = 0; i < shieldSegments; i++) {
          const angle = (Math.PI * 2 / shieldSegments) * i + rotationSpeed;
          
          ctx.fillStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(shieldTime / 200 + i * 2) * 0.5})`;
          ctx.beginPath();
          ctx.arc(
            ship.x + Math.cos(angle) * (shieldSize - 5),
            ship.y + Math.sin(angle) * (shieldSize - 5),
            3 + Math.sin(shieldTime / 300 + i) * 1.5,
            0, Math.PI * 2
          );
          ctx.fill();
        }
        shieldGradient.addColorStop(1, `rgba(0, 170, 255, 0)`);
        
        ctx.fillStyle = shieldGradient;
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, shieldSize + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield border effect
        ctx.strokeStyle = `rgba(0, 220, 255, ${shieldPulse * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, shieldSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Hexagonal pattern for cyberpunk shield
        ctx.strokeStyle = `rgba(0, 255, 255, ${shieldPulse * 0.4})`;
        ctx.lineWidth = 1;
        
        const segments = 6;
        const angleStep = (Math.PI * 2) / segments;
        const rotationOffset = Date.now() / 2000; // Slow rotation
        
        for (let i = 0; i < segments; i++) {
          const angle = i * angleStep + rotationOffset;
          const nextAngle = angle + angleStep;
          
          const x1 = ship.x + Math.cos(angle) * shieldSize;
          const y1 = ship.y + Math.sin(angle) * shieldSize;
          const x2 = ship.x + Math.cos(nextAngle) * shieldSize;
          const y2 = ship.y + Math.sin(nextAngle) * shieldSize;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(ship.x, ship.y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      
      // Draw enemies - Enhanced cyberpunk enemies
      const enemies = engine.getEnemies();
      
      enemies.forEach(enemy => {
        ctx.save();
        
        // Enemy base colors based on movement pattern
        let baseColor, accentColor, engineColor;
        
        switch(enemy.movementPattern) {
          case 'zigzag':
            baseColor = '#FF3300';
            accentColor = '#FFCC00';
            engineColor = '#FF6600';
            break;
          case 'sine':
            baseColor = '#CC00FF';
            accentColor = '#FF00FF';
            engineColor = '#8800FF';
            break;
          case 'swooping':
            baseColor = '#FF0000';
            accentColor = '#FFAA00';
            engineColor = '#FF0055';
            break;
          default: // straight
            baseColor = enemy.type === 'large' ? '#FF0033' : '#FF3377';
            accentColor = '#FFCC00';
            engineColor = '#FF6600';
        }
        
        // Convert hex to decimal RGB values
        const r = parseInt(baseColor.substr(1, 2), 16);
        const g = parseInt(baseColor.substr(3, 2), 16);
        const b = parseInt(baseColor.substr(5, 2), 16);
        const glowColor = `rgba(${r}, ${g}, ${b}, ${0.5 + Math.sin(Date.now() / 400) * 0.2})`;
        
        // Create enemy glow effect
        const enemySize = enemy.type === 'large' ? 15 : 8;
        const glowSize = enemy.type === 'large' ? 25 : 15;
        
        // Apply rotation based on movement direction
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotationAngle + Math.PI/2); // Add 90 degrees so enemy faces movement direction
        
        // Draw engine glow behind the enemy (relative to movement direction)
        const engineGlow = ctx.createRadialGradient(
          0, enemySize * 0.8, 0,
          0, enemySize * 0.8, enemySize * 1.2
        );
        engineGlow.addColorStop(0, engineColor);
        engineGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = engineGlow;
        ctx.beginPath();
        ctx.arc(0, enemySize * 0.8, enemySize * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw enemy ship body
        if (enemy.type === 'large') {
          // Large enemy - ship shape
          ctx.fillStyle = baseColor;
          
          // Main body - triangular ship
          ctx.beginPath();
          ctx.moveTo(0, -enemySize * 1.5); // Front tip
          ctx.lineTo(enemySize, enemySize * 0.8); // Bottom right
          ctx.lineTo(-enemySize, enemySize * 0.8); // Bottom left
          ctx.closePath();
          ctx.fill();
          
          // Wing details
          ctx.fillStyle = accentColor;
          
          // Left wing
          ctx.beginPath();
          ctx.moveTo(-enemySize * 0.3, -enemySize * 0.5);
          ctx.lineTo(-enemySize * 1.3, enemySize * 0.5);
          ctx.lineTo(-enemySize * 0.7, enemySize * 0.5);
          ctx.closePath();
          ctx.fill();
          
          // Right wing
          ctx.beginPath();
          ctx.moveTo(enemySize * 0.3, -enemySize * 0.5);
          ctx.lineTo(enemySize * 1.3, enemySize * 0.5);
          ctx.lineTo(enemySize * 0.7, enemySize * 0.5);
          ctx.closePath();
          ctx.fill();
          
          // Cockpit/bridge
          ctx.fillStyle = '#00FFFF';
          ctx.beginPath();
          ctx.arc(0, -enemySize * 0.5, enemySize * 0.4, 0, Math.PI * 2);
          ctx.fill();
          
          // Energy core pulsing
          const pulseIntensity = 0.7 + Math.sin(Date.now() / 300) * 0.3;
          ctx.fillStyle = `rgba(255, 204, 0, ${pulseIntensity})`;
          ctx.beginPath();
          ctx.arc(0, 0, enemySize * 0.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Detail lines
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1;
          
          // Tech details
          ctx.beginPath();
          ctx.moveTo(-enemySize * 0.8, enemySize * 0.3);
          ctx.lineTo(enemySize * 0.8, enemySize * 0.3);
          ctx.stroke();
          
          // Engine exhausts
          for (let i = -2; i <= 2; i += 2) {
            const exhaustX = enemySize * 0.3 * i;
            const exhaustLength = (0.8 + Math.sin(Date.now() / 200 + i) * 0.2) * enemySize * 0.8;
            
            ctx.fillStyle = engineColor;
            ctx.beginPath();
            ctx.rect(exhaustX - enemySize * 0.2, enemySize * 0.8, enemySize * 0.4, exhaustLength);
            ctx.fill();
          }
        } else {
          // Small enemy - ship shape
          ctx.fillStyle = baseColor;
          
          // Small fighter body
          ctx.beginPath();
          ctx.moveTo(0, -enemySize); // Front tip
          ctx.lineTo(enemySize * 0.7, enemySize * 0.3); // Bottom right
          ctx.lineTo(-enemySize * 0.7, enemySize * 0.3); // Bottom left
          ctx.closePath();
          ctx.fill();
          
          // Wing details
          ctx.fillStyle = accentColor;
          
          // Wings
          ctx.beginPath();
          ctx.moveTo(-enemySize * 0.2, -enemySize * 0.3);
          ctx.lineTo(-enemySize * 1, 0);
          ctx.lineTo(-enemySize * 0.2, enemySize * 0.3);
          ctx.closePath();
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(enemySize * 0.2, -enemySize * 0.3);
          ctx.lineTo(enemySize * 1, 0);
          ctx.lineTo(enemySize * 0.2, enemySize * 0.3);
          ctx.closePath();
          ctx.fill();
          
          // Cockpit
          ctx.fillStyle = '#80FFFF';
          ctx.beginPath();
          ctx.arc(0, -enemySize * 0.3, enemySize * 0.3, 0, Math.PI * 2);
          ctx.fill();
          
          // Engine glow
          const pulseIntensity = 0.7 + Math.sin(Date.now() / 200) * 0.3;
          
          ctx.fillStyle = `rgba(255, 100, 0, ${pulseIntensity})`;
          ctx.beginPath();
          ctx.rect(-enemySize * 0.3, enemySize * 0.3, enemySize * 0.6, enemySize * 0.5);
          ctx.fill();
        }
        
        ctx.restore();
        
        // Draw ship aura (in world space, not rotated)
        const auraGradient = ctx.createRadialGradient(
          enemy.x, enemy.y, enemySize * 0.5,
          enemy.x, enemy.y, glowSize
        );
        auraGradient.addColorStop(0, glowColor);
        auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw projectiles - Enhanced cyberpunk projectiles with different types
      const projectiles = engine.getProjectiles();
      
      projectiles.forEach(proj => {
        // Set defaults if not specified
        const size = proj.size || 5;
        const color = proj.color || '#33FF33';
        const isEnemy = proj.isEnemy || false;
        const type = proj.type || 'standard';
        
        ctx.save();
        
        // Render different projectile types
        switch(type) {
          case 'standard':
            // Standard projectiles with basic glow
            // Create projectile glow effect
            const standardGradient = ctx.createRadialGradient(
              proj.x, proj.y, 1,
              proj.x, proj.y, size * 1.6
            );
            standardGradient.addColorStop(0, color);
            standardGradient.addColorStop(0.6, `rgba(${hexToRgb(color)}, 0.4)`);
            standardGradient.addColorStop(1, `rgba(${hexToRgb(color)}, 0)`);
            
            // Draw glow
            ctx.fillStyle = standardGradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size * 1.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw projectile core
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // Add projectile trail in the appropriate direction
            const trailLength = isEnemy ? -15 : 15; // Negative for enemy (down), positive for player (up)
            const trailGradient = ctx.createLinearGradient(
              proj.x, proj.y,
              proj.x, proj.y - trailLength
            );
            trailGradient.addColorStop(0, `rgba(${hexToRgb(color)}, 0.5)`);
            trailGradient.addColorStop(1, `rgba(${hexToRgb(color)}, 0)`);
            
            ctx.fillStyle = trailGradient;
            ctx.beginPath();
            ctx.moveTo(proj.x - size * 0.2, proj.y);
            ctx.lineTo(proj.x + size * 0.2, proj.y);
            ctx.lineTo(proj.x + size * 0.2, proj.y - trailLength);
            ctx.lineTo(proj.x - size * 0.2, proj.y - trailLength);
            ctx.closePath();
            ctx.fill();
            break;
            
          case 'plasma':
            // Plasma projectiles with pulsating effect
            const pulseIntensity = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
            const plasmaSize = size * pulseIntensity;
            
            // Outer glow
            const plasmaGradient = ctx.createRadialGradient(
              proj.x, proj.y, plasmaSize * 0.3,
              proj.x, proj.y, plasmaSize * 2
            );
            plasmaGradient.addColorStop(0, color);
            plasmaGradient.addColorStop(0.4, `rgba(${hexToRgb(color)}, 0.6)`);
            plasmaGradient.addColorStop(0.8, `rgba(${hexToRgb(color)}, 0.2)`);
            plasmaGradient.addColorStop(1, `rgba(${hexToRgb(color)}, 0)`);
            
            ctx.fillStyle = plasmaGradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, plasmaSize * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner core with rotating effect
            const time = Date.now() * 0.003;
            ctx.fillStyle = '#FFFFFF';
            
            // Draw plasma core with rotating geometry
            for (let i = 0; i < 3; i++) {
              const angle = time + (Math.PI * 2 / 3) * i;
              ctx.beginPath();
              ctx.arc(
                proj.x + Math.cos(angle) * plasmaSize * 0.3,
                proj.y + Math.sin(angle) * plasmaSize * 0.3,
                plasmaSize * 0.25,
                0, Math.PI * 2
              );
              ctx.fill();
            }
            break;
            
          case 'homing':
            // Homing missile with targeting effect
            // Draw missile body
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw targeting reticle
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            
            // Outer circle
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner crosshair
            ctx.beginPath();
            ctx.moveTo(proj.x - size, proj.y);
            ctx.lineTo(proj.x + size, proj.y);
            ctx.moveTo(proj.x, proj.y - size);
            ctx.lineTo(proj.x, proj.y + size);
            ctx.stroke();
            
            // Rotating scanner effect
            const scanAngle = Date.now() * 0.005;
            ctx.beginPath();
            ctx.moveTo(proj.x, proj.y);
            ctx.lineTo(
              proj.x + Math.cos(scanAngle) * size * 2.5,
              proj.y + Math.sin(scanAngle) * size * 2.5
            );
            ctx.stroke();
            
            // Propulsion effect
            const trailAngle = Math.atan2(this.ship.y - proj.y, this.ship.x - proj.x) + Math.PI;
            ctx.fillStyle = '#FFAA33';
            ctx.beginPath();
            ctx.moveTo(proj.x, proj.y);
            ctx.lineTo(
              proj.x + Math.cos(trailAngle - 0.3) * size,
              proj.y + Math.sin(trailAngle - 0.3) * size
            );
            ctx.lineTo(
              proj.x + Math.cos(trailAngle + 0.3) * size,
              proj.y + Math.sin(trailAngle + 0.3) * size
            );
            ctx.closePath();
            ctx.fill();
            break;
            
          case 'glitch':
            // Glitchy projectile that distorts and teleports
            // Draw main projectile with digital glitch effect
            ctx.fillStyle = color;
            
            // Multiple layers with random offsets
            for (let i = 0; i < 3; i++) {
              const offsetX = (Math.random() - 0.5) * size * 0.6;
              const offsetY = (Math.random() - 0.5) * size * 0.6;
              
              ctx.globalAlpha = 0.7 - i * 0.2;
              ctx.beginPath();
              ctx.rect(
                proj.x - size * 0.5 + offsetX,
                proj.y - size * 0.5 + offsetY,
                size, size
              );
              ctx.fill();
            }
            
            // Digital noise effect
            ctx.globalAlpha = 0.5;
            for (let i = 0; i < 5; i++) {
              const noiseX = proj.x + (Math.random() - 0.5) * size * 4;
              const noiseY = proj.y + (Math.random() - 0.5) * size * 4;
              const noiseSize = Math.random() * size * 0.8;
              
              ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : color;
              ctx.beginPath();
              ctx.rect(noiseX, noiseY, noiseSize, noiseSize);
              ctx.fill();
            }
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
            break;
            
          default:
            // Fallback for any unhandled types
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
      });
      
      // Helper function to convert hex to rgb for gradient stops
      function hexToRgb(hex: string): string {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert 3-digit hex to 6-digits
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
      }
      
      
      // Draw power-ups - Enhanced cyberpunk power-ups
      const powerUps = engine.getPowerUps();
      powerUps.forEach(powerUp => {
        ctx.save();
        
        // Define color schemes for each power-up type
        let innerColor, outerColor;
        const pulseIntensity = 0.5 + Math.sin(Date.now() / 300) * 0.5; // Pulsing effect
        const rotationSpeed = Date.now() / 1000; // Rotation for effects
        
        switch (powerUp.type) {
          case 'extra_life':
            innerColor = '#00FF44';
            outerColor = `rgba(0, 255, 68, ${0.3 + pulseIntensity * 0.3})`;
            break;
          case 'shield':
            innerColor = '#00AAFF';
            outerColor = `rgba(0, 170, 255, ${0.3 + pulseIntensity * 0.3})`;
            break;
          case 'rapid_fire':
            innerColor = '#FFFF00';
            outerColor = `rgba(255, 255, 0, ${0.3 + pulseIntensity * 0.3})`;
            break;
          case 'score_bonus':
            innerColor = '#FF00FF';
            outerColor = `rgba(255, 0, 255, ${0.3 + pulseIntensity * 0.3})`;
            break;
        }
        
        // Create outer glow
        const glowGradient = ctx.createRadialGradient(
          powerUp.x, powerUp.y, 5,
          powerUp.x, powerUp.y, 20
        );
        glowGradient.addColorStop(0, outerColor);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the geometric shape based on power-up type
        const size = 8;
        
        // Draw base shape
        ctx.fillStyle = innerColor;
        
        if (powerUp.type === 'shield') {
          // Draw octagon for shield
          const sides = 8;
          const angleStep = (Math.PI * 2) / sides;
          
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = i * angleStep + rotationSpeed;
            const x = powerUp.x + size * Math.cos(angle);
            const y = powerUp.y + size * Math.sin(angle);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        } else if (powerUp.type === 'rapid_fire') {
          // Draw diamond for rapid fire
          ctx.beginPath();
          ctx.moveTo(powerUp.x, powerUp.y - size);
          ctx.lineTo(powerUp.x + size, powerUp.y);
          ctx.lineTo(powerUp.x, powerUp.y + size);
          ctx.lineTo(powerUp.x - size, powerUp.y);
          ctx.closePath();
          ctx.fill();
        } else if (powerUp.type === 'extra_life') {
          // Draw heart-like shape for extra life
          ctx.beginPath();
          ctx.arc(powerUp.x - size/2, powerUp.y - size/2, size/2, 0, Math.PI * 2);
          ctx.arc(powerUp.x + size/2, powerUp.y - size/2, size/2, 0, Math.PI * 2);
          ctx.moveTo(powerUp.x, powerUp.y + size);
          ctx.lineTo(powerUp.x - size, powerUp.y);
          ctx.lineTo(powerUp.x + size, powerUp.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Score bonus - star shape
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = size;
          const innerRadius = size / 2;
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i + rotationSpeed;
            const x = powerUp.x + Math.cos(angle) * radius;
            const y = powerUp.y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
        }
        
        // Add rotating outer ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulseIntensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const ringSegments = 16;
        const dashLength = (Math.PI * 2 * 12) / ringSegments;
        const gapLength = dashLength / 2;
        
        ctx.setLineDash([dashLength, gapLength]);
        ctx.lineDashOffset = rotationSpeed * 10; // Makes it rotate
        ctx.arc(powerUp.x, powerUp.y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.restore();
      });
      
      // Draw glitch explosion if game is over
      if (isGameOver) {
        // Draw explosion particles
        glitchParticles.forEach(particle => {
          const alpha = particle.life / particle.maxLife;
          ctx.globalAlpha = alpha;
          
          // Draw glitchy rectangle particles
          ctx.fillStyle = particle.color;
          
          // Random chance of drawing different shapes for variety
          const shapeType = Math.random();
          
          if (shapeType < 0.4) {
            // Draw rectangle
            ctx.fillRect(
              particle.x - particle.size/2, 
              particle.y - particle.size/2,
              particle.size,
              particle.size
            );
          } else if (shapeType < 0.7) {
            // Draw circle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size/2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Draw triangle
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y - particle.size/2);
            ctx.lineTo(particle.x + particle.size/2, particle.y + particle.size/2);
            ctx.lineTo(particle.x - particle.size/2, particle.y + particle.size/2);
            ctx.closePath();
            ctx.fill();
          }
        });
        
        // Draw screen-wide glitch effects when explosion is active
        if (glitchExplosionActive) {
          // Random horizontal glitch lines
          const numGlitchLines = 8 + Math.floor(Math.random() * 8);
          for (let i = 0; i < numGlitchLines; i++) {
            const y = Math.random() * canvas.height;
            const height = 1 + Math.random() * 20;
            const glitchColor = Math.random() > 0.5 ? '#FF00FF' : '#00FFFF';
            const xOffset = Math.random() * 50;
            
            ctx.fillStyle = glitchColor;
            ctx.fillRect(xOffset, y, canvas.width - xOffset * 2, height);
          }
          
          // Random vertical glitch lines
          const numVertGlitches = 2 + Math.floor(Math.random() * 5);
          for (let i = 0; i < numVertGlitches; i++) {
            const x = Math.random() * canvas.width;
            const width = 1 + Math.random() * 10;
            const glitchColor = Math.random() > 0.5 ? '#33FF33' : '#FFFFFF';
            
            ctx.fillStyle = glitchColor;
            ctx.fillRect(x, 0, width, canvas.height);
          }
          
          // Random blocks of "corrupted data"
          const numBlocks = 3 + Math.floor(Math.random() * 5);
          for (let i = 0; i < numBlocks; i++) {
            const blockX = Math.random() * canvas.width;
            const blockY = Math.random() * canvas.height;
            const blockSize = 30 + Math.random() * 120;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${0.1 + Math.random() * 0.3})`;
            ctx.fillRect(blockX, blockY, blockSize, blockSize);
            
            // Add some "corrupted data" text-like elements
            ctx.fillStyle = '#FFFFFF';
            for (let j = 0; j < 10; j++) {
              const x = blockX + Math.random() * blockSize;
              const y = blockY + Math.random() * blockSize;
              const charSize = 8 + Math.random() * 10;
              ctx.font = `${charSize}px monospace`;
              ctx.fillText("@#$%01", x, y);
            }
          }
          
          // Screen tear effect
          if (Math.random() > 0.7) {
            const tearY = Math.random() * canvas.height;
            const tearHeight = 50 + Math.random() * 150;
            const tearOffset = -30 + Math.random() * 60;
            
            // Copy a portion of the canvas and draw it offset
            const imageData = ctx.getImageData(0, tearY, canvas.width, tearHeight);
            ctx.putImageData(imageData, tearOffset, tearY);
          }
        }
        
        // Reset global alpha
        ctx.globalAlpha = 1.0;
        
        // Draw "SYSTEM FAILURE" text that flashes
        if (Math.random() > 0.4) {
          ctx.font = "bold 40px 'VT323', monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = Math.random() > 0.5 ? '#FF00FF' : '#FF3333';
          ctx.fillText("SYSTEM FAILURE", canvas.width / 2, canvas.height / 2 - 20);
          ctx.font = "bold 20px 'VT323', monospace";
          ctx.fillText("MEMORY CORRUPTION DETECTED", canvas.width / 2, canvas.height / 2 + 30);
        }
      }
      
      // Make sure we restore the context at the end of rendering
      ctx.restore();
    };
    
    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.add(e.key);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.key);
    };
    
    // Process all currently pressed keys on each game update
    const processInput = () => {
      // Process movement and shooting simultaneously
      if (keysPressed.has('ArrowLeft')) engine.moveShip('left');
      if (keysPressed.has('ArrowRight')) engine.moveShip('right');
      if (keysPressed.has('ArrowUp')) engine.moveShip('up');
      if (keysPressed.has('ArrowDown')) engine.moveShip('down');
      
      // Handle firing with sound effect
      if (keysPressed.has(' ')) {
        engine.fireProjectile();
        
        // Play laser sound with rate limiting to avoid sound overlapping too much
        if (laserSoundRef.current) {
          // Reset sound to start and play it
          if (!laserSoundRef.current.paused && laserSoundRef.current.currentTime > 0) {
            // If already playing, only restart if it's been playing for a while
            if (laserSoundRef.current.currentTime > 0.15) {
              laserSoundRef.current.currentTime = 0;
              laserSoundRef.current.play().catch(e => console.log("Audio playback failed:", e));
            }
          } else {
            laserSoundRef.current.currentTime = 0;
            laserSoundRef.current.play().catch(e => console.log("Audio playback failed:", e));
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    animationFrameId = requestAnimationFrame(render);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      engine.pause();
      
      // Stop all audio
      if (laserSoundRef.current) {
        laserSoundRef.current.pause();
        laserSoundRef.current.currentTime = 0;
      }
      if (enemyLaserSoundRef.current) {
        enemyLaserSoundRef.current.pause();
        enemyLaserSoundRef.current.currentTime = 0;
      }
      if (shipHitSoundRef.current) {
        shipHitSoundRef.current.pause();
        shipHitSoundRef.current.currentTime = 0;
      }
      if (shipEnginesSoundRef.current) {
        shipEnginesSoundRef.current.pause();
        shipEnginesSoundRef.current.currentTime = 0;
      }
      if (gameOverSoundRef.current) {
        gameOverSoundRef.current.pause();
        gameOverSoundRef.current.currentTime = 0;
      }
    };
  }, [engine]);
  
  useEffect(() => {
    // Update power-up state for UI
    const checkPowerUps = () => {
      setShieldActive(engine.hasShield());
      setRapidFireActive(engine.hasRapidFire());
    };
    
    // Check every 100ms
    const powerUpInterval = setInterval(checkPowerUps, 100);
    return () => clearInterval(powerUpInterval);
  }, [engine]);
  
  return (
    <div className={`starfield-game ${isGameOver ? 'game-over' : ''}`}>
      <StarfieldHUD 
        score={score}
        lives={lives}
        targetScore={engine.getTargetScore()}
        shieldActive={shieldActive}
        rapidFireActive={rapidFireActive}
      />
      <canvas ref={canvasRef} width={640} height={480} className="starfield-canvas" />
      {isGameOver && glitchExplosionActive && (
        <div className="game-over-text">SYSTEM FAILURE</div>
      )}
      {showExplosionOverlay && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          {/* Central hit impact */}
          <div
            className="hit-impact"
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              left: hitPosition.x - 150 + 'px',
              top: hitPosition.y - 150 + 'px',
            }}
          />
          
          {/* Digital glitch scanlines */}
          <div 
            className="hit-scanlines"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
          
          {/* Matrix-style digital rain */}
          <div 
            className="hit-matrix-rain"
            style={{
              position: 'absolute',
              left: hitPosition.x - 200 + 'px',
              top: hitPosition.y - 200 + 'px',
              width: '400px',
              height: '400px',
            }}
          />
          
          {/* Electric fractal patterns */}
          <div 
            className="hit-electric-fractal"
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              left: hitPosition.x - 200 + 'px',
              top: hitPosition.y - 200 + 'px',
            }}
          />
          
          {/* System error text */}
          <div 
            className="hit-system-error"
            style={{
              position: 'absolute',
              left: hitPosition.x - 100 + 'px',
              top: hitPosition.y - 40 + 'px',
              width: '200px',
              textAlign: 'center',
            }}
          >
            <div className="error-text-primary">SYSTEM ERROR</div>
            <div className="error-text-secondary">HULL INTEGRITY COMPROMISED</div>
            <div className="error-code">ERR-CX:FF7A-04</div>
          </div>
          
          {/* Hexagon grid pattern */}
          <div 
            className="hit-hex-grid"
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              left: hitPosition.x - 250 + 'px',
              top: hitPosition.y - 250 + 'px',
            }}
          />
        </div>
      )}
      {/* Audio elements */}
      <audio ref={laserSoundRef} src="/audio/laser_small.mp3" preload="auto"></audio>
      <audio ref={enemyLaserSoundRef} src="/audio/laser_large.mp3" preload="auto"></audio>
      <audio ref={shipHitSoundRef} src="/audio/ship_hit.mp3" preload="auto"></audio>
      <audio ref={shipEnginesSoundRef} src="/audio/ship_engines.mp3" preload="auto" loop></audio>
      <audio ref={gameOverSoundRef} src="/audio/alert_gameover.mp3" preload="auto"></audio>
    </div>
  );
};

export default StarfieldGame;
