import { GameBase, GameEvent } from '../../engine/games/GameBase';
import { addDiscoveredClue } from '../../engine/save/SaveManager';

// Starfield game implementation
export class StarfieldEngine extends GameBase {
  // Game state properties
  private score: number = 0;
  private lives: number = 3;
  private ship: { x: number, y: number } = { x: 0, y: 0 };
  private enemyFired: boolean = false;  // Track when enemies fire
  private enemies: Array<{ 
    x: number, 
    y: number, 
    type: string, 
    speed: number, 
    movementPattern: 'straight' | 'zigzag' | 'sine' | 'swooping',
    patternOffset: number,
    patternAmplitude: number,
    lastX: number,
    rotationAngle: number,
    lastProjectileFired: number,
    projectileCooldown: number
  }> = [];
  private projectiles: Array<{ 
    x: number, 
    y: number,
    isEnemy?: boolean,
    type?: 'standard' | 'plasma' | 'homing' | 'glitch',
    color?: string,
    speed?: number,
    size?: number,
    damage?: number,
    targetX?: number,
    targetY?: number,
    patternOffset?: number
  }> = [];
  private stars: Array<{ x: number, y: number, brightness: number }> = [];
  private powerUps: Array<{ x: number, y: number, type: 'extra_life' | 'shield' | 'rapid_fire' | 'score_bonus' }> = [];
  private gameOver: boolean = false;
  private gameWidth: number = 640;
  private gameHeight: number = 480;
  private difficulty: number = 1;
  private shieldActive: boolean = false;
  private rapidFireActive: boolean = false;
  private powerUpTimer: number = 0;
  private lastPowerUpSpawn: number = 0;
  private targetScore: number = 15953; // Special score for memory dump
  private shipHitEvent: boolean = false; // To track when ship is hit for animation
  
