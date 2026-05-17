import { createSignal, Show } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import editorStore from '../store/editorStore';
import { dashboardApi } from '../services/api';

export default function EditorToolbar() {
  const { state, setZoom, setSnapToGrid, setShowGrid, undo, redo, saveStatus, setSaveStatus } = editorStore;
  const navigate = useNavigate();
  const params = useParams();
  const [showExportMenu, setShowExportMenu] = createSignal(false);

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      const dashboardId = Number(params.id);
      await dashboardApi.update(dashboardId, { config: state.dashboard });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('保存失败:', error);
      setSaveStatus('idle');
    }
  };

  const handleExportImage = (format: 'png' | 'jpg') => {
    const canvas = document.createElement('canvas');
    canvas.width = state.dashboard.width;
    canvas.height = state.dashboard.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = state.dashboard.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `dashboard.${format}`;
    link.href = dataUrl;
    link.click();
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>可视化大屏</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            overflow: hidden;
        }
        .dashboard {
            position: relative;
            width: ${state.dashboard.width}px;
            height: ${state.dashboard.height}px;
            background-color: ${state.dashboard.backgroundColor};
            transform: scale(var(--scale, 1));
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
</head>
<body>
    <div class="dashboard" id="dashboard"></div>
    <script>
        const config = ${JSON.stringify(state.dashboard)};
        
        function scaleDashboard() {
            const dashboard = document.getElementById('dashboard');
            const scaleX = window.innerWidth / config.width;
            const scaleY = window.innerHeight / config.height;
            const scale = Math.min(scaleX, scaleY);
            dashboard.style.setProperty('--scale', scale);
        }
        
        window.addEventListener('resize', scaleDashboard);
        scaleDashboard();
        
        // 注意：完整的组件渲染需要更多逻辑
        console.log('大屏配置:', config);
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'dashboard.html';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div class="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
      <div class="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          class="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回
        </button>

        <div class="h-6 w-px bg-slate-700" />

        <div class="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setZoom(Math.max(0.2, state.zoom - 0.1))}
            class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600/50 rounded transition-colors"
          >
            −
          </button>
          <span class="text-sm text-slate-300 w-14 text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, state.zoom + 0.1))}
            class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600/50 rounded transition-colors"
          >
            +
          </button>
        </div>

        <div class="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={undo}
            disabled={!state.history || state.historyIndex <= 0}
            class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600/50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="撤销 (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={!state.history || state.historyIndex >= state.history.length - 1}
            class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600/50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="重做 (Ctrl+Shift+Z)"
          >
            ↪
          </button>
        </div>

        <div class="h-6 w-px bg-slate-700" />

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={state.snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              class="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            对齐网格
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={state.showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              class="w-4 h-4 rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            显示网格
          </label>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <Show when={saveStatus() === 'saved'}>
          <span class="text-sm text-green-400 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            已保存
          </span>
        </Show>

        <button
          onClick={() => navigate(`/preview/${params.id}`)}
          class="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
        >
          👁️ 预览
        </button>

        <div class="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu())}
            class="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
          >
            📤 导出
          </button>

          <Show when={showExportMenu()}>
            <div class="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={() => handleExportImage('png')}
                class="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
              >
                🖼️ 导出 PNG 图片
              </button>
              <button
                onClick={() => handleExportImage('jpg')}
                class="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
              >
                🖼️ 导出 JPG 图片
              </button>
              <button
                onClick={handleExportHTML}
                class="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
              >
                🌐 导出 HTML 文件
              </button>
            </div>
          </Show>
        </div>

        <button
          onClick={handleSave}
          disabled={saveStatus() === 'saving'}
          class="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saveStatus() === 'saving' ? (
            <>
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              保存中...
            </>
          ) : (
            <>💾 保存</>
          )}
        </button>
      </div>
    </div>
  );
}
