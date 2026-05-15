import React from 'react';
import { AnimationConfig, PathVersion, HistoryRecord } from '../types';
import { Save, RotateCcw, Download, Settings, History, Trash2, Layers } from 'lucide-react';

interface ControlPanelProps {
  config: AnimationConfig;
  onConfigChange: (config: AnimationConfig) => void;
  versions: PathVersion[];
  history: HistoryRecord[];
  onSaveVersion: (description: string) => void;
  onRestoreVersion: (versionId: string) => void;
  onExportJSON: () => void;
  onExportSVG: () => void;
  onClearPoints: () => void;
  pointCount: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onConfigChange,
  versions,
  history,
  onSaveVersion,
  onRestoreVersion,
  onExportJSON,
  onExportSVG,
  onClearPoints,
  pointCount,
}) => {
  const [activeTab, setActiveTab] = React.useState<'config' | 'versions' | 'history'>('config');
  const [versionDescription, setVersionDescription] = React.useState('');

  const handleSaveVersion = () => {
    if (versionDescription.trim()) {
      onSaveVersion(versionDescription);
      setVersionDescription('');
    }
  };

  return (
    <div className="w-80 bg-slate-800 rounded-lg p-4 h-full overflow-y-auto">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
            activeTab === 'config' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Settings size={16} />
          参数
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
            activeTab === 'versions' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <Layers size={16} />
          版本
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
            activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <History size={16} />
          历史
        </button>
      </div>

      {activeTab === 'config' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">动画时长 (秒)</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.duration}
              onChange={(e) => onConfigChange({ ...config, duration: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-slate-400">{config.duration}s</span>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">缓动函数</label>
            <select
              value={config.ease}
              onChange={(e) => onConfigChange({ ...config, ease: e.target.value })}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
            >
              <option value="power1.out">Power1</option>
              <option value="power2.out">Power2</option>
              <option value="power3.out">Power3</option>
              <option value="power4.out">Power4</option>
              <option value="back.out(1.7)">Back</option>
              <option value="elastic.out(1, 0.3)">Elastic</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="loop"
              checked={config.loop}
              onChange={(e) => onConfigChange({ ...config, loop: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="loop" className="text-sm text-slate-300">循环动画</label>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">流动速度</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={config.flowSpeed}
              onChange={(e) => onConfigChange({ ...config, flowSpeed: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-slate-400">{config.flowSpeed}x</span>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">磁吸距离 (像素)</label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={config.snapDistance}
              onChange={(e) => onConfigChange({ ...config, snapDistance: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-slate-400">{config.snapDistance}px</span>
          </div>

          <div className="pt-4 border-t border-slate-700 space-y-2">
            <div className="text-sm text-slate-300 mb-2">点数: {pointCount}</div>
            <button
              onClick={onClearPoints}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <Trash2 size={16} />
              清空所有点
            </button>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={versionDescription}
              onChange={(e) => setVersionDescription(e.target.value)}
              placeholder="版本描述..."
              className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
            />
            <button
              onClick={handleSaveVersion}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              <Save size={18} />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-4">暂无版本记录</div>
            ) : (
              versions.map((version) => (
                <div key={version.id} className="bg-slate-700 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">v{version.versionNumber}</div>
                      <div className="text-xs text-slate-400">{version.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(version.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onRestoreVersion(version.id)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-4">暂无历史记录</div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="bg-slate-700 p-3 rounded">
                <div className="text-sm font-medium">{record.action}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(record.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="pt-4 border-t border-slate-700 mt-4 space-y-2">
        <button
          onClick={onExportJSON}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Download size={16} />
          导出 JSON
        </button>
        <button
          onClick={onExportSVG}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors"
        >
          <Download size={16} />
          导出 SVG
        </button>
      </div>
    </div>
  );
};