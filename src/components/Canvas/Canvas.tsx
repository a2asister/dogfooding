import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useEditorStore } from '../../store/editorStore';
import { DragItem, ElementType } from '../../types';
import { snapToGrid, snapToElement } from '../../utils';
import CanvasElement from './CanvasElement';
import Ruler from './Ruler';

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const Canvas: React.FC = () => {
  const {
    elements,
    selectedElementIds,
    canvas,
    addElement,
    updateElementStyle,
    setCanvasState,
    clearSelection,
    selectElements,
    saveToLocalStorage
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [snapLines, setSnapLines] = useState<Array<{ type: 'horizontal' | 'vertical'; position: number }>>([]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    const x = (screenX - rect.left - 24 - canvas.panX) / canvas.scale;
    const y = (screenY - rect.top - 24 - canvas.panY) / canvas.scale;
    
    return { x, y };
  }, [canvas.scale, canvas.panX, canvas.panY]);

  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    return {
      x: canvasX * canvas.scale + canvas.panX + 24,
      y: canvasY * canvas.scale + canvas.panY + 24
    };
  }, [canvas.scale, canvas.panX, canvas.panY]);

  const [, drop] = useDrop(() => ({
    accept: ['TOOL_ITEM', 'CANVAS_ELEMENT'],
    drop: (item: DragItem, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const { x, y } = screenToCanvas(offset.x, offset.y);
      
      if (item.isNew) {
        const elementDefaults = {
          title: { width: 300, height: 40 },
          list: { width: 300, height: 80 },
          bold: { width: 200, height: 30 },
          italic: { width: 200, height: 30 },
          link: { width: 200, height: 30 },
          divider: { width: 300, height: 2 },
          rectangle: { width: 200, height: 120 },
          slide: { width: 400, height: 250 }
        };
        
        const size = elementDefaults[item.type as ElementType];
        
        const dropX = x - size.width / 2;
        const dropY = y - size.height / 2;
        
        const snappedX = snapToGrid(dropX);
        const snappedY = snapToGrid(dropY);
        
        addElement(item.type as ElementType, snappedX, snappedY);
      } else if (item.elementId) {
        const element = elements.find(e => e.id === item.elementId);
        if (element) {
          const elementInfo = elements.map(e => ({
            id: e.id,
            x: e.style.x,
            y: e.style.y,
            width: e.style.width,
            height: e.style.height
          }));
          
          const initialClientOffset = monitor.getInitialClientOffset();
          const initialSourceClientOffset = monitor.getInitialSourceClientOffset();
          
          let newX: number;
          let newY: number;
          
          if (initialClientOffset && initialSourceClientOffset) {
            const dx = offset.x - initialClientOffset.x;
            const dy = offset.y - initialClientOffset.y;
            
            const canvasDx = dx / canvas.scale;
            const canvasDy = dy / canvas.scale;
            
            newX = element.style.x + canvasDx;
            newY = element.style.y + canvasDy;
          } else {
            newX = x - element.style.width / 2;
            newY = y - element.style.height / 2;
          }
          
          const snappedX = snapToGrid(newX);
          const snappedY = snapToGrid(newY);
          
          const snapResult = snapToElement(snappedX, snappedY, item.elementId, elementInfo);
          
          updateElementStyle(item.elementId, {
            x: snapResult.x,
            y: snapResult.y
          });
          
          setSnapLines(snapResult.snapLines);
          setTimeout(() => setSnapLines([]), 1000);
        }
      }
      
      return { dropped: true };
    },
  }), [elements, addElement, updateElementStyle, screenToCanvas, canvas.scale]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, canvas.scale * delta));
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - 24;
    const mouseY = e.clientY - rect.top - 24;
    
    const newPanX = mouseX - (mouseX - canvas.panX) * (newScale / canvas.scale);
    const newPanY = mouseY - (mouseY - canvas.panY) * (newScale / canvas.scale);

    setCanvasState({
      scale: newScale,
      panX: newPanX,
      panY: newPanY
    });
  }, [canvas.scale, canvas.panX, canvas.panY, setCanvasState]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvas.panX,
        y: e.clientY - canvas.panY
      });
      return;
    }

    if (e.button === 0 && !e.altKey && e.target === e.currentTarget) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setIsSelecting(true);
      setSelectionBox({
        startX: x,
        startY: y,
        endX: x,
        endY: y
      });
    }
  }, [canvas.panX, canvas.panY, screenToCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasState({
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y
      });
      return;
    }

    if (isSelecting && selectionBox) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setSelectionBox({
        ...selectionBox,
        endX: x,
        endY: y
      });
    }
  }, [isPanning, panStart, isSelecting, selectionBox, screenToCanvas, setCanvasState]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      saveToLocalStorage();
      return;
    }

    if (isSelecting && selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);

      const selectedIds = elements.filter(el => {
        const elX = el.style.x;
        const elY = el.style.y;
        const elW = el.style.width;
        const elH = el.style.height;
        
        return !(elX + elW < minX || elX > maxX || elY + elH < minY || elY > maxY);
      }).map(el => el.id);

      if (selectedIds.length > 0) {
        selectElements(selectedIds);
      } else {
        clearSelection();
      }

      setIsSelecting(false);
      setSelectionBox(null);
    }
  }, [isPanning, isSelecting, selectionBox, elements, selectElements, clearSelection, saveToLocalStorage]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  const getSelectionBoxStyle = (): React.CSSProperties | null => {
    if (!selectionBox) return null;
    
    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const maxX = Math.max(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const maxY = Math.max(selectionBox.startY, selectionBox.endY);

    const topLeft = canvasToScreen(minX, minY);
    const bottomRight = canvasToScreen(maxX, maxY);

    return {
      position: 'absolute',
      left: topLeft.x,
      top: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none',
      zIndex: 50
    };
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-200"
      style={{
        cursor: isPanning ? 'grabbing' : (isSelecting ? 'crosshair' : 'default')
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      <Ruler
        type="horizontal"
        scale={canvas.scale}
        panOffset={canvas.panX}
        canvasSize={canvas.canvasWidth}
        rulerSize={containerSize.width - 24}
      />
      <Ruler
        type="vertical"
        scale={canvas.scale}
        panOffset={canvas.panY}
        canvasSize={canvas.canvasHeight}
        rulerSize={containerSize.height - 24}
      />

      <div 
        ref={drop}
        className="absolute overflow-hidden"
        style={{
          left: 24,
          top: 24,
          right: 0,
          bottom: 0
        }}
      >
        <div
          className="absolute will-change-transform"
          style={{
            width: canvas.canvasWidth,
            height: canvas.canvasHeight,
            transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.scale})`,
            transformOrigin: 'top left',
            background: `
              linear-gradient(to right, #e5e5e5 1px, transparent 1px),
              linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundColor: '#fafafa',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedElementIds.includes(element.id)}
            />
          ))}
        </div>
      </div>

      {snapLines.map((line, index) => {
        const screenPos = canvasToScreen(line.position, line.position);
        return (
          <div
            key={index}
            className="absolute"
            style={{
              ...(line.type === 'horizontal' ? {
                left: 24,
                top: screenPos.y,
                right: 0,
                height: 1,
                borderTop: '1px solid #ef4444'
              } : {
                left: screenPos.x,
                top: 24,
                bottom: 0,
                width: 1,
                borderLeft: '1px solid #ef4444'
              }),
              pointerEvents: 'none',
              zIndex: 60
            }}
          />
        );
      })}

      {selectionBox && (
        <div style={getSelectionBoxStyle() || undefined} />
      )}

      <div className="absolute bottom-2 left-28 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-4">
        <span>缩放: {Math.round(canvas.scale * 100)}%</span>
        <span>画布: {canvas.canvasWidth}×{canvas.canvasHeight}</span>
      </div>
    </div>
  );
};

export default Canvas;
