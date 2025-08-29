import { useState, useEffect } from 'react';
import BootSequence from './engine/boot/BootSequence';
import Desktop from './ui/Desktop';
import { ThemeProvider } from './ui/ThemeContext';
import useAssetLoader from './engine/assetLoader';
import FileSystem, { FileSystemData } from './engine/fileSystem';
import { getGameState, addGameLog } from './engine/save/SaveManager';
import { MysteryEngine } from './engine/mystery/MysteryEngine';

// List of essential assets to preload
const essentialAssets = [
  { id: 'fileSystem', type: 'json' as const, url: '/data/filesystem/fileSystem.json' },
  // Add other essential assets here (core images, sound effects, etc.)
];

const App = () => {
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootMode, setBootMode] = useState<'normal' | 'verbose' | 'fast'>('normal');
  const [assetsReady, setAssetsReady] = useState(false);
  const [fileSystem, setFileSystem] = useState<FileSystem | null>(null);
  
  // Load essential assets
  const { assets } = useAssetLoader(
    essentialAssets,
    {
      preload: true,
      onProgress: (progress) => {
        // Asset loading contributes to 30% of boot progress
        setBootProgress(Math.min(30, progress * 0.3));
      },
      onComplete: () => {
        setAssetsReady(true);
        // Initialize file system with loaded data
        if (assets && assets.fileSystem) {
          try {
            const fileSystemData = assets.fileSystem as unknown as FileSystemData;
            
            // Validate that the fileSystemData has the expected structure
            if (!fileSystemData.fileSystem || fileSystemData.fileSystem.type !== 'directory') {
              console.error('Invalid file system data format:', fileSystemData);
              loadFileSystemFromUrl();
              return;
            }
            
            // Create filesystem instance
            const fs = new FileSystem(fileSystemData);
            
            // Verify key paths exist
            const requiredPaths = ['/home', '/system'];
            const missingPaths = requiredPaths.filter(path => !fs.exists(path));
            
            if (missingPaths.length > 0) {
              console.error('File system is missing required paths:', missingPaths);
              console.warn('Will try loading from URL instead');
              loadFileSystemFromUrl();
              return;
            }
            
            setFileSystem(fs);
            console.log('File system successfully initialized from preloaded data');
          } catch (error) {
            console.error('Failed to initialize file system with loaded data:', error);
            loadFileSystemFromUrl();
          }
        } else {
          console.warn('File system data not found in assets, loading from URL');
          loadFileSystemFromUrl();
        }
      }
    }
  );
  
  // Helper function to load file system from URL
  const loadFileSystemFromUrl = () => {
    const fs = new FileSystem();
    console.log('Loading file system from URL: /data/filesystem/fileSystem.json');
    
    fs.loadFromUrl('/data/filesystem/fileSystem.json')
      .then((data) => {
        // Validate file system data
        if (!data.fileSystem || data.fileSystem.type !== 'directory') {
          console.error('Invalid file system data format loaded from URL:', data);
          tryLocalFallback();
          return;
        }
        
        // Verify key paths exist
        const requiredPaths = ['/home', '/system'];
        const missingPaths = requiredPaths.filter(path => !fs.exists(path));
        
        if (missingPaths.length > 0) {
          console.error('File system loaded from URL is missing required paths:', missingPaths);
          tryLocalFallback();
          return;
        }
        
        console.log('File system successfully loaded from URL');
        setFileSystem(fs);
      })
      .catch(error => {
        console.error('Failed to load file system from URL:', error);
        tryLocalFallback();
      });
  };
  
  // Try to load from localStorage as a last resort
  const tryLocalFallback = () => {
    const fs = new FileSystem();
    const loaded = fs.loadFromLocalStorage();
    
    if (loaded) {
      console.log('Successfully loaded file system from localStorage');
      setFileSystem(fs);
    } else {
      console.error('CRITICAL: Failed to load file system from any source');
      // Create a minimal valid file system as last resort
      const minimalFileSystem: FileSystemData = {
        version: '1.0',
        fileSystem: {
          type: 'directory',
          name: 'root',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          attributes: { hidden: false, system: true, readonly: true },
          children: [
            {
              type: 'directory',
              name: 'home',
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              attributes: { hidden: false, system: false, readonly: false },
              children: []
            },
            {
              type: 'directory',
              name: 'system',
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              attributes: { hidden: false, system: true, readonly: true },
              children: []
            }
          ]
        }
      };
      
      const backupFs = new FileSystem(minimalFileSystem);
      setFileSystem(backupFs);
    }
  };

  // Initialize SaveManager to ensure game state is properly loaded
  useEffect(() => {
    // Initialize the SaveManager by calling getGameState()
    // This ensures the SaveManager singleton is created and loads any existing data
    const gameState = getGameState();
    console.log('SaveManager initialized with game state:', gameState);
    
    // Initialize MysteryEngine and make it available globally
    const mysteryInstance = MysteryEngine.getInstance();
    // @ts-ignore - Register MysteryEngine globally for component access
    window.__MYSTERY_ENGINE__ = mysteryInstance;
    console.log('MysteryEngine initialized and registered globally');
    
    // Generate a unique user thumbprint
    const generateThumbprint = () => {
      const navigator = window.navigator;
      const screen = window.screen;
      
      // Collect browser and system information to create a unique identifier
      const thumbprintData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        timezone: new Date().getTimezoneOffset(),
        sessionId: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString()
      };
      
      // Create a simplified hash of the data
      const hashString = JSON.stringify(thumbprintData);
      let hash = 0;
      for (let i = 0; i < hashString.length; i++) {
        const char = hashString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return {
        id: Math.abs(hash).toString(16),
        details: thumbprintData
      };
    };
    
    // Create a user thumbprint log
    const thumbprint = generateThumbprint();
    
    // Add the log to the system
    addGameLog('system', {
      type: 'user_access',
      data: {
        message: 'User system access recorded',
        thumbprintId: thumbprint.id,
        details: thumbprint.details
      },
      timestamp: Date.now()
    });
    
    // Also add a system initialization log
    addGameLog('system', {
      type: 'system_init',
      data: { 
        message: 'System initialized successfully', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      },
      timestamp: Date.now()
    });
  }, []);

  useEffect(() => {
    // Determine boot mode based on any saved preference or random glitches
    // For now, we'll just use normal
    const savedBootMode = localStorage.getItem('bootMode');
    if (savedBootMode && ['normal', 'verbose', 'fast'].includes(savedBootMode)) {
      setBootMode(savedBootMode as 'normal' | 'verbose' | 'fast');
    }
    
    // Add small random chance for verbose mode (easter egg)
    if (Math.random() < 0.05) { // 5% chance
      setBootMode('verbose');
    }
    
    // Begin boot sequence once assets are ready
    if (assetsReady) {
      // The rest of boot progress (30% to 100%)
      const bootDuration = bootMode === 'fast' ? 3000 : bootMode === 'verbose' ? 8000 : 5000;
      const increment = (70 / (bootDuration / 100)); // How much to increment every 100ms
      
      const progressInterval = setInterval(() => {
        setBootProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => setBooting(false), 500); // Short pause at 100%
            return 100;
          }
          return Math.min(100, prev + increment);
        });
      }, 100);

      return () => {
        clearInterval(progressInterval);
      };
    }
  }, [assetsReady, bootMode]);

  return (
    <ThemeProvider>
      {booting ? (
        <BootSequence 
          progress={bootProgress} 
          mode={bootMode}
          onComplete={() => setBooting(false)}
        />
      ) : (
        <Desktop fileSystem={fileSystem} />
      )}
    </ThemeProvider>
  );
};

export default App;
