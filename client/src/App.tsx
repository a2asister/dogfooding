import {
  createResource,
  createSignal,
  createEffect,
  For,
  type Component
} from 'solid-js';
import type { User } from './types';
import { fetchUsers } from './api';
import { UserCard } from './components/UserCard';

const App: Component = () => {
  const [users] = createResource<User[]>(() => fetchUsers());
  const [userList, setUserList] = createSignal<User[]>([]);
  const [draggingId, setDraggingId] = createSignal<string | null>(null);
  const [overId, setOverId] = createSignal<string | null>(null);

  createEffect(() => {
    const data = users();
    if (data && data.length > 0 && userList().length === 0) {
      setUserList([...data]);
    }
  });

  const handleFollowChange = (
    userId: string,
    isFollowing: boolean,
    followerCount: number
  ) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isFollowing, followerCount } : u
      )
    );
  };

  const handleDragStart = (e: DragEvent, userId: string) => {
    setDraggingId(userId);
    document.body.classList.add('is-dragging-active');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', userId);
    }
  };

  const handleDragEnter = (e: DragEvent, userId: string) => {
    e.preventDefault();
    if (draggingId() && draggingId() !== userId) {
      setOverId(userId);
    }
  };

  const handleDragLeave = (_e: DragEvent, userId: string) => {
    if (overId() === userId) {
      setOverId(null);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: DragEvent, targetUserId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceId = e.dataTransfer?.getData('text/plain') || draggingId();
    if (!sourceId || sourceId === targetUserId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }

    setUserList((prev) => {
      const list = [...prev];
      const sourceIndex = list.findIndex((u) => u.id === sourceId);
      const targetIndex = list.findIndex((u) => u.id === targetUserId);

      if (sourceIndex === -1 || targetIndex === -1) return list;

      const [removed] = list.splice(sourceIndex, 1);
      list.splice(targetIndex, 0, removed);

      return list;
    });

    setDraggingId(null);
    setOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
    document.body.classList.remove('is-dragging-active');
  };

  return (
    <div class="app-container">
      <h1 class="app-title">用户名片系统</h1>
      <p class="app-subtitle">悬停翻转卡片 · 拖拽交换位置 · 点击关注体验</p>

      {users.loading && !users() && (
        <div class="loading-container">
          <div class="loading-spinner" />
        </div>
      )}

      {userList().length > 0 && (
        <div class="card-grid">
          <For each={userList()}>
            {(user) => (
              <div
                onDragEnter={(e) => handleDragEnter(e, user.id)}
                onDragLeave={(e) => handleDragLeave(e, user.id)}
                classList={{ 'drag-wrapper': true }}
              >
                <UserCard
                  user={user}
                  onFollowChange={handleFollowChange}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDragging={draggingId() === user.id}
                  isOver={overId() === user.id}
                />
              </div>
            )}
          </For>
        </div>
      )}

      {users.error && (
        <div style={{ 'text-align': 'center', color: '#f87171', 'margin-top': '40px' }}>
          <p>加载失败，请确保后端服务已启动</p>
          <p style={{ 'margin-top': '8px', 'font-size': '0.9rem', color: '#94a3b8' }}>
            运行 npm run dev 以同时启动前后端
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
