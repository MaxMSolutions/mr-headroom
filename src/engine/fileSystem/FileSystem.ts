import { useState, useEffect } from 'react';

// Define the interfaces for file system objects
export interface FileAttributes {
  hidden: boolean;
  system: boolean;
  readonly: boolean;
  [key: string]: any; // Allow additional custom attributes
}

export interface FileSystemObject {
  type: 'file' | 'directory';
  name: string;
  created: string; // ISO date string
  modified: string; // ISO date string
  attributes: FileAttributes;
  content?: string; // For files only
  contentType?: string; // MIME type for files
  size?: number; // Size in bytes for files
  tags?: string[]; // Optional tags for metadata
}

export interface Directory extends FileSystemObject {
  type: 'directory';
  children: (File | Directory)[];
}

export interface File extends FileSystemObject {
  type: 'file';
  content?: string;
}

export interface FileSystemData {
  version: string;
  fileSystem: Directory;
}

// Path utilities
export const joinPath = (basePath: string, relativePath: string): string => {
  if (!basePath || basePath === '/') {
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }
  return `${basePath}${basePath.endsWith('/') ? '' : '/'}${relativePath.startsWith('/') ? relativePath.slice(1) : relativePath}`;
};

export const getParentPath = (path: string): string => {
  const parts = path.split('/').filter(p => p);
  if (parts.length === 0) return '/';
  parts.pop();
  return `/${parts.join('/')}`;
};

export const getPathParts = (path: string): string[] => {
  return path.split('/').filter(p => p);
};

export const getFileName = (path: string): string => {
  const parts = path.split('/').filter(p => p);
  return parts.length > 0 ? parts[parts.length - 1] : '';
};

// FileSystem class
export class FileSystem {
  private data: FileSystemData | null = null;
  private loadPromise: Promise<FileSystemData> | null = null;
  
  constructor(initialData?: FileSystemData) {
    if (initialData) {
      this.data = initialData;
    }
  }

