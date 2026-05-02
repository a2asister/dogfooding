import React, { useRef, useState, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import './MenuBar.css';

interface MenuBarProps {
  onImportImage: (file: File) => void;
  onExportImage: (format: 'png' | 'jpg' | 'webp') => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ onImportImage, onExportImage }) => {
  const { state, dispatch } = useEditor();
  const { canvasConfig, selection } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [canvasSettings, setCanvasSettings] = useState({
    width: canvasConfig.width,
    height: canvasConfig.height,
    resolution: canvasConfig.resolution,
    backgroundColor: canvasConfig.backgroundColor,
  });
  const [showCanvasDialog, setShowCanvasDialog] = useState(false);

  useEffect(() => {
    setCanvasSettings({
      width: canvasConfig.width,
      height: canvasConfig.height,
      resolution: canvasConfig.resolution,
      backgroundColor: canvasConfig.backgroundColor,
    });
  }, [canvasConfig]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportImage(file);
    }
    e.target.value = '';
  };

  const handleApplyCanvasSettings = () => {
    dispatch({
      type: 'SET_CANVAS_CONFIG',
      payload: {
        width: Math.max(1, canvasSettings.width),
        height: Math.max(1, canvasSettings.height),
        resolution: Math.max(1, canvasSettings.resolution),
        backgroundColor: canvasSettings.backgroundColor,
      },
    });
    setShowCanvasDialog(false);
  };

  const handleClearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  const handleInvertSelection = () => {
    dispatch({ type: 'INVERT_SELECTION' });
  };

  const menus: {
    name: string;
    items: {
      label: string;
      action: () => void;
      disabled?: boolean;
      divider?: boolean;
    }[];
  }[] = [
    {
      name: '文件',
      items: [
        { label: '新建', action: () => dispatch({ type: 'RESET_STATE' }) },
        { label: '导入图片...', action: handleFileClick },
        { label: '导出 PNG', action: () => onExportImage('png') },
        { label: '导出 JPG', action: () => onExportImage('jpg') },
        { label: '导出 WebP', action: () => onExportImage('webp') },
        { divider: true, label: '', action: () => {} },
        { label: '保存项目', action: () => dispatch({ type: 'SAVE_STATE' }) },
        { label: '加载项目', action: () => dispatch({ type: 'LOAD_STATE' }) },
      ],
    },
    {
      name: '编辑',
      items: [
        { label: '画布设置...', action: () => setShowCanvasDialog(true) },
        { divider: true, label: '', action: () => {} },
        { label: '取消选区', action: handleClearSelection, disabled: !selection },
        { label: '反选', action: handleInvertSelection, disabled: !selection },
      ],
    },
    {
      name: '图层',
      items: [
        { label: '新建图层', action: () => dispatch({ type: 'ADD_LAYER' }) },
        { label: '复制图层', action: () => state.activeLayerId && dispatch({ type: 'DUPLICATE_LAYER', payload: state.activeLayerId }), disabled: !state.activeLayerId },
        { label: '删除图层', action: () => state.activeLayerId && state.layers.length > 1 && dispatch({ type: 'DELETE_LAYER', payload: state.activeLayerId }), disabled: !state.activeLayerId || state.layers.length <= 1 },
        { divider: true, label: '', action: () => {} },
        { label: '上移一层', action: () => state.activeLayerId && dispatch({ type: 'MOVE_LAYER_UP', payload: state.activeLayerId }), disabled: !state.activeLayerId },
        { label: '下移一层', action: () => state.activeLayerId && dispatch({ type: 'MOVE_LAYER_DOWN', payload: state.activeLayerId }), disabled: !state.activeLayerId },
      ],
    },
    {
      name: '视图',
      items: [
        { label: '放大', action: () => dispatch({ type: 'SET_ZOOM', payload: Math.min(500, state.zoom + 10) }) },
        { label: '缩小', action: () => dispatch({ type: 'SET_ZOOM', payload: Math.max(10, state.zoom - 10) }) },
        { label: '100%', action: () => dispatch({ type: 'SET_ZOOM', payload: 100 }) },
        { label: '适应屏幕', action: () => dispatch({ type: 'SET_ZOOM', payload: 50 }) },
        { divider: true, label: '', action: () => {} },
        { label: '重置视图', action: () => {
          dispatch({ type: 'SET_ZOOM', payload: 100 });
          dispatch({ type: 'SET_PAN', payload: { x: 0, y: 0 } });
        }},
      ],
    },
  ];

  return (
    <>
      <div className="menu-bar flex items-center gap-0 bg-editor-panel border-b border-editor-border px-1 h-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {menus.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              className={`menu-btn px-3 py-1 text-xs text-editor-text hover:bg-editor-border rounded transition-colors ${
                activeMenu === menu.name ? 'bg-editor-border' : ''
              }`}
              onClick={() => setActiveMenu(activeMenu === menu.name ? null : menu.name)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.name)}
            >
              {menu.name}
            </button>

            {activeMenu === menu.name && (
              <div
                className="menu-dropdown absolute top-full left-0 mt-0 bg-editor-panel border border-editor-border rounded shadow-lg min-w-36 z-50"
                onMouseLeave={() => setActiveMenu(null)}
              >
                {menu.items.map((item, idx) =>
                  item.divider ? (
                    <div key={idx} className="border-t border-editor-border my-1" />
                  ) : (
                    <button
                      key={idx}
                      className={`menu-item w-full text-left px-4 py-1.5 text-xs transition-colors ${
                        item.disabled
                          ? 'text-editor-textSecondary cursor-not-allowed'
                          : 'text-editor-text hover:bg-editor-accent hover:text-white'
                      }`}
                      onClick={() => {
                        if (!item.disabled) item.action();
                        setActiveMenu(null);
                      }}
                      disabled={item.disabled}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCanvasDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-editor-panel border border-editor-border rounded-lg p-4 min-w-80 shadow-xl">
            <h3 className="text-sm font-medium text-editor-text mb-4">画布设置</h3>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-editor-textSecondary mb-1">宽度 (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={canvasSettings.width}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, width: Number(e.target.value) })}
                    className="w-full bg-editor-bg border border-editor-border rounded text-sm text-editor-text px-2 py-1.5"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-editor-textSecondary mb-1">高度 (px)</label>
                  <input
                    type="number"
                    min="1"
                    value={canvasSettings.height}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, height: Number(e.target.value) })}
                    className="w-full bg-editor-bg border border-editor-border rounded text-sm text-editor-text px-2 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-editor-textSecondary mb-1">分辨率 (ppi)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={canvasSettings.resolution}
                  onChange={(e) => setCanvasSettings({ ...canvasSettings, resolution: Number(e.target.value) })}
                  className="w-full bg-editor-bg border border-editor-border rounded text-sm text-editor-text px-2 py-1.5"
                />
              </div>

              <div>
                <label className="block text-xs text-editor-textSecondary mb-1">背景颜色</label>
                <input
                  type="color"
                  value={canvasSettings.backgroundColor}
                  onChange={(e) => setCanvasSettings({ ...canvasSettings, backgroundColor: e.target.value })}
                  className="w-full h-8 cursor-pointer bg-transparent border border-editor-border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCanvasDialog(false)}
                className="px-3 py-1.5 bg-editor-bg hover:bg-editor-border rounded text-xs text-editor-text transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleApplyCanvasSettings}
                className="px-3 py-1.5 bg-editor-accent hover:bg-editor-accent/80 rounded text-xs text-white transition-colors"
              >
                应用
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};