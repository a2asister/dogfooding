import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { ComponentTemplate, LayoutMode, CanvasComponent, ComponentType } from '../types';
import CanvasRenderer from './CanvasRenderer';
import './Canvas.css';

interface CanvasProps {
  onDrop: (template: ComponentTemplate, position: { x: number; y: number }) => void;
  draggingTemplate: ComponentTemplate | null;
}

const Canvas: React.FC<CanvasProps> = ({ onDrop, draggingTemplate }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    state,
    selectComponent,
    moveComponent,
    getCurrentDeviceConfig,
    changeLayoutMode,
    addComponent,
  } = useEditor();
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [componentStartPos, setComponentStartPos] = useState({ x: 0, y: 0 });
  const [dragOverContainerId, setDragOverContainerId] = useState<string | null>(null);

  const deviceConfig = getCurrentDeviceConfig();
  const zoom = state.zoom / 100;
  const isPreviewMode = state.isPreviewMode;

  const findContainerAtPosition = useCallback((clientX: number, clientY: number): string | null => {
    const elements = document.elementsFromPoint(clientX, clientY);
    
    for (const element of elements) {
      const componentId = element.getAttribute('data-component-id');
      if (componentId) {
        const findComponent = (components: CanvasComponent[], id: string): CanvasComponent | null => {
          for (const comp of components) {
            if (comp.id === id) return comp;
            if (comp.children && comp.children.length > 0) {
              const found = findComponent(comp.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        
        const component = findComponent(state.canvasComponents, componentId);
        if (component && [
          ComponentType.CONTAINER,
          ComponentType.ROW,
          ComponentType.COL,
          ComponentType.CARD,
          ComponentType.TABLE,
          ComponentType.TABS,
        ].includes(component.type)) {
          return componentId;
        }
      }
    }
    
    return null;
  }, [state.canvasComponents]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
    
    const containerId = findContainerAtPosition(e.clientX, e.clientY);
    setDragOverContainerId(containerId);
  }, [isPreviewMode, findContainerAtPosition]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
    setDragOverContainerId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (isPreviewMode) return;
      e.preventDefault();
      setIsDragOver(false);

      if (!draggingTemplate || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      const containerId = findContainerAtPosition(e.clientX, e.clientY);
      
      if (containerId) {
        addComponent(draggingTemplate, { x: 0, y: 0 }, containerId);
      } else {
        onDrop(draggingTemplate, { x, y });
      }
      
      setDragOverContainerId(null);
    },
    [draggingTemplate, zoom, onDrop, isPreviewMode, findContainerAtPosition, addComponent]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPreviewMode) return;
      if (e.target === canvasRef.current) {
        selectComponent(null);
      }
    },
    [selectComponent, isPreviewMode]
  );

  const findComponentById = useCallback((components: CanvasComponent[], id: string): CanvasComponent | null => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children && comp.children.length > 0) {
        const found = findComponentById(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const handleComponentMouseDown = useCallback(
    (e: React.MouseEvent, componentId: string) => {
      if (isPreviewMode) return;
      e.stopPropagation();
      const component = findComponentById(state.canvasComponents, componentId);
      
      if (!component || component.locked) return;

      selectComponent(componentId);
      setDraggingComponent(componentId);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setComponentStartPos({
        x: (component.style.left as number) || 0,
        y: (component.style.top as number) || 0,
      });
    },
    [state.canvasComponents, selectComponent, isPreviewMode, findComponentById]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingComponent || state.layoutMode === LayoutMode.GRID || isPreviewMode) return;

      const deltaX = (e.clientX - dragStartPos.x) / zoom;
      const deltaY = (e.clientY - dragStartPos.y) / zoom;

      moveComponent(draggingComponent, {
        x: componentStartPos.x + deltaX,
        y: componentStartPos.y + deltaY,
      });
    },
    [draggingComponent, dragStartPos, componentStartPos, zoom, moveComponent, state.layoutMode, isPreviewMode]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingComponent) {
      const component = state.canvasComponents.find((c) => c.id === draggingComponent);
      if (component) {
        // 这里可以触发更新历史记录
      }
    }
    setDraggingComponent(null);
  }, [draggingComponent, state.canvasComponents]);

  useEffect(() => {
    if (draggingComponent && !isPreviewMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingComponent, handleMouseMove, handleMouseUp, isPreviewMode]);

  const handleLayoutModeChange = (mode: LayoutMode) => {
    if (isPreviewMode) return;
    changeLayoutMode(mode);
  };

  const renderCanvasComponent = (component: CanvasComponent) => {
    if (!component.visible) return null;

    const isSelected = !isPreviewMode && state.selectedComponentId === component.id;
    const isDragging = !isPreviewMode && draggingComponent === component.id;

    return (
      <CanvasRenderer
        key={component.id}
        component={component}
        isSelected={isSelected}
        isDragging={isDragging}
        onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
        layoutMode={state.layoutMode}
        isPreviewMode={isPreviewMode}
      />
    );
  };

  const canvasStyle: React.CSSProperties = {
    width: deviceConfig.width,
    height: 'auto',
    minHeight: deviceConfig.height,
    transform: `scale(${zoom})`,
    transformOrigin: 'top center',
    position: state.layoutMode === LayoutMode.GRID ? 'relative' : 'relative',
  };

  if (isPreviewMode) {
    return (
      <div className="canvas-container canvas-container-preview">
        <div className="canvas-wrapper canvas-wrapper-preview">
          <div
            ref={canvasRef}
            className="canvas canvas-preview"
            style={canvasStyle}
          >
            {state.canvasComponents.map(renderCanvasComponent)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-container">
      <div className="canvas-toolbar">
        <div className="layout-mode-switch">
          <span
            className={`mode-btn ${state.layoutMode === LayoutMode.FREE ? 'active' : ''}`}
            onClick={() => handleLayoutModeChange(LayoutMode.FREE)}
          >
            自由布局
          </span>
          <span
            className={`mode-btn ${state.layoutMode === LayoutMode.GRID ? 'active' : ''}`}
            onClick={() => handleLayoutModeChange(LayoutMode.GRID)}
          >
            栅格布局
          </span>
        </div>
        <div className="canvas-info">
          <span>当前设备: {deviceConfig.name}</span>
          <span>缩放: {state.zoom}%</span>
        </div>
      </div>
      <div className="canvas-wrapper">
        <div
          ref={canvasRef}
          className={`canvas ${isDragOver ? 'drag-over' : ''}`}
          style={canvasStyle}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          {state.canvasComponents.map(renderCanvasComponent)}
          {state.canvasComponents.length === 0 && (
            <div className="canvas-empty">
              <div className="empty-icon">📱</div>
              <div className="empty-text">从左侧组件库拖拽组件到这里</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
