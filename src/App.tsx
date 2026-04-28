import React, { useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEditorStore } from './store/editorStore';
import Toolbar from './components/Toolbar/Toolbar';
import ToolPanel from './components/ToolPanel/ToolPanel';
import Canvas from './components/Canvas/Canvas';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import Preview from './components/Preview/Preview';
import './styles/animations.css';

const Editor: React.FC = () => {
  const { isPreviewMode, canvas, loadFromLocalStorage, saveToLocalStorage, setCanvasState, setPreviewMode, togglePreviewMode } = useEditorStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isPreviewMode) {
        setPreviewMode(false);
      }
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      setCanvasState({ scale: Math.min(5, canvas.scale * 1.2) });
    }

    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      setCanvasState({ scale: Math.max(0.1, canvas.scale / 1.2) });
    }

    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      setCanvasState({ scale: 1 });
    }

    if (e.key === 'F5' || (e.key === 'p' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      togglePreviewMode();
    }
  }, [isPreviewMode, canvas.scale, setCanvasState, setPreviewMode, togglePreviewMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveToLocalStorage]);

  if (isPreviewMode) {
    return <Preview />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <ToolPanel />
        <Canvas />
        <PropertyPanel />
      </div>
    </div>
  );
};

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Editor />
    </DndProvider>
  );
}

export default App;
