/**
 * FileMetadataSystem.ts
 * A system for hiding and discovering clues in file metadata
 */

import { MysteryEngine, ClueId } from './MysteryEngine';
import { addGameLog } from '../save/SaveManager';
import { GameEvent } from '../games/GameBase';

interface FileMetadata {
  timestamp: number;
  author?: string;
  modifiedBy?: string;
  hiddenData?: string;
  relatedClues?: ClueId[];
  accessCount: number;
  tags: string[];
}

/**
 * The FileMetadataSystem handles file metadata attributes that can contain hidden clues.
 * It works alongside the filesystem to add an extra layer of puzzle mechanics.
 */
class FileMetadataSystem {
  private static instance: FileMetadataSystem;
  private fileMetadata: Map<string, FileMetadata> = new Map();
  private discoveredHiddenData: Set<string> = new Set();
  
  private constructor() {
    this.initializeFileMetadata();
    console.log('[FileMetadataSystem] Initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): FileMetadataSystem {
    if (!FileMetadataSystem.instance) {
      FileMetadataSystem.instance = new FileMetadataSystem();
    }
    return FileMetadataSystem.instance;
  }
  
  /**
   * Initialize file metadata for important files
   */
  private initializeFileMetadata(): void {
    // System log with evidence of glitches
    this.fileMetadata.set('/var/log/system.log', {
      timestamp: new Date('2025-07-15T03:42:18').getTime(),
      author: 'system',
      modifiedBy: 'mrheadroom',
      hiddenData: 'REALITY:UNSTABLE',
      relatedClues: ['reality_001'],
      accessCount: 0,
      tags: ['system', 'log', 'critical']
    });
    
    // User file with strange access patterns
    this.fileMetadata.set('/home/user/documents/notes.txt', {
      timestamp: new Date('2025-08-01T23:17:55').getTime(),
      author: 'user',
      modifiedBy: 'unknown',
      hiddenData: 'THE WALLS ARE THIN HERE',
      relatedClues: ['reality_002'],
      accessCount: 0,
      tags: ['personal', 'modified']
    });
    
    // Starfield configuration with coordinates
    this.fileMetadata.set('/etc/apps/starfield/config.json', {
      timestamp: new Date('2025-07-29T02:00:00').getTime(), // During maintenance window
      author: 'system',
      modifiedBy: 'mrheadroom',
      hiddenData: 'COORDS:753,159',
      relatedClues: ['starfield_constellation'],
      accessCount: 0,
      tags: ['configuration', 'starfield', 'modified']
    });
  }
  
  /**
   * Get metadata for a file
   * @param filePath Path to the file
   * @returns Metadata if it exists, undefined otherwise
   */
  public getFileMetadata(filePath: string): FileMetadata | undefined {
    const metadata = this.fileMetadata.get(filePath);
    
    if (metadata) {
      // Increment access count
      metadata.accessCount++;
      
      // Check for special conditions or patterns in access
      this.checkForMetadataPatterns(filePath, metadata);
    }
    
    return metadata;
  }
  
  /**
   * Check for patterns in metadata access that might reveal clues
   * @param filePath Path to the file
   * @param metadata The file's metadata
   */
  private checkForMetadataPatterns(filePath: string, metadata: FileMetadata): void {
    // If this file has hidden data and it hasn't been discovered yet
    if (metadata.hiddenData && !this.discoveredHiddenData.has(filePath)) {
      // Check for conditions that would reveal the hidden data
      // For example, accessing during maintenance window
      const mysteryEngine = MysteryEngine.getInstance();
      const isMaintenanceActive = mysteryEngine.isMaintenanceWindowActive();
      
      // Accessing a system file during maintenance window reveals hidden data
      if (isMaintenanceActive && metadata.tags.includes('system')) {
        this.discoverHiddenData(filePath);
      }
      
      // Accessing a file multiple times might reveal hidden data
      if (metadata.accessCount >= 3) {
        this.discoverHiddenData(filePath);
      }
    }
  }
  
  /**
   * Discover hidden data in a file
   * @param filePath Path to the file
   */
  public discoverHiddenData(filePath: string): void {
    const metadata = this.fileMetadata.get(filePath);
    if (!metadata || !metadata.hiddenData) return;
    
    // Mark as discovered
    this.discoveredHiddenData.add(filePath);
    
    // Log the discovery
    const event: GameEvent = {
      type: 'hidden_data_discovered',
      data: {
        filePath,
        hiddenData: metadata.hiddenData,
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now()
    };
    
    addGameLog('mystery', event);
    
    // If there are related clues, discover them
    if (metadata.relatedClues && metadata.relatedClues.length > 0) {
      const mysteryEngine = MysteryEngine.getInstance();
      metadata.relatedClues.forEach(clueId => {
        mysteryEngine.discoverClue(clueId);
      });
    }
    
    console.log(`[FileMetadataSystem] Discovered hidden data in ${filePath}: ${metadata.hiddenData}`);
  }
  
  /**
   * Check if a file has discovered hidden data
   * @param filePath Path to the file
   */
  public hasDiscoveredHiddenData(filePath: string): boolean {
    return this.discoveredHiddenData.has(filePath);
  }
  
  /**
   * Get all files with hidden data
   */
  public getFilesWithHiddenData(): string[] {
    return Array.from(this.fileMetadata.entries())
      .filter(([_, metadata]) => metadata.hiddenData !== undefined)
      .map(([filePath, _]) => filePath);
  }
  
  /**
   * Get all discovered hidden data
   */
  public getAllDiscoveredHiddenData(): Map<string, string> {
    const result = new Map<string, string>();
    
    this.discoveredHiddenData.forEach(filePath => {
      const metadata = this.fileMetadata.get(filePath);
      if (metadata && metadata.hiddenData) {
        result.set(filePath, metadata.hiddenData);
      }
    });
    
    return result;
  }
}

export { FileMetadataSystem, type FileMetadata };
export default FileMetadataSystem.getInstance();
