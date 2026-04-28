import React, { useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';

const Toolbar: React.FC = () => {
  const { 
    canvas, 
    setCanvasState, 
    resetCanvas, 
    togglePreviewMode,
    clearStorage,
    selectedElementIds,
    deleteElement
  } = useEditorStore();

  const handleZoomIn = useCallback(() => {
    setCanvasState({ scale: Math.min(5, canvas.scale * 1.2) });
  }, [canvas.scale, setCanvasState]);

  const handleZoomOut = useCallback(() => {
    setCanvasState({ scale: Math.max(0.1, canvas.scale / 1.2) });
  }, [canvas.scale, setCanvasState]);

  const handleResetZoom = useCallback(() => {
    setCanvasState({ scale: 1 });
  }, [setCanvasState]);

  const handleFitToScreen = useCallback(() => {
    const container = document.querySelector('.flex-1.relative.overflow-hidden.bg-gray-200');
    if (container) {
      const rect = container.getBoundingClientRect();
      const availableWidth = rect.width - 48;
      const availableHeight = rect.height - 48;
      
      const scaleX = availableWidth / canvas.canvasWidth;
      const scaleY = availableHeight / canvas.canvasHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setCanvasState({ 
        scale,
        panX: (availableWidth - canvas.canvasWidth * scale) / 2,
        panY: (availableHeight - canvas.canvasHeight * scale) / 2
      });
    }
  }, [canvas.canvasWidth, canvas.canvasHeight, setCanvasState]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElementIds.length > 0) {
      selectedElementIds.forEach(id => deleteElement(id));
    }
  }, [selectedElementIds, deleteElement]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('确定要清空画布吗？此操作不可撤销。')) {
      clearStorage();
    }
  }, [clearStorage]);

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-white font-bold text-lg">📋</span>
          <span className="text-white font-semibold">PRD 编辑器</span>
        </div>
        
        <div className="h-6 w-px bg-gray-600 mx-2" />
        
        <div className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="缩小 (Ctrl+-)"
          >
            <span className="text-lg">−</span>
          </button>
          <span className="text-gray-300 text-sm w-16 text-center font-mono">
            {Math.round(canvas.scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 rounded transition-colors"
            title="放大 (Ctrl++)"
          >
            <span className="text-lg">+</span>
          </button>
        </div>

        <button
          onClick={handleResetZoom}
          className="px-3 py-1.5 text-gray-300 text-sm hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="重置缩放"
        >
          100%
        </button>

        <button
          onClick={handleFitToScreen}
          className="px-3 py-1.5 text-gray-300 text-sm hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="适应屏幕"
        >
          适应屏幕
        </button>

        <div className="h-6 w-px bg-gray-600 mx-2" />

        <button
          onClick={resetCanvas}
          className="px-3 py-1.5 text-gray-300 text-sm hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="重置画布位置"
        >
          重置位置
        </button>
      </div>

      <div className="flex items-center gap-2">
        {selectedElementIds.length > 0 && (
          <>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 text-red-400 text-sm hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
              title="删除选中元素"
            >
              删除 ({selectedElementIds.length})
            </button>
            <div className="h-6 w-px bg-gray-600 mx-2" />
          </>
        )}

        <button
          onClick={handleClearAll}
          className="px-3 py-1.5 text-gray-300 text-sm hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="清空画布"
        >
          清空画布
        </button>

        <div className="h-6 w-px bg-gray-600 mx-2" />

        <button
          onClick={togglePreviewMode}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          title="预览模式"
        >
          <span>👁️</span>
          预览
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
