import React, { useState, useRef } from 'react';
import { WindowState } from '../types';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize?: (id: string) => void;
  onMaximize?: (id: string) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ window, onClose, onMinimize, onMaximize, children }) => {
  const [position, setPosition] = useState({ x: window.x, y: window.y });
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize(window.id);
    }
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition({ x: window.x, y: window.y });
      setSize({ width: window.width, height: window.height });
    } else {
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 48 });
    }
    setIsMaximized(!isMaximized);
    if (onMaximize) {
      onMaximize(window.id);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      globalThis.addEventListener('mouseup', handleMouseUp);
      globalThis.addEventListener('mousemove', handleMouseMove as any);
    }
    return () => {
      globalThis.removeEventListener('mouseup', handleMouseUp);
      globalThis.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [isDragging]);

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
      }}
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
          <button className="window-control-btn close" onClick={() => onClose(window.id)} title="关闭">
            <span>✕</span>
          </button>
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
};

export default Window;
