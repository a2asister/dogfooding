import React from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { AnimationTrigger } from '../types';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedElementId,
    elements,
    updateElement,
    animationConfig,
    addAnimationTrigger,
    removeAnimationTrigger,
  } = useEditorStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <p className="text-gray-500 text-sm text-center mt-8">选择元素以编辑属性</p>
      </div>
    );
  }

  const handlePropertyChange = (key: string, value: any) => {
    updateElement(selectedElement.id, { [key]: value });
  };

  const addAnimation = (type: AnimationTrigger['type']) => {
    const trigger: AnimationTrigger = {
      id: `trigger-${Date.now()}`,
      elementId: selectedElement.id,
      type,
      start: 0.1,
      end: 0.6,
      from: getFromValue(type),
      to: getToValue(type),
      ease: 'power1.out',
      markers: true,
    };
    addAnimationTrigger(trigger);
  };

  const getFromValue = (type: AnimationTrigger['type']) => {
    switch (type) {
      case 'fadeIn':
        return { opacity: 0 };
      case 'slideIn':
        return { x: -100, opacity: 0 };
      case 'scale':
        return { scale: 0.5, opacity: 0 };
      case 'rotate':
        return { rotation: -180, opacity: 0 };
      case 'parallax':
        return { y: 100 };
      default:
        return { opacity: 0 };
    }
  };

  const getToValue = (type: AnimationTrigger['type']) => {
    switch (type) {
      case 'parallax':
        return { y: -100 };
      default:
        return { opacity: 1, x: 0, scale: 1, rotation: 0 };
    }
  };

  const elementAnimations = animationConfig.triggers.filter(
    (t) => t.elementId === selectedElement.id,
  );

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-800 mb-4">属性设置</h3>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">X 位置</label>
          <input
            type="number"
            value={selectedElement.x}
            onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Y 位置</label>
          <input
            type="number"
            value={selectedElement.y}
            onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">宽度</label>
          <input
            type="number"
            value={selectedElement.width}
            onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">高度</label>
          <input
            type="number"
            value={selectedElement.height}
            onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {selectedElement.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">字号</label>
              <input
                type="number"
                value={selectedElement.fontSize || 16}
                onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">文字颜色</label>
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">背景颜色</label>
          <input
            type="color"
            value={selectedElement.backgroundColor || '#ffffff'}
            onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">透明度</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedElement.opacity ?? 1}
            onChange={(e) => handlePropertyChange('opacity', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">旋转角度</label>
          <input
            type="number"
            value={selectedElement.rotation || 0}
            onChange={(e) => handlePropertyChange('rotation', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-800 mb-3">添加动画</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['fadeIn', 'slideIn', 'scale', 'rotate', 'parallax'] as const).map((type) => (
            <button
              key={type}
              onClick={() => addAnimation(type)}
              className="px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              {type}
            </button>
          ))}
        </div>

        {elementAnimations.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">已添加动画 ({elementAnimations.length})</h5>
            <div className="space-y-2">
              {elementAnimations.map((trigger) => (
                <div
                  key={trigger.id}
                  className="p-2 bg-blue-50 rounded text-xs flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-blue-700">{trigger.type}</span>
                    <span className="text-gray-500">
                      触发: {(trigger.start * 100).toFixed(0)}% - {(trigger.end * 100).toFixed(0)}%
                    </span>
                  </div>
                  <button
                    onClick={() => removeAnimationTrigger(trigger.id)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                    title="删除动画"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
