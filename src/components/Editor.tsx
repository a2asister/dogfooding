import { useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '../store/useProjectStore';
import { useUIStore } from '../store/useUIStore';
import { Cloud, CloudOff, X, Save, Code } from 'lucide-react';

export const CodeEditor = () => {
  const activeFileId = useProjectStore((state) => state.activeFileId);
  const files = useProjectStore((state) => state.files);
  const updateFileContent = useProjectStore((state) => state.updateFileContent);
  const settings = useUIStore((state) => state.settings);
  const editorRef = useRef<any>(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        if (editorRef.current) {
          editorRef.current.getAction('editor.action.formatDocument').run();
        }
      }
    };

    const handleFormatCode = () => {
      if (editorRef.current) {
        editorRef.current.getAction('editor.action.formatDocument').run();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('formatCode', handleFormatCode);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('formatCode', handleFormatCode);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [activeFileId]);

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <CloudOff size={48} className="mx-auto mb-4 opacity-50" />
          <p>选择一个文件开始编辑</p>
          <p className="text-sm mt-2 text-gray-500">或使用 Ctrl+Shift+P 打开命令面板</p>
        </div>
      </div>
    );
  }

  if (activeFile.type === 'folder') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <Code size={48} className="mx-auto mb-4 opacity-50" />
          <p>这是一个文件夹</p>
          <p className="text-sm mt-2 text-gray-500">展开后选择其中的文件进行编辑</p>
        </div>
      </div>
    );
  }

  const getLanguage = () => {
    const ext = activeFile.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'vue': return 'html';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="h-9 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
        <span className="text-sm text-gray-300 font-medium">{activeFile.name}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Cloud size={12} />
          <span>自动保存</span>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage()}
          value={activeFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: settings.fontSize,
            fontFamily: settings.fontFamily,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 16, bottom: 16 },
            automaticLayout: true,
            tabSize: settings.tabSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            formatOnPaste: true,
            formatOnType: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
          }}
        />
      </div>
    </div>
  );
};
