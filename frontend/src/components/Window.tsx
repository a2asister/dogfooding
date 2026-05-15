import React, { useState, useRef } from 'react';
import { WindowState } from '../types';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  children: React.ReactNode;
}

const Window: React.FC<WindowProps> = ({ window, onClose, children }) => {
  const [position, setPosition] = useState({ x: window.x, y: window.y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
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

  return (
    <div
      className="window"
      style={{
        left: position.x,
        top: position.y,
        width: window.width,
        height: window.height,
      }}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <div className="window-title">{window.title}</div>
        <div className="window-controls">
          <div className="window-control close" onClick={() => onClose(window.id)} />
          <div className="window-control minimize" />
          <div className="window-control maximize" />
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
};

export default Window;