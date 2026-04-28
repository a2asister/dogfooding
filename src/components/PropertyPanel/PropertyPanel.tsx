import React, { useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { AnimationType, BorderStyle } from '../../types';
import { getElementLabel } from '../../utils';

const PropertyPanel: React.FC = () => {
  const {
    elements,
    selectedElementIds,
    updateElementStyle,
    deleteElement
  } = useEditorStore();

  const selectedElement = selectedElementIds.length === 1 
    ? elements.find(el => el.id === selectedElementIds[0])
    : null;

  const handleStyleChange = useCallback((property: string, value: number | string | BorderStyle | AnimationType) => {
    if (!selectedElement) return;
    updateElementStyle(selectedElement.id, { [property]: value });
  }, [selectedElement, updateElementStyle]);

  const handleBorderChange = useCallback((property: keyof BorderStyle, value: number | string) => {
    if (!selectedElement) return;
    const newBorder = { ...selectedElement.style.border, [property]: value };
    updateElementStyle(selectedElement.id, { border: newBorder });
  }, [selectedElement, updateElementStyle]);

  const handleDelete = useCallback(() => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    }
  }, [selectedElement, deleteElement]);

  if (!selectedElement) {
    return (
      <div className="w-72 h-full bg-gray-50 border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">属性面板</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">👆</div>
            <p className="text-gray-500 text-sm">点击画布上的元素</p>
            <p className="text-gray-500 text-sm">以查看和编辑属性</p>
          </div>
        </div>
      </div>
    );
  }

  const { style } = selectedElement;

  return (
    <div className="w-72 h-full bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">属性面板</h2>
        <p className="text-xs text-gray-500 mt-1">
          {getElementLabel(selectedElement.type)} · ID: {selectedElement.id.slice(0, 8)}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">位置与尺寸</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X 坐标</label>
              <input
                type="number"
                value={Math.round(style.x)}
                onChange={(e) => handleStyleChange('x', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y 坐标</label>
              <input
                type="number"
                value={Math.round(style.y)}
                onChange={(e) => handleStyleChange('y', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">宽度</label>
              <input
                type="number"
                value={Math.round(style.width)}
                onChange={(e) => handleStyleChange('width', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">高度</label>
              <input
                type="number"
                value={Math.round(style.height)}
                onChange={(e) => handleStyleChange('height', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">颜色与外观</h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">文字颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.color}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={style.color}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">背景颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={style.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">背景图片 URL</label>
            <input
              type="text"
              value={style.backgroundImage}
              onChange={(e) => handleStyleChange('backgroundImage', e.target.value)}
              placeholder="输入图片 URL..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              透明度: {Math.round(style.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={style.opacity}
              onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              旋转: {Math.round(style.rotation)}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={style.rotation}
              onChange={(e) => handleStyleChange('rotation', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">边框</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">边框宽度</label>
              <input
                type="number"
                min="0"
                max="20"
                value={style.border.width}
                onChange={(e) => handleBorderChange('width', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">边框样式</label>
              <select
                value={style.border.style}
                onChange={(e) => handleBorderChange('style', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="none">无</option>
                <option value="solid">实线</option>
                <option value="dashed">虚线</option>
                <option value="dotted">点线</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">边框颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.border.color}
                onChange={(e) => handleBorderChange('color', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={style.border.color}
                onChange={(e) => handleBorderChange('color', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">圆角: {style.borderRadius}px</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={style.borderRadius}
              onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">动画</h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">入场动画</label>
            <select
              value={style.animation}
              onChange={(e) => handleStyleChange('animation', e.target.value as AnimationType)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="none">无动画</option>
              <option value="fadeIn">淡入</option>
              <option value="slideInLeft">从左滑入</option>
              <option value="slideInRight">从右滑入</option>
              <option value="slideInUp">从下滑入</option>
              <option value="slideInDown">从上滑入</option>
              <option value="scaleIn">缩放显示</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">时长 (秒)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={style.animationDuration}
                onChange={(e) => handleStyleChange('animationDuration', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">延迟 (秒)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={style.animationDelay}
                onChange={(e) => handleStyleChange('animationDelay', Number(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
        >
          删除元素 (Delete)
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;
