import React, { useEffect } from 'react';

interface TextEditorContentProps {
  content: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  glitchMode: boolean;
}

const TextEditorContent: React.FC<TextEditorContentProps> = ({
  content,
  onChange,
  textareaRef,
  glitchMode
}) => {
  // Focus the textarea when the component mounts or when glitchMode changes
  useEffect(() => {
    if (textareaRef.current && !glitchMode) {
      textareaRef.current.focus();
    }
  }, [textareaRef, glitchMode]);

  return (
    <div className="text-editor-content">
      <textarea
        ref={textareaRef}
        className="text-editor-textarea"
        value={content}
        onChange={onChange}
        spellCheck={false}
        autoFocus
        placeholder="// BEGIN TYPING..."
      />
    </div>
  );
};

export default TextEditorContent;
