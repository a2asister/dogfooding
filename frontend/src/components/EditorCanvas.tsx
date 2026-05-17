import { createEffect, For, onCleanup } from 'solid-js';
import ChartRenderer from './ChartRenderer';
import BasicRenderer from './BasicRenderer';
import editorStore from '../store/editorStore';
import type { ComponentType } from '../types';

export default function EditorCanvas() {
  const {
    state,
    selectComponent,
    startDrag,
    drag,
    endDrag,
    startResize,
    resize,
    endResize,
  } = editorStore;

  const isChartComponent = (type: ComponentType) => {
    return !['text', 'title', 'image', 'rectangle', 'border', 'table', 'progress', 'countup'].includes(type);
  };

  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (state.isDragging) {
      drag(e.clientX, e.clientY);
    } else if (state.isResizing) {
      resize(e.clientX, e.clientY);
    }
  };

  const handleCanvasMouseUp = () => {
    if (state.isDragging) {
      endDrag();
    } else if (state.isResizing) {
      endResize();
    }
  };

  createEffect(() => {
    document.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('mouseup', handleCanvasMouseUp);

    onCleanup(() => {
      document.removeEventListener('mousemove', handleCanvasMouseMove);
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    });
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && state.selectedId) {
      const component = state.dashboard.components.find((c) => c.id === state.selectedId);
      if (component) {
        deleteComponent(state.selectedId);
      }
    }
  };

  createEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  const { deleteComponent } = editorStore;

  return (
    <div class="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-8">
      <div
        style={{
          transform: `scale(${state.zoom})`,
          'transform-origin': 'center center',
        }}
      >
        <div
          class="relative shadow-2xl"
          style={{
            width: `${state.dashboard.width}px`,
            height: `${state.dashboard.height}px`,
            'background-color': state.dashboard.backgroundColor,
            'background-image': state.dashboard.backgroundImage
              ? `url(${state.dashboard.backgroundImage})`
              : undefined,
            'background-size': 'cover',
            'background-position': 'center',
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectComponent(null);
          }}
        >
          {state.showGrid && (
            <div
              class="absolute inset-0 pointer-events-none"
              style={{
                'background-image': `
                  linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
                `,
                'background-size': `${state.gridSize}px ${state.gridSize}px`,
              }}
            />
          )}

          <For each={state.dashboard.components}>
            {(component) => {
              const isSelected = state.selectedId === component.id;

              return (
                <div
                  class="absolute cursor-move transition-shadow duration-200"
                  style={{
                    left: `${component.x}px`,
                    top: `${component.y}px`,
                    width: `${component.width}px`,
                    height: `${component.height}px`,
                    'z-index': component.zIndex || 0,
                    border: isSelected ? '2px solid #8b5cf6' : '1px solid transparent',
                    'border-radius': '4px',
                    'box-shadow': isSelected ? '0 0 0 1px #8b5cf6, 0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectComponent(component.id);
                  }}
                  onMouseDown={(e) => {
                    if (e.button === 0) {
                      e.stopPropagation();
                      selectComponent(component.id);
                      startDrag(e.clientX, e.clientY);
                    }
                  }}
                >
                  {isChartComponent(component.type) ? (
                    <ChartRenderer
                      component={component}
                      width={component.width}
                      height={component.height}
                    />
                  ) : (
                    <BasicRenderer component={component} />
                  )}

                  {isSelected && (
                    <div
                      class="absolute -bottom-2 -right-2 w-5 h-5 bg-purple-500 rounded-full cursor-se-resize border-2 border-white flex items-center justify-center shadow-lg"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        startResize(e.clientX, e.clientY);
                      }}
                    >
                      <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
                      </svg>
                    </div>
                  )}

                  {isSelected && (
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1 shadow-lg border border-slate-700 whitespace-nowrap">
                      <span class="text-xs text-slate-300 max-w-24 truncate">{component.name}</span>
                      <span class="text-xs text-slate-500">|</span>
                      <span class="text-xs text-slate-400">{Math.round(component.x)}, {Math.round(component.y)}</span>
                    </div>
                  )}
                </div>
              );
            }}
          </For>

          {state.dashboard.components.length === 0 && (
            <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <span class="text-6xl mb-4 opacity-30">📊</span>
              <p class="text-lg">从左侧组件库拖拽组件到这里</p>
              <p class="text-sm mt-1">开始创建您的可视化大屏</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
