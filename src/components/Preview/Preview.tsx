import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { CanvasElement as CanvasElementType } from '../../types';

const Preview: React.FC = () => {
  const { elements, canvas, setPreviewMode } = useEditorStore();
  const [isAnimating, setIsAnimating] = useState(true);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey(prev => prev + 1);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setPreviewMode(false);
  };

  const handleReplay = () => {
    setIsAnimating(true);
    setRenderKey(prev => prev + 1);
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const renderElementContent = (element: CanvasElementType) => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: element.type === 'list' ? 'flex-start' : 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      padding: '4px 8px',
      color: element.style.color,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    };

    switch (element.type) {
      case 'title':
        return (
          <div style={{ ...baseStyle, fontSize: '24px', fontWeight: 'bold' }}>
            {element.content}
          </div>
        );
      case 'list':
        return (
          <div style={{ ...baseStyle, fontSize: '14px', lineHeight: 1.5 }}>
            {element.content}
          </div>
        );
      case 'bold':
        return (
          <div style={{ ...baseStyle, fontSize: '14px', fontWeight: 'bold' }}>
            {element.content}
          </div>
        );
      case 'italic':
        return (
          <div style={{ ...baseStyle, fontSize: '14px', fontStyle: 'italic' }}>
            {element.content}
          </div>
        );
      case 'link':
        return (
          <div style={{ ...baseStyle, fontSize: '14px', textDecoration: 'underline', cursor: 'pointer' }}>
            {element.content}
          </div>
        );
      case 'divider':
        return (
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: element.style.backgroundColor 
            }} 
          />
        );
      case 'rectangle':
      case 'slide':
        return (
          <div 
            style={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '12px'
            }}
          >
            {element.content || (element.type === 'slide' ? '幻灯片' : '矩形')}
          </div>
        );
      default:
        return <div style={baseStyle}>{element.content}</div>;
    }
  };

  const scaleToFit = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - 60;
    
    const scaleX = windowWidth / canvas.canvasWidth;
    const scaleY = windowHeight / canvas.canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    const offsetX = (windowWidth - canvas.canvasWidth * scale) / 2;
    const offsetY = (windowHeight - canvas.canvasHeight * scale) / 2;
    
    return { scale, offsetX, offsetY };
  };

  const { scale, offsetX, offsetY } = scaleToFit();

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="h-14 bg-gray-900 flex items-center justify-between px-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold">预览模式</span>
          {isAnimating && (
            <span className="text-green-400 text-sm animate-pulse">动画播放中...</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleReplay}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            重新播放动画
          </button>
          
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <span>✕</span>
            返回编辑
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden bg-gray-800">
        <div
          key={renderKey}
          className="relative bg-white shadow-2xl"
          style={{
            width: canvas.canvasWidth * scale,
            height: canvas.canvasHeight * scale,
            transform: `translate(${offsetX}px, ${offsetY}px)`
          }}
        >
          {elements.map((element) => {
            const elementStyle: React.CSSProperties = {
              position: 'absolute',
              left: element.style.x * scale,
              top: element.style.y * scale,
              width: element.style.width * scale,
              height: element.style.height * scale,
              backgroundColor: element.style.backgroundColor,
              backgroundImage: element.style.backgroundImage ? `url(${element.style.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: element.style.opacity,
              transform: `rotate(${element.style.rotation}deg)`,
              borderRadius: element.style.borderRadius * scale,
              border: element.style.border.width > 0 
                ? `${element.style.border.width * scale}px ${element.style.border.style} ${element.style.border.color}`
                : 'none',
              boxSizing: 'border-box',
              '--animation-duration': `${element.style.animationDuration}s`,
              '--animation-delay': `${element.style.animationDelay}s`
            } as React.CSSProperties;

            return (
              <div
                key={element.id}
                style={elementStyle}
                className={`animation-${element.style.animation}`}
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: element.style.width, height: element.style.height }}>
                  {renderElementContent(element)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-10 bg-gray-900 flex items-center justify-center border-t border-gray-700">
        <span className="text-gray-400 text-xs">
          画布尺寸: {canvas.canvasWidth}×{canvas.canvasHeight}px | 元素数量: {elements.length} | 按 ESC 或点击返回编辑
        </span>
      </div>
    </div>
  );
};

export default Preview;
