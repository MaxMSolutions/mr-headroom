import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import WindowManager, { Window } from '../engine/windowManager/WindowManager';
import DesktopIcons from './components/DesktopIcons/DesktopIcons';
import Taskbar from './components/Taskbar/Taskbar';
import DesktopMenu from './components/DesktopMenu/DesktopMenu';
import StartMenu from './components/StartMenu/StartMenu';
import GlitchOverlay from './components/GlitchEffects/GlitchOverlay';
import FileSystem from '../engine/fileSystem';
import './Desktop.css';
import './DesktopBackground.css';

// Add type definition for window.windowManager
declare global {
  interface Window {
    windowManager: {
      addWindow: (window: any) => string;
      closeWindow: (id: string) => void;
      minimizeWindow: (id: string) => void;
      maximizeWindow: (id: string) => void;
      bringToFront: (id: string) => void;
      getWindows?: () => any[];
      getActiveWindowId?: () => string | null;
    };
    openApp?: (appName: string, props?: Record<string, any>) => void;
  }
}

interface DesktopProps {
  fileSystem: FileSystem | null;
}

const Desktop: React.FC<DesktopProps> = ({ fileSystem }) => {
  const { 
    currentTheme, 
    setTheme, 
    crtEffect, 
    toggleCrtEffect, 
    accessibilityMode, 
    toggleAccessibilityMode 
  } = useTheme();
  
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [glitchingTime, setGlitchingTime] = useState(false);
  const startButtonRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  // Handle right click on desktop to show context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    // Don't show desktop menu if right-clicking on a desktop icon
    const target = e.target as HTMLElement;
    if (target.closest('.desktop-icon')) {
      return;
    }
    
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowDesktopMenu(true);
    setShowStartMenu(false); // Close start menu if open
  };

  // Toggle start menu
  const toggleStartMenu = () => {
    setShowStartMenu(!showStartMenu);
    setShowDesktopMenu(false); // Close desktop menu if open
  };
  
  // Handle window state changes from WindowManager
  const handleWindowsChange = (updatedWindows: Window[], activeId: string | null) => {
    setWindows(updatedWindows);
    setActiveWindowId(activeId);
  };
  
  // Handle clicking on a window in the taskbar
  const handleTaskbarWindowClick = (id: string) => {
    // Access the window manager API through the global object
    if (window.windowManager) {
      const windowObj = windows.find(w => w.id === id);
      if (windowObj) {
        if (windowObj.isMinimized) {
          window.windowManager.minimizeWindow(id); // Toggle minimize state
        }
        window.windowManager.bringToFront(id);
      }
    }
  };

  // Close menus when clicking elsewhere
  const handleClick = (e: React.MouseEvent) => {
    // Don't close if clicking on start button (handled by toggleStartMenu)
    if (startButtonRef.current && startButtonRef.current.contains(e.target as Node)) {
      return;
    }
    
    if (showDesktopMenu) {
      setShowDesktopMenu(false);
    }
    
    if (showStartMenu) {
      setShowStartMenu(false);
    }
  };

  // Create a global openApp function
  useEffect(() => {
    // Define a function to open applications by name
    const openApp = (appName: string, props: Record<string, any> = {}) => {
      if (window.windowManager) {
        // Handle case-sensitivity by capitalizing first letter
        // This helps convert "guide" to "Guide" to match registry keys
        const normalizedAppName = appName.charAt(0).toUpperCase() + appName.slice(1);
        const appId = `${appName.toLowerCase()}-${Date.now()}`;
        
        // If the app was launched from an executable, use that info for the window title
        const executablePath = props.executablePath;
        const windowTitle = executablePath 
          ? executablePath.split('/').pop()?.replace(/\.exe$/i, '') || appName 
          : appName;
          
        window.windowManager.addWindow({
          id: appId,
          title: windowTitle,
          width: 700,
          height: 500,
          x: 100 + Math.random() * 50,
          y: 100 + Math.random() * 50,
          zIndex: 10,
          isMinimized: false,
          isMaximized: false,
          component: normalizedAppName,
          componentProps: {
            ...props,
            // Don't pass fileSystem to apps that don't need it (like LogViewer)
            fileSystem: normalizedAppName === 'LogViewer' ? undefined : (fileSystem || undefined),
            id: appId
          }
        });
        return appId;
      }
      return null;
    };
    
    // Expose the function globally
    window.openApp = openApp;
    
    // Cleanup
    return () => {
      delete window.openApp;
    };
  }, [fileSystem]);
  
  // For throttling glitch check
  const lastGlitchCheckRef = useRef<number>(0);
  
  // Function to add glitches randomly - improved for less frequency and better timing
  const addRandomGlitch = () => {
    // Only run the check once per second at most
    if (!lastGlitchCheckRef.current || Date.now() - lastGlitchCheckRef.current > 1000) {
      // Much lower chance of glitch - 0.5% chance
      if (Math.random() < 0.005) {
        const desktop = document.querySelector('.desktop');
        if (desktop) {
          desktop.classList.add('glitch');
          setTimeout(() => {
            desktop.classList.remove('glitch');
          }, 350); // Longer duration for the effect
          
          // Occasionally glitch the clock (5% of glitches - but overall much less frequent)
          if (Math.random() < 0.05) {
            setGlitchingTime(true);
            setTimeout(() => setGlitchingTime(false), 2000);
          }
        }
      }
      lastGlitchCheckRef.current = Date.now();
    }
  };

  // Handle icon double-click to open windows/applications
  const handleIconClick = (iconId: string, filePath?: string) => {
    console.log(`DOUBLE CLICK - Opening ${iconId}${filePath ? ` with path ${filePath}` : ''}`);
    
    // Example of adding a glitch effect when clicking certain icons
    if (iconId === 'corrupt' || iconId === 'boundary-test') {
      const desktop = document.querySelector('.desktop');
      if (desktop) {
        desktop.classList.add('glitch');
        setTimeout(() => {
          desktop.classList.remove('glitch');
        }, 300);
      }
    }
    
    // If we have a file path and it ends with .EXE, we can run it with the terminal
    if (filePath && filePath.toUpperCase().endsWith('.EXE')) {
      // For executables, try to use the run command through Terminal
      if (fileSystem) {
        console.log(`Running executable at path: ${filePath}`);
        
        // Extract app name from file path for window title
        const fileName = filePath.split('/').pop() || '';
        const appName = fileName.replace(/\.exe$/i, '');
        
        // Map file names to component names
        let componentName = appName;
        switch(appName.toUpperCase()) {
          case 'TERMINAL': componentName = 'Terminal'; break;
          case 'FILEMANAGER': componentName = 'FileManager'; break;
          case 'TEXTEDITOR': componentName = 'TextEditor'; break;
          case 'SETTINGS': componentName = 'Settings'; break;
          case 'DOOM': componentName = 'Doom'; break;
          case 'WOLF3D': componentName = 'Wolfenstein3D'; break;
          case 'KEEN': case 'KEEN4E': componentName = 'CommanderKeen'; break;
          case 'OREGON': componentName = 'OregonTrail'; break;
          case 'STARFIELD': componentName = 'Starfield'; break;
          case 'LABYRINTH': componentName = 'Labyrinth'; break;
          case 'LOGVIEW': componentName = 'LogViewer'; break;
          case 'REALITY_PROBE': 
          case 'REALITY_PROBE.EXE': 
            // Show error dialog instead of launching RealityProbe
            if (window.windowManager) {
              window.windowManager.addWindow({
                title: 'System Error',
                component: 'ErrorDialog',
                width: 450,
                height: 250,
                componentProps: {
                  errorTitle: 'Reality Boundary Error',
                  errorMessage: 'CRITICAL ERROR: Reality desynchronization detected. Access to this program has been revoked by SYSTEM.',
                  errorCode: 'ERR_REALITY_BREACH'
                }
              });
              return; // Skip the default window creation code
            }
            break;
          case 'NEXUS9': componentName = 'Nexus9'; break;
          case 'GUIDE': componentName = 'Guide'; break;
          case 'PAINT': componentName = 'PaintGame'; break;
          case 'WIN95': componentName = 'Win95Game'; break;
          // Add other mappings as needed
        }
        
        // Use window manager to create the appropriate window
        if (window.windowManager) {
          const windowId = `${componentName.toLowerCase()}-${Date.now()}`;
          window.windowManager.addWindow({
            id: windowId,
            title: appName,
            width: 650,
            height: 500,
            x: 100 + Math.random() * 100,
            y: 100 + Math.random() * 100,
            zIndex: 10,
            isMinimized: false,
            isMaximized: false,
            component: componentName,
            componentProps: {
              fileSystem: fileSystem || undefined,
              executablePath: filePath,
              id: windowId
            }
          });
        }
        return;
      }
    }
    
    // Fallback to legacy handling if no executable path or special cases
    if (window.windowManager) {
      // Map icon IDs to appropriate windows
      switch(iconId) {
        case 'terminal':
          const terminalId = `terminal-${Date.now()}`;
          window.windowManager.addWindow({
            id: terminalId,
            title: 'Terminal',
            width: 600,
            height: 400,
            x: 50 + Math.random() * 50,
            y: 50 + Math.random() * 50,
            zIndex: 10,
            isMinimized: false,
            isMaximized: false,
            component: 'Terminal',
            componentProps: {
              initialCommands: [],
              fileSystem: fileSystem || undefined
            }
          });
          break;
        case 'files':
          window.windowManager.addWindow({
            title: 'File Explorer',
            component: 'FileManager',
            width: 700,
            height: 500,
            x: 100,
            y: 100,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
        case 'notepad':
          window.windowManager.addWindow({
            title: 'Text Editor',
            component: 'TextEditor',
            width: 650,
            height: 450,
            x: 150,
            y: 150,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
          
        case 'settings':
          window.windowManager.addWindow({
            title: 'System Settings',
            component: 'Settings',
            width: 750,
            height: 550,
            x: 200,
            y: 100,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
        case 'doom':
          window.windowManager.addWindow({
            title: 'DOOM',
            component: 'Doom',
            width: 700,
            height: 500,
            x: 180,
            y: 120,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
        case 'wolf3d':
          window.windowManager.addWindow({
            title: 'Wolfenstein 3D',
            component: 'Wolfenstein3D',
            width: 700,
            height: 500,
            x: 150,
            y: 100,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
        case 'keen':
          window.windowManager.addWindow({
            title: 'Commander Keen',
            component: 'CommanderKeen',
            width: 700,
            height: 500,
            x: 200,
            y: 150,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
        case 'oregontrail':
          window.windowManager.addWindow({
            title: 'Oregon Trail',
            component: 'OregonTrail',
            width: 700,
            height: 500,
            x: 220,
            y: 130,
            componentProps: {
              fileSystem: fileSystem || undefined
            }
          });
          break;
        // Add more applications as needed
      }
    }
  };

  // Set data attribute for glitched text and initialize periodic glitches
  useEffect(() => {
    const glitchedTexts = document.querySelectorAll('.glitched-text');
    glitchedTexts.forEach(el => {
      el.setAttribute('data-text', el.textContent || '');
    });
    
    // Set up periodic random glitches instead of on mouse move
    const glitchInterval = setInterval(() => {
      // Random interval between 30-120 seconds
      const randomGlitchChance = Math.random();
      
      // 25% chance of triggering a glitch effect when the interval hits
      if (randomGlitchChance < 0.25) {
        addRandomGlitch();
        
        // Occasionally add a sequence of smaller glitches (10% of glitch events)
        if (randomGlitchChance < 0.025) {
          // Create a small sequence of 2-3 glitches
          const glitchCount = Math.floor(Math.random() * 2) + 2;
          for (let i = 1; i <= glitchCount; i++) {
            setTimeout(() => {
              addRandomGlitch();
            }, i * 800);
          }
        }
      }
    }, 30000 + Math.random() * 90000); // Between 30s and 120s
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div 
      className={`desktop ${currentTheme} ${accessibilityMode ? 'accessibility-mode' : ''}`}
      data-theme={currentTheme}
      onClick={handleClick} 
      onContextMenu={handleContextMenu}
    >
      {/* Retrowave Animated Background */}
      <div className="retrowave-background">
        <div className="stars"></div>
        <div className="sun"></div>
        <div className="grid"></div>
        {crtEffect && (
          <>
            <div className="sky-scanlines"></div>
            <div className="ground-scanlines"></div>
          </>
        )}
      </div>
      
      {/* Desktop Icons */}
      <DesktopIcons 
        onIconClick={(iconId) => {
          setActiveIcon(iconId);
          // Additional single-click behavior can be added here
          console.log(`Icon selected: ${iconId}`);
        }} 
        onIconDoubleClick={handleIconClick} 
      />
      
      {/* Taskbar */}
      <Taskbar 
        showStartMenu={showStartMenu}
        toggleStartMenu={toggleStartMenu}
        isGlitchingTime={glitchingTime}
        startButtonRef={startButtonRef}
        windows={windows}
        activeWindowId={activeWindowId}
        onWindowClick={handleTaskbarWindowClick}
      />

      {/* Start Menu */}
      {showStartMenu && (
        <StartMenu 
          onThemeChange={setTheme}
          onToggleCrtEffect={toggleCrtEffect}
          onToggleAccessibilityMode={toggleAccessibilityMode}
          crtEffect={crtEffect}
          accessibilityMode={accessibilityMode}
        />
      )}
      
      {/* Desktop Context Menu */}
      {showDesktopMenu && (
        <DesktopMenu 
          position={menuPosition}
          onThemeChange={setTheme}
          onToggleCrtEffect={toggleCrtEffect}
          onToggleAccessibilityMode={toggleAccessibilityMode}
          crtEffect={crtEffect}
          accessibilityMode={accessibilityMode}
          onClose={() => setShowDesktopMenu(false)}
          onOpenApp={(appName) => window.openApp?.(appName)}
        />
      )}
      
      {/* Window Manager */}
      <WindowManager 
        initialWindows={[]} 
        fileSystem={fileSystem || undefined}
        onWindowsChange={handleWindowsChange}
      />
      
      {/* Add subtle overlay for glitch effects */}
      <GlitchOverlay />
    </div>
  );
};

export default Desktop;
