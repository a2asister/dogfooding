<template>
  <div>
    <header class="main-header">
      <h1 class="page-title">链路隔离</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          + 新建隔离
        </button>
      </div>
    </header>
    <div class="main-body">
      <div class="grid grid-3 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">
            <span style="font-size: 24px;">📊</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeRequests }}</div>
            <div class="stat-label">活动请求</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <span style="font-size: 24px;">⏳</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.queuedRequests }}</div>
            <div class="stat-label">排队请求</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <span style="font-size: 24px;">🚫</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.rejectedRequests }}</div>
            <div class="stat-label">被拒绝</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-container" v-if="isolations.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>服务</th>
                  <th>隔离级别</th>
                  <th>利用率</th>
                  <th>活动/最大</th>
                  <th>超时</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="iso in isolations" :key="iso.id">
                  <td class="font-semibold">
                    <div class="flex items-center gap-2">
                      <span :class="['status-dot', iso.enabled ? 'success' : 'secondary']"></span>
                      {{ iso.name }}
                    </div>
                  </td>
                  <td class="text-muted">{{ iso.serviceName }}</td>
                  <td>
                    <span class="badge badge-info">{{ getLevelText(iso.level) }}</span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="progress-bar" style="width: 100px;">
                        <div 
                          :class="['progress-bar-fill', getUtilizationClass(iso.utilization)]"
                          :style="{ width: Math.min(100, iso.utilization) + '%' }"
                        ></div>
                      </div>
                      <span :class="getUtilizationTextClass(iso.utilization)">
                        {{ iso.utilization.toFixed(1) }}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="font-bold">{{ iso.activeRequests }}</span>
                    <span class="text-muted"> / {{ iso.maxConcurrent }}</span>
                  </td>
                  <td>
                    <span v-if="iso.timeouts > 0" class="badge badge-danger">{{ iso.timeouts }}</span>
                    <span v-else class="text-muted">0</span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button 
                        class="btn btn-outline btn-sm"
                        @click="resetIsolation(iso.id)"
                      >
                        重置
                      </button>
                      <button 
                        class="btn btn-outline btn-sm"
                        @click="editIsolation(iso)"
                      >
                        编辑
                      </button>
                      <button 
                        class="btn btn-outline btn-sm text-danger"
                        @click="confirmDelete(iso.id)"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <div class="empty-state-icon">🏢</div>
            <div class="empty-state-text">暂无链路隔离配置</div>
            <button class="btn btn-primary" @click="showCreateModal = true">
              创建第一个隔离
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="showCreateModal || showEditModal" @click.self="closeModal">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ showCreateModal ? '新建链路隔离' : '编辑链路隔离' }}
              </h3>
              <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">名称</label>
                <input 
                  v-model="formData.name" 
                  type="text" 
                  class="form-input"
                  placeholder="输入隔离名称"
                />
              </div>
              <div class="form-group">
                <label class="form-label">服务名称</label>
                <input 
                  v-model="formData.serviceName" 
                  type="text" 
                  class="form-input"
                  placeholder="order-service"
                />
              </div>
              <div class="form-group">
                <label class="form-label">隔离级别</label>
                <select v-model="formData.level" class="form-select">
                  <option value="none">无隔离</option>
                  <option value="semaphore">信号量</option>
                  <option value="bulkhead">舱壁</option>
                  <option value="thread_pool">线程池</option>
                </select>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">最大并发数</label>
                  <input 
                    v-model.number="formData.maxConcurrent" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">队列大小</label>
                  <input 
                    v-model.number="formData.queueSize" 
                    type="number" 
                    class="form-input"
                    min="0"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">超时时间 (ms)</label>
                <input 
                  v-model.number="formData.timeout" 
                  type="number" 
                  class="form-input"
                  min="100"
                />
              </div>
              <div class="form-group">
                <label class="form-checkbox">
                  <input type="checkbox" v-model="formData.enabled" />
                  <span>启用隔离</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="submitForm" :disabled="!formData.name || !formData.serviceName">
                {{ showCreateModal ? '创建' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { IsolationListItem, IsolationConfig, IsolationLevel } from '@/types';
import { dashboardApi, configApi } from '@/api';

const isolations = ref<IsolationListItem[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingId = ref<string | null>(null);

const defaultForm = {
  name: '',
  serviceName: '',
  level: 'bulkhead' as IsolationLevel,
  maxConcurrent: 20,
  queueSize: 100,
  timeout: 5000,
  enabled: true,
};

const formData = reactive({ ...defaultForm });

const stats = computed(() => {
  return {
    activeRequests: isolations.value.reduce((sum, i) => sum + i.activeRequests, 0),
    queuedRequests: isolations.value.reduce((sum, i) => sum + i.queuedRequests, 0),
    rejectedRequests: isolations.value.reduce((sum, i) => sum + i.rejectedRequests, 0),
  };
});

const getLevelText = (level: string) => {
  const levels: Record<string, string> = {
    none: '无隔离',
    semaphore: '信号量',
    bulkhead: '舱壁',
    thread_pool: '线程池',
  };
  return levels[level] || level;
};

const getUtilizationClass = (utilization: number) => {
  if (utilization >= 80) return 'danger';
  if (utilization >= 50) return 'warning';
  return 'success';
};

const getUtilizationTextClass = (utilization: number) => {
  if (utilization >= 80) return 'text-danger';
  if (utilization >= 50) return 'text-warning';
  return 'text-success';
};

const loadData = async () => {
  try {
    isolations.value = await dashboardApi.getIsolations();
  } catch (error) {
    console.error('Failed to load isolations:', error);
  }
};

const resetIsolation = async (id: string) => {
  try {
    await configApi.resetIsolation(id);
    await loadData();
  } catch (error) {
    console.error('Failed to reset isolation:', error);
  }
};

const editIsolation = (iso: IsolationListItem) => {
  editingId.value = iso.id;
  formData.name = iso.name;
  formData.serviceName = iso.serviceName;
  formData.level = iso.level;
  formData.maxConcurrent = iso.maxConcurrent;
  formData.enabled = iso.enabled;
  showEditModal.value = true;
};

const confirmDelete = async (id: string) => {
  if (confirm('确定要删除这个链路隔离配置吗？')) {
    try {
      await configApi.deleteIsolationConfig(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete isolation:', error);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingId.value = null;
  Object.assign(formData, defaultForm);
};

const submitForm = async () => {
  try {
    if (showCreateModal.value) {
      await configApi.createIsolationConfig(formData as Omit<IsolationConfig, 'id'>);
    } else if (editingId.value) {
      await configApi.updateIsolationConfig(editingId.value, formData);
    }
    closeModal();
    await loadData();
  } catch (error) {
    console.error('Failed to submit form:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
