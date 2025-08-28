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
  { id: 'fileSystem', type: 'json' as const, url: '/src/data/filesystem/fileSystem.json' },
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
            const fs = new FileSystem(fileSystemData);
            setFileSystem(fs);
          } catch (error) {
            console.error('Failed to initialize file system with loaded data:', error);
            loadFileSystemFromUrl();
          }
        } else {
          loadFileSystemFromUrl();
        }
      }
    }
  );
  
  // Helper function to load file system from URL
  const loadFileSystemFromUrl = () => {
    const fs = new FileSystem();
    fs.loadFromUrl('/src/data/filesystem/fileSystem.json')
      .then(() => {
        setFileSystem(fs);
      })
      .catch(error => {
        console.error('Failed to load file system:', error);
      });
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
