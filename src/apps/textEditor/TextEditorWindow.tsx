import React, { useState, useEffect, useRef } from 'react';
import './TextEditor.css';
import FileSystem from '../../engine/fileSystem';
import { 
  TextEditorToolbar, 
  TextEditorContent, 
  TextEditorStatusBar, 
  SaveDialog,
  OpenFileDialog
} from './components';
import { getParentPath } from './utils';

interface TextEditorWindowProps {
  id: string;
  title?: string;
  fileSystem?: FileSystem;
  filePath?: string;
  initialContent?: string;
  onClose?: () => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
}

const TextEditorWindow: React.FC<TextEditorWindowProps> = ({
  id,
  fileSystem,
  filePath,
  initialContent = '',
  onUpdateTitle
}) => {
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState(filePath ? filePath.split('/').pop() : 'Untitled');
  const [currentFilePath, setCurrentFilePath] = useState<string | undefined>(filePath);
  const [isModified, setIsModified] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(1);
  const [glitchMode, setGlitchMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenFileDialog, setShowOpenFileDialog] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load content from file if path is provided
  useEffect(() => {
    if (fileSystem && filePath) {
      const fileContent = fileSystem.readFile(filePath);
      if (fileContent !== null) {
        setContent(fileContent);
        setCharCount(fileContent.length);
        setLineCount(fileContent.split('\n').length);
        setStatusMessage('File loaded');
        
        // Update window title when file is first loaded
        if (onUpdateTitle) {
          const loadedFileName = filePath.split('/').pop() || 'Untitled';
          onUpdateTitle(id, `Text Editor - ${loadedFileName}`);
        }
      } else {
        setStatusMessage('Error: File not found');
      }
    }
  }, [fileSystem, filePath, id, onUpdateTitle]);

  // Update stats when content changes
  useEffect(() => {
    setCharCount(content.length);
    setLineCount(content.split('\n').length);
  }, [content]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Save As: Ctrl+Shift+S or Cmd+Shift+S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        handleSaveAs();
      }
      
      // Open: Ctrl+O or Cmd+O
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOpenFile();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fileSystem, currentFilePath, content]);

  // Handle content change with cyberpunk typing effect sound
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Optional: Add typing sound effect here
    // const typingSound = new Audio('/assets/sounds/typing.mp3');
    // typingSound.volume = 0.2;
    // typingSound.play().catch(e => console.log('Audio play prevented:', e));
    
    setContent(e.target.value);
    setIsModified(true);
    setStatusMessage('Editing...');
    
    // Random chance for very subtle glitch
    if (Math.random() < 0.005) {
      setGlitchMode(true);
      setTimeout(() => setGlitchMode(false), 100); // Very brief glitch
    }
    
    // No need to track selection anymore as we've refactored this
  };

  // Handle save
  const handleSave = () => {
    if (fileSystem && currentFilePath) {
      if (fileSystem.writeFile(currentFilePath, content)) {
        setIsModified(false);
        setStatusMessage('File saved');
      } else {
        setStatusMessage('Error: Could not save file');
      }
    } else {
      // Save as new file
      handleSaveAs();
    }
  };

  // Handle save as
  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };
  
  // Handle save dialog confirmation
  const handleSaveDialogConfirm = (path: string) => {
    if (fileSystem) {
      if (fileSystem.writeFile(path, content)) {
        setCurrentFilePath(path);
        const newFileName = path.split('/').pop() || 'Untitled';
        setFileName(newFileName);
        setIsModified(false);
        setStatusMessage('File saved');
        
        // Update window title
        if (onUpdateTitle) {
          onUpdateTitle(id, `Text Editor - ${newFileName}`);
        }
      } else {
        setStatusMessage('Error: Could not save file');
      }
    }
    setShowSaveDialog(false);
  };
  
  // Handle save dialog cancel
  const handleSaveDialogCancel = () => {
    setShowSaveDialog(false);
    setStatusMessage('Save cancelled');
  };
  
  // Handle open file
  const handleOpenFile = () => {
    setShowOpenFileDialog(true);
  };
  
  // Handle open file dialog selection
  const handleOpenFileSelect = (path: string) => {
    if (fileSystem) {
      const fileContent = fileSystem.readFile(path);
      if (fileContent !== null) {
        setContent(fileContent);
        setCurrentFilePath(path);
        const newFileName = path.split('/').pop() || 'Untitled';
        setFileName(newFileName);
        setCharCount(fileContent.length);
        setLineCount(fileContent.split('\n').length);
        setIsModified(false);
        setStatusMessage('File loaded');
        
        // Update window title
        if (onUpdateTitle) {
          onUpdateTitle(id, `Text Editor - ${newFileName}`);
        }
      } else {
        setStatusMessage('Error: Could not open file');
      }
    }
    setShowOpenFileDialog(false);
  };
  
  // Handle open file dialog cancel
  const handleOpenFileCancel = () => {
    // First update the status message
    setStatusMessage('Open cancelled');
    // Then close the dialog
    setShowOpenFileDialog(false);
  };

  // Add a random glitch effect that sometimes introduces text corruption
  useEffect(() => {
    // This is part of the narrative - rarely the text editor will glitch
    const glitchInterval = setInterval(() => {
      // Only 1% chance of triggering a glitch
      if (Math.random() < 0.01) {
        setGlitchMode(true);
        setStatusMessage('SIGNAL INTERFERENCE DETECTED');
        
        // Possibly corrupt some text for narrative purposes
        if (Math.random() < 0.3 && content.length > 20) {
          // Create a glitched version of the text with some corruption
          const contentArray = content.split('');
          const randomIndex = Math.floor(Math.random() * (content.length - 10)) + 5;
          const glitchTexts = [
            'MRHEADROOM',
            'REALITY BREACH',
            'HELP ME',
            'IT SEES YOU',
            'ESCAPE NOW'
          ];
          const randomGlitch = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
          
          for (let i = 0; i < randomGlitch.length; i++) {
            if (randomIndex + i < contentArray.length) {
              contentArray[randomIndex + i] = randomGlitch[i];
            }
          }
          
          setContent(contentArray.join(''));
          setIsModified(true);
        }
        
        // Turn off glitch mode after a short time
        setTimeout(() => {
          setGlitchMode(false);
          setStatusMessage('Ready');
        }, 500 + Math.random() * 1500); // Random duration between 500ms and 2000ms
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(glitchInterval);
    };
  }, [content]);
  
  // Format file information for status bar
  const getFileInfo = () => {
    if (!currentFilePath) return 'New file';
    
    const pathParts = currentFilePath.split('/');
    if (pathParts.length <= 2) return currentFilePath;
    
    // Show abbreviated path
    return '.../' + pathParts.slice(-2).join('/');
  };

  return (
    <div className={`text-editor ${glitchMode ? 'glitching' : ''}`}>
      <TextEditorToolbar
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onOpen={handleOpenFile}
        isModified={isModified}
        onAddTimestamp={() => {
          const now = new Date().toLocaleString();
          const timestampText = `\n// ${now}\n`;
          setContent(prev => prev + timestampText);
          setIsModified(true);
        }}
      />
      
      <TextEditorContent
        content={content}
        onChange={handleContentChange}
        textareaRef={textareaRef}
        glitchMode={glitchMode}
      />
      
      <TextEditorStatusBar
        fileName={fileName}
        fileInfo={getFileInfo()}
        charCount={charCount}
        lineCount={lineCount}
        statusMessage={statusMessage}
        isModified={isModified}
      />
      
      {/* Only render the SaveDialog when needed to avoid z-index issues */}
      {showSaveDialog && (
        <SaveDialog
          isOpen={true}
          currentPath={currentFilePath ? getParentPath(currentFilePath) : '/home/hedrum/documents/'}
          onSave={handleSaveDialogConfirm}
          onCancel={handleSaveDialogCancel}
          fileSystem={fileSystem}
        />
      )}

      {/* Only render the OpenFileDialog when needed to avoid z-index issues */}
      {showOpenFileDialog && (
        <OpenFileDialog
          isOpen={true}
          currentPath={currentFilePath ? getParentPath(currentFilePath) : '/home/hedrum/documents/'}
          onSelect={handleOpenFileSelect}
          onCancel={handleOpenFileCancel}
          fileSystem={fileSystem}
        />
      )}
    </div>
  );
};

export default TextEditorWindow;
