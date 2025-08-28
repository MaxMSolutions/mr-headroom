import React, { useState, useEffect } from 'react';

interface TextEditorStatusBarProps {
  fileName: string | undefined;
  fileInfo: string | undefined;
  charCount: number;
  lineCount: number;
  statusMessage: string;
  isModified: boolean;
}

const TextEditorStatusBar: React.FC<TextEditorStatusBarProps> = ({
  fileName,
  fileInfo,
  charCount,
  lineCount,
  statusMessage,
  isModified
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-editor-status-bar">
      <div>
        <span>{'>>'} {fileName || 'Untitled'}{isModified ? '*' : ''}</span>
        <span>LINES: {lineCount}</span>
        <span>CHARS: {charCount}</span>
      </div>
      <div>
        <span>{statusMessage}</span>
        <span>SYS:{time}</span>
        <span>{fileInfo}</span>
      </div>
    </div>
  );
};

export default TextEditorStatusBar;
