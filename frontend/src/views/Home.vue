<template>
  <div class="home">
    <div class="header">
      <h1 class="title">数据可视化大屏编辑器</h1>
      <button class="btn btn-primary" @click="createNewDashboard">
        + 创建新大屏
      </button>
    </div>

    <div class="stats" v-if="statistics">
      <div class="stat-card">
        <div class="stat-value">{{ statistics.total }}</div>
        <div class="stat-label">总大屏数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ statistics.templates }}</div>
        <div class="stat-label">模板数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ statistics.totalViews }}</div>
        <div class="stat-label">总访问量</div>
      </div>
    </div>

    <div class="dashboard-list">
      <h2>我的大屏</h2>
      <div class="list-content">
        <div 
          v-for="dashboard in dashboards" 
          :key="dashboard.id"
          class="dashboard-card"
          @click="editDashboard(dashboard.id)"
        >
          <div class="card-header">
            <h3>{{ dashboard.name }}</h3>
            <div class="card-actions">
              <button class="btn-icon" @click.stop="previewDashboard(dashboard.id)">
                👁️
              </button>
              <button class="btn-icon btn-danger" @click.stop="deleteDashboard(dashboard.id)">
                🗑️
              </button>
            </div>
          </div>
          <p v-if="dashboard.description" class="card-desc">
            {{ dashboard.description }}
          </p>
          <div class="card-footer">
            <span class="view-count">👁️ {{ dashboard.viewCount }}</span>
            <span class="date">{{ formatDate(dashboard.updatedAt) }}</span>
          </div>
        </div>
        <div v-if="dashboards.length === 0" class="empty">
          暂无大屏，点击上方按钮创建
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apolloClient } from '@/apollo/client';
import { GET_DASHBOARDS, GET_STATISTICS, DELETE_DASHBOARD } from '@/apollo/queries';
import type { Dashboard } from '@/types';

const router = useRouter();
const dashboards = ref<Dashboard[]>([]);
const statistics = ref<{ total: number; templates: number; totalViews: number } | null>(null);

const fetchData = async () => {
  try {
    const [dashboardsResult, statsResult] = await Promise.all([
      apolloClient.query({ query: GET_DASHBOARDS, fetchPolicy: 'no-cache' }),
      apolloClient.query({ query: GET_STATISTICS, fetchPolicy: 'no-cache' }),
    ]);
    dashboards.value = dashboardsResult.data.dashboards;
    statistics.value = statsResult.data.dashboardStatistics;
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
};

const createNewDashboard = () => {
  router.push('/editor');
};

const editDashboard = (id: string) => {
  router.push(`/editor/${id}`);
};

const previewDashboard = (id: string) => {
  router.push(`/preview/${id}`);
};

const deleteDashboard = async (id: string) => {
  if (confirm('确定要删除这个大屏吗？')) {
    try {
      await apolloClient.mutate({
        mutation: DELETE_DASHBOARD,
        variables: { id },
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to delete dashboard:', err);
    }
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

onMounted(() => {
  fetchData().catch((err) => console.error(err));
});
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  padding: 30px;
  overflow-y: auto;
  background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 212, 255, 0.5);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
}

.stat-value {
  font-size: 48px;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.dashboard-list h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.list-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  border-color: rgba(0, 212, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 18px;
  color: white;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(0, 212, 255, 0.3);
}

.btn-danger:hover {
  background: rgba(255, 68, 68, 0.3);
}

.card-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
}
</style>
