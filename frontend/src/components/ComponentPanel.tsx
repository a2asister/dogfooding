import { For } from 'solid-js';
import { componentRegistry } from './registry';
import editorStore from '../store/editorStore';

export default function ComponentPanel() {
  const { addComponent } = editorStore;

  const categories = [
    { id: 'chart', name: '图表组件', icon: '📊' },
    { id: 'basic', name: '基础组件', icon: '📝' },
    { id: 'map', name: '地图组件', icon: '🗺️' },
  ];

  return (
    <div class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      <div class="p-4 border-b border-slate-700">
        <h2 class="text-lg font-semibold text-white">组件库</h2>
        <p class="text-slate-400 text-sm mt-1">拖拽组件到画布</p>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <For each={categories}>
          {(category) => {
            const components = componentRegistry.filter((c) => c.category === category.id);
            if (components.length === 0) return null;

            return (
              <div>
                <h3 class="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.name}
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <For each={components}>
                    {(component) => (
                      <button
                        onClick={() => addComponent(component.type)}
                        class="flex flex-col items-center justify-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all duration-200 border border-slate-600/50 hover:border-purple-500/50 group"
                        title={component.name}
                      >
                        <span class="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {component.icon}
                        </span>
                        <span class="text-xs text-slate-300 truncate w-full text-center">
                          {component.name}
                        </span>
                      </button>
                    )}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
