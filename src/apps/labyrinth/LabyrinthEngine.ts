import { GameBase, GameEvent, GameState } from '../../engine/games/GameBase';
import { addGameLog, addDiscoveredClue } from '../../engine/save/SaveManager';

interface LabyrinthGameState extends GameState {
  customState: {
    width: number;
    height: number;
    playerPos: { x: number, y: number };
    collectedSymbols: string[];
    currentLevel: number;
    isGameOver: boolean;
    isVictory: boolean;
  };
}

export class LabyrinthEngine extends GameBase {
  // Game dimensions and properties
  private width: number = 21; // Must be odd for maze generation
  private height: number = 21; // Must be odd for maze generation
  private maze: string[][] = [];
  private playerPos: { x: number, y: number } = { x: 1, y: 1 };
  private symbols: Map<string, { x: number, y: number, collected: boolean }> = new Map();
  private symbolOrder: string[] = [];
  private collectedSymbols: string[] = [];
  private currentLevel: number = 1;
  private maxLevel: number = 5;
  private isGameOver: boolean = false;
  private isVictory: boolean = false;
  private message: string = "";
  
  // Maze cell types
  private readonly WALL = "█";
  private readonly PATH = "·"; // Using a dot for better visibility
  private readonly PLAYER = "☺";
  private readonly EXIT = "◊";
  private readonly VISITED_PATH = "○"; // New marker for visited paths
  
  constructor() {
    super('labyrinth');
    
    // Initialize the gameState with proper structure
    this.gameState = {
      gameId: 'labyrinth',
      status: 'idle',
      level: 1,
      score: 0,
      customState: {
        width: this.width,
        height: this.height,
        playerPos: { ...this.playerPos },
        collectedSymbols: [],
        currentLevel: 1,
        isGameOver: false,
        isVictory: false
      }
    };
  }
  
  /**
   * Initialize the game with optional saved state
   */
  public initialize(savedState?: any): void {
    if (savedState) {
      // Restore from saved state
      this.currentLevel = savedState.level || 1;
      this.collectedSymbols = savedState.customState?.collectedSymbols || [];
      this.isGameOver = savedState.customState?.isGameOver || false;
      this.isVictory = savedState.customState?.isVictory || false;
      this.playerPos = savedState.customState?.playerPos || { x: 1, y: 1 };
    }
    
    // Generate the maze and place items
    this.generateMaze();
    this.placeSymbols();
    this.placeExit();
    
    // Update game state
    this.gameState = {
      ...this.gameState,
      status: 'running',
      level: this.currentLevel,
      customState: {
        width: this.width,
        height: this.height,
        playerPos: { ...this.playerPos },
        collectedSymbols: [...this.collectedSymbols],
        currentLevel: this.currentLevel,
        isGameOver: this.isGameOver,
        isVictory: this.isVictory
      }
    };
    
    this.message = `Welcome to LABYRINTH.EXE - Level ${this.currentLevel}`;
    
    // Log game initialization event
    this.logEvent('game_start', { 
      level: this.currentLevel,
      mazeSize: `${this.width}x${this.height}`,
      timestamp: Date.now()
    });
  }
  
  /**
   * Initialize the game state (legacy method - use initialize() instead)
   */
  public initGame(): void {
    this.initialize();
  }
  
  /**
   * Generate a procedural maze using a simplified algorithm that ensures playability
   */
  private generateMaze(): void {
    // Initialize maze with walls
    this.maze = Array(this.height).fill(null)
      .map(() => Array(this.width).fill(this.WALL));
    
    // Create a grid of paths with walls in between
    for (let y = 1; y < this.height - 1; y += 2) {
      for (let x = 1; x < this.width - 1; x += 2) {
        this.maze[y][x] = this.PATH;
      }
    }
    
    // Create paths using a simple maze generation algorithm that guarantees connectivity
    this.createPathsWithRandomizedDFS(1, 1);
    
    // Add some random additional paths to make navigation easier
    this.addAdditionalPaths();
    
    // Set player starting position
    this.playerPos = { x: 1, y: 1 };
    
    // Special patterns for specific levels
    if (this.currentLevel === 3) {
      this.createSpecialPattern();
    }
    
    // Ensure the maze is solvable
    this.ensureMazeIsSolvable();
  }
  
