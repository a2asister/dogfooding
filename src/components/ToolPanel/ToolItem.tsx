import React from 'react';
import { useDrag } from 'react-dnd';
import { ElementType } from '../../types';
import { getElementIcon, getElementLabel } from '../../utils';

interface ToolItemProps {
  type: ElementType;
}

const ToolItem: React.FC<ToolItemProps> = ({ type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TOOL_ITEM',
    item: { type, isNew: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-all select-none ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-600 font-semibold">
        {getElementIcon(type)}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {getElementLabel(type)}
      </span>
    </div>
  );
};

export default ToolItem;
