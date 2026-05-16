import React, { useState, useRef, useEffect } from 'react';
import { FileItem } from '../types';

interface ImageViewerProps {
  file: FileItem;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ file }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState('');
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file.content) {
      setImageSrc(file.content);
    } else {
      const fallbackImages = [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=2',
        'https://picsum.photos/800/600?random=3',
      ];
      setImageSrc(fallbackImages[file.id % fallbackImages.length]);
    }
  }, [file]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
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

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(5, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.1, prev - 0.2));
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="image-viewer" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
      <div className="image-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: '#2d2d2d',
        borderBottom: '1px solid #3d3d3d',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleZoomOut}
            style={{
              padding: '6px 12px',
              background: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ➖ 缩小
          </button>
          <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            style={{
              padding: '6px 12px',
              background: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ➕ 放大
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleRotateLeft}
            style={{
              padding: '6px 12px',
              background: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ↺ 左转
          </button>
          <button
            onClick={handleRotateRight}
            style={{
              padding: '6px 12px',
              background: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ↻ 右转
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '6px 12px',
              background: '#3d3d3d',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            🔄 重置
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="image-container"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        <img
          src={imageSrc}
          alt={file.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </div>
      <div className="image-footer" style={{
        padding: '8px 16px',
        background: '#2d2d2d',
        borderTop: '1px solid #3d3d3d',
        color: '#aaa',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>{file.name}</span>
        <span>滚轮缩放 · 拖拽移动</span>
      </div>
    </div>
  );
};

export default ImageViewer;