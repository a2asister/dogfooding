import React, { useEffect } from 'react';
import { Save, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { api } from '../services/api';
import { DeviceType } from '../types';

export const Header: React.FC = () => {
  const {
    projectName,
    projectId,
    setProjectName,
    getPageStructure,
    animationConfig,
    deviceType,
    setDeviceType,
    scrollProgress,
    setScrollProgressManually,
    autoSave,
    setAutoSave,
    isDirty,
    setProjectId,
    setIsDirty,
    loadProject,
  } = useEditorStore();

  const deviceOptions: { type: DeviceType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { type: 'desktop', icon: Monitor, label: '桌面端' },
    { type: 'tablet', icon: Tablet, label: '平板端' },
    { type: 'mobile', icon: Smartphone, label: '移动端' },
  ];

  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async (showNotification = true) => {
    try {
      setSaveStatus('saving');
      const pageStructure = getPageStructure();
      const data = {
        name: projectName,
        pageStructure: JSON.stringify(pageStructure),
        animationConfig: JSON.stringify(animationConfig),
        responsiveConfig: JSON.stringify({}),
        scrollCalibration: 0,
        isAutoSave: autoSave,
      };

      if (projectId) {
        await api.updateProject(projectId, data);
      } else {
        const result = await api.createProject(data);
        setProjectId(result.id);
      }
      setIsDirty(false);
      setSaveStatus('success');
      
      if (showNotification) {
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleLoadProject = async () => {
    try {
      const projects = await api.getProjects();
      if (projects.length > 0) {
        loadProject(projects[0]);
      }
    } catch (error) {
      console.error('Load failed:', error);
    }
  };

  useEffect(() => {
    if (autoSave && isDirty && projectId) {
      const timer = setTimeout(() => handleSave(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, autoSave, projectId]);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">滚动叙事动画编辑器</h1>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-48"
        />
        {isDirty && <span className="text-xs text-orange-500">● 未保存</span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {deviceOptions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setDeviceType(type)}
              className={`p-2 rounded-md transition-colors ${
                deviceType === type
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            动画预览: {(scrollProgress * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scrollProgress}
            onChange={(e) => setScrollProgressManually(Number(e.target.value))}
            className="w-32 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => setScrollProgressManually(0)}
            className="px-2 py-1 text-xs bg-white rounded hover:bg-gray-50"
          >
            重置
          </button>
          <div className="text-xs text-gray-500">
            元素: {animationConfig.triggers.filter((t: any) => t.type !== 'parallax').length} | 
            视差: {animationConfig.triggers.filter((t: any) => t.type === 'parallax').length}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600">自动保存</span>
        </label>

        <button
          onClick={handleLoadProject}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          加载项目
        </button>

        <button
          onClick={() => handleSave(true)}
          disabled={saveStatus === 'saving'}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            saveStatus === 'saving'
              ? 'bg-gray-400 cursor-not-allowed'
              : saveStatus === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : saveStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          <Save className="w-4 h-4" />
          {saveStatus === 'saving' ? '保存中...' : saveStatus === 'success' ? '已保存 ✓' : saveStatus === 'error' ? '保存失败 ✗' : '保存'}
        </button>
      </div>
    </header>
  );
};
