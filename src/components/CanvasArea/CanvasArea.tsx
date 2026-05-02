import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useEditor, getAndClearPendingImport } from '../../context/EditorContext';
import {
  createCanvas,
  getCanvasContext,
  clearCanvas,
  fillCanvas,
  loadImage,
  drawImageOnCanvas,
  getImageData,
  putImageData,
  copyCanvasContent,
  createMaskCanvas,
} from '../../utils/canvasUtils';
import { saveLayerCanvas, saveMaskCanvas, loadLayerCanvas, loadMaskCanvas } from '../../utils/storage';
import { isPointInSelection, magicWandSelection } from '../../utils/selectionUtils';
import { Tool } from '../../types';
import './CanvasArea.css';

interface CanvasAreaProps {
  onImageImport?: (file: File) => void;
}

export interface CanvasAreaRef {
  importImageToLayer: (file: File, layerId: string) => void;
  getActiveLayerCanvas: () => HTMLCanvasElement | null;
  getCompositeCanvas: () => HTMLCanvasElement | null;
}

export const CanvasArea = forwardRef<CanvasAreaRef, CanvasAreaProps>(({ onImageImport }, ref) => {
  const { state, dispatch } = useEditor();
  const { canvasConfig, layers, activeLayerId, currentTool, selection, zoom, panX, panY } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerCanvasesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const maskCanvasesRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [forceRender, setForceRender] = useState(0);

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  const activeLayerCanvas = activeLayerId ? layerCanvasesRef.current.get(activeLayerId) : undefined;

  useImperativeHandle(ref, () => ({
    importImageToLayer: async (file: File, targetLayerId: string) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        try {
          const img = await loadImage(dataUrl);
          const canvas = layerCanvasesRef.current.get(targetLayerId);
          if (canvas) {
            clearCanvas(canvas);
            drawImageOnCanvas(canvas, img);
            saveLayerCanvas(targetLayerId, canvas);
            setForceRender((prev) => prev + 1);
          }
        } catch (err) {
          console.error('Failed to load image:', err);
        }
      };
      reader.readAsDataURL(file);
    },
    getActiveLayerCanvas: () => activeLayerCanvas || null,
    getCompositeCanvas: () => compositeCanvasRef.current || null,
  }));

  const getCanvasScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };

    const scaledWidth = canvasConfig.width * (zoom / 100);
    const scaledHeight = canvasConfig.height * (zoom / 100);

    const offsetX = (container.clientWidth - scaledWidth) / 2 + panX;
    const offsetY = (container.clientHeight - scaledHeight) / 2 + panY;

    return {
      scaleX: zoom / 100,
      scaleY: zoom / 100,
      offsetX,
      offsetY,
    };
  }, [canvasConfig, zoom, panX, panY]);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };

      const rect = container.getBoundingClientRect();
      const { scaleX, scaleY, offsetX, offsetY } = getCanvasScale();

      const x = (screenX - rect.left - offsetX) / scaleX;
      const y = (screenY - rect.top - offsetY) / scaleY;

      return { x, y };
    },
    [getCanvasScale]
  );

  const initializeLayerCanvas = useCallback(
    (layerId: string, width: number, height: number) => {
      if (layerCanvasesRef.current.has(layerId)) {
        const existing = layerCanvasesRef.current.get(layerId)!;
        if (existing.width === width && existing.height === height) {
          return;
        }
      }

      const canvas = createCanvas(width, height);
      layerCanvasesRef.current.set(layerId, canvas);

      const pendingImport = getAndClearPendingImport(layerId);
      if (pendingImport) {
        loadImage(pendingImport).then((img) => {
          clearCanvas(canvas);
          drawImageOnCanvas(canvas, img);
          saveLayerCanvas(layerId, canvas);
          setForceRender((prev) => prev + 1);
        });
        return;
      }

      const savedData = loadLayerCanvas(layerId);
      if (savedData) {
        loadImage(savedData).then((img) => {
          const ctx = getCanvasContext(canvas);
          ctx.drawImage(img, 0, 0);
          setForceRender((prev) => prev + 1);
        });
      }
    },
    []
  );

  const initializeMaskCanvas = useCallback(
    (layerId: string, width: number, height: number) => {
      if (maskCanvasesRef.current.has(layerId)) {
        const existing = maskCanvasesRef.current.get(layerId)!;
        if (existing.width === width && existing.height === height) {
          return;
        }
      }

      const canvas = createMaskCanvas(width, height);
      maskCanvasesRef.current.set(layerId, canvas);

      const savedData = loadMaskCanvas(layerId);
      if (savedData) {
        loadImage(savedData).then((img) => {
          const ctx = getCanvasContext(canvas);
          ctx.drawImage(img, 0, 0);
          setForceRender((prev) => prev + 1);
        });
      }
    },
    []
  );

  const renderComposite = useCallback(() => {
    if (!compositeCanvasRef.current) return;

    const compCanvas = compositeCanvasRef.current;
    const compCtx = getCanvasContext(compCanvas);

    clearCanvas(compCanvas);
    fillCanvas(compCanvas, 'transparent');

    compCtx.save();
    compCtx.fillStyle = canvasConfig.backgroundColor;
    compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);
    compCtx.restore();

    const sortedLayers = [...layers].reverse();

    sortedLayers.forEach((layer) => {
      if (!layer.visible) return;

      const layerCanvas = layerCanvasesRef.current.get(layer.id);
      if (!layerCanvas) return;

      let sourceCanvas = layerCanvas;

      if (layer.hasMask && layer.maskEnabled) {
        const maskCanvas = maskCanvasesRef.current.get(layer.id);
        if (maskCanvas) {
          const tempCanvas = createCanvas(layerCanvas.width, layerCanvas.height);

          const layerData = getImageData(layerCanvas);
          const maskData = getImageData(maskCanvas);

          for (let i = 0; i < layerData.data.length; i += 4) {
            const maskAlpha = maskData.data[i] / 255;
            layerData.data[i + 3] = Math.round(layerData.data[i + 3] * maskAlpha);
          }

          putImageData(tempCanvas, layerData);
          sourceCanvas = tempCanvas;
        }
      }

      compCtx.save();
      compCtx.globalAlpha = layer.opacity / 100;
      compCtx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
      compCtx.drawImage(sourceCanvas, layer.x, layer.y);
      compCtx.restore();
    });

    if (selection) {
      compCtx.save();
      compCtx.strokeStyle = '#ffffff';
      compCtx.setLineDash([5, 5]);
      compCtx.lineWidth = 1;

      if (selection.type === 'rect' && selection.bounds) {
        compCtx.strokeRect(
          selection.bounds.x,
          selection.bounds.y,
          selection.bounds.width,
          selection.bounds.height
        );
      } else if (selection.type === 'circle' && selection.center && selection.radius) {
        compCtx.beginPath();
        compCtx.arc(selection.center.x, selection.center.y, selection.radius, 0, Math.PI * 2);
        compCtx.stroke();
      } else if (selection.type === 'lasso' && selection.path && selection.path.length > 1) {
        compCtx.beginPath();
        compCtx.moveTo(selection.path[0].x, selection.path[0].y);
        for (let i = 1; i < selection.path.length; i++) {
          compCtx.lineTo(selection.path[i].x, selection.path[i].y);
        }
        compCtx.closePath();
        compCtx.stroke();
      } else if (selection.type === 'magic' && selection.bounds) {
        compCtx.strokeRect(
          selection.bounds.x,
          selection.bounds.y,
          selection.bounds.width,
          selection.bounds.height
        );
      }

      compCtx.restore();
    }
  }, [layers, canvasConfig.backgroundColor, selection, forceRender]);

  const drawOnCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      x: number,
      y: number,
      lastX: number | null,
      lastY: number | null,
      tool: Tool,
      isEraser: boolean,
      isMask: boolean = false
    ) => {
      if (selection) {
        const inSelection = isPointInSelection(
          x,
          y,
          selection,
          canvasConfig.width,
          canvasConfig.height
        );
        if (!inSelection) {
          return;
        }
      }

      const ctx = getCanvasContext(canvas);
      ctx.save();

      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else if (isMask) {
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = tool.color;
        ctx.strokeStyle = tool.color;
      }

      ctx.globalAlpha = tool.opacity / 100;
      ctx.lineWidth = tool.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const hardness = tool.hardness / 100;
      if (hardness < 1 && !isMask) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, tool.size / 2);
        const colorValue = isEraser ? 'rgba(255,255,255,1)' : tool.color;
        const colorTransparent = isEraser ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)';
        gradient.addColorStop(0, colorValue);
        gradient.addColorStop(hardness, colorValue);
        gradient.addColorStop(1, colorTransparent);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = gradient;
      }

      if (lastX !== null && lastY !== null) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, tool.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    [selection, canvasConfig]
  );

  const handleMagicWand = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!activeLayerCanvas) return;

      const x = Math.floor(canvasX);
      const y = Math.floor(canvasY);

      if (x < 0 || x >= canvasConfig.width || y < 0 || y >= canvasConfig.height) {
        return;
      }

      const imageData = getImageData(activeLayerCanvas);
      const tolerance = 32;

      const result = magicWandSelection(
        imageData,
        x,
        y,
        canvasConfig.width,
        canvasConfig.height,
        tolerance
      );

      if (result.path.length > 0) {
        dispatch({
          type: 'SET_SELECTION',
          payload: {
            type: 'magic',
            path: result.path,
            bounds: result.bounds,
            feather: 0,
            colorThreshold: tolerance,
          },
        });
      }
    },
    [activeLayerCanvas, canvasConfig, dispatch]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
        return;
      }

      const canvasPos = screenToCanvas(e.clientX, e.clientY);

      if (currentTool.type === 'magicWand') {
        handleMagicWand(canvasPos.x, canvasPos.y);
        return;
      }

      if (
        currentTool.type === 'rectSelect' ||
        currentTool.type === 'circleSelect' ||
        currentTool.type === 'lasso'
      ) {
        setSelectionStart(canvasPos);
        setIsDrawing(true);

        if (currentTool.type === 'lasso') {
          dispatch({
            type: 'SET_SELECTION',
            payload: {
              type: 'lasso',
              path: [canvasPos],
              feather: 0,
            },
          });
        }
      } else if (
        currentTool.type === 'brush' ||
        currentTool.type === 'eraser' ||
        currentTool.type === 'maskBrush'
      ) {
        if (!activeLayer || activeLayer.locked) return;

        let targetCanvas: HTMLCanvasElement | undefined;
        let isMaskOperation = false;

        if (currentTool.type === 'maskBrush') {
          if (!activeLayer.hasMask) {
            dispatch({ type: 'ADD_MASK', payload: activeLayer.id });
            initializeMaskCanvas(activeLayer.id, canvasConfig.width, canvasConfig.height);
          } else {
            initializeMaskCanvas(activeLayer.id, canvasConfig.width, canvasConfig.height);
          }
          targetCanvas = maskCanvasesRef.current.get(activeLayer.id);
          isMaskOperation = true;
        } else {
          targetCanvas = activeLayerCanvas;
        }

        if (!targetCanvas) return;

        setIsDrawing(true);
        setLastPos(canvasPos);

        if (isMaskOperation) {
          const ctx = getCanvasContext(targetCanvas);
          ctx.save();

          const r = parseInt(currentTool.color.slice(1, 3), 16);
          const g = parseInt(currentTool.color.slice(3, 5), 16);
          const b = parseInt(currentTool.color.slice(5, 7), 16);
          const brightness = (r + g + b) / 3;
          const isWhite = brightness > 128;

          ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
          ctx.strokeStyle = isWhite ? '#ffffff' : '#000000';
          ctx.globalAlpha = currentTool.opacity / 100;
          ctx.lineWidth = currentTool.size;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.arc(canvasPos.x, canvasPos.y, currentTool.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          drawOnCanvas(
            targetCanvas,
            canvasPos.x,
            canvasPos.y,
            null,
            null,
            currentTool,
            currentTool.type === 'eraser',
            false
          );
        }

        setForceRender((prev) => prev + 1);
      } else if (currentTool.type === 'select') {
        if (activeLayerId && activeLayerCanvas) {
          dispatch({ type: 'SET_ACTIVE_LAYER', payload: activeLayerId });
        }
      } else if (currentTool.type === 'move') {
        setIsDragging(true);
        setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      }
    },
    [
      screenToCanvas,
      currentTool,
      activeLayer,
      activeLayerId,
      activeLayerCanvas,
      drawOnCanvas,
      dispatch,
      panX,
      panY,
      canvasConfig,
      initializeMaskCanvas,
      handleMagicWand,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && dragStart) {
        dispatch({
          type: 'SET_PAN',
          payload: { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y },
        });
        return;
      }

      if (!isDrawing) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);

      if (currentTool.type === 'rectSelect' && selectionStart) {
        const x = Math.min(selectionStart.x, canvasPos.x);
        const y = Math.min(selectionStart.y, canvasPos.y);
        const width = Math.abs(canvasPos.x - selectionStart.x);
        const height = Math.abs(canvasPos.y - selectionStart.y);

        dispatch({
          type: 'SET_SELECTION',
          payload: {
            type: 'rect',
            bounds: { x, y, width, height },
            feather: 0,
          },
        });
      } else if (currentTool.type === 'circleSelect' && selectionStart) {
        const dx = canvasPos.x - selectionStart.x;
        const dy = canvasPos.y - selectionStart.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        dispatch({
          type: 'SET_SELECTION',
          payload: {
            type: 'circle',
            center: selectionStart,
            radius,
            feather: 0,
          },
        });
      } else if (currentTool.type === 'lasso') {
        dispatch({
          type: 'SET_SELECTION',
          payload: {
            type: 'lasso',
            path: [...(selection?.path || []), canvasPos],
            feather: 0,
          },
        });
      } else if (
        currentTool.type === 'brush' ||
        currentTool.type === 'eraser' ||
        currentTool.type === 'maskBrush'
      ) {
        if (!activeLayer || activeLayer.locked) return;

        let targetCanvas: HTMLCanvasElement | undefined;
        let isMaskOperation = currentTool.type === 'maskBrush';

        if (isMaskOperation) {
          targetCanvas = activeLayerId ? maskCanvasesRef.current.get(activeLayerId) : undefined;
        } else {
          targetCanvas = activeLayerCanvas;
        }

        if (!targetCanvas || !lastPos) return;

        if (isMaskOperation) {
          const ctx = getCanvasContext(targetCanvas);
          ctx.save();

          const r = parseInt(currentTool.color.slice(1, 3), 16);
          const g = parseInt(currentTool.color.slice(3, 5), 16);
          const b = parseInt(currentTool.color.slice(5, 7), 16);
          const brightness = (r + g + b) / 3;
          const isWhite = brightness > 128;

          ctx.strokeStyle = isWhite ? '#ffffff' : '#000000';
          ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
          ctx.globalAlpha = currentTool.opacity / 100;
          ctx.lineWidth = currentTool.size;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(lastPos.x, lastPos.y);
          ctx.lineTo(canvasPos.x, canvasPos.y);
          ctx.stroke();
          ctx.restore();
        } else {
          drawOnCanvas(
            targetCanvas,
            canvasPos.x,
            canvasPos.y,
            lastPos.x,
            lastPos.y,
            currentTool,
            currentTool.type === 'eraser',
            false
          );
        }

        setLastPos(canvasPos);
        setForceRender((prev) => prev + 1);
      }
    },
    [
      isDrawing,
      isDragging,
      dragStart,
      screenToCanvas,
      currentTool,
      selectionStart,
      activeLayer,
      activeLayerId,
      activeLayerCanvas,
      lastPos,
      selection,
      drawOnCanvas,
      dispatch,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setIsDragging(false);
    setLastPos(null);
    setSelectionStart(null);
    setDragStart(null);

    if (activeLayerId) {
      const layerCanvas = layerCanvasesRef.current.get(activeLayerId);
      if (layerCanvas) {
        saveLayerCanvas(activeLayerId, layerCanvas);
      }
      const maskCanvas = maskCanvasesRef.current.get(activeLayerId);
      if (maskCanvas) {
        saveMaskCanvas(activeLayerId, maskCanvas);
      }
    }
  }, [activeLayerId]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      dispatch({ type: 'SET_ZOOM', payload: zoom + delta });
    },
    [zoom, dispatch]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        onImageImport?.(files[0]);
      }
    },
    [onImageImport]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!compositeCanvasRef.current) {
      compositeCanvasRef.current = createCanvas(canvasConfig.width, canvasConfig.height);
    }

    const compCanvas = compositeCanvasRef.current;
    if (compCanvas.width !== canvasConfig.width || compCanvas.height !== canvasConfig.height) {
      const oldCanvas = compCanvas;
      compositeCanvasRef.current = createCanvas(canvasConfig.width, canvasConfig.height);
      copyCanvasContent(oldCanvas, compositeCanvasRef.current);
    }

    layers.forEach((layer) => {
      let layerCanvas = layerCanvasesRef.current.get(layer.id);
      if (!layerCanvas) {
        initializeLayerCanvas(layer.id, canvasConfig.width, canvasConfig.height);
      } else if (layerCanvas.width !== layer.width || layerCanvas.height !== layer.height) {
        const oldCanvas = layerCanvas;
        layerCanvas = createCanvas(layer.width, layer.height);
        layerCanvasesRef.current.set(layer.id, layerCanvas);
        copyCanvasContent(oldCanvas, layerCanvas);
      }

      if (layer.hasMask) {
        let maskCanvas = maskCanvasesRef.current.get(layer.id);
        if (!maskCanvas) {
          initializeMaskCanvas(layer.id, canvasConfig.width, canvasConfig.height);
        } else if (maskCanvas.width !== layer.width || maskCanvas.height !== layer.height) {
          const oldCanvas = maskCanvas;
          maskCanvas = createMaskCanvas(layer.width, layer.height);
          maskCanvasesRef.current.set(layer.id, maskCanvas);
          copyCanvasContent(oldCanvas, maskCanvas);
        }
      }
    });

    renderComposite();
  }, [layers, canvasConfig, initializeLayerCanvas, initializeMaskCanvas, renderComposite]);

  useEffect(() => {
    renderComposite();
  }, [renderComposite]);

  const { scaleX, offsetX, offsetY } = getCanvasScale();

  return (
    <div
      ref={containerRef}
      className="canvas-area flex-1 bg-editor-bg overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="checkerboard absolute inset-0" />

      {compositeCanvasRef.current && (
        <canvas
          width={compositeCanvasRef.current.width}
          height={compositeCanvasRef.current.height}
          style={{
            position: 'absolute',
            left: offsetX,
            top: offsetY,
            width: compositeCanvasRef.current.width * scaleX,
            height: compositeCanvasRef.current.height * scaleX,
            imageRendering: 'auto',
            cursor:
              currentTool.type === 'brush' || currentTool.type === 'eraser' || currentTool.type === 'maskBrush'
                ? 'crosshair'
                : currentTool.type === 'rectSelect' ||
                  currentTool.type === 'circleSelect' ||
                  currentTool.type === 'lasso' ||
                  currentTool.type === 'magicWand'
                ? 'crosshair'
                : currentTool.type === 'move'
                ? 'grab'
                : 'default',
          }}
          ref={(el) => {
            if (el && compositeCanvasRef.current) {
              const ctx = el.getContext('2d');
              if (ctx) {
                ctx.drawImage(compositeCanvasRef.current, 0, 0);
              }
            }
          }}
        />
      )}

      <div className="absolute bottom-2 left-2 bg-editor-panel/80 backdrop-blur-sm rounded px-3 py-1.5 text-xs text-editor-textSecondary flex items-center gap-4">
        <span>缩放: {zoom}%</span>
        <span>
          画布: {canvasConfig.width} × {canvasConfig.height}
        </span>
        {activeLayer && <span>当前: {activeLayer.name}</span>}
      </div>

      <div className="absolute top-2 right-2 bg-editor-panel/80 backdrop-blur-sm rounded px-3 py-1.5 text-xs text-editor-textSecondary">
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_ZOOM', payload: Math.max(10, zoom - 10) })}
            className="hover:text-editor-accent transition-colors"
          >
            −
          </button>
          <span className="min-w-12 text-center">{zoom}%</span>
          <button
            onClick={() => dispatch({ type: 'SET_ZOOM', payload: Math.min(500, zoom + 10) })}
            className="hover:text-editor-accent transition-colors"
          >
            +
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'SET_ZOOM', payload: 100 });
              dispatch({ type: 'SET_PAN', payload: { x: 0, y: 0 } });
            }}
            className="hover:text-editor-accent transition-colors"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  );
});

CanvasArea.displayName = 'CanvasArea';
