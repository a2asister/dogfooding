import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { PageElement } from '../types';
import { useEditorStore } from '../store/useEditorStore';
import { cn } from '../utils/cn';

interface CanvasElementProps {
  element: PageElement;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({ element }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { selectedElementId, setSelectedElementId } = useEditorStore();
  const isSelected = selectedElementId === element.id;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { id: element.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  React.useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
  }, [drag]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <span style={{ fontSize: element.fontSize || 16, color: element.color || '#000' }}>
            {element.content || '文本内容'}
          </span>
        );
      case 'image':
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">图片占位</span>
          </div>
        );
      case 'shape':
      case 'container':
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      data-element-id={element.id}
      onClick={handleClick}
      className={cn(
        'absolute cursor-move transition-shadow',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2',
        isDragging && 'opacity-50',
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.backgroundColor || 'transparent',
        borderRadius: element.borderRadius || 0,
        opacity: element.opacity ?? 1,
        transform: `rotate(${element.rotation || 0}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {renderContent()}
      {isSelected && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {element.id}
        </div>
      )}
    </div>
  );
};
