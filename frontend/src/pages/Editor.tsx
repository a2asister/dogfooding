import { createEffect, createSignal, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import editorStore from '../store/editorStore';
import { dashboardApi } from '../services/api';
import EditorToolbar from '../components/EditorToolbar';
import ComponentPanel from '../components/ComponentPanel';
import EditorCanvas from '../components/EditorCanvas';
import PropertyPanel from '../components/PropertyPanel';

export default function Editor() {
  const params = useParams();
  const navigate = useNavigate();
  const { setDashboard, state } = editorStore;
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  createEffect(async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getById(Number(params.id));
      
      if (response.dashboard?.config) {
        setDashboard(response.dashboard.config);
      }
    } catch (err: any) {
      setError(err.message || '加载大屏失败');
      if (err.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  });

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        (document.querySelector('[class*="from-purple-600 to-blue-600"]') as HTMLElement)?.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (e.key === 'Delete' && state.selectedId) {
        deleteComponent(state.selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const { deleteComponent, undo, redo } = editorStore;

  return (
    <div class="h-screen flex flex-col bg-slate-900 overflow-hidden">
      <Show when={loading()}>
        <div class="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p class="text-slate-300">加载中...</p>
          </div>
        </div>
      </Show>

      <Show when={error()}>
        <div class="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
          <div class="text-center max-w-md">
            <div class="text-5xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold text-white mb-2">加载失败</h2>
            <p class="text-slate-400 mb-6">{error()}</p>
            <button
              onClick={() => navigate('/')}
              class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              返回列表
            </button>
          </div>
        </div>
      </Show>

      <EditorToolbar />

      <div class="flex-1 flex overflow-hidden">
        <ComponentPanel />
        <EditorCanvas />
        <PropertyPanel />
      </div>
    </div>
  );
}