  /**
   * Creates paths in the maze using a randomized depth-first search algorithm.
   * This algorithm guarantees that there is a path from any path cell to any other path cell.
   */
  private createPathsWithRandomizedDFS(startX: number, startY: number): void {
    // Array to keep track of visited cells
    const visited: boolean[][] = Array(this.height).fill(null)
      .map(() => Array(this.width).fill(false));
    
    // Stack for the DFS algorithm
    const stack: {x: number, y: number}[] = [];
    stack.push({ x: startX, y: startY });
    visited[startY][startX] = true;
    
    // Directions: right, down, left, up
    const directions = [
      { dx: 2, dy: 0 }, // right
      { dx: 0, dy: 2 }, // down
      { dx: -2, dy: 0 }, // left
      { dx: 0, dy: -2 } // up
    ];
    
    while (stack.length > 0) {
      // Get the current cell
      const current = stack[stack.length - 1];
      
      // Shuffle directions randomly
      const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
      
      // Flag to track if we found any unvisited neighbors
      let foundUnvisited = false;
      
      // Try each direction
      for (const dir of shuffledDirs) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        
        // Check if the neighbor is within bounds and not visited
        if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1 && !visited[ny][nx]) {
          // Mark as visited
          visited[ny][nx] = true;
          
          // Carve a path between the current cell and the neighbor
          this.maze[current.y + dir.dy / 2][current.x + dir.dx / 2] = this.PATH;
          
          // Push the neighbor onto the stack
          stack.push({ x: nx, y: ny });
          foundUnvisited = true;
          break;
        }
      }
      
