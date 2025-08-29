import React from 'react';
import { 
  IoFolderOpenOutline,
  IoSaveOutline,
  IoDocumentTextOutline,
  IoTimeOutline 
} from 'react-icons/io5';

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
        title="Open File"
      >
        <IoFolderOpenOutline className="text-editor-icon" /> OPEN
      </button>
      <button 
        className="text-editor-toolbar-button"
        onClick={onSave}
        title="Save File"
      >
        <IoSaveOutline className="text-editor-icon" /> {isModified ? "SAVE*" : "SAVE"}
      </button>
      <button 
        className="text-editor-toolbar-button"
        onClick={onSaveAs}
        title="Save As"
      >
        <IoDocumentTextOutline className="text-editor-icon" /> SAVE AS
      </button>
      {onAddTimestamp && (
        <button
          className="text-editor-toolbar-button"
          onClick={onAddTimestamp}
          title="Insert Timestamp"
        >
          <IoTimeOutline className="text-editor-icon" /> TIMESTAMP
        </button>
      )}
    </div>
  );
};

export default TextEditorToolbar;
