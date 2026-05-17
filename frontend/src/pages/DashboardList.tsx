import { createSignal, createEffect, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { dashboardApi } from '../services/api';
import authStore from '../store/authStore';
import { cn } from '../utils/cn';
import type { Dashboard } from '../types';

export default function DashboardList() {
  const [dashboards, setDashboards] = createSignal<Dashboard[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [newName, setNewName] = createSignal('');
  const [newDesc, setNewDesc] = createSignal('');

  const { logout, authState } = authStore;
  const navigate = useNavigate();

  const fetchDashboards = async () => {
    try {
      const response = await dashboardApi.getAll();
      setDashboards(response.dashboards || []);
    } catch (error) {
      console.error('获取大屏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchDashboards();
  });

  const handleCreate = async () => {
    if (!newName().trim()) return;

    try {
      const response = await dashboardApi.create(newName(), newDesc());
      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
      navigate(`/editor/${response.dashboard.id}`);
    } catch (error) {
      console.error('创建大屏失败:', error);
    }
  };

  const handleDelete = async (id: number, e: Event) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个大屏吗？')) return;

    try {
      await dashboardApi.delete(id);
      fetchDashboards();
    } catch (error) {
      console.error('删除大屏失败:', error);
    }
  };

  return (
    <div class="min-h-screen bg-slate-900">
      <header class="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-white">可视化大屏系统</h1>
            <p class="text-slate-400 text-sm mt-1">管理您的数据可视化大屏</p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-slate-300">欢迎, {authState().user?.username}</span>
            <button
              onClick={logout}
              class="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-xl font-semibold text-white">我的大屏</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            class={cn(
              'px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg',
              'hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02]',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900'
            )}
          >
            + 创建新大屏
          </button>
        </div>

        <Show when={loading()}>
          <div class="text-center py-12">
            <div class="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p class="text-slate-400">加载中...</p>
          </div>
        </Show>

        <Show when={!loading() && dashboards().length === 0}>
          <div class="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <div class="text-6xl mb-4">📊</div>
            <h3 class="text-xl font-semibold text-white mb-2">还没有大屏</h3>
            <p class="text-slate-400 mb-6">创建您的第一个可视化大屏吧</p>
            <button
              onClick={() => setShowCreateModal(true)}
              class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              创建大屏
            </button>
          </div>
        </Show>

        <Show when={!loading() && dashboards().length > 0}>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <For each={dashboards()}>
              {(dashboard) => (
                <div
                  class="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/editor/${dashboard.id}`)}
                >
                  <div class="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                    <Show when={dashboard.thumbnail}>
                      <img
                        src={dashboard.thumbnail || undefined}
                        alt={dashboard.name}
                        class="w-full h-full object-cover"
                      />
                    </Show>
                    <Show when={!dashboard.thumbnail}>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-4xl opacity-30">📈</span>
                      </div>
                    </Show>
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/preview/${dashboard.id}`);
                        }}
                      >
                        预览
                      </button>
                      <button
                        class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        onClick={(e) => handleDelete(dashboard.id, e)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div class="p-4">
                    <h3 class="text-lg font-semibold text-white mb-1">{dashboard.name}</h3>
                    <p class="text-slate-400 text-sm line-clamp-2">
                      {dashboard.description || '暂无描述'}
                    </p>
                    <p class="text-slate-500 text-xs mt-3">
                      更新于: {new Date(dashboard.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </main>

      <Show when={showCreateModal()}>
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700">
            <h3 class="text-xl font-bold text-white mb-6">创建新大屏</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  大屏名称
                </label>
                <input
                  type="text"
                  value={newName()}
                  onInput={(e) => setNewName(e.target.value)}
                  class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="请输入大屏名称"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">
                  描述（可选）
                </label>
                <textarea
                  value={newDesc()}
                  onInput={(e) => setNewDesc(e.target.value)}
                  class="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="请输入大屏描述"
                />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                class="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName().trim()}
                class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
