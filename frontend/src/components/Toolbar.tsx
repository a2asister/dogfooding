import React from 'react';
import { Type, Square, Image, Box, Trash2 } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

export const Toolbar: React.FC = () => {
  const { addElement, selectedElementId, removeElement } = useEditorStore();

  const elementTypes = [
    { type: 'text' as const, icon: Type, label: '文本' },
    { type: 'shape' as const, icon: Square, label: '形状' },
    { type: 'image' as const, icon: Image, label: '图片' },
    { type: 'container' as const, icon: Box, label: '容器' },
  ];

  const handleAddElement = (type: 'text' | 'shape' | 'image' | 'container') => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 150,
      content: type === 'text' ? '双击编辑文本' : undefined,
      backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
      fontSize: type === 'text' ? 24 : undefined,
      color: type === 'text' ? '#000000' : undefined,
    };
    addElement(newElement);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white border-r border-gray-200 w-16">
      {elementTypes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => handleAddElement(type)}
          className="p-3 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center gap-1"
          title={label}
        >
          <Icon className="w-5 h-5 text-gray-700" />
          <span className="text-xs text-gray-500">{label}</span>
        </button>
      ))}

      <div className="border-t border-gray-200 my-2" />

      <button
        onClick={() => selectedElementId && removeElement(selectedElementId)}
        disabled={!selectedElementId}
        className="p-3 rounded-lg hover:bg-red-50 transition-colors flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        title="删除元素"
      >
        <Trash2 className="w-5 h-5 text-red-500" />
        <span className="text-xs text-red-500">删除</span>
      </button>
    </div>
  );
};
