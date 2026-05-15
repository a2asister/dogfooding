import React, { useState } from 'react';
import { FileItem } from '../types';
import { filesApi } from '../services/api';

interface TextEditorProps {
  file: FileItem;
  onSave: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ file, onSave }) => {
  const [content, setContent] = useState(file.content || '');

  const handleSave = async () => {
    await filesApi.updateFile(file.id, { content });
    onSave();
  };

  return (
    <div className="text-editor">
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <button className="file-button" onClick={handleSave}>保存</button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="在此输入内容..."
      />
    </div>
  );
};

export default TextEditor;