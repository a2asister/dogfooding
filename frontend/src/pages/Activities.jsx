import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { api } from '../api.js';
import ActivityForm from '../components/ActivityForm.jsx';
import Toast from '../components/Toast.jsx';

const Activities = () => {
  const [activities, setActivities] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [showModal, setShowModal] = createSignal(false);
  const [editActivity, setEditActivity] = createSignal(null);
  const [toast, setToast] = createSignal({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const loadActivities = async () => {
    try {
      const result = await api.getActivities();
      setActivities(result);
    } catch (err) {
      showToast('加载活动失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个活动吗？')) return;
    try {
      await api.deleteActivity(id);
      showToast('删除成功');
      loadActivities();
    } catch (err) {
      showToast('删除失败', 'error');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editActivity()) {
        await api.updateActivity(editActivity().id, data);
        showToast('更新成功');
      } else {
        await api.createActivity(data);
        showToast('创建成功');
      }
      setShowModal(false);
      setEditActivity(null);
      loadActivities();
    } catch (err) {
      showToast(err.message || '操作失败', 'error');
    }
  };

  const openCreateModal = () => {
    setEditActivity(null);
    setShowModal(true);
  };

  const openEditModal = (activity, e) => {
    e.stopPropagation();
    setEditActivity(activity);
    setShowModal(true);
  };

  createEffect(() => {
    loadActivities();
  });

  return (
    <div>
      <div class="page-header">
        <h1 class="page-title">活动管理</h1>
        <button class="btn btn-primary" onClick={openCreateModal}>
          + 新建活动
        </button>
      </div>

      {loading() ? (
        <div class="empty-state">
          <div class="empty-icon">⏳</div>
          <div class="empty-text">加载中...</div>
        </div>
      ) : activities().length === 0 ? (
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无活动，点击上方按钮创建</div>
        </div>
      ) : (
        <div class="activity-grid">
          {activities().map((activity) => {
            const progress = activity.max_participants > 0
              ? (activity.current_participants / activity.max_participants * 100)
              : 0;
            return (
              <div 
                class="activity-card" 
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                <h3 class="activity-name">{activity.name}</h3>
                <div class="activity-meta">
                  <span class={`status-badge status-${activity.status}`}>
                    {activity.status === 'active' ? '进行中' : 
                     activity.status === 'completed' ? '已结束' : '草稿'}
                  </span>
                  <span>📍 {activity.location}</span>
                </div>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div class="progress-text">
                    <span>报名进度</span>
                    <span>{activity.current_participants}/{activity.max_participants}</span>
                  </div>
                </div>
                <div class="activity-actions">
                  <button class="btn btn-sm btn-outline" onClick={(e) => openEditModal(activity, e)}>
                    ✏️ 编辑
                  </button>
                  <button class="btn btn-sm btn-danger" onClick={(e) => handleDelete(activity.id, e)}>
                    🗑️ 删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal() && (
        <ActivityForm
          activity={editActivity()}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditActivity(null);
          }}
        />
      )}

      {toast().show && <Toast message={toast().message} type={toast().type} />}
    </div>
  );
};

export default Activities;
