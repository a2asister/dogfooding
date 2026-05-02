import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Tool } from '../../types';
import './ToolBar.css';

const tools: { type: Tool['type']; icon: string; label: string }[] = [
  { type: 'select', icon: '↖', label: '选择' },
  { type: 'move', icon: '✋', label: '移动' },
  { type: 'brush', icon: '🖌', label: '画笔' },
  { type: 'eraser', icon: '🧽', label: '橡皮擦' },
  { type: 'rectSelect', icon: '▢', label: '矩形选区' },
  { type: 'circleSelect', icon: '○', label: '圆形选区' },
  { type: 'lasso', icon: '⊃', label: '套索' },
  { type: 'magicWand', icon: '✨', label: '魔棒' },
  { type: 'maskBrush', icon: '🎭', label: '蒙版画笔' },
];

export const ToolBar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { currentTool } = state;

  const handleToolClick = (type: Tool['type']) => {
    dispatch({ type: 'SET_TOOL', payload: { type } });
  };

  const handleToolSizeChange = (size: number) => {
    dispatch({ type: 'SET_TOOL', payload: { size: Math.max(1, Math.min(500, size)) } });
  };

  const handleToolOpacityChange = (opacity: number) => {
    dispatch({ type: 'SET_TOOL', payload: { opacity: Math.max(0, Math.min(100, opacity)) } });
  };

  const handleToolHardnessChange = (hardness: number) => {
    dispatch({ type: 'SET_TOOL', payload: { hardness: Math.max(0, Math.min(100, hardness)) } });
  };

  const handleColorChange = (color: string) => {
    dispatch({ type: 'SET_TOOL', payload: { color } });
  };

  return (
    <div className="tool-bar flex flex-col h-full bg-editor-panel border-r border-editor-border">
      <div className="flex flex-col gap-1 p-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            className={`tool-btn w-10 h-10 flex items-center justify-center text-lg rounded transition-colors
              ${currentTool.type === tool.type ? 'active bg-editor-accent text-white' : 'bg-editor-bg text-editor-text hover:bg-editor-border'}`}
            onClick={() => handleToolClick(tool.type)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="mt-auto p-2 border-t border-editor-border">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-editor-textSecondary mb-1">大小</label>
            <input
              type="range"
              min="1"
              max="500"
              value={currentTool.size}
              onChange={(e) => handleToolSizeChange(Number(e.target.value))}
              className="w-full h-1 bg-editor-border rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-editor-textSecondary">{currentTool.size}px</span>
          </div>

          <div>
            <label className="block text-xs text-editor-textSecondary mb-1">不透明度</label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentTool.opacity}
              onChange={(e) => handleToolOpacityChange(Number(e.target.value))}
              className="w-full h-1 bg-editor-border rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-editor-textSecondary">{currentTool.opacity}%</span>
          </div>

          <div>
            <label className="block text-xs text-editor-textSecondary mb-1">硬度</label>
            <input
              type="range"
              min="0"
              max="100"
              value={currentTool.hardness}
              onChange={(e) => handleToolHardnessChange(Number(e.target.value))}
              className="w-full h-1 bg-editor-border rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-editor-textSecondary">{currentTool.hardness}%</span>
          </div>

          <div>
            <label className="block text-xs text-editor-textSecondary mb-1">颜色</label>
            <input
              type="color"
              value={currentTool.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-8 cursor-pointer bg-transparent border border-editor-border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};