import React, { useState, useEffect, useCallback } from 'react';
import './WindowManager.css';
import { renderApp } from '../../apps/registry';
import FileSystem from '../fileSystem';

// Define the global windowManager type
declare global {
  interface Window {
    windowManager: {
      addWindow: (window: any) => string;
      closeWindow: (id: string) => void;
      minimizeWindow: (id: string) => void;
      maximizeWindow: (id: string) => void;
      bringToFront: (id: string) => void;
      getWindows: () => any[];
      getActiveWindowId: () => string | null;
    };
  }
}

export interface Window {
  id: string;
  title: string;
  content?: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  component?: string;
  componentProps?: Record<string, any>;
  icon?: string; // Icon to display in taskbar
}

interface WindowManagerProps {
  initialWindows?: Window[];
  fileSystem?: FileSystem;
  onWindowsChange?: (windows: Window[], activeWindowId: string | null) => void;
}

const WindowManager: React.FC<WindowManagerProps> = ({ 
  initialWindows = [],
  fileSystem,
  onWindowsChange 
}) => {
  const [windows, setWindows] = useState<Window[]>(initialWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windowAnimations, setWindowAnimations] = useState<{[id: string]: string}>({});
  const [glitchingWindowIds, setGlitchingWindowIds] = useState<{[id: string]: boolean}>({});
  const [dragInfo, setDragInfo] = useState<{
    isDragging: boolean;
    windowId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    isDragging: false,
    windowId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const [resizeInfo, setResizeInfo] = useState<{
    isResizing: boolean;
    windowId: string | null;
    direction: string | null;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  }>({
    isResizing: false,
    windowId: null,
    direction: null,
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
  });

  // Function to bring a window to the front
  const bringToFront = useCallback((id: string) => {
    setWindows(prev => {
      // Find the highest z-index
      const highestZ = Math.max(...prev.map(w => w.zIndex), 0);
      
      return prev.map(window => {
        if (window.id === id) {
          return { ...window, zIndex: highestZ + 1 };
        }
        return window;
      });
    });
    
    setActiveWindowId(id);
  }, []);

  // Handle window activation
  const activateWindow = useCallback((id: string) => {
    bringToFront(id);
  }, [bringToFront]);

  // Start dragging a window
  const startDrag = useCallback((e: React.MouseEvent, id: string) => {
    const window = windows.find(w => w.id === id);
    if (!window || window.isMaximized) return;
    
    e.preventDefault();
    bringToFront(id);
    
    setDragInfo({
      isDragging: true,
      windowId: id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: window.x,
      initialY: window.y,
    });
  }, [windows, bringToFront]);

  // Handle dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Handle window dragging
    if (dragInfo.isDragging && dragInfo.windowId) {
      const deltaX = e.clientX - dragInfo.startX;
      const deltaY = e.clientY - dragInfo.startY;
      
      setWindows(prev => 
        prev.map(window => {
          if (window.id === dragInfo.windowId) {
            return {
              ...window,
              x: dragInfo.initialX + deltaX,
              y: dragInfo.initialY + deltaY,
            };
          }
          return window;
        })
      );
    }
    
    // Handle window resizing
    if (resizeInfo.isResizing && resizeInfo.windowId) {
      const deltaX = e.clientX - resizeInfo.startX;
      const deltaY = e.clientY - resizeInfo.startY;
      
      setWindows(prev => 
        prev.map(window => {
          if (window.id === resizeInfo.windowId) {
            let newWidth = window.width;
            let newHeight = window.height;
            
            // Apply width/height changes based on resize direction
            if (resizeInfo.direction?.includes('e')) {
              newWidth = Math.max(300, resizeInfo.initialWidth + deltaX);
            }
            if (resizeInfo.direction?.includes('s')) {
              newHeight = Math.max(200, resizeInfo.initialHeight + deltaY);
            }
            
            return {
              ...window,
              width: newWidth,
              height: newHeight,
            };
          }
          return window;
        })
      );
    }
  }, [dragInfo, resizeInfo]);

  // End dragging/resizing
  const handleMouseUp = useCallback(() => {
    setDragInfo({
      isDragging: false,
      windowId: null,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0,
    });
    
    setResizeInfo({
      isResizing: false,
      windowId: null,
      direction: null,
      startX: 0,
      startY: 0,
      initialWidth: 0,
      initialHeight: 0,
    });
  }, []);

  // Start resizing a window
  const startResize = useCallback((e: React.MouseEvent, id: string, direction: string) => {
    const window = windows.find(w => w.id === id);
    if (!window || window.isMaximized) return;
    
    e.preventDefault();
    bringToFront(id);
    
    setResizeInfo({
      isResizing: true,
      windowId: id,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: window.width,
      initialHeight: window.height,
    });
  }, [windows, bringToFront]);
  
  // Add random glitch effects to windows occasionally
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // Small chance of random glitch effect on windows
      if (windows.length > 0 && Math.random() < 0.01) {
        const randomWindowIndex = Math.floor(Math.random() * windows.length);
        const windowId = windows[randomWindowIndex].id;
        
        setGlitchingWindowIds(prev => ({
          ...prev,
          [windowId]: true
        }));
        
        // Remove the glitch effect after a short time
        setTimeout(() => {
          setGlitchingWindowIds(prev => ({
            ...prev,
            [windowId]: false
          }));
        }, 300);
      }
    }, 10000);
    
    return () => clearInterval(glitchInterval);
  }, [windows]);

  // Trigger a glitch effect on a specific window
  /* Unused function but may be needed later
  const triggerGlitchEffect = useCallback((windowId: string) => {
    setGlitchingWindowIds(prev => ({
      ...prev,
      [windowId]: true
    }));
    
    setTimeout(() => {
      setGlitchingWindowIds(prev => ({
        ...prev,
        [windowId]: false
      }));
    }, 300);
  }, []);
  */

  // Add window
  const addWindow = useCallback((window: Partial<Window>) => {
    const highestZ = Math.max(...windows.map(w => w.zIndex), 0);
    
    const newWindow: Window = {
      id: `window-${Date.now()}`,
      title: window.title || 'Untitled',
      content: window.content || null,
      x: window.x || 50,
      y: window.y || 50,
      width: window.width || 400,
      height: window.height || 300,
      zIndex: highestZ + 1,
      isMinimized: false,
      isMaximized: false,
      component: window.component,
      componentProps: {
        ...window.componentProps,
        fileSystem,
        id: `window-${Date.now()}`
      },
      icon: window.icon || '⊞', // Default icon if none provided
    };
    
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    
    return newWindow.id;
  }, [windows]);

  // Close window
  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id));
    
    if (activeWindowId === id) {
      // Set the window with the highest z-index as active
      const remainingWindows = windows.filter(window => window.id !== id);
      if (remainingWindows.length > 0) {
        const highestZWindow = remainingWindows.reduce((prev, current) => 
          prev.zIndex > current.zIndex ? prev : current
        );
        setActiveWindowId(highestZWindow.id);
      } else {
        setActiveWindowId(null);
      }
    }
  }, [windows, activeWindowId]);

  // Toggle minimize
  const toggleMinimize = useCallback((id: string) => {
    const window = windows.find(w => w.id === id);
    if (!window) return;
    
    if (!window.isMinimized) {
      // Start minimizing animation
      setWindowAnimations(prev => ({ ...prev, [id]: 'minimizing' }));
      
      // After animation completes, actually minimize the window
      setTimeout(() => {
        setWindows(prev => 
          prev.map(window => {
            if (window.id === id) {
              return { ...window, isMinimized: true };
            }
            return window;
          })
        );
        // Clear animation state
        setWindowAnimations(prev => {
          const newAnimations = { ...prev };
          delete newAnimations[id];
          return newAnimations;
        });
      }, 200); // Match the animation duration in CSS
    } else {
      // Simply show the window again
      setWindows(prev => 
        prev.map(window => {
          if (window.id === id) {
            return { ...window, isMinimized: false };
          }
          return window;
        })
      );
    }
  }, [windows]);

  // Toggle maximize
  const toggleMaximize = useCallback((id: string) => {
    const window = windows.find(w => w.id === id);
    if (!window) return;
    
    if (!window.isMaximized) {
      // Start maximizing animation
      setWindowAnimations(prev => ({ ...prev, [id]: 'maximizing' }));
    }
    
    setWindows(prev => 
      prev.map(window => {
        if (window.id === id) {
          return { ...window, isMaximized: !window.isMaximized };
        }
        return window;
      })
    );
    
    // Clear animation state after animation completes
    setTimeout(() => {
      setWindowAnimations(prev => {
        const newAnimations = { ...prev };
        delete newAnimations[id];
        return newAnimations;
      });
    }, 200); // Match the animation duration in CSS
  }, [windows]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Export the window management API to the global context
  useEffect(() => {
    // @ts-ignore
    window.windowManager = {
      addWindow,
      closeWindow,
      minimizeWindow: toggleMinimize,
      maximizeWindow: toggleMaximize,
      bringToFront,
      getWindows: () => windows,
      getActiveWindowId: () => activeWindowId,
    };
  }, [addWindow, closeWindow, toggleMinimize, toggleMaximize, bringToFront, windows, activeWindowId]);
  
  // Notify parent components about window changes
  useEffect(() => {
    if (onWindowsChange) {
      onWindowsChange(windows, activeWindowId);
    }
  }, [windows, activeWindowId, onWindowsChange]);

  // Render window content
  const renderWindowContent = (windowObj: Window) => {
    if (windowObj.content) {
      return windowObj.content;
    }
    
    if (windowObj.component) {
      // Special handling for components that don't need fileSystem
      if (windowObj.component === 'LogViewer') {
        // For LogViewer, only pass id and onClose, not fileSystem
        return renderApp(windowObj.component, {
          id: windowObj.id,
          onClose: () => closeWindow(windowObj.id)
        });
      }
      
      // Normal case for other components
      return renderApp(windowObj.component, {
        ...windowObj.componentProps,
        id: windowObj.id,
        onClose: () => closeWindow(windowObj.id)
      });
    }
    
    return <div className="empty-window">No content</div>;
  };

  return (
    <div className="window-manager">
      {windows
        .filter(window => !window.isMinimized)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((window) => (
          <div
            key={window.id}
            className={`window 
              ${window.id === activeWindowId ? 'active' : ''} 
              ${window.isMaximized ? 'maximized' : ''} 
              ${windowAnimations[window.id] || ''} 
              ${glitchingWindowIds[window.id] ? 'glitching' : ''}
            `}
            tabIndex={0}
            onClick={() => activateWindow(window.id)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeWindow(window.id);
            }}
            style={{
              left: window.isMaximized ? 0 : `${window.x}px`,
              top: window.isMaximized ? 0 : `${window.y}px`,
              width: window.isMaximized ? '100%' : `${window.width}px`,
              height: window.isMaximized ? 'calc(100% - var(--taskbar-height))' : `${window.height}px`,
              zIndex: window.zIndex,
            }}
          >
            <div 
              className="window-titlebar"
              onMouseDown={(e) => startDrag(e, window.id)}
            >
              <div className="window-title">{window.title}</div>
              <div className="window-controls">
                <button className="window-button minimize" onClick={() => toggleMinimize(window.id)}>_</button>
                <button className="window-button maximize" onClick={() => toggleMaximize(window.id)}>□</button>
                <button className="window-button close" onClick={() => closeWindow(window.id)}>×</button>
              </div>
            </div>
            
            <div className="window-content">
              {renderWindowContent(window)}
            </div>
            
            {/* Resize handles */}
            {!window.isMaximized && (
              <>
                <div 
                  className="resize-handle resize-e"
                  onMouseDown={(e) => startResize(e, window.id, 'e')}
                />
                <div 
                  className="resize-handle resize-s"
                  onMouseDown={(e) => startResize(e, window.id, 's')}
                />
                <div 
                  className="resize-handle resize-se"
                  onMouseDown={(e) => startResize(e, window.id, 'se')}
                />
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default WindowManager;
