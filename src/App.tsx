import React, { useRef, useEffect, useCallback } from 'react';
import { MenuBar } from './components/MenuBar/MenuBar';
import { ToolBar } from './components/ToolBar/ToolBar';
import { LayerPanel } from './components/LayerPanel/LayerPanel';
import { CanvasArea, CanvasAreaRef } from './components/CanvasArea/CanvasArea';
import { useEditor } from './context/EditorContext';
import './App.css';

const App: React.FC = () => {
  const { state, dispatch } = useEditor();
  const canvasAreaRef = useRef<CanvasAreaRef>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImportImage(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleImportImage = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        dispatch({ type: 'ADD_LAYER', payload: { importDataUrl: dataUrl } });
      };
      reader.readAsDataURL(file);
    },
    [dispatch]
  );

  const handleExportImage = useCallback(
    async (format: 'png' | 'jpg' | 'webp') => {
      const compositeCanvas = document.querySelector('.canvas-area canvas') as HTMLCanvasElement;
      if (!compositeCanvas) return;

      let mimeType: string;
      let extension: string;
      
      switch (format) {
        case 'jpg':
          mimeType = 'image/jpeg';
          extension = 'jpg';
          break;
        case 'webp':
          mimeType = 'image/webp';
          extension = 'webp';
          break;
        default:
          mimeType = 'image/png';
          extension = 'png';
      }

      compositeCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        },
        mimeType,
        format === 'jpg' ? 0.9 : 1
      );
    },
    []
  );

  return (
    <div className="app-container flex flex-col h-screen w-screen bg-editor-bg text-editor-text overflow-hidden">
      <MenuBar onImportImage={handleImportImage} onExportImage={handleExportImage} />

      <div className="flex flex-1 overflow-hidden">
        <ToolBar />

        <CanvasArea ref={canvasAreaRef} onImageImport={handleImportImage} />

        <LayerPanel />
      </div>

      <div className="status-bar bg-editor-panel border-t border-editor-border px-3 py-1 text-xs text-editor-textSecondary flex items-center justify-between">
        <div className="flex gap-4">
          <span>工具: {getToolName(state.currentTool.type)}</span>
          <span>缩放: {state.zoom}%</span>
        </div>
        <div className="flex gap-4">
          <span>图层数: {state.layers.length}</span>
          {state.selection && <span className="text-editor-accent">有选区</span>}
          {state.lastSaved && (
            <span>
              最后保存: {new Date(state.lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function getToolName(type: string): string {
  const names: Record<string, string> = {
    select: '选择',
    move: '移动',
    brush: '画笔',
    eraser: '橡皮擦',
    rectSelect: '矩形选区',
    circleSelect: '圆形选区',
    lasso: '套索',
    magicWand: '魔棒',
    maskBrush: '蒙版画笔',
  };
  return names[type] || type;
}

export default App;
