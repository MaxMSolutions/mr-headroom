
import React, { useState, useEffect } from 'react';
import './FileManager.css';
import FileSystem, { FileSystemObject, File, Directory, joinPath, getParentPath } from '../../engine/fileSystem';
import {
  FileManagerToolbar,
  FileManagerSidebar,
  FileManagerPathDisplay,
  FileManagerItemList,
  FileManagerStatusBar,
  FileManagerContextMenu,
  formatFileSize,
  formatDate
} from './components';

interface FileManagerWindowProps {
  id: string;
  title?: string;
  fileSystem?: FileSystem;
  initialPath?: string;
  onClose?: () => void;
}

const FileManagerWindow: React.FC<FileManagerWindowProps> = ({
  id, // Used for window manager identification
  title = 'File Explorer', // Used in window title
  fileSystem,
  initialPath = '/',
  onClose // Called when the window is closed
}) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [directoryContent, setDirectoryContent] = useState<FileSystemObject[]>([]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState<string | null>(null);
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');

  // Load directory content when path changes
  useEffect(() => {
    if (!fileSystem) {
      console.log('[FileManagerWindow] FileSystem is undefined, showing empty directory');
      setDirectoryContent([]);
      setStatusMessage('FileSystem not available');
      return;
    }
    
    try {
      // First check if the path exists and fallback to root if not
      const pathExists = fileSystem.exists(currentPath);
      
      if (!pathExists) {
        console.warn(`[FileManagerWindow] Path does not exist: ${currentPath}, falling back to /`);
        setCurrentPath('/');
        setStatusMessage(`Directory not found: ${currentPath}, showing root`);
        return;
      }
      
      const content = fileSystem.listDirectory(currentPath);
      if (content) {
        setDirectoryContent(content);
        setStatusMessage(`${content.length} items`);
      } else {
        console.warn(`[FileManagerWindow] Failed to list directory: ${currentPath}`);
        setDirectoryContent([]);
        setStatusMessage('Directory not found or access denied');
      }
    } catch (error) {
      console.error('[FileManagerWindow] Error listing directory:', error);
      setDirectoryContent([]);
      setStatusMessage('Error loading directory');
    }
  }, [fileSystem, currentPath]);

  // Handle navigation
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedItem(null);
    setStatusMessage('Loading...');
  };

  // Handle item click
  const handleItemClick = (item: FileSystemObject) => {
    setSelectedItem(item.name);
  };

  // Handle item double click
  const handleItemDoubleClick = (item: FileSystemObject) => {
    if (item.type === 'directory') {
      navigateTo(joinPath(currentPath, item.name));
    } else {
      handleOpenFile(item);
    }
  };

  // Handle open file
  const handleOpenFile = (file: FileSystemObject) => {
    if (file.type !== 'file') return;
    
    const filePath = joinPath(currentPath, file.name);
    
    // Determine app to open file with
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Open file with appropriate app through window manager
    if (window.windowManager) {
      switch (extension) {
        case 'txt':
        case 'log':
        case 'ini':
          window.windowManager.addWindow({
            title: `Text Editor - ${file.name}`,
            component: 'TextEditor',
            width: 850,
            height: 650,
            componentProps: {
              filePath,
              fileSystem
            }
          });
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          window.windowManager.addWindow({
            title: `Image Viewer - ${file.name}`,
            component: 'ImageViewer',
            width: 800,
            height: 600,
            componentProps: {
              filePath,
              fileSystem
            }
          });
          break;
        case 'exe':
        case 'com':
        case 'bat':
          // Handle executable files - could launch mini-games or special apps
          handleExecutableFile(file.name, filePath);
          break;
        default:
          // Default to text editor for unknown file types
          window.windowManager.addWindow({
            title: `Text Editor - ${file.name}`,
            component: 'TextEditor',
            width: 850,
            height: 650,
            componentProps: {
              filePath,
              fileSystem
            }
          });
      }
    }
  };

  // Handle executable files
  const handleExecutableFile = (fileName: string, filePath: string) => {
    if (!fileSystem) return;
    
    // Get the file object to access its metadata and appId
    const file = fileSystem.getItem(filePath);
    if (!file) {
      setStatusMessage(`Error: Cannot find file ${fileName}`);
      return;
    }
    
    // Check if file has an appId property
    // Use explicit type check to avoid runtime errors
    const fileWithAppId = file as FileSystemObject & { appId?: string };
    const appId = fileWithAppId.appId;
    
    if (appId && window.windowManager) {
      // Map known app IDs to their proper components
      setStatusMessage(`Launching ${appId}...`);
      
      // Just use the appId or fileName for the title
      const appTitle = appId === 'Doom' ? 'DOOM.EXE' :
                       appId === 'Starfield' ? 'STARFIELD.EXE' :
                       appId === 'Labyrinth' ? 'LABYRINTH.EXE' :
                       appId === 'RealityProbe' ? 'Reality Probe' :
                       fileName;
      
      // Launch the application using the appId from the file
      const isGame = appId === 'Doom' || appId === 'Starfield' || appId === 'Labyrinth';
      
      window.windowManager.addWindow({
        title: appTitle,
        component: appId,
        width: isGame ? 800 : 850,
        height: isGame ? 600 : 650,
        componentProps: {
          filePath,
          fileSystem
        }
      });
    } else {
      // For executables without an appId, try to determine from filename
      const upperCaseName = fileName.toUpperCase();
      
      if (upperCaseName === 'STARFIELD.EXE') {
        setStatusMessage('Launching Starfield game...');
        if (window.windowManager) {
          window.windowManager.addWindow({
            title: 'Starfield',
            component: 'Starfield',
            width: 800,
            height: 600,
            componentProps: {
              filePath,
              fileSystem
            }
          });
        }
      } else if (upperCaseName === 'LABYRINTH.EXE') {
        setStatusMessage('Launching Labyrinth game...');
        if (window.windowManager) {
          window.windowManager.addWindow({
            title: 'Labyrinth',
            component: 'Labyrinth',
            width: 800,
            height: 600,
            componentProps: {
              filePath,
              fileSystem
            }
          });
        }
      } else if (upperCaseName === 'DOOM.EXE') {
        setStatusMessage('Launching DOOM game...');
        if (window.windowManager) {
          window.windowManager.addWindow({
            title: 'DOOM.EXE',
            component: 'Doom',
            width: 800,
            height: 600,
            componentProps: {
              filePath,
              fileSystem
            }
          });
        }
      } else if (upperCaseName === 'REALITY_PROBE.EXE') {
        setStatusMessage('ERROR: File is corrupted or access denied');
        // Display an error dialog to the user
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
        }
      } else {
        setStatusMessage(`Cannot execute ${fileName}: Unknown application`);
      }
    }
  };

  // Handle right click
  const handleContextMenu = (e: React.MouseEvent, item: FileSystemObject | null) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
    setContextMenuTarget(item ? item.name : null);
  };

  // Handle go up
  const handleGoUp = () => {
    if (currentPath === '/') return;
    
    navigateTo(getParentPath(currentPath));
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowContextMenu(false);
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Handle file operations
  const handleFileOperation = (operation: string) => {
    if (!contextMenuTarget) return;
    
    const targetItem = directoryContent.find(item => item.name === contextMenuTarget);
    if (!targetItem) return;
    
    const targetPath = joinPath(currentPath, contextMenuTarget);
    
    switch (operation) {
      case 'open':
        if (targetItem.type === 'directory') {
          navigateTo(targetPath);
        } else {
          handleOpenFile(targetItem);
        }
        break;
      case 'delete':
        if (fileSystem && window.confirm(`Are you sure you want to delete ${contextMenuTarget}?`)) {
          if (fileSystem.deleteItem(targetPath)) {
            setStatusMessage(`Deleted ${contextMenuTarget}`);
            // Refresh directory content
            const content = fileSystem.listDirectory(currentPath);
            if (content) {
              setDirectoryContent(content);
            }
          } else {
            setStatusMessage(`Failed to delete ${contextMenuTarget}`);
          }
        }
        break;
      case 'properties':
        if (fileSystem) {
          const metadata = fileSystem.getMetadata(targetPath);
          if (metadata) {
            // Display properties dialog
            alert(`
              Name: ${metadata.name}
              Type: ${metadata.type}
              Size: ${formatFileSize(metadata.size)}
              Created: ${formatDate(metadata.created ?? "")}
              Modified: ${formatDate(metadata.modified ?? "")}
              Hidden: ${metadata.attributes?.hidden ? 'Yes' : 'No'}
              System: ${metadata.attributes?.system ? 'Yes' : 'No'}
              Read-only: ${metadata.attributes?.readonly ? 'Yes' : 'No'}
            `);
          }
        }
        break;
    }
    
    setShowContextMenu(false);
  };

  // Common sidebar locations - build dynamically based on filesystem
  const [sidebarLocations, setSidebarLocations] = useState([
    { name: 'My Computer', icon: '⌘', path: '/' },
    { name: 'Home', icon: '⌂', path: '/home' },
    { name: 'System', icon: '⚙', path: '/system' },
  ]);
  
  // Update sidebar locations once file system is loaded
  useEffect(() => {
    if (!fileSystem) return;
    
    const locations = [
      { name: 'My Computer', icon: '⌘', path: '/' },
      { name: 'Home', icon: '⌂', path: '/home' }
    ];
    
    // Only add paths that exist
    if (fileSystem.exists('/home/hedrum')) {
      if (fileSystem.exists('/home/hedrum/documents')) {
        locations.push({ name: 'Documents', icon: '⊟', path: '/home/hedrum/documents' });
      }
      
      if (fileSystem.exists('/home/hedrum/apps')) {
        locations.push({ name: 'Applications', icon: '⊞', path: '/home/hedrum/apps' });
      }
    }
    
    if (fileSystem.exists('/system')) {
      locations.push({ name: 'System', icon: '⚙', path: '/system' });
    }
    
    setSidebarLocations(locations);
  }, [fileSystem]);

  // Import formatFileSize and formatDate from utils.ts when needed

  // Filter files based on settings
  const filteredFiles = directoryContent.filter(
    file => showHiddenFiles || !file.attributes.hidden
  );

  return (
    <div className="file-manager">
      <FileManagerToolbar
        onGoUp={handleGoUp}
        showHiddenFiles={showHiddenFiles}
        onToggleHiddenFiles={() => setShowHiddenFiles(!showHiddenFiles)}
      />
      
      <FileManagerPathDisplay currentPath={currentPath} />

      <div className="file-manager-container">
        <FileManagerSidebar
          locations={sidebarLocations}
          currentPath={currentPath}
          onNavigate={navigateTo}
        />

        <FileManagerItemList
          files={filteredFiles}
          selectedItem={selectedItem}
          onItemClick={handleItemClick}
          onItemDoubleClick={handleItemDoubleClick}
          onContextMenu={handleContextMenu}
        />
      </div>

      <FileManagerStatusBar
        fileCount={filteredFiles.length}
        statusMessage={statusMessage}
        selectedItem={selectedItem}
        files={directoryContent}
      />

      {showContextMenu && (
        <FileManagerContextMenu
          position={contextMenuPosition}
          contextMenuTarget={contextMenuTarget}
          showHiddenFiles={showHiddenFiles}
          onFileOperation={handleFileOperation}
          onToggleHiddenFiles={() => setShowHiddenFiles(!showHiddenFiles)}
          onRefresh={() => navigateTo(currentPath)}
        />
      )}
    </div>
  );
}; 

export default FileManagerWindow;