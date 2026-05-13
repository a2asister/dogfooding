<script setup lang="ts">
import { ref } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useTripStore } from '../stores/trip';

const store = useTripStore();
const showModal = ref(false);
const newTrip = ref({
  title: '',
  description: '',
  category: '旅行',
});

const { result, loading, refetch } = useQuery(gql`
  query GetTrips {
    trips {
      id
      title
      description
      category
      isArchived
      createdAt
      nodes {
        id
        name
      }
    }
  }
`);

const { mutate: createTrip } = useMutation(gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(createTripInput: $input) {
      id
      title
    }
  }
`);

const { mutate: updateTrip } = useMutation(gql`
  mutation UpdateTrip($input: UpdateTripInput!) {
    updateTrip(updateTripInput: $input) {
      id
      title
      isArchived
    }
  }
`);

const { mutate: deleteTrip } = useMutation(gql`
  mutation DeleteTrip($id: ID!) {
    removeTrip(id: $id)
  }
`);

const handleCreateTrip = async (): Promise<void> => {
  try {
    await createTrip({
      input: {
        title: newTrip.value.title,
        description: newTrip.value.description,
        category: newTrip.value.category,
      },
    });
    showModal.value = false;
    newTrip.value = { title: '', description: '', category: '旅行' };
    await refetch();
  } catch (error) {
    console.error('创建行程失败:', error);
  }
};

const toggleArchive = async (trip: { id: number; isArchived: boolean }): Promise<void> => {
  try {
    await updateTrip({
      input: {
        id: trip.id,
        isArchived: !trip.isArchived,
      },
    });
    await refetch();
  } catch (error) {
    console.error('更新行程失败:', error);
  }
};

const handleDelete = async (id: number): Promise<void> => {
  if (!confirm('确定要删除这个行程吗？')) return;
  try {
    await deleteTrip({ id });
    await refetch();
  } catch (error) {
    console.error('删除行程失败:', error);
  }
};

const viewTrip = (trip: { id: number }): void => {
  store.router.push(`/trip/${trip.id}`);
};
</script>

<template>
  <div class="trips-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">行程管理</h1>
        <p class="view-subtitle">管理您的所有行程</p>
      </div>
      <button class="create-btn" @click="showModal = true">
        + 创建行程
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!result?.trips?.length" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>还没有行程</h3>
      <p>创建您的第一个行程吧！</p>
      <button class="btn-primary" @click="showModal = true">创建行程</button>
    </div>

    <div v-else class="trips-grid">
      <div v-for="trip in result.trips" :key="trip.id" class="trip-card-item" :class="{ archived: trip.isArchived }">
        <div class="card-header">
          <h3 class="trip-title">{{ trip.title }}</h3>
          <span class="trip-category">{{ trip.category }}</span>
        </div>
        <p v-if="trip.description" class="trip-description">{{ trip.description }}</p>
        <div class="trip-meta">
          <span class="node-count">{{ trip.nodes.length }} 个站点</span>
          <span class="trip-date">{{ new Date(trip.createdAt).toLocaleDateString('zh-CN') }}</span>
        </div>
        <div class="trip-actions">
          <button class="action-btn view-btn" @click="viewTrip(trip)">查看</button>
          <button class="action-btn archive-btn" @click="toggleArchive(trip)">
            {{ trip.isArchived ? '取消归档' : '归档' }}
          </button>
          <button class="action-btn delete-btn" @click="handleDelete(trip.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content animate-fade-in">
        <div class="modal-header">
          <h2>创建新行程</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>行程标题</label>
            <input v-model="newTrip.title" type="text" class="form-input" placeholder="例如：云南五日游" />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="newTrip.category" class="form-input">
              <option value="旅行">旅行</option>
              <option value="商务">商务</option>
              <option value="探亲">探亲</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="newTrip.description" class="form-input textarea" placeholder="简单描述一下这次行程..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal = false">取消</button>
          <button class="btn-primary" @click="handleCreateTrip" :disabled="!newTrip.title">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trips-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.view-title {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.view-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.create-btn {
  padding: 12px 30px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.trip-card-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.trip-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.trip-card-item.archived {
  opacity: 0.6;
}

.trip-title {
  font-size: 1.3rem;
  color: #333;
  margin: 0;
}

.trip-category {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.trip-description {
  color: #666;
  margin: 15px 0;
  line-height: 1.5;
}

.trip-meta {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.node-count,
.trip-date {
  color: #888;
  font-size: 0.9rem;
}

.trip-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn {
  background: #667eea;
  color: white;
}

.archive-btn {
  background: #f0f0f0;
  color: #666;
}

.delete-btn {
  background: #ff6b6b;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-state p {
  color: white;
  font-size: 1.1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 25px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input.textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 25px;
  border-top: 1px solid #eee;
}

.btn-primary {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 30px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled),
.btn-secondary:hover {
  transform: translateY(-2px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>