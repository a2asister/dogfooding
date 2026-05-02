import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { BlendMode } from '../../types';
import './LayerPanel.css';

export const LayerPanel: React.FC = () => {
  const { state, dispatch, blendModes } = useEditor();
  const { layers, activeLayerId } = state;
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const handleAddLayer = () => {
    dispatch({ type: 'ADD_LAYER' });
  };

  const handleDuplicateLayer = (id: string) => {
    dispatch({ type: 'DUPLICATE_LAYER', payload: id });
  };

  const handleDeleteLayer = (id: string) => {
    dispatch({ type: 'DELETE_LAYER', payload: id });
  };

  const handleSelectLayer = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_LAYER', payload: id });
  };

  const handleToggleVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: id });
  };

  const handleToggleLock = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LAYER_LOCK', payload: id });
  };

  const handleMoveUp = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_LAYER_UP', payload: id });
  };

  const handleMoveDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'MOVE_LAYER_DOWN', payload: id });
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    dispatch({
      type: 'UPDATE_LAYER',
      payload: { id, updates: { opacity: Math.max(0, Math.min(100, opacity)) } },
    });
  };

  const handleBlendModeChange = (id: string, blendMode: BlendMode) => {
    dispatch({
      type: 'UPDATE_LAYER',
      payload: { id, updates: { blendMode } },
    });
  };

  const handleAddMask = (id: string) => {
    dispatch({ type: 'ADD_MASK', payload: id });
  };

  const handleRemoveMask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_MASK', payload: id });
  };

  const handleToggleMask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_MASK', payload: id });
  };

  const handleDoubleClick = (layer: typeof layers[0]) => {
    if (layer.locked) return;
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleNameBlur = () => {
    if (editingLayerId && editingName.trim()) {
      dispatch({
        type: 'UPDATE_LAYER',
        payload: { id: editingLayerId, updates: { name: editingName.trim() } },
      });
    }
    setEditingLayerId(null);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
    }
  };

  return (
    <div className="layer-panel flex flex-col h-full bg-editor-panel border-l border-editor-border">
      <div className="p-2 border-b border-editor-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-editor-text">图层</h3>
        <div className="flex gap-1">
          <button
            onClick={handleAddLayer}
            className="w-7 h-7 flex items-center justify-center bg-editor-bg hover:bg-editor-border rounded text-editor-text text-sm transition-colors"
            title="新建图层"
          >
            +
          </button>
        </div>
      </div>

      {activeLayer && (
        <div className="p-2 border-b border-editor-border space-y-2">
          <div>
            <label className="block text-xs text-editor-textSecondary mb-1">不透明度</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={activeLayer.opacity}
                onChange={(e) => handleOpacityChange(activeLayer.id, Number(e.target.value))}
                className="flex-1 h-1 bg-editor-border rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={activeLayer.opacity}
                onChange={(e) => handleOpacityChange(activeLayer.id, Number(e.target.value))}
                className="w-12 bg-editor-bg border border-editor-border rounded text-xs text-editor-text text-center p-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-editor-textSecondary mb-1">混合模式</label>
            <select
              value={activeLayer.blendMode}
              onChange={(e) =>
                handleBlendModeChange(activeLayer.id, e.target.value as BlendMode)
              }
              className="w-full bg-editor-bg border border-editor-border rounded text-xs text-editor-text p-1.5"
            >
              {blendModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode === 'normal'
                    ? '正常'
                    : mode === 'multiply'
                    ? '正片叠底'
                    : mode === 'screen'
                    ? '滤色'
                    : mode === 'overlay'
                    ? '叠加'
                    : mode === 'darken'
                    ? '变暗'
                    : mode === 'lighten'
                    ? '变亮'
                    : mode === 'color-dodge'
                    ? '颜色减淡'
                    : mode === 'color-burn'
                    ? '颜色加深'
                    : mode === 'hard-light'
                    ? '强光'
                    : mode === 'soft-light'
                    ? '柔光'
                    : mode}
                </option>
              ))}
            </select>
          </div>

          {activeLayer.hasMask ? (
            <div className="flex gap-1">
              <button
                onClick={(e) => handleToggleMask(e, activeLayer.id)}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  activeLayer.maskEnabled
                    ? 'bg-editor-accent text-white'
                    : 'bg-editor-bg text-editor-text hover:bg-editor-border'
                }`}
              >
                {activeLayer.maskEnabled ? '停用蒙版' : '启用蒙版'}
              </button>
              <button
                onClick={(e) => handleRemoveMask(e, activeLayer.id)}
                className="px-2 py-1 bg-editor-bg hover:bg-editor-border rounded text-xs text-editor-text transition-colors"
              >
                删除蒙版
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddMask(activeLayer.id)}
              className="w-full px-2 py-1 bg-editor-bg hover:bg-editor-border rounded text-xs text-editor-text transition-colors"
            >
              添加蒙版
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-1">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`layer-item flex items-center gap-2 p-1.5 rounded border cursor-pointer transition-colors mb-1 ${
              layer.id === activeLayerId
                ? 'selected border-editor-accent bg-editor-border/30'
                : 'border-transparent hover:bg-editor-border/20'
            }`}
            onClick={() => handleSelectLayer(layer.id)}
          >
            <button
              onClick={(e) => handleToggleVisibility(e, layer.id)}
              className="w-5 h-5 flex items-center justify-center text-xs"
              title={layer.visible ? '隐藏' : '显示'}
            >
              {layer.visible ? '👁' : '👁‍🗨'}
            </button>

            <button
              onClick={(e) => handleToggleLock(e, layer.id)}
              className="w-5 h-5 flex items-center justify-center text-xs"
              title={layer.locked ? '解锁' : '锁定'}
            >
              {layer.locked ? '🔒' : '🔓'}
            </button>

            <div className="flex-1 min-w-0">
              {editingLayerId === layer.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className="w-full bg-editor-accent/20 border border-editor-accent rounded text-xs text-editor-text px-1.5 py-0.5"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div
                  className="text-xs text-editor-text truncate select-none"
                  onDoubleClick={() => handleDoubleClick(layer)}
                >
                  {layer.name}
                  {layer.hasMask && (
                    <span className="ml-1 text-editor-textSecondary">[蒙版]</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-0.5">
              <button
                onClick={(e) => handleMoveUp(e, layer.id)}
                className="w-5 h-5 flex items-center justify-center text-xs hover:bg-editor-border/50 rounded"
                title="上移一层"
              >
                ▲
              </button>
              <button
                onClick={(e) => handleMoveDown(e, layer.id)}
                className="w-5 h-5 flex items-center justify-center text-xs hover:bg-editor-border/50 rounded"
                title="下移一层"
              >
                ▼
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateLayer(layer.id);
                }}
                className="w-5 h-5 flex items-center justify-center text-xs hover:bg-editor-border/50 rounded"
                title="复制图层"
              >
                ⧉
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLayer(layer.id);
                }}
                className="w-5 h-5 flex items-center justify-center text-xs hover:bg-editor-accent/30 rounded disabled:opacity-30"
                title="删除图层"
                disabled={layers.length <= 1 || layer.locked}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};