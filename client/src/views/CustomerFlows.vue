<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">客流统计</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 添加客流数据
        </button>
      </div>

      <div class="filter-section">
        <div class="form-group">
          <label>选择门店</label>
          <select v-model="selectedStoreId" @change="loadFlows">
            <option value="">所有门店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="loadFlows">🔄 刷新</button>
      </div>

      <table v-if="flows.length">
        <thead>
          <tr>
            <th>门店</th>
            <th>日期</th>
            <th>进店人数</th>
            <th>出店人数</th>
            <th>净流量</th>
            <th>记录时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="flow in flows" :key="flow.id">
            <td>{{ getStoreName(flow.storeId) }}</td>
            <td>{{ flow.date }}</td>
            <td>{{ flow.inCount }}</td>
            <td>{{ flow.outCount }}</td>
            <td :style="{ color: flow.inCount - flow.outCount >= 0 ? '#10b981' : '#ef4444' }">
              {{ flow.inCount - flow.outCount >= 0 ? '+' : '' }}{{ flow.inCount - flow.outCount }}
            </td>
            <td>{{ formatDate(flow.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无客流数据</p>
    </div>

    <!-- 添加客流弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>添加客流数据</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>选择门店 *</label>
            <select v-model="formData.storeId" required>
              <option value="">请选择门店</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>日期 *</label>
            <input v-model="formData.date" type="date" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>进店人数 *</label>
              <input v-model.number="formData.inCount" type="number" min="0" required placeholder="请输入进店人数" />
            </div>
            <div class="form-group">
              <label>出店人数 *</label>
              <input v-model.number="formData.outCount" type="number" min="0" required placeholder="请输入出店人数" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              添加数据
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { customerFlowApi } from '@/api/customerFlows';
import { storeApi } from '@/api/stores';
import { CustomerFlow, Store } from '@/types';

const flows = ref<CustomerFlow[]>([]);
const stores = ref<Store[]>([]);
const selectedStoreId = ref('');
const error = ref('');
const success = ref('');
const showModal = ref(false);

const defaultFormData = {
  storeId: '',
  date: new Date().toISOString().split('T')[0],
  inCount: 0,
  outCount: 0
};

const formData = ref({ ...defaultFormData });

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

const getStoreName = (storeId: string) => {
  const store = stores.value.find(s => s.id === storeId);
  return store ? store.name : '未知门店';
};

const loadStores = async () => {
  try {
    const response = await storeApi.getAll();
    if (response.success && response.data) {
      stores.value = response.data;
    }
  } catch (err) {
    console.error('加载门店失败:', err);
  }
};

const loadFlows = async () => {
  try {
    const response = await customerFlowApi.getAll(selectedStoreId.value || undefined);
    if (response.success && response.data) {
      flows.value = response.data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
  } catch (err) {
    console.error('加载客流数据失败:', err);
  }
};

const openCreateModal = () => {
  formData.value = { ...defaultFormData };
  if (stores.value.length > 0) {
    formData.value.storeId = stores.value[0].id;
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  error.value = '';
  success.value = '';
};

const handleSubmit = async () => {
  try {
    error.value = '';
    const response = await customerFlowApi.create({
      storeId: formData.value.storeId,
      date: formData.value.date,
      inCount: formData.value.inCount,
      outCount: formData.value.outCount
    });

    if (response.success) {
      success.value = '客流数据添加成功！';
      closeModal();
      loadFlows();
      setTimeout(() => {
        success.value = '';
      }, 3000);
    } else {
      error.value = response.message || '添加失败';
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试';
    console.error(err);
  }
};

onMounted(() => {
  loadStores();
  loadFlows();
});
</script>
