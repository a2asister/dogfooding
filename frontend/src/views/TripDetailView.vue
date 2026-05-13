<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useTripStore } from '../stores/trip';
import type { Trip } from '../types';

const route = useRoute();
const store = useTripStore();
const tripId = computed(() => parseInt(route.params.id as string, 10));
const showNodeModal = ref(false);

const mockTrip: Trip = {
  id: 1,
  title: '云南五日游',
  description: '一次精彩的云南之旅',
  category: '旅行',
  isArchived: false,
  createdAt: new Date(),
  nodes: [],
};

const newNode = ref({
  name: '',
  address: '',
  arrivalTime: '',
  note: '',
  order: 0,
});

const { result, loading, error, refetch } = useQuery(gql`
  query GetTrip($id: ID!) {
    trip(id: $id) {
      id
      title
      description
      category
      isArchived
      createdAt
      nodes {
        id
        name
        address
        arrivalTime
        note
        order
        tripId
      }
    }
  }
`, () => ({
  variables: { id: tripId.value },
}));

watch(
  error,
  (err) => {
    if (err) {
      console.warn('GraphQL Error (using mock data):', err.message);
    }
  }
);

const { mutate: createNode } = useMutation(gql`
  mutation CreateTripNode($input: CreateTripNodeInput!) {
    createTripNode(createTripNodeInput: $input) {
      id
      name
    }
  }
`);

const { mutate: deleteNode } = useMutation(gql`
  mutation DeleteTripNode($id: ID!) {
    removeTripNode(id: $id)
  }
`, {
  variables: () => ({}),
});

const handleCreateNode = async (): Promise<void> => {
  try {
    const nodes = result.value?.trip?.nodes || [];
    newNode.value.order = nodes.length;

    const inputData = {
      name: newNode.value.name,
      address: newNode.value.address || undefined,
      arrivalTime: new Date(newNode.value.arrivalTime),
      note: newNode.value.note || undefined,
      order: newNode.value.order,
      tripId: tripId.value,
    };

    console.log('Creating node with input:', inputData);

    await createNode({ input: inputData });
    
    showNodeModal.value = false;
    newNode.value = {
      name: '',
      address: '',
      arrivalTime: '',
      note: '',
      order: 0,
    };
    await refetch();
  } catch (error) {
    console.error('创建站点失败:', error);
    alert('创建站点失败，请检查后端服务是否启动');
  }
};

const handleDeleteNode = async (id: number): Promise<void> => {
  if (!confirm('确定要删除这个站点吗？')) return;
  try {
    await deleteNode({ id });
    await refetch();
  } catch (error) {
    console.error('删除站点失败:', error);
  }
};

const startTimeline = (): void => {
  if (result.value?.trip) {
    store.setTrips([result.value.trip]);
    store.setCurrentTrip(result.value.trip);
    store.router.push('/');
  }
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div class="trip-detail-view">
    <div class="view-header">
      <div class="header-content">
        <button class="back-btn" @click="store.router.back()">← 返回</button>
        <div>
          <h1 class="view-title">{{ result?.trip?.title }}</h1>
          <span class="trip-category">{{ result?.trip?.category }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="start-btn" @click="startTimeline">开始时间轴</button>
        <button class="add-node-btn" @click="showNodeModal = true">+ 添加站点</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>加载中...</p>
    </div>

    <div v-if="result?.trip?.description" class="description-section">
      <p class="trip-description">{{ result.trip.description }}</p>
    </div>

    <div class="nodes-section">
      <h2 class="section-title">站点列表</h2>
      <div v-if="!result?.trip?.nodes?.length" class="empty-nodes">
        <p>还没有添加站点，点击右上角添加第一个站点吧！</p>
      </div>
      <div v-else class="nodes-list">
        <div v-for="(node, index) in result.trip.nodes.sort((a: { order: number }, b: { order: number }) => a.order - b.order)" :key="node.id" class="node-item animate-fade-in" :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="node-index">{{ index + 1 }}</div>
          <div class="node-info">
            <h3 class="node-name">{{ node.name }}</h3>
            <p v-if="node.address" class="node-address">📍 {{ node.address }}</p>
            <p class="node-time">🕐 {{ formatTime(node.arrivalTime) }}</p>
            <p v-if="node.note" class="node-note">{{ node.note }}</p>
          </div>
          <button class="delete-node-btn" @click="handleDeleteNode(node.id)">×</button>
        </div>
      </div>
    </div>

    <div v-if="showNodeModal" class="modal-overlay" @click.self="showNodeModal = false">
      <div class="modal-content animate-fade-in">
        <div class="modal-header">
          <h2>添加站点</h2>
          <button class="close-btn" @click="showNodeModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>站点名称</label>
            <input v-model="newNode.name" type="text" class="form-input" placeholder="例如：昆明火车站" />
          </div>
          <div class="form-group">
            <label>地址</label>
            <input v-model="newNode.address" type="text" class="form-input" placeholder="例如：云南省昆明市官渡区" />
          </div>
          <div class="form-group">
            <label>到达时间</label>
            <input v-model="newNode.arrivalTime" type="datetime-local" class="form-input" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="newNode.note" class="form-input textarea" placeholder="在这个站点的计划安排..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showNodeModal = false">取消</button>
          <button class="btn-primary" @click="handleCreateNode" :disabled="!newNode.name || !newNode.arrivalTime">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trip-detail-view {
  max-width: 900px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.view-title {
  font-size: 2rem;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.trip-category {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 12px;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.start-btn,
.add-node-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: white;
  color: #667eea;
}

.add-node-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.start-btn:hover,
.add-node-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.description-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
}

.trip-description {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.nodes-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
}

.section-title {
  color: #333;
  margin: 0 0 25px 0;
  font-size: 1.5rem;
}

.empty-nodes {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.node-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  position: relative;
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
}

.node-index {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
}

.node-name {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.node-address,
.node-time,
.node-note {
  margin: 5px 0;
  color: #666;
  font-size: 0.95rem;
}

.node-note {
  color: #888;
  font-style: italic;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ddd;
}

.delete-node-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #ff6b6b;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.delete-node-btn:hover {
  transform: scale(1.1);
}

.loading-state {
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>