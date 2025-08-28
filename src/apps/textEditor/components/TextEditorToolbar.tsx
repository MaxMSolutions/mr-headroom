import React from 'react';

interface TextEditorToolbarProps {
  onSave: () => void;
  onSaveAs: () => void;
  onOpen: () => void;
  isModified: boolean;
  onAddTimestamp?: () => void;
}

const TextEditorToolbar: React.FC<TextEditorToolbarProps> = ({
  onSave,
  onSaveAs,
  onOpen,
  isModified,
  onAddTimestamp
}) => {
  return (
    <div className="text-editor-toolbar">
      <button 
        className="text-editor-toolbar-button"
        onClick={onOpen}
      >
        ⌘ OPEN
      </button>
      <button 
        className="text-editor-toolbar-button"
        onClick={onSave}
      >
        ⌘ {isModified ? "SAVE*" : "SAVE"}
      </button>
      <button 
        className="text-editor-toolbar-button"
        onClick={onSaveAs}
      >
        ⌘ SAVE AS
      </button>
      {onAddTimestamp && (
        <button
          className="text-editor-toolbar-button"
          onClick={onAddTimestamp}
        >
          ⌚ TIMESTAMP
        </button>
      )}
    </div>
  );
};

export default TextEditorToolbar;
