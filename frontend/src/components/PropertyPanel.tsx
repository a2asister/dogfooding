import { createSignal, Show, For } from 'solid-js';
import editorStore from '../store/editorStore';

export default function PropertyPanel() {
  const { state, getSelectedComponent, updateComponentWithHistory, updateDashboardStyle, deleteComponent, copyComponent } = editorStore;
  const [activeTab, setActiveTab] = createSignal<'config' | 'data' | 'style' | 'animation' | 'interaction'>('config');

  const selectedComponent = getSelectedComponent();

  const tabs = [
    { id: 'config', name: '配置', icon: '⚙️' },
    { id: 'data', name: '数据', icon: '📊' },
    { id: 'style', name: '样式', icon: '🎨' },
    { id: 'animation', name: '动画', icon: '✨' },
    { id: 'interaction', name: '交互', icon: '🖱️' },
  ];

  const handleConfigChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentWithHistory(selectedComponent.id, {
      config: { ...selectedComponent.config, [key]: value },
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentWithHistory(selectedComponent.id, {
      style: { ...selectedComponent.style, [key]: value },
    });
  };

  const handleDataChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentWithHistory(selectedComponent.id, {
      data: { ...selectedComponent.data, [key]: value },
    });
  };

  const handleAnimationChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentWithHistory(selectedComponent.id, {
      animation: { ...selectedComponent.animation, [key]: value },
    });
  };

  const handleInteractionChange = (key: string, value: any) => {
    if (!selectedComponent) return;
    updateComponentWithHistory(selectedComponent.id, {
      interaction: { ...selectedComponent.interaction, [key]: value },
    });
  };

  const colorPresets = [
    '#0f172a', '#1e293b', '#334155', '#475569',
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#10b981', '#34d399', '#f59e0b', '#ef4444',
    '#06b6d4', '#0ea5e9', '#64748b', '#94a3b8',
  ];

  return (
    <div class="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      <div class="p-4 border-b border-slate-700">
        <h2 class="text-lg font-semibold text-white">属性设置</h2>
        <p class="text-slate-400 text-sm mt-1">
          {selectedComponent ? selectedComponent.name : '请选择组件'}
        </p>
      </div>

      <Show when={selectedComponent}>
        <div class="flex border-b border-slate-700">
          <For each={tabs}>
            {(tab) => (
              <button
                onClick={() => setActiveTab(tab.id as any)}
                class={`flex-1 px-2 py-3 text-sm font-medium transition-colors ${
                  activeTab() === tab.id
                    ? 'text-purple-400 bg-purple-500/10 border-b-2 border-purple-500'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                }`}
              >
                <span class="mr-1">{tab.icon}</span>
                {tab.name}
              </button>
            )}
          </For>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <Show when={activeTab() === 'config'}>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  组件名称
                </label>
                <input
                  type="text"
                  value={selectedComponent!.name}
                  onInput={(e) => updateComponentWithHistory(selectedComponent!.id, { name: e.target.value })}
                  class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">
                    X 坐标
                  </label>
                  <input
                    type="number"
                    value={selectedComponent!.x}
                    onInput={(e) => updateComponentWithHistory(selectedComponent!.id, { x: Number(e.target.value) })}
                    class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">
                    Y 坐标
                  </label>
                  <input
                    type="number"
                    value={selectedComponent!.y}
                    onInput={(e) => updateComponentWithHistory(selectedComponent!.id, { y: Number(e.target.value) })}
                    class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">
                    宽度
                  </label>
                  <input
                    type="number"
                    value={selectedComponent!.width}
                    onInput={(e) => updateComponentWithHistory(selectedComponent!.id, { width: Number(e.target.value) })}
                    class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">
                    高度
                  </label>
                  <input
                    type="number"
                    value={selectedComponent!.height}
                    onInput={(e) => updateComponentWithHistory(selectedComponent!.id, { height: Number(e.target.value) })}
                    class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <For each={Object.entries(selectedComponent!.config)}>
                {([key, value]) => {
                  const configKey = key as string;
                  const configValue = value as any;
                  return (
                    <div>
                      <label class="block text-sm font-medium text-slate-300 mb-2 capitalize">
                        {configKey.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {typeof configValue === 'boolean' ? (
                        <button
                          onClick={() => handleConfigChange(configKey, !configValue)}
                          class={`w-12 h-6 rounded-full transition-colors ${configValue ? 'bg-purple-500' : 'bg-slate-600'}`}
                        >
                          <div class={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${configValue ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                      ) : typeof configValue === 'number' ? (
                        <input
                          type="number"
                          value={configValue}
                          onInput={(e) => handleConfigChange(configKey, Number(e.target.value))}
                          class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : Array.isArray(configValue) ? null : (
                        <input
                          type="text"
                          value={String(configValue)}
                          onInput={(e) => handleConfigChange(configKey, e.target.value)}
                          class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>

          <Show when={activeTab() === 'data'}>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  数据来源
                </label>
                <select
                  value={selectedComponent!.data.type}
                  onChange={(e) => handleDataChange('type', e.target.value)}
                  class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="mock">模拟数据</option>
                  <option value="static">静态 JSON</option>
                  <option value="api">API 接口</option>
                </select>
              </div>

              <Show when={selectedComponent!.data.type === 'mock'}>
                <div class="space-y-3 p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">
                      数据条数
                    </label>
                    <input
                      type="number"
                      value={selectedComponent!.data.mockConfig?.count || 6}
                      onInput={(e) => handleDataChange('mockConfig', {
                        ...selectedComponent!.data.mockConfig, count: Number(e.target.value)
                      })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-medium text-slate-400 mb-1">
                        最小值
                      </label>
                      <input
                        type="number"
                        value={selectedComponent!.data.mockConfig?.min || 0}
                        onInput={(e) => handleDataChange('mockConfig', {
                          ...selectedComponent!.data.mockConfig, min: Number(e.target.value)
                        })}
                        class="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-slate-400 mb-1">
                        最大值
                      </label>
                      <input
                        type="number"
                        value={selectedComponent!.data.mockConfig?.max || 100}
                        onInput={(e) => handleDataChange('mockConfig', {
                          ...selectedComponent!.data.mockConfig, max: Number(e.target.value)
                        })}
                        class="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Show>

              <Show when={selectedComponent!.data.type === 'static'}>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    JSON 数据
                  </label>
                  <textarea
                    value={JSON.stringify(selectedComponent!.data.staticData || [], null, 2)}
                    onInput={(e) => {
                      try {
                        const data = JSON.parse(e.target.value);
                        handleDataChange('staticData', data);
                      } catch {
                        // 忽略解析错误
                      }
                    }}
                    rows={8}
                    class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder='[{"name": "数据1", "value": 100}]'
                  />
                </div>
              </Show>

              <Show when={selectedComponent!.data.type === 'api'}>
                <div class="space-y-3 p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">
                      API 地址
                    </label>
                    <input
                      type="text"
                      value={selectedComponent!.data.apiConfig?.url || ''}
                      onInput={(e) => handleDataChange('apiConfig', {
                        ...selectedComponent!.data.apiConfig, url: e.target.value
                      })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="https://api.example.com/data"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">
                      请求方式
                    </label>
                    <select
                      value={selectedComponent!.data.apiConfig?.method || 'GET'}
                      onChange={(e) => handleDataChange('apiConfig', {
                        ...selectedComponent!.data.apiConfig, method: e.target.value
                      })}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={activeTab() === 'style'}>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  背景颜色
                </label>
                <div class="flex gap-2 flex-wrap">
                  <For each={colorPresets}>
                    {(color) => (
                      <button
                        onClick={() => handleStyleChange('backgroundColor', color)}
                        class={`w-6 h-6 rounded border-2 transition-all ${
                          selectedComponent!.style.backgroundColor === color
                            ? 'border-purple-400 scale-110'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                        style={{ 'background-color': color }}
                      />
                    )}
                  </For>
                </div>
                <input
                  type="color"
                  value={selectedComponent!.style.backgroundColor || '#0f172a'}
                  onInput={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  class="w-full mt-2 h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">
                    圆角
                  </label>
                  <input
                    type="number"
                    value={selectedComponent!.style.borderRadius || 0}
                    onInput={(e) => handleStyleChange('borderRadius', Number(e.target.value))}
                    class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-400 mb-1">
                    不透明度
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedComponent!.style.opacity ?? 1}
                    onInput={(e) => handleStyleChange('opacity', Number(e.target.value))}
                    class="w-full mt-2"
                  />
                </div>
              </div>
            </div>
          </Show>

          <Show when={activeTab() === 'animation'}>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-slate-300">
                  启用动画
                </label>
                <button
                  onClick={() => handleAnimationChange('enabled', !selectedComponent!.animation.enabled)}
                  class={`w-12 h-6 rounded-full transition-colors ${selectedComponent!.animation.enabled ? 'bg-purple-500' : 'bg-slate-600'}`}
                >
                  <div class={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${selectedComponent!.animation.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <Show when={selectedComponent!.animation.enabled}>
                <div class="space-y-3 p-3 bg-slate-700/30 rounded-lg">
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">
                      动画时长 (ms)
                    </label>
                    <input
                      type="number"
                      value={selectedComponent!.animation.duration || 1000}
                      onInput={(e) => handleAnimationChange('duration', Number(e.target.value))}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">
                      缓动函数
                    </label>
                    <select
                      value={selectedComponent!.animation.easing || 'cubicOut'}
                      onChange={(e) => handleAnimationChange('easing', e.target.value)}
                      class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="linear">Linear</option>
                      <option value="easeIn">Ease In</option>
                      <option value="easeOut">Ease Out</option>
                      <option value="easeInOut">Ease In Out</option>
                      <option value="cubicOut">Cubic Out</option>
                    </select>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={activeTab() === 'interaction'}>
            <div class="space-y-4">
              <For each={Object.entries(selectedComponent!.interaction)}>
                {([key, value]) => {
                  const interactionKey = key as string;
                  const interactionValue = value as boolean;
                  return (
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-medium text-slate-300 capitalize">
                        {interactionKey === 'tooltip' ? '显示提示' : interactionKey}
                      </label>
                      <button
                        onClick={() => handleInteractionChange(interactionKey, !interactionValue)}
                        class={`w-12 h-6 rounded-full transition-colors ${interactionValue ? 'bg-purple-500' : 'bg-slate-600'}`}
                      >
                        <div class={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${interactionValue ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>

        <div class="p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={() => copyComponent(selectedComponent!.id)}
            class="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>📋</span>
            复制组件
          </button>
          <button
            onClick={() => deleteComponent(selectedComponent!.id)}
            class="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            删除组件
          </button>
        </div>
      </Show>

      <Show when={!selectedComponent}>
        <div class="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
          <span class="text-5xl mb-4 opacity-30">👆</span>
          <p class="text-center">点击画布中的组件进行编辑</p>
        </div>

        <div class="p-4 border-t border-slate-700">
          <h3 class="text-sm font-medium text-slate-300 mb-3">画布设置</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1">
                背景颜色
              </label>
              <input
                type="color"
                value={state.dashboard.backgroundColor || '#0f172a'}
                onInput={(e) => updateDashboardStyle({ backgroundColor: e.target.value })}
                class="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <For each={colorPresets.slice(0, 8)}>
                {(color) => (
                  <button
                    onClick={() => updateDashboardStyle({ backgroundColor: color })}
                    class={`w-full h-8 rounded border-2 transition-all ${
                      state.dashboard.backgroundColor === color
                        ? 'border-purple-400'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    style={{ 'background-color': color }}
                  />
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
