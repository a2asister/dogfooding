import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { CanvasElement as CanvasElementType, DragItem } from '../../types';
import { useEditorStore } from '../../store/editorStore';
import { getElementLabel } from '../../utils';

interface CanvasElementProps {
  element: CanvasElementType;
  isSelected: boolean;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ element, isSelected }) => {
  const { 
    selectElement, 
    updateElement,
    deleteElement,
    selectedElementIds
  } = useEditorStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CANVAS_ELEMENT',
    item: (): DragItem => ({
      type: element.type,
      isNew: false,
      elementId: element.id
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isFocusedOnInput = 
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected && !isEditing && !isFocusedOnInput) {
        if (selectedElementIds.includes(element.id)) {
          e.preventDefault();
          deleteElement(element.id);
        }
      }
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(false);
        setEditContent(element.content);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isEditing, element.id, element.content, selectedElementIds, deleteElement]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id, e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (['title', 'list', 'bold', 'italic', 'link'].includes(element.type)) {
      setIsEditing(true);
      setEditContent(element.content);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent !== element.content) {
      updateElement(element.id, { content: editContent });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const renderContent = () => {
    if (isEditing && ['title', 'list', 'bold', 'italic', 'link'].includes(element.type)) {
      return (
        <textarea
          ref={inputRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-white border-2 border-blue-400 rounded p-1 resize-none focus:outline-none"
          style={{
            color: element.style.color,
            fontSize: element.type === 'title' ? '24px' : '14px',
            fontWeight: element.type === 'bold' || element.type === 'title' ? 'bold' : 'normal',
            fontStyle: element.type === 'italic' ? 'italic' : 'normal',
            textDecoration: element.type === 'link' ? 'underline' : 'none'
          }}
        />
      );
    }

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
            {element.content || getElementLabel(element.type)}
          </div>
        );
      default:
        return <div style={baseStyle}>{element.content}</div>;
    }
  };

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.style.x,
    top: element.style.y,
    width: element.style.width,
    height: element.style.height,
    backgroundColor: element.style.backgroundColor,
    backgroundImage: element.style.backgroundImage ? `url(${element.style.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: element.style.opacity,
    transform: `rotate(${element.style.rotation}deg)`,
    borderRadius: element.style.borderRadius,
    border: element.style.border.width > 0 
      ? `${element.style.border.width}px ${element.style.border.style} ${element.style.border.color}`
      : 'none',
    boxShadow: isSelected ? '0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.3)' : 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    boxSizing: 'border-box',
    zIndex: isSelected ? 100 : 1,
    transition: 'box-shadow 0.15s ease',
    '--animation-duration': `${element.style.animationDuration}s`,
    '--animation-delay': `${element.style.animationDelay}s`
  } as React.CSSProperties;

  return (
    <div
      ref={drag}
      style={elementStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`animation-${element.style.animation}`}
    >
      {renderContent()}
      
      {isSelected && !isEditing && (
        <>
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-nw-resize"
            style={{ top: -4, left: -4 }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-n-resize"
            style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-ne-resize"
            style={{ top: -4, right: -4 }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-w-resize"
            style={{ top: '50%', left: -4, transform: 'translateY(-50%)' }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-e-resize"
            style={{ top: '50%', right: -4, transform: 'translateY(-50%)' }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-sw-resize"
            style={{ bottom: -4, left: -4 }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-s-resize"
            style={{ bottom: -4, left: '50%', transform: 'translateX(-50%)' }}
          />
          <div 
            className="absolute w-2 h-2 bg-white border border-blue-500 rounded-full cursor-se-resize"
            style={{ bottom: -4, right: -4 }}
          />
          
          <div 
            className="absolute -top-7 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap select-none"
            style={{ transform: 'translateX(0)' }}
          >
            {getElementLabel(element.type)} ({Math.round(element.style.x)}, {Math.round(element.style.y)})
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasElement;
