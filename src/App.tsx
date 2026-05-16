import { useEffect, useState } from 'react';
import { MenuBar } from './components/MenuBar';
import { ActivityBar } from './components/ActivityBar';
import { CodeEditor } from './components/Editor';
import { Preview } from './components/Preview';
import { BottomPanel } from './components/BottomPanel';
import { CommandPalette } from './components/CommandPalette';
import { ProjectCreator } from './components/ProjectCreator';
import { useProjectStore } from './store/useProjectStore';

function App() {
  const files = useProjectStore((state) => state.files);
  const activeFileId = useProjectStore((state) => state.activeFileId);
  const setActiveFile = useProjectStore((state) => state.setActiveFile);
  const [editorWidth, setEditorWidth] = useState(50);

  useEffect(() => {
    if (!activeFileId && files.length > 0) {
      const firstFile = files.find(f => f.type === 'file');
      if (firstFile) {
        setActiveFile(firstFile.id);
      }
    }
  }, [activeFileId, files, setActiveFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = editorWidth;
    const container = (e.target as HTMLElement).parentElement;
    if (!container) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((moveEvent.clientX - startX) / containerRect.width) * 100 + startWidth;
      setEditorWidth(Math.min(Math.max(newWidth, 20), 80));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <MenuBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <ActivityBar />
          <div className="flex-1 flex overflow-hidden">
            <div style={{ flexBasis: `${editorWidth}%`, flexShrink: 0 }}>
              <CodeEditor />
            </div>
            <div
              className="w-1 bg-gray-700 cursor-col-resize hover:bg-blue-500 transition-colors flex-shrink-0 z-10"
              onMouseDown={handleMouseDown}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Preview />
            </div>
          </div>
        </div>
        <BottomPanel />
      </div>
      <CommandPalette />
      <ProjectCreator />
    </div>
  );
}

export default App;