      // If no unvisited neighbors, backtrack
      if (!foundUnvisited) {
        stack.pop();
      }
    }
  }
  
  /**
   * Adds additional random paths to make the maze easier to navigate
   */
  private addAdditionalPaths(): void {
    // Decide how many additional paths to add based on level
    const additionalPaths = Math.min(5, this.currentLevel + 2);
    
    for (let i = 0; i < additionalPaths; i++) {
      // Pick a random wall that's not on the border
      let x, y;
      let tries = 0;
      let valid = false;
      
      while (!valid && tries < 100) {
        x = Math.floor(Math.random() * (this.width - 4)) + 2;
        y = Math.floor(Math.random() * (this.height - 4)) + 2;
        
        // Check if it's a wall with paths on both sides (horizontally or vertically)
        if (this.maze[y][x] === this.WALL) {
          if ((this.maze[y][x-1] === this.PATH && this.maze[y][x+1] === this.PATH) ||
              (this.maze[y-1][x] === this.PATH && this.maze[y+1][x] === this.PATH)) {
            valid = true;
            this.maze[y][x] = this.PATH; // Convert wall to path
          }
        }
        tries++;
      }
    }
  }
  
  /**
   * Ensures the maze is solvable by checking and fixing any issues
   */
  private ensureMazeIsSolvable(): void {
    // Create a map to store distances from start to each cell
    const dist: number[][] = Array(this.height).fill(null)
      .map(() => Array(this.width).fill(-1));
    
    // Use breadth-first search to calculate distances
    const queue: {x: number, y: number}[] = [];
    queue.push({ x: this.playerPos.x, y: this.playerPos.y });
    dist[this.playerPos.y][this.playerPos.x] = 0;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Try all four adjacent cells
      const adjacentCells = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const cell of adjacentCells) {
        if (cell.x > 0 && cell.x < this.width - 1 && cell.y > 0 && cell.y < this.height - 1) {
          if (this.maze[cell.y][cell.x] !== this.WALL && dist[cell.y][cell.x] === -1) {
            queue.push({ x: cell.x, y: cell.y });
            dist[cell.y][cell.x] = dist[current.y][current.x] + 1;
          }
        }
      }
    }
    
    // Find the farthest point in the bottom right quadrant for exit placement
    let maxDist = -1;
    let exitPos = { x: this.width - 2, y: this.height - 2 };
    
    // Search in bottom right quadrant
    for (let y = Math.floor(this.height / 2); y < this.height - 1; y++) {
      for (let x = Math.floor(this.width / 2); x < this.width - 1; x++) {
        if (dist[y][x] > maxDist) {
          maxDist = dist[y][x];
          exitPos = { x, y };
        }
      }
    }
    
    // If we found a valid exit position, update the exit
    if (maxDist > 0) {
      // First remove any existing exit
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.maze[y][x] === this.EXIT) {
            this.maze[y][x] = this.PATH;
          }
        }
      }
      
      // Place new exit
      this.maze[exitPos.y][exitPos.x] = this.EXIT;
    }
  }
  
  /**
   * Create special pattern in level 3 maze (forms coordinates or word)
   */
  private createSpecialPattern(): void {
    // Create a pattern that spells out "2517" in walls
    // This is a simple example - would be more elaborate in final implementation
    const startX = 5;
    const startY = 5;
    
    // Create pattern - this is just a placeholder
    // In a real implementation, this would create a more complex and recognizable pattern
    const pattern = [
      [1,1,1,1,0,1,1,1,0,1,1,1],
      [0,0,0,1,0,1,0,0,0,1,0,1],
      [1,1,1,1,0,1,1,1,0,1,1,1],
      [1,0,0,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,0,1,1,1,0,1,1,1]
    ];
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === 1) {
          this.maze[startY + y][startX + x] = this.PATH;
        } else {
          this.maze[startY + y][startX + x] = this.WALL;
        }
      }
    }
  }
  
  /**
   * Place collectible symbols in the maze
   */
  private placeSymbols(): void {
    this.symbols.clear();
    this.symbolOrder = [];
    
    // Define symbols for the current level
    const availableSymbols = ['2', '5', '1', '7', '*', '&', '#', '@'];
    const numSymbols = Math.min(4 + this.currentLevel, availableSymbols.length);
    
    // For level with code "2517", enforce this specific sequence
    if (this.currentLevel === 4) {
      this.symbolOrder = ['2', '5', '1', '7'];
    } else {
      // Randomly select and order symbols
      const shuffled = [...availableSymbols].sort(() => Math.random() - 0.5);
      this.symbolOrder = shuffled.slice(0, numSymbols);
    }
    
    // Find all valid path cells
    const validCells: {x: number, y: number}[] = [];
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.maze[y][x] === this.PATH && !(x === this.playerPos.x && y === this.playerPos.y)) {
          validCells.push({x, y});
        }
      }
    }
    
    // Shuffle the valid cells
    const shuffledCells = [...validCells].sort(() => Math.random() - 0.5);
    
    // Place symbols strategically throughout the maze
    for (let i = 0; i < this.symbolOrder.length && i < shuffledCells.length; i++) {
      const symbol = this.symbolOrder[i];
      const cellIndex = Math.floor(i * (shuffledCells.length / this.symbolOrder.length));
      const cell = shuffledCells[cellIndex];
      
      this.symbols.set(symbol, { x: cell.x, y: cell.y, collected: false });
    }
    
    // If we're on level 4 (the "2517" level), ensure symbols are placed in a logical order
    if (this.currentLevel === 4) {
      this.placeSymbolsInOrder();
    }
  }
  
  /**
   * Places the "2517" symbols in a logical sequence through the maze
   */
  private placeSymbolsInOrder(): void {
    const validCells: {x: number, y: number, dist: number}[] = [];
    
    // Calculate distances from start position
    const dist: number[][] = Array(this.height).fill(null)
      .map(() => Array(this.width).fill(-1));
    
    // Use BFS to find distances
    const queue: {x: number, y: number}[] = [];
    queue.push({ x: this.playerPos.x, y: this.playerPos.y });
    dist[this.playerPos.y][this.playerPos.x] = 0;
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Add this position to valid cells
      if (this.maze[current.y][current.x] === this.PATH && 
          !(current.x === this.playerPos.x && current.y === this.playerPos.y)) {
        validCells.push({
          x: current.x, 
          y: current.y, 
          dist: dist[current.y][current.x]
        });
      }
      
      // Try all four adjacent cells
      const adjacentCells = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const cell of adjacentCells) {
        if (cell.x > 0 && cell.x < this.width - 1 && cell.y > 0 && cell.y < this.height - 1) {
          if (this.maze[cell.y][cell.x] !== this.WALL && dist[cell.y][cell.x] === -1) {
            queue.push({ x: cell.x, y: cell.y });
            dist[cell.y][cell.x] = dist[current.y][current.x] + 1;
          }
        }
      }
    }
    
    // Sort valid cells by distance
    validCells.sort((a, b) => a.dist - b.dist);
    
    // Place symbols in increasing distance order
    const symbols = ['2', '5', '1', '7'];
    for (let i = 0; i < symbols.length && i < validCells.length; i++) {
      // Use cells that are appropriately spaced through the maze
      const cellIndex = Math.floor((i + 1) * validCells.length / (symbols.length + 1));
      const cell = validCells[Math.min(cellIndex, validCells.length - 1)];
      
      this.symbols.set(symbols[i], { x: cell.x, y: cell.y, collected: false });
    }
  }
  
  /**
   * Place exit in the maze
   * Note: With our new maze generation approach, this is mainly a fallback.
   * The ensureMazeIsSolvable method now places the exit at the farthest reachable point.
   */
  private placeExit(): void {
    // Check if exit already exists (placed by ensureMazeIsSolvable)
    let exitExists = false;
    for (let y = 0; y < this.height && !exitExists; y++) {
      for (let x = 0; x < this.width && !exitExists; x++) {
        if (this.maze[y][x] === this.EXIT) {
          exitExists = true;
        }
      }
    }
    
    // If exit doesn't exist yet, place it in bottom right area
    if (!exitExists) {
      let placed = false;
      
      // Try to find a valid path cell in bottom right quadrant
      for (let y = Math.floor(this.height * 0.7); y < this.height - 1 && !placed; y++) {
        for (let x = Math.floor(this.width * 0.7); x < this.width - 1 && !placed; x++) {
          if (this.maze[y][x] === this.PATH) {
            this.maze[y][x] = this.EXIT;
            placed = true;
          }
        }
      }
      
      // Fallback - if no place found, try to create a valid path to the bottom right
      if (!placed) {
        // Create a path from near player start to bottom right
        const endX = this.width - 2;
        const endY = this.height - 2;
        
        // Ensure there's a path to bottom right
        this.createPathTo(endX, endY);
        
        // Place exit
        this.maze[endY][endX] = this.EXIT;
      }
    }
  }
  
  /**
   * Creates a direct path to the specified coordinates
   */
  private createPathTo(targetX: number, targetY: number): void {
    let x = this.playerPos.x;
    let y = this.playerPos.y;
    
    // First move horizontally to align with target X
    while (x < targetX) {
      this.maze[y][x] = this.PATH;
      x++;
    }
    
    // Then move vertically to target Y
    while (y < targetY) {
      this.maze[y][x] = this.PATH;
      y++;
    }
  }
  
  /**
   * Handle player movement
   */
  public movePlayer(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    if (this.isGameOver || this.isVictory) return false;
    
    const newPos = { ...this.playerPos };
    
    switch (direction) {
      case 'up':
        newPos.y -= 1;
        break;
      case 'down':
        newPos.y += 1;
        break;
      case 'left':
        newPos.x -= 1;
        break;
      case 'right':
        newPos.x += 1;
        break;
    }
    
    // Check if move is valid
    if (this.isValidMove(newPos)) {
      // Mark the old position as visited if it was a path
      if (this.maze[this.playerPos.y][this.playerPos.x] === this.PATH) {
        this.maze[this.playerPos.y][this.playerPos.x] = this.VISITED_PATH;
      }
      
      this.playerPos = newPos;
      this.checkCollisions();
      this.logEvent('player_move', { 
        direction, 
        position: this.playerPos, 
        level: this.currentLevel,
        success: true 
      });
      return true;
    } else {
      this.message = "Can't move there - that's a wall!";
      this.logEvent('player_move', { 
        direction, 
        position: this.playerPos, 
        level: this.currentLevel,
        success: false, 
        reason: 'wall_collision' 
      });
      return false;
    }
  }
  
  /**
   * Check if a move is valid (not into a wall)
   */
  private isValidMove(pos: { x: number, y: number }): boolean {
    // Check bounds
    if (pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height) {
      return false;
    }
    
    // Check for wall collision
    const cellContent = this.maze[pos.y][pos.x];
    // Allow movement to any non-wall cell
    return cellContent !== this.WALL;
  }
  
  /**
   * Check for collisions with symbols or exit
   */
  private checkCollisions(): void {
    // Check for symbol collection
    for (const [symbol, data] of this.symbols.entries()) {
      if (!data.collected && data.x === this.playerPos.x && data.y === this.playerPos.y) {
        data.collected = true;
        this.collectedSymbols.push(symbol);
        this.message = `Collected symbol: ${symbol}`;
        
        // Enhanced symbol collection log with more detailed information
        this.logEvent('symbol_collected', { 
          symbol, 
          order: this.collectedSymbols.length,
          position: { x: this.playerPos.x, y: this.playerPos.y },
          currentSequence: this.collectedSymbols.join(''),
          timestamp_encoded: this.encodeTimestampForLogs(),
          level: this.currentLevel
        });
        
        // Log special patterns when collecting certain symbols
        if (symbol === '2' && this.currentLevel >= 3) {
          this.logEvent('pattern_emerging', {
            pattern_type: 'symbolic_sequence',
            initial_symbol: symbol,
            potential_matches: ['2517', '2501', '2534'],
            significance: 'HIGH',
            coordinates: `${this.playerPos.x},${this.playerPos.y}`
          });
        }
        
        // Check for special sequence
        this.checkSymbolSequence();
      }
    }
    
    // Check for exit reached
    if (this.maze[this.playerPos.y][this.playerPos.x] === this.EXIT) {
      this.completeLevel();
    }
    
    // Check for secret room (special case in certain levels)
    if (this.currentLevel === 3 && this.playerPos.x === 10 && this.playerPos.y === 10) {
      this.discoverSecretRoom();
    }
    
    // Check for special wall patterns (Level 3 specific)
    if (this.currentLevel === 3) {
      this.checkWallPatterns();
    }
  }
  
  /**
   * Encode timestamp in a special format for log patterns
   */
  private encodeTimestampForLogs(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // Encode as hex for more mysterious logs
    return `0x${parseInt(hours + minutes, 10).toString(16).toUpperCase()}`;
  }
  
  /**
   * Check for special patterns in the wall structure around the player
   */
  private checkWallPatterns(): void {
    // Only trigger this once per game session
    const visitedKey = `wall_pattern_${this.currentLevel}`;
    if (this.gameState.customState[visitedKey]) return;
    
    // Calculate the player's distance from specific points of interest
    const centerDist = Math.abs(this.playerPos.x - 10) + Math.abs(this.playerPos.y - 10);
    
    // When player is close to the center but not exactly at it
    if (centerDist <= 2 && centerDist > 0) {
      this.gameState.customState[visitedKey] = true;
      
      this.logEvent('anomaly_detected', {
        type: 'wall_pattern',
        description: 'Unusual geometric arrangement detected in labyrinth structure',
        coordinates: `${this.playerPos.x},${this.playerPos.y}`,
        analysis: 'Wall patterns contain encoded spatial information',
        significance: 'MEDIUM',
        related_system: 'STARFIELD.EXE coordinate system'
      });
      
      // Don't show a message to keep this subtle
    }
  }
  
  /**
   * Check if collected symbols form a special sequence
   */
  private checkSymbolSequence(): void {
    const sequence = this.collectedSymbols.join('');
    
    // Check for the code "2517"
    if (sequence === "2517") {
      this.logEvent('code_entered', { 
        code: '2517',
        level: this.currentLevel,
        position: { x: this.playerPos.x, y: this.playerPos.y },
        collection_order: this.collectedSymbols.map((s, i) => `${i+1}:${s}`).join(',')
      });
      
      // Add special log for the LogViewer to show pattern analysis
      this.logEvent('pattern_found', {
        pattern: '2517',
        pattern_type: 'numerical_sequence',
        significance: 'HIGH',
        interpretation: 'Coordinates aligned with stellar anomaly',
        connection_points: ['STARFIELD.EXE:memory_sectors', 'TERMINAL:decrypt_command'],
        message: 'Pattern "2517" corresponds to sector coordinates in STARFIELD memory.'
      });
      
      this.message = "SEQUENCE ACCEPTED: Reality fragment detected.";
      
      // This will trigger the clue discovery through the checkForClues method
    }
    // Partial matches for more subtle hints
    else if (sequence.includes("25") || sequence.includes("17")) {
      // Log partial matches but don't show a message to the player
      this.logEvent('partial_sequence_match', {
        current_sequence: sequence,
        partial_match: sequence.includes("25") ? "25" : "17",
        missing_components: sequence.includes("25") ? "1,7" : "2,5",
        significance: 'MEDIUM',
        interpretation: 'Partial coordinate match detected'
      });
    }
    // Track progress toward any meaningful sequences
    else if (sequence.length >= 2) {
      this.logEvent('sequence_progress', {
        current_sequence: sequence,
        length: sequence.length,
        potential_matches: this.getPotentialMatches(sequence),
        significance: 'LOW'
      });
    }
  }
  
  /**
   * Helper to determine potential sequence matches based on current collection
   */
  private getPotentialMatches(currentSequence: string): string[] {
    const potentialMatches = [];
    const targets = ['2517', '2501', '2534', '1725'];
    
    for (const target of targets) {
      let isMatch = true;
      for (let i = 0; i < currentSequence.length; i++) {
        if (currentSequence[i] !== target[i]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        potentialMatches.push(target);
      }
    }
    
    return potentialMatches;
  }
  
  /**
   * Handle discovery of secret room
   */
  private discoverSecretRoom(): void {
    // Basic event log
    this.logEvent('secret_room_found', { 
      room: 'central',
      level: this.currentLevel,
      coordinates: `${this.playerPos.x},${this.playerPos.y}`,
      symbols_collected: this.collectedSymbols.join('')
    });
    
    // Create a visual glitch effect (would be implemented in UI)
    this.message = "You found a hidden room. Strange symbols cover the walls.";
    
    // Add special detailed log for pattern analysis in the LogViewer
    this.logEvent('anomaly_detected', {
      anomaly_type: 'spatial_distortion',
      location: 'central_chamber',
      level: this.currentLevel,
      severity: 'HIGH',
      description: 'Dimensional boundary weakened in central chamber',
      symbols_detected: ['Δ', 'Ω', 'Φ', '⌬'],
      translation: 'AXIS-SHIFT mechanism active',
      connection_points: ['STARFIELD.EXE:navigation_system', 'TERMINAL:reality_parse']
    });
    
    // Add signal received log for pattern analysis
    setTimeout(() => {
      this.logEvent('signal_received', {
        signal_type: 'subspace',
        origin: 'unknown',
        content: 'TRUTH.BEYOND.CODE.2517',
        strength: 'fading',
        interference_pattern: 'scattered',
        recommended_action: 'Cross-reference with STARFIELD coordinates'
      });
      
      this.message = "The walls seem to whisper: \"The truth lies beyond the code.\"";
    }, 2000);
  }
  
  /**
   * Complete current level and move to next
   */
  private completeLevel(): void {
    this.logEvent('level_completed', { 
      level: this.currentLevel, 
      symbolsCollected: this.collectedSymbols.length 
    });
    
    if (this.currentLevel >= this.maxLevel) {
      this.completeGame();
    } else {
      this.currentLevel++;
      this.message = `Level ${this.currentLevel - 1} complete! Moving to level ${this.currentLevel}`;
      this.collectedSymbols = [];
      this.generateMaze();
      this.placeSymbols();
      this.placeExit();
    }
  }
  
  /**
   * Complete the entire game
   */
  private completeGame(): void {
    this.isVictory = true;
    this.message = "Congratulations! You have completed LABYRINTH.EXE";
    this.logEvent('game_completed', { 
      totalLevels: this.maxLevel,
      symbolsCollected: this.symbolOrder.length
    });
  }
  
  /**
   * Render the maze as a string
   */
  public renderMaze(): string[][] {
    // Create a copy of the maze for rendering
    const renderMaze = this.maze.map(row => [...row]);
    
    // Place symbols
    for (const [symbol, data] of this.symbols.entries()) {
      if (!data.collected) {
        renderMaze[data.y][data.x] = symbol;
      }
    }
    
    // Place player
    renderMaze[this.playerPos.y][this.playerPos.x] = this.PLAYER;
    
    return renderMaze;
  }
  
  /**
   * Get the exit position
   */
  public getExitPosition(): {x: number, y: number} | null {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.maze[y][x] === this.EXIT) {
          return {x, y};
        }
      }
    }
    return null;
  }
  
  /**
   * Get game status information
   */
  public getGameStatus(): {
    level: number;
    collectedSymbols: string[];
    message: string;
    isGameOver: boolean;
    isVictory: boolean;
  } {
    return {
      level: this.currentLevel,
      collectedSymbols: this.collectedSymbols,
      message: this.message,
      isGameOver: this.isGameOver,
      isVictory: this.isVictory
    };
  }
  
  /**
   * Check for clues based on game events
   */
  protected checkForClues(event: GameEvent): void {
    // Check for clue triggers based on game events
    if (event.type === 'secret_room_found' && event.data.room === 'central') {
      addDiscoveredClue('labyrinth_hidden_message', event.data);
      
      // Add more detailed information to logs for later analysis
      const enhancedEvent: GameEvent = {
        ...event,
        type: 'anomaly_detected',
        data: {
          ...event.data,
          anomaly_type: 'spatial_distortion',
          resonance_pattern: 'AXIS-SHIFT',
          significance: 'HIGH',
          message: 'Dimensional boundary weakened in central chamber. Reality fragment detected.'
        }
      };
      addGameLog('labyrinth', enhancedEvent);
    }
    
    if (event.type === 'code_entered' && event.data.code === '2517') {
      addDiscoveredClue('labyrinth_reality_fragment', event.data);
      
      // Add enhanced log with pattern information
      const enhancedEvent: GameEvent = {
        ...event,
        type: 'pattern_found',
        data: {
          ...event.data,
          pattern_type: 'numerical_sequence',
          reality_signature: 'CONVERGENT',
          connection_points: ['terminal:decode', 'starfield:coordinates'],
          message: 'Pattern "2517" aligns with coordinates in STARFIELD.EXE memory structure.'
        }
      };
      addGameLog('labyrinth', enhancedEvent);
    }
    
    // Process symbol collection patterns
    if (event.type === 'symbol_collected') {
      const symbolSequence = this.collectedSymbols.join('');
      
      // Check for specific patterns in collected symbols
      if (/[25].*[17]/.test(symbolSequence)) {
        const patternEvent: GameEvent = {
          type: 'pattern_emerging',
          timestamp: Date.now(),
          data: {
            partial_sequence: symbolSequence,
            completion_percentage: Math.min(100, (symbolSequence.length / 4) * 100),
            potential_matches: ['2517', '2717', '2501']
          }
        };
        addGameLog('labyrinth', patternEvent);
      }
    }
    
    // Add special logs for maze structure analysis
    if (event.type === 'level_completed' && event.data.level === 3) {
      const analysisEvent: GameEvent = {
        type: 'structure_analysis',
        timestamp: Date.now(),
        data: {
          level: 3,
          pattern_detected: true,
          pattern_type: 'spatial_encoding',
          visual_signature: 'COORDINATE_MATRIX',
          connections: ['terminal:decrypt', 'starfield:navigation']
        }
      };
      addGameLog('labyrinth', analysisEvent);
    }
    
    // Make sure the event is logged directly to ensure it shows up in logs
    // We're adding it explicitly since some events might be missed by the GameBase logging
    addGameLog('labyrinth', event);
  }
}