  // Ship particle effects for enhanced visual impact
  private engineParticles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
  }> = [];
  private shipTrail: Array<{
    x: number;
    y: number;
    alpha: number;
  }> = [];
  private lastPositionX: number = 0; // For tracking ship movement
  
  constructor() {
    super('starfield');
  }
  
  public initialize(savedState?: any): void {
    // Reset game state
    this.score = savedState?.score || 0;
    this.lives = savedState?.lives || 3;
    this.ship = { x: this.gameWidth / 2, y: this.gameHeight - 50 };
    this.enemies = [];
    this.projectiles = [];
    this.powerUps = [];
    this.gameOver = false;
    this.difficulty = 1;
    this.shieldActive = false;
    this.rapidFireActive = false;
    this.powerUpTimer = 0;
    this.lastPowerUpSpawn = 0;
    this.lastPositionX = this.ship.x;
    
    // Reset particle effects
    this.engineParticles = [];
    this.shipTrail = [];
    
    // Generate stars with hidden pattern
    this.generateStars();
    
    // Show target score hint at game start
    this.logEvent('game_start_hint', {
      message: "SYSTEM MEMORY INTEGRITY CHECK AT SCORE: " + this.targetScore
    });
    
    // Start the game
    this.start();
  }
  
  private generateStars(): void {
    // Generate star pattern that subtly encodes a clue
    this.stars = [];
    
    // Generate 100 random stars
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.gameWidth,
        y: Math.random() * this.gameHeight,
        brightness: Math.random() * 0.7 + 0.3
      });
    }
    
    // Add specific stars that form a pattern (constellation that encodes a clue)
    const patternStars = [
      { x: 120, y: 80, brightness: 1.0 },
      { x: 180, y: 120, brightness: 1.0 },
      { x: 240, y: 160, brightness: 1.0 },
      { x: 300, y: 120, brightness: 1.0 },
      { x: 360, y: 80, brightness: 1.0 },
      { x: 240, y: 240, brightness: 1.0 },
      { x: 140, y: 180, brightness: 1.0 },
      { x: 340, y: 180, brightness: 1.0 },
      { x: 240, y: 320, brightness: 1.0 },
    ];
    
    this.stars.push(...patternStars);
  }
  
  public getStars(): Array<{ x: number, y: number, brightness: number }> {
    return this.stars;
  }
  
  public update(deltaTime: number): void {
    if (this.gameState.status !== 'running') return;
    
    // Update game entities
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.updatePowerUps(deltaTime);
    this.updateParticleEffects(deltaTime);
    this.checkCollisions();
    
    // Track ship movement to create effects
    const shipMovement = Math.abs(this.ship.x - this.lastPositionX);
    if (shipMovement > 0.5) {
      this.addShipTrail();
      if (shipMovement > 5) {
        this.addMovementParticles(shipMovement);
      }
    }
    this.lastPositionX = this.ship.x;
    
    // Generate continuous engine particles
    this.addEngineParticles();
    
    // Scale difficulty based on score
    this.difficulty = Math.min(10, 1 + Math.floor(this.score / 1000));
    
    // Spawn rate increases with difficulty
    const spawnRate = 0.01 + (this.difficulty * 0.002);
    if (Math.random() < spawnRate) {
      this.spawnEnemy();
    }
    
    // Spawn power-ups occasionally (every 15-20 seconds)
    this.lastPowerUpSpawn += deltaTime;
    if (this.lastPowerUpSpawn > 15 + Math.random() * 5) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = 0;
    }
    
    // Update power-up timers
    if (this.shieldActive || this.rapidFireActive) {
      this.powerUpTimer -= deltaTime;
      
      if (this.powerUpTimer <= 0) {
        this.shieldActive = false;
        
        if (this.rapidFireActive) {
          this.rapidFireActive = false;
          // Reset fire cooldown when rapid fire expires
          this.projectileCooldown = 250;
        }
        
        this.powerUpTimer = 0;
      }
    }
    
    // If we're getting close to the target score, provide a hint
    const scoreToTarget = this.targetScore - this.score;
    if (scoreToTarget > 0 && scoreToTarget < 500 && this.score % 100 === 0) {
      this.logEvent('score_hint', {
        message: `SYSTEM MEMORY THRESHOLD APPROACHING...`,
        scoreToTarget: scoreToTarget
      });
    }
  }
  
  private updatePowerUps(deltaTime: number): void {
    // Move power-ups down the screen
    this.powerUps.forEach(powerUp => {
      powerUp.y += 50 * deltaTime;
    });
    
    // Remove power-ups that go off-screen
    this.powerUps = this.powerUps.filter(powerUp => powerUp.y < this.gameHeight);
  }
  
  private spawnPowerUp(): void {
    // Choose a random power-up type
    const types: Array<'extra_life' | 'shield' | 'rapid_fire' | 'score_bonus'> = 
      ['extra_life', 'shield', 'rapid_fire', 'score_bonus'];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    this.powerUps.push({
      x: Math.random() * (this.gameWidth - 40) + 20,
      y: -20,
      type: randomType
    });
  }
  
  private updateEnemies(deltaTime: number): void {
    const time = Date.now() * 0.001; // Current time in seconds for wave patterns
    
    // Move enemies based on their movement pattern
    this.enemies.forEach(enemy => {
      // Store last X position for rotation calculation
      if (enemy.lastX === 0) {
        enemy.lastX = enemy.x;
      }
      
      // Base vertical movement
      enemy.y += enemy.speed * deltaTime;
      
      // Apply horizontal movement based on pattern
      switch (enemy.movementPattern) {
        case 'straight':
          // No horizontal movement - just go straight down
          break;
          
        case 'zigzag':
          // Zigzag pattern - change direction periodically
          const zigzagPeriod = 2.0; // seconds per zigzag
          const zigzagProgress = (time + enemy.patternOffset) % zigzagPeriod;
          const zigzagDirection = zigzagProgress < zigzagPeriod / 2 ? 1 : -1;
          
          enemy.x += zigzagDirection * enemy.speed * 0.8 * deltaTime;
          
          // Keep within screen bounds
          if (enemy.x < 20) {
            enemy.x = 20;
          } else if (enemy.x > this.gameWidth - 20) {
            enemy.x = this.gameWidth - 20;
          }
          break;
          
        case 'sine':
          // Smooth sine wave movement
          const centerX = this.gameWidth / 2;
          const frequency = 1.0; // Complete cycles per movement
          
          // Calculate new position based on sine wave
          enemy.x = centerX + Math.sin((time + enemy.patternOffset) * frequency * Math.PI) * enemy.patternAmplitude;
          break;
          
        case 'swooping':
          // Swooping attack pattern - accelerate towards player's general position
          const targetX = this.ship.x;
          const swoopFactor = 0.5 + Math.min(1.0, enemy.y / 200) * 1.5; // Increases as enemy moves down
          
          // Move towards player with increasing intensity
          const directionX = targetX > enemy.x ? 1 : -1;
          enemy.x += directionX * enemy.speed * swoopFactor * deltaTime;
          
          // Limit maximum deflection
          if (Math.abs(enemy.x - targetX) < 10) {
            enemy.x = targetX;
          }
          break;
      }
      
      // Calculate rotation angle based on movement direction
      const xDiff = enemy.x - enemy.lastX;
      if (Math.abs(xDiff) > 0.01) {
        // Smooth rotation transitions
        const targetAngle = Math.atan2(enemy.speed * deltaTime, xDiff);
        const rotationSpeed = 5.0 * deltaTime;
        
        // Interpolate towards target angle
        enemy.rotationAngle += (targetAngle - enemy.rotationAngle) * rotationSpeed;
      }
      
      // Update lastX for next frame
      enemy.lastX = enemy.x;
    });
    
    // Check if enemies should fire
    const now = Date.now();
    this.enemies.forEach(enemy => {
      // Only fire if enemy is on screen and cooldown has elapsed
      if (now - enemy.lastProjectileFired > enemy.projectileCooldown && 
          enemy.y > 0 && enemy.y < this.gameHeight - 50) {
        this.fireEnemyProjectile(enemy);
        enemy.lastProjectileFired = now;
        
        // Randomize the next cooldown a bit
        enemy.projectileCooldown = 
          enemy.type === 'large' 
            ? 1500 + Math.random() * 1000 
            : 2500 + Math.random() * 2000;
      }
    });
    
    // Remove enemies that go off-screen
    this.enemies = this.enemies.filter(enemy => 
      enemy.y < this.gameHeight && 
      enemy.x > -50 && 
      enemy.x < this.gameWidth + 50
    );
  }
  
  private updateProjectiles(deltaTime: number): void {
    // Move projectiles based on type
    this.projectiles.forEach(proj => {
      // Calculate base speed
      const speed = proj.speed || 300;
      
      // If it's a player projectile, move it upward
      if (!proj.isEnemy) {
        proj.y -= speed * deltaTime;
      } else {
        // Handle enemy projectiles based on type
        switch (proj.type) {
          case 'standard':
            // Standard projectiles move straight down
            proj.y += speed * deltaTime;
            break;
            
          case 'plasma':
            // Plasma projectiles move down with slight oscillation
            proj.y += speed * deltaTime;
            // Add side-to-side motion with sine wave
            if (!proj.patternOffset) {
              proj.patternOffset = Math.random() * Math.PI * 2;
            }
            proj.x += Math.sin((Date.now() * 0.005) + proj.patternOffset) * 1.5;
            break;
            
          case 'homing':
            // Homing projectiles gradually move toward the player
            proj.y += speed * 0.7 * deltaTime;
            
            // Get direction to player
            const dx = this.ship.x - proj.x;
            const dy = this.ship.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Move toward player with limited tracking
            if (dist > 0) {
              proj.x += (dx / dist) * speed * 0.5 * deltaTime;
              proj.y += (dy / dist) * speed * 0.3 * deltaTime;
            }
            break;
            
          case 'glitch':
            // Glitch projectiles teleport randomly as they move down
            proj.y += speed * deltaTime;
            if (Math.random() < 0.05) {
              // Random teleportation (5% chance per frame)
              proj.x += (Math.random() - 0.5) * 40;
            }
            break;
            
          default:
            // Default behavior for any unspecified types
            proj.y += speed * deltaTime;
            break;
        }
      }
    });
    
    // Remove projectiles that go off-screen
    this.projectiles = this.projectiles.filter(proj => {
      // Player projectiles go off top, enemy projectiles off bottom
      return (proj.isEnemy && proj.y < this.gameHeight + 20) || 
             (!proj.isEnemy && proj.y > -20);
    });
  }
  
  private checkCollisions(): void {
    // DEBUG: Randomly trigger ship hit for testing (1% chance per frame)
    if (Math.random() < 0.01 && !this.shipHitEvent && this.lives > 0) {
      console.log("DEBUG: Random ship hit triggered for testing!");
      this.shipHitEvent = true;
      
      // Don't actually reduce lives since this is just for testing
      // We just want to see if the animation works
    }
  
    // Check player projectile-enemy collisions
    for (let pIndex = this.projectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.projectiles[pIndex];
      
      // Skip enemy projectiles
      if (proj.isEnemy) continue;
      
      let hitDetected = false;
      
      for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = this.enemies[eIndex];
        const distance = Math.sqrt(
          Math.pow(proj.x - enemy.x, 2) + Math.pow(proj.y - enemy.y, 2)
        );
        
        if (distance < 20) {
          // Remove the enemy and projectile
          this.enemies.splice(eIndex, 1);
          
          // Update score
          const points = enemy.type === 'large' ? 100 : 50;
          this.updateScore(points);
          
          hitDetected = true;
          break;
        }
      }
      
      // Remove the projectile if it hit something
      if (hitDetected) {
        this.projectiles.splice(pIndex, 1);
      }
    }
    
    // Check enemy projectile-player collisions
    for (let pIndex = this.projectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.projectiles[pIndex];
      
      // Skip player projectiles
      if (!proj.isEnemy) continue;
      
      const distance = Math.sqrt(
        Math.pow(proj.x - this.ship.x, 2) + Math.pow(proj.y - this.ship.y, 2)
      );
      
      const hitRadius = (proj.size || 5) + 15; // Adjust hit radius based on projectile size
      
      if (distance < hitRadius) {
        // Remove the projectile
        this.projectiles.splice(pIndex, 1);
        
        // If shield is active, just remove shield
        if (this.shieldActive) {
          this.logEvent('shield_hit', {
            projectileType: proj.type
          });
          // Disable shield after hit
          this.shieldActive = false;
        } else {
          // Reduce lives based on projectile damage
          const damage = proj.damage || 1;
          this.lives -= damage;
          
          // Set ship hit event for animation
          this.shipHitEvent = true;
          
          this.logEvent('ship_hit', {
            livesRemaining: this.lives,
            projectileType: proj.type
          });
          
          // Check for special effects from glitch projectiles
          if (proj.type === 'glitch' && this.lives > 0) {
            this.logEvent('glitch_hit', {
              message: "MEMORY CORRUPTION DETECTED"
            });
          }
          
          if (this.lives <= 0) {
            this.gameOver = true;
            this.failGame({ finalScore: this.score });
          }
        }
      }
    }
    
    // Check ship-powerup collisions
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      const distance = Math.sqrt(
        Math.pow(this.ship.x - powerUp.x, 2) + Math.pow(this.ship.y - powerUp.y, 2)
      );
      
      if (distance < 30) {
        // Apply the power-up effect
        this.applyPowerUp(powerUp.type);
        
        // Remove the power-up
        this.powerUps.splice(i, 1);
      }
    }
    
    // Check enemy-ship collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const distance = Math.sqrt(
        Math.pow(this.ship.x - enemy.x, 2) + Math.pow(this.ship.y - enemy.y, 2)
      );
      
      if (distance < 30) {
        // Remove the enemy
        this.enemies.splice(i, 1);
        
        // If shield is active, just remove shield
        if (this.shieldActive) {
          this.logEvent('shield_hit', {
            enemyType: enemy.type
          });
          // Disable shield after hit
          this.shieldActive = false;
        } else {
          // Reduce lives
          this.lives--;
          
          // Set ship hit event for animation
          this.shipHitEvent = true;
          
          this.logEvent('ship_hit', {
            livesRemaining: this.lives
          });
          
          if (this.lives <= 0) {
            this.gameOver = true;
            this.failGame({ finalScore: this.score });
          }
        }
      }
    }
  }
  
  private applyPowerUp(type: 'extra_life' | 'shield' | 'rapid_fire' | 'score_bonus'): void {
    switch (type) {
      case 'extra_life':
        this.lives = Math.min(5, this.lives + 1);
        this.logEvent('power_up', { type: 'extra_life', lives: this.lives });
        break;
      
      case 'shield':
        this.shieldActive = true;
        this.powerUpTimer = 10; // 10 seconds of shield
        this.logEvent('power_up', { type: 'shield', duration: 10 });
        break;
      
      case 'rapid_fire':
        this.rapidFireActive = true;
        this.powerUpTimer = 8; // 8 seconds of rapid fire
        this.logEvent('power_up', { type: 'rapid_fire', duration: 8 });
        break;
      
      case 'score_bonus':
        const bonusPoints = 500;
        this.updateScore(bonusPoints);
        this.logEvent('power_up', { type: 'score_bonus', points: bonusPoints });
        break;
    }
  }
  
  private spawnEnemy(): void {
    // Create a new enemy at a random position at the top of the screen
    const enemyType = Math.random() < 0.2 ? 'large' : 'small';
    
    // Speed increases with difficulty
    const baseSpeed = enemyType === 'large' ? 80 : 120;
    const speed = baseSpeed + (this.difficulty * 10);
    
    // Choose a random movement pattern
    const patterns: Array<'straight' | 'zigzag' | 'sine' | 'swooping'> = ['straight', 'zigzag', 'sine', 'swooping'];
    const movementPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Large enemies are more likely to have interesting patterns
    const patternDistribution = enemyType === 'large' 
      ? Math.random() < 0.7  // 70% chance for large enemies to have patterns
      : Math.random() < 0.4; // 40% chance for small enemies to have patterns
    
    const finalPattern = patternDistribution ? movementPattern : 'straight';
    
    // Random amplitude for movement patterns
    const baseAmplitude = enemyType === 'large' ? 50 : 30;
    const patternAmplitude = Math.random() * baseAmplitude + 20;
    
    this.enemies.push({
      x: Math.random() * (this.gameWidth - 40) + 20,
      y: -20,
      type: enemyType,
      speed: speed,
      movementPattern: finalPattern,
      patternOffset: Math.random() * Math.PI * 2, // Random starting phase
      patternAmplitude: patternAmplitude,
      lastX: 0, // Will be set on first update
      rotationAngle: 0, // Initial rotation
      lastProjectileFired: 0, // Initial time for projectile cooldown
      projectileCooldown: enemyType === 'large' ? 2000 + Math.random() * 1000 : 3000 + Math.random() * 2000 // Cooldown between shots
    });
  }
  
  public handleKeyPress(key: string): void {
    if (this.gameState.status !== 'running') return;
    
    // Handle player input
    switch (key) {
      case 'ArrowLeft':
        this.moveShip('left');
        break;
      case 'ArrowRight':
        this.moveShip('right');
        break;
      case 'ArrowUp':
        this.moveShip('up');
        break;
      case 'ArrowDown':
        this.moveShip('down');
        break;
      case ' ':
        this.fireProjectile();
        break;
    }
  }
  
  public moveShip(direction: 'left' | 'right' | 'up' | 'down'): void {
    if (this.gameState.status !== 'running') return;
    
    const moveSpeed = 15;
    
    switch (direction) {
      case 'left':
        this.ship.x = Math.max(20, this.ship.x - moveSpeed);
        break;
      case 'right':
        this.ship.x = Math.min(this.gameWidth - 20, this.ship.x + moveSpeed);
        break;
      case 'up':
        this.ship.y = Math.max(20, this.ship.y - moveSpeed);
        break;
      case 'down':
        this.ship.y = Math.min(this.gameHeight - 20, this.ship.y + moveSpeed);
        break;
    }
  }
  
  // Track last time projectile was fired for rate limiting
  private lastProjectileFired: number = 0;
  private projectileCooldown: number = 250; // ms between shots (4 per second)

  // Fires enemy projectiles of different types
  private fireEnemyProjectile(enemy: any): void {
    // Determine projectile type based on enemy type and randomness
    let projectileType: 'standard' | 'plasma' | 'homing' | 'glitch';
    let projectileColor: string;
    let projectileSpeed: number;
    let projectileSize: number = 4;
    let projectileDamage: number = 1;
    
    const randomType = Math.random();
    
    if (enemy.type === 'large') {
      // Large enemies have more advanced projectiles
      if (randomType < 0.4) {
        projectileType = 'plasma';
        projectileColor = '#FF00FF'; // Magenta plasma
        projectileSpeed = 150;
        projectileSize = 8;
        projectileDamage = 2;
      } else if (randomType < 0.7) {
        projectileType = 'homing';
        projectileColor = '#00FFFF'; // Cyan homing missile
        projectileSpeed = 120;
        projectileSize = 6;
        projectileDamage = 1;
      } else {
        projectileType = 'standard';
        projectileColor = '#FF3333'; // Red standard projectile
        projectileSpeed = 180;
      }
      
      // 5% chance for any large enemy to fire a special glitch projectile
      if (Math.random() < 0.05) {
        projectileType = 'glitch';
        projectileColor = '#FFFFFF';
        projectileSpeed = 200;
        projectileSize = 10;
        projectileDamage = 3;
      }
    } else {
      // Small enemies mostly fire standard projectiles
      projectileType = 'standard';
      projectileColor = '#FF3333';
      projectileSpeed = 180;
      
      // 10% chance for small enemies to fire plasma
      if (randomType < 0.1) {
        projectileType = 'plasma';
        projectileColor = '#FF00FF';
        projectileSpeed = 150;
        projectileSize = 6;
      }
    }
    
    // Create the projectile with all possible properties
    const projectile: {
      x: number;
      y: number;
      isEnemy: boolean;
      type: 'standard' | 'plasma' | 'homing' | 'glitch';
      color: string;
      speed: number;
      size: number;
      damage: number;
      targetX?: number;
      targetY?: number;
      patternOffset?: number;
    } = {
      x: enemy.x,
      y: enemy.y + 15, // Position at bottom of enemy
      isEnemy: true,
      type: projectileType,
      color: projectileColor,
      speed: projectileSpeed,
      size: projectileSize,
      damage: projectileDamage
    };
    
    // Add targeting for homing projectiles
    if (projectileType === 'homing') {
      projectile.targetX = this.ship.x;
      projectile.targetY = this.ship.y;
    }
    
    // Add pattern offset for plasma projectiles
    if (projectileType === 'plasma') {
      projectile.patternOffset = Math.random() * Math.PI * 2;
    }
    
    // Add to projectiles array
    this.projectiles.push(projectile);
    
    // Set flag to indicate an enemy fired
    this.enemyFired = true;
  }
  
  // Method to check if an enemy fired and reset the flag
  public checkForEnemyFireEvent(): boolean {
    const didFire = this.enemyFired;
    this.enemyFired = false;
    return didFire;
  }

  public fireProjectile(): void {
    // Check if cooldown has elapsed
    const now = Date.now();
    if (now - this.lastProjectileFired < this.projectileCooldown) {
      return; // Still on cooldown
    }
    
    // Update last fired time
    this.lastProjectileFired = now;
    
    // Create a new projectile at the ship's position
    if (this.rapidFireActive) {
      // Faster cooldown with powerup
      this.projectileCooldown = 100;
      // Triple shot for rapid fire
      this.projectiles.push(
        { x: this.ship.x - 10, y: this.ship.y - 5, isEnemy: false, type: 'standard', color: '#33FF33', speed: 300 },
        { x: this.ship.x, y: this.ship.y - 10, isEnemy: false, type: 'standard', color: '#33FF33', speed: 300 },
        { x: this.ship.x + 10, y: this.ship.y - 5, isEnemy: false, type: 'standard', color: '#33FF33', speed: 300 }
      );
    } else {
      // Regular single shot
      this.projectiles.push({
        x: this.ship.x,
        y: this.ship.y - 10,
        isEnemy: false,
        type: 'standard',
        color: '#33FF33',
        speed: 300,
        size: 5,
        damage: 1
      });
    }
  }
  
  private updateScore(points: number): void {
    const previousScore = this.score;
    this.score += points;
    
    // Log the score update
    this.logEvent('score_update', { 
      score: this.score,
      gained: points
    });
    
    // Check for special score milestone - handle the case where we might skip over it with a large point gain
    if (previousScore < this.targetScore && this.score >= this.targetScore) {
      // Adjust score to be exactly the target
      this.score = this.targetScore;
      
      // Trigger the memory dump effect
      this.triggerMemoryDump();
    }
  }
  
  private triggerMemoryDump(): void {
    // Pause the game
    this.pause();
    
    // Log the memory dump event with more detailed information
    this.logEvent('memory_dump', {
      message: "MEMORY INTEGRITY CHECK FAILED AT 0xF7A39D4...",
      fragmentData: "PATH_GAMMA_SEQUENCE_FRAGMENT_2",
      coordinates: "SECTOR 7G, QUADRANT 9",
      timestamp: Date.now()
    });
    
    // Resume the game after a delay
    setTimeout(() => {
      // Add the discovered clue
      addDiscoveredClue('starfield_memory_fragment', {
        type: 'memory_fragment',
        source: 'starfield',
        content: 'PATH_GAMMA_SEQUENCE_FRAGMENT_2',
        metadata: {
          coordinates: 'SECTOR 7G, QUADRANT 9',
          timestamp: Date.now()
        }
      });
      
      this.resume();
    }, 2000);
  }
  
  public getScore(): number {
    return this.score;
  }
  
  public getLives(): number {
    return this.lives;
  }
  
  public getShip(): { x: number, y: number } {
    return this.ship;
  }
  
  public getEnemies(): Array<{ x: number, y: number, type: string, movementPattern: string, rotationAngle: number }> {
    return this.enemies;
  }
  
  public getProjectiles(): Array<{ 
    x: number, 
    y: number,
    isEnemy?: boolean,
    type?: 'standard' | 'plasma' | 'homing' | 'glitch',
    color?: string,
    speed?: number,
    size?: number,
    damage?: number,
    targetX?: number,
    targetY?: number,
    patternOffset?: number
  }> {
    return this.projectiles;
  }
  
  public getPowerUps(): Array<{ x: number, y: number, type: 'extra_life' | 'shield' | 'rapid_fire' | 'score_bonus' }> {
    return this.powerUps;
  }
  
  public hasShield(): boolean {
    return this.shieldActive;
  }
  
  public hasRapidFire(): boolean {
    return this.rapidFireActive;
  }
  
  public getTargetScore(): number {
    return this.targetScore;
  }
  
  public isGameOver(): boolean {
    return this.gameOver;
  }
  
  // Check if ship was hit this frame and clear flag
  public checkForShipHitEvent(): boolean {
    if (this.shipHitEvent) {
      console.log("DEBUG: Ship hit event detected and being cleared");
      const wasHit = true;
      this.shipHitEvent = false;
      return wasHit;
    }
    return false;
  }
  
  // Debug method to manually trigger a ship hit event
  public debugTriggerShipHit(): void {
    console.log("DEBUG: Ship hit event triggered manually");
    this.shipHitEvent = true;
  }
  
  // Get particle effects for rendering
  public getEngineParticles(): Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
  }> {
    return this.engineParticles;
  }
  
  public getShipTrail(): Array<{
    x: number;
    y: number;
    alpha: number;
  }> {
    return this.shipTrail;
  }
  
  private updateParticleEffects(deltaTime: number): void {
    // Update engine particles
    for (let i = this.engineParticles.length - 1; i >= 0; i--) {
      const particle = this.engineParticles[i];
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= deltaTime;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.engineParticles.splice(i, 1);
      }
    }
    
    // Update ship trail
    for (let i = this.shipTrail.length - 1; i >= 0; i--) {
      const trail = this.shipTrail[i];
      trail.alpha -= deltaTime * 2;
      
      // Remove faded trail points
      if (trail.alpha <= 0) {
        this.shipTrail.splice(i, 1);
      }
    }
    
    // Limit number of particles for performance
    if (this.engineParticles.length > 100) {
      this.engineParticles.splice(0, this.engineParticles.length - 100);
    }
    
    if (this.shipTrail.length > 20) {
      this.shipTrail.splice(0, this.shipTrail.length - 20);
    }
  }
  
  private addEngineParticles(): void {
    // Add engine exhaust particles
    if (Math.random() > 0.5) {
      const baseColor = this.rapidFireActive ? '#FFFF00' : '#FF3300';
      
      // Left engine
      this.engineParticles.push({
        x: this.ship.x - 8,
        y: this.ship.y + 15,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 50 + 30,
        life: Math.random() * 0.5 + 0.2,
        maxLife: 0.7,
        color: baseColor
      });
      
      // Right engine
      this.engineParticles.push({
        x: this.ship.x + 8,
        y: this.ship.y + 15,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 50 + 30,
        life: Math.random() * 0.5 + 0.2,
        maxLife: 0.7,
        color: baseColor
      });
    }
  }
  
  private addShipTrail(): void {
    // Add trail behind ship for visual effect
    this.shipTrail.push({
      x: this.ship.x,
      y: this.ship.y,
      alpha: 1.0
    });
  }
  
  private addMovementParticles(movementSpeed: number): void {
    // Add particles when ship makes sharp turns
    const particleCount = Math.floor(movementSpeed / 3);
    const direction = this.lastPositionX > this.ship.x ? 1 : -1;
    
    for (let i = 0; i < particleCount; i++) {
      this.engineParticles.push({
        x: this.ship.x + (direction * (Math.random() * 10)),
        y: this.ship.y + (Math.random() * 10 - 5),
        vx: direction * (Math.random() * 30 + 10),
        vy: (Math.random() - 0.5) * 20,
        life: Math.random() * 0.3 + 0.1,
        maxLife: 0.4,
        color: this.shieldActive ? '#00CCFF' : '#FF00FF'
      });
    }
  }
  
  protected checkForClues(event: GameEvent): void {
    if (event.type === 'memory_dump') {
      // This is handled in the triggerMemoryDump method
    }
    
    if (event.type === 'game_over' && this.score > 10000) {
      // Additional clue for high scores
      addDiscoveredClue('starfield_high_score', {
        type: 'achievement',
        source: 'starfield',
        content: 'Achieved high score in Starfield',
        metadata: {
          score: this.score,
          timestamp: Date.now()
        }
      });
    }
  }
}