  // Load file system from JSON
  async loadFromUrl(url: string): Promise<FileSystemData> {
    if (this.loadPromise) return this.loadPromise;
    
    this.loadPromise = fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load file system from ${url}`);
        }
        return response.json();
      })
      .then((data: FileSystemData) => {
        this.data = data;
        return data;
      });
    
    return this.loadPromise;
  }
  
  // Load file system from localStorage
  loadFromLocalStorage(key: string = 'fileSystem'): FileSystemData | null {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return null;
      
      const parsedData = JSON.parse(storedData) as FileSystemData;
      this.data = parsedData;
      return parsedData;
    } catch (error) {
      console.error('Failed to load file system from localStorage:', error);
      return null;
    }
  }
  
  // Save file system to localStorage
  saveToLocalStorage(key: string = 'fileSystem'): boolean {
    if (!this.data) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('Failed to save file system to localStorage:', error);
      return false;
    }
  }
  
  // Get file or directory by path
  getItem(path: string): FileSystemObject | null {
    if (!this.data) {
      console.warn(`[FileSystem] No data loaded when accessing path: ${path}`);
      return null;
    }
    
    if (path === '/') return this.data.fileSystem;
    
    const parts = getPathParts(path);
    let current: FileSystemObject = this.data.fileSystem;
    
    for (const part of parts) {
      if (!current || current.type !== 'directory') {
        console.warn(`[FileSystem] Path component ${part} in ${path} is not a directory`);
        return null;
      }
      
      const found = (current as Directory).children.find(child => child.name === part);
      if (!found) {
        console.warn(`[FileSystem] Path component ${part} not found in ${path}`);
        return null;
      }
      
      current = found;
    }
    
    return current;
  }
  
  // List contents of a directory
  listDirectory(path: string): FileSystemObject[] | null {
    try {
      if (!this.data) {
        console.warn(`[FileSystem] Attempting to list directory ${path} but file system is not loaded`);
        return null;
      }
      
      const dir = this.getItem(path);
      if (!dir) {
        console.warn(`[FileSystem] Directory not found: ${path}`);
        return null;
      }
      
      if (dir.type !== 'directory') {
        console.warn(`[FileSystem] Path is not a directory: ${path}`);
        return null;
      }
      
      return (dir as Directory).children;
    } catch (error) {
      console.error(`Error listing directory: ${path}`, error);
      return null;
    }
  }
  
  // Check if a path exists
  exists(path: string): boolean {
    return this.getItem(path) !== null;
  }
  
  // Read file content
  readFile(path: string): string | null {
    const file = this.getItem(path) as File;
    if (!file || file.type !== 'file') return null;
    
    // Log file access for mystery tracking
    this.logFileAccess(path, file);
    
    return file.content || '';
  }
  
  // Log file access for mystery tracking
  private logFileAccess(path: string, file: File): void {
    try {
      // Skip logging for certain file types or paths that don't need tracking
      if (path.includes('.css') || path.includes('.js') || path.includes('/assets/')) {
        return; // Don't track system files
      }
      
      // Get MysteryEngine instance without requiring it (to avoid browser issues with require)
      // @ts-ignore - Accessing global registry for MysteryEngine instance
      const mysteryEngine = window.__MYSTERY_ENGINE__;
      
      // Skip logging if mystery engine isn't available yet
      if (!mysteryEngine) {
        // This is normal during initial boot when mystery engine isn't initialized yet
        return;
      }
      
      // Create a file read event
      const fileReadEvent = {
        type: 'file_read',
        path,
        filename: file.name,
        timestamp: new Date().toISOString(),
        metadata: {
          ...file.attributes,
          created: file.created,
          modified: file.modified,
          size: file.size
        }
      };
      
      // Log the event to the mystery engine
      if (typeof mysteryEngine.trackEvent === 'function') {
        mysteryEngine.trackEvent(fileReadEvent);
        // Enhanced logging for debugging
        console.log(`[FileSystem] File read logged: ${path}`);
      }
    } catch (error) {
      // Silence the error in production or log it discreetly
      // This prevents cluttering the console with non-critical errors
      if (process.env.NODE_ENV === 'development') {
        console.debug('[FileSystem] File tracking skipped:', path);
      }
    }
  }
  
  // Write file content
  writeFile(path: string, content: string): boolean {
    if (!this.data) return false;
    
    const fileName = getFileName(path);
    const parentPath = getParentPath(path);
    const parent = this.getItem(parentPath) as Directory;
    
    if (!parent || parent.type !== 'directory') return false;
    
    // Check if file exists
    const existingFile = parent.children.find(
      child => child.name === fileName && child.type === 'file'
    ) as File | undefined;
    
    if (existingFile) {
      // Update existing file
      existingFile.content = content;
      existingFile.modified = new Date().toISOString();
      existingFile.size = content.length;
    } else {
      // Create new file
      const newFile: File = {
        type: 'file',
        name: fileName,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        attributes: { hidden: false, system: false, readonly: false },
        content,
        size: content.length,
      };
      
      parent.children.push(newFile);
    }
    
    return true;
  }
  
  // Create directory
  createDirectory(path: string): boolean {
    if (!this.data) return false;
    
    const dirName = getFileName(path);
    const parentPath = getParentPath(path);
    const parent = this.getItem(parentPath) as Directory;
    
    if (!parent || parent.type !== 'directory') return false;
    
    // Check if directory exists
    if (parent.children.some(child => child.name === dirName && child.type === 'directory')) {
      return false; // Directory already exists
    }
    
    // Create new directory
    const newDir: Directory = {
      type: 'directory',
      name: dirName,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      attributes: { hidden: false, system: false, readonly: false },
      children: [],
    };
    
    parent.children.push(newDir);
    return true;
  }
  
  // Delete file or directory
  deleteItem(path: string): boolean {
    if (!this.data) return false;
    
    const itemName = getFileName(path);
    const parentPath = getParentPath(path);
    const parent = this.getItem(parentPath) as Directory;
    
    if (!parent || parent.type !== 'directory') return false;
    
    const itemIndex = parent.children.findIndex(child => child.name === itemName);
    if (itemIndex === -1) return false;
    
    parent.children.splice(itemIndex, 1);
    return true;
  }
  
  // Search files by name or content
  searchFiles(query: string, options: { 
    matchContent?: boolean;
    caseSensitive?: boolean;
    path?: string;
  } = {}): FileSystemObject[] {
    if (!this.data) return [];
    
    const results: FileSystemObject[] = [];
    const searchPath = options.path || '/';
    const startDir = this.getItem(searchPath) as Directory;
    
    if (!startDir || startDir.type !== 'directory') return [];
    
    const search = options.caseSensitive ? query : query.toLowerCase();
    
    const traverseDirectory = (dir: Directory, currentPath: string) => {
      for (const item of dir.children) {
        const itemPath = joinPath(currentPath, item.name);
        
        // Match name
        const itemName = options.caseSensitive ? item.name : item.name.toLowerCase();
        if (itemName.includes(search)) {
          results.push({ ...item, path: itemPath });
        }
        
        // Match content for files
        if (options.matchContent && item.type === 'file') {
          const content = (item as File).content;
          if (content) {
            const fileContent = options.caseSensitive ? content : content.toLowerCase();
            if (fileContent.includes(search)) {
              results.push({ ...item, path: itemPath });
            }
          }
        }
        
        // Recurse into directories
        if (item.type === 'directory') {
          traverseDirectory(item as Directory, itemPath);
        }
      }
    };
    
    traverseDirectory(startDir, searchPath);
    return results;
  }
  
  // Get metadata for a file
  getMetadata(path: string): Partial<FileSystemObject> | null {
    const item = this.getItem(path);
    if (!item) return null;
    
    // Return everything except content to avoid large data transfer
    const { content, ...metadata } = item;
    return metadata;
  }
  
  // Export file system as JSON
  export(): FileSystemData | null {
    return this.data;
  }
}

// React hook for using FileSystem
export const useFileSystem = (initialFileSystemUrl?: string) => {
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fileSystem = new FileSystem();
    
    const loadFs = async () => {
      try {
        // Try to load from localStorage first
        let data = fileSystem.loadFromLocalStorage();
        
        // If not in localStorage and URL provided, load from URL
        if (!data && initialFileSystemUrl) {
          data = await fileSystem.loadFromUrl(initialFileSystemUrl);
        }
        
        setFs(fileSystem);
        setLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
      }
    };
    
    loadFs();
    
    return () => {
      // Save to localStorage when component unmounts
      if (fs) {
        fs.saveToLocalStorage();
      }
    };
  }, [initialFileSystemUrl]);
  
  return { fs, loading, error };
};

export default FileSystem;
