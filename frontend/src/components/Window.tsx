import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowState } from '../types';

interface WindowProps {
  window: WindowState;
  onClose: (windowId: string) => void;
  onMinimize?: (windowId: string) => void;
  onMaximize?: (windowId: string, isMaximized: boolean) => void;
  onMove?: (windowId: string, x: number, y: number) => void;
  onResize?: (windowId: string, width: number, height: number) => void;
  onFocus?: (windowId: string) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  onFocus,
  children,
}) => {
  const [position, setPosition] = useState({ x: window.x, y: window.y });
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(window.isMaximized || false);
  const [prevPosition, setPrevPosition] = useState({ x: window.x, y: window.y });
  const [prevSize, setPrevSize] = useState({ width: window.width, height: window.height });
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedUpdatePosition = useCallback((x: number, y: number) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (onMove) {
        onMove(window.windowId, x, y);
      }
    }, 100);
  }, [window.windowId, onMove]);

  const debouncedUpdateSize = useCallback((width: number, height: number) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (onResize) {
        onResize(window.windowId, width, height);
      }
    }, 100);
  }, [window.windowId, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    if (onFocus) {
      onFocus(window.windowId);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
      debouncedUpdatePosition(newX, newY);
    }
    if (isResizing) {
      const newWidth = Math.max(300, resizeStart.current.width + (e.clientX - resizeStart.current.x));
      const newHeight = Math.max(200, resizeStart.current.height + (e.clientY - resizeStart.current.y));
      setSize({ width: newWidth, height: newHeight });
      debouncedUpdateSize(newWidth, newHeight);
    }
  }, [isDragging, isResizing, debouncedUpdatePosition, debouncedUpdateSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize(window.windowId);
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(prevPosition);
      setSize(prevSize);
    } else {
      setPrevPosition(position);
      setPrevSize(size);
      setPosition({ x: 0, y: 0 });
      setSize({ width: globalThis.innerWidth, height: globalThis.innerHeight - 48 });
    }
    setIsMaximized(!isMaximized);
    if (onMaximize) {
      onMaximize(window.windowId, !isMaximized);
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      globalThis.addEventListener('mouseup', handleMouseUp);
      globalThis.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      globalThis.removeEventListener('mouseup', handleMouseUp);
      globalThis.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (window.isMinimized === false) {
      setPosition({ x: window.x, y: window.y });
      setSize({ width: window.width, height: window.height });
      setIsMaximized(window.isMaximized || false);
    }
  }, [window]);

  if (window.isMinimized) {
    return null;
  }

  return (
    <div
      className="window"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: window.zIndex || 1,
      }}
      onMouseDown={() => onFocus && onFocus(window.windowId)}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <div className="window-title">{window.title}</div>
        <div className="window-controls">
          <button className="window-control-btn minimize" onClick={handleMinimize} title="最小化">
            <span>─</span>
          </button>
          <button className="window-control-btn maximize" onClick={handleMaximize} title="最大化">
            <span>{isMaximized ? '❐' : '☐'}</span>
          </button>
          <button className="window-control-btn close" onClick={() => onClose(window.windowId)} title="关闭">
            <span>✕</span>
          </button>
        </div>
      </div>
      <div className="window-content">{children}</div>
      <div className="window-resize-handle" onMouseDown={handleResizeStart} />
    </div>
  );
};

export default Window;
