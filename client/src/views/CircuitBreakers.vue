<template>
  <div>
    <header class="main-header">
      <h1 class="page-title">熔断器管理</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          + 新建熔断器
        </button>
      </div>
    </header>
    <div class="main-body">
      <div class="grid grid-3 mb-4">
        <div class="stat-card">
          <div class="stat-icon success">
            <span style="font-size: 24px;">✅</span>
          </div>
          <div class="stat-info">
            <div class="stat-value text-success">{{ stats.closed }}</div>
            <div class="stat-label">正常 (关闭)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <span style="font-size: 24px;">⚠️</span>
          </div>
          <div class="stat-info">
            <div class="stat-value text-warning">{{ stats.halfOpen }}</div>
            <div class="stat-label">恢复中 (半开)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <span style="font-size: 24px;">🚨</span>
          </div>
          <div class="stat-info">
            <div class="stat-value text-danger">{{ stats.open }}</div>
            <div class="stat-label">熔断 (开启)</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-container" v-if="circuitBreakers.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>状态</th>
                  <th>失败率阈值</th>
                  <th>慢调用阈值</th>
                  <th>等待时间</th>
                  <th>隔离级别</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="circuit in circuitBreakers" :key="circuit.id">
                  <td class="font-semibold">
                    <div class="flex items-center gap-2">
                      <span :class="['status-dot', getStatusDotClass(circuit.state)]"></span>
                      {{ circuit.name }}
                    </div>
                  </td>
                  <td>
                    <span :class="['badge', getStatusBadgeClass(circuit.state)]">
                      {{ getStatusText(circuit.state) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>{{ circuit.config.failureThreshold }}%</span>
                      <div class="progress-bar" style="width: 60px;">
                        <div 
                          :class="['progress-bar-fill', circuit.failureRate > circuit.config.failureThreshold * 0.8 ? 'warning' : 'success']"
                          :style="{ width: Math.min(100, (circuit.failureRate / circuit.config.failureThreshold) * 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>{{ circuit.config.slowCallThreshold }}%</td>
                  <td>{{ (circuit.config.waitDurationInOpenState / 1000).toFixed(0) }}s</td>
                  <td>
                    <span class="badge badge-secondary">
                      {{ getIsolationLevelText(circuit.config.isolationLevel) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button 
                        class="btn btn-outline btn-sm"
                        @click="handleAction(circuit.id, 'reset')"
                        :disabled="circuit.state === 'closed'"
                      >
                        重置
                      </button>
                      <button 
                        class="btn btn-danger btn-sm"
                        @click="handleAction(circuit.id, 'forceOpen')"
                        v-if="circuit.state !== 'open'"
                      >
                        强制开启
                      </button>
                      <button 
                        class="btn btn-success btn-sm"
                        @click="handleAction(circuit.id, 'forceClosed')"
                        v-else
                      >
                        强制关闭
                      </button>
                      <button 
                        class="btn btn-outline btn-sm"
                        @click="editCircuit(circuit)"
                      >
                        编辑
                      </button>
                      <button 
                        class="btn btn-outline btn-sm text-danger"
                        @click="confirmDelete(circuit.id)"
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
            <div class="empty-state-icon">🔌</div>
            <div class="empty-state-text">暂无熔断器配置</div>
            <button class="btn btn-primary" @click="showCreateModal = true">
              创建第一个熔断器
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
                {{ showCreateModal ? '新建熔断器' : '编辑熔断器' }}
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
                  placeholder="输入熔断器名称"
                />
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">失败率阈值 (%)</label>
                  <input 
                    v-model.number="formData.failureThreshold" 
                    type="number" 
                    class="form-input"
                    min="1"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">慢调用率阈值 (%)</label>
                  <input 
                    v-model.number="formData.slowCallThreshold" 
                    type="number" 
                    class="form-input"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">慢调用时间阈值 (ms)</label>
                  <input 
                    v-model.number="formData.slowCallDurationThreshold" 
                    type="number" 
                    class="form-input"
                    min="100"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">熔断后等待时间 (ms)</label>
                  <input 
                    v-model.number="formData.waitDurationInOpenState" 
                    type="number" 
                    class="form-input"
                    min="1000"
                  />
                </div>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">滑动窗口类型</label>
                  <select v-model="formData.slidingWindowType" class="form-select">
                    <option value="count_based">基于计数</option>
                    <option value="time_based">基于时间</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">滑动窗口大小</label>
                  <input 
                    v-model.number="formData.slidingWindowSize" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">最小调用数</label>
                  <input 
                    v-model.number="formData.minimumNumberOfCalls" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">半开状态允许调用数</label>
                  <input 
                    v-model.number="formData.permittedNumberOfCallsInHalfOpenState" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">隔离级别</label>
                  <select v-model="formData.isolationLevel" class="form-select">
                    <option value="none">无</option>
                    <option value="semaphore">信号量</option>
                    <option value="bulkhead">舱壁</option>
                    <option value="thread_pool">线程池</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">最大并发调用数</label>
                  <input 
                    v-model.number="formData.maxConcurrentCalls" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-checkbox">
                  <input type="checkbox" v-model="formData.enabled" />
                  <span>启用熔断器</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="submitForm" :disabled="!formData.name">
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
import type { CircuitBreakerListItem, CircuitBreakerConfig, IsolationLevel } from '@/types';
import { dashboardApi, configApi } from '@/api';

const circuitBreakers = ref<CircuitBreakerListItem[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingId = ref<string | null>(null);

const defaultForm = {
  name: '',
  failureThreshold: 50,
  slowCallThreshold: 50,
  slowCallDurationThreshold: 1000,
  waitDurationInOpenState: 30000,
  permittedNumberOfCallsInHalfOpenState: 3,
  slidingWindowType: 'count_based' as const,
  slidingWindowSize: 10,
  minimumNumberOfCalls: 5,
  enabled: true,
  isolationLevel: 'semaphore' as IsolationLevel,
  maxConcurrentCalls: 10,
};

const formData = reactive({ ...defaultForm });

const stats = computed(() => {
  return {
    closed: circuitBreakers.value.filter(c => c.state === 'closed').length,
    halfOpen: circuitBreakers.value.filter(c => c.state === 'half_open').length,
    open: circuitBreakers.value.filter(c => c.state === 'open').length,
  };
});

const getStatusDotClass = (state: string) => {
  switch (state) {
    case 'open': return 'danger';
    case 'half_open': return 'warning';
    default: return 'success';
  }
};

const getStatusBadgeClass = (state: string) => {
  switch (state) {
    case 'open': return 'badge-danger';
    case 'half_open': return 'badge-warning';
    default: return 'badge-success';
  }
};

const getStatusText = (state: string) => {
  switch (state) {
    case 'open': return '开启 (熔断)';
    case 'half_open': return '半开 (恢复中)';
    default: return '关闭 (正常)';
  }
};

const getIsolationLevelText = (level: string) => {
  const levels: Record<string, string> = {
    none: '无',
    semaphore: '信号量',
    bulkhead: '舱壁',
    thread_pool: '线程池',
  };
  return levels[level] || level;
};

const loadData = async () => {
  try {
    circuitBreakers.value = await dashboardApi.getCircuitBreakers();
  } catch (error) {
    console.error('Failed to load circuit breakers:', error);
  }
};

const handleAction = async (id: string, action: string) => {
  try {
    switch (action) {
      case 'reset':
        await configApi.resetCircuitBreaker(id);
        break;
      case 'forceOpen':
        await configApi.forceOpenCircuit(id);
        break;
      case 'forceClosed':
        await configApi.forceClosedCircuit(id);
        break;
    }
    await loadData();
  } catch (error) {
    console.error(`Failed to ${action} circuit:`, error);
  }
};

const editCircuit = (circuit: CircuitBreakerListItem) => {
  editingId.value = circuit.id;
  formData.name = circuit.name;
  formData.failureThreshold = circuit.config.failureThreshold;
  formData.slowCallThreshold = circuit.config.slowCallThreshold;
  formData.isolationLevel = circuit.config.isolationLevel;
  if (circuit.config.waitDurationInOpenState !== undefined) {
    formData.waitDurationInOpenState = circuit.config.waitDurationInOpenState;
  }
  if (circuit.config.slowCallDurationThreshold !== undefined) {
    formData.slowCallDurationThreshold = circuit.config.slowCallDurationThreshold;
  }
  if (circuit.config.slidingWindowType !== undefined) {
    formData.slidingWindowType = circuit.config.slidingWindowType as any;
  }
  if (circuit.config.slidingWindowSize !== undefined) {
    formData.slidingWindowSize = circuit.config.slidingWindowSize;
  }
  if (circuit.config.minimumNumberOfCalls !== undefined) {
    formData.minimumNumberOfCalls = circuit.config.minimumNumberOfCalls;
  }
  if (circuit.config.permittedNumberOfCallsInHalfOpenState !== undefined) {
    formData.permittedNumberOfCallsInHalfOpenState = circuit.config.permittedNumberOfCallsInHalfOpenState;
  }
  if (circuit.config.maxConcurrentCalls !== undefined) {
    formData.maxConcurrentCalls = circuit.config.maxConcurrentCalls;
  }
  showEditModal.value = true;
};

const confirmDelete = async (id: string) => {
  if (confirm('确定要删除这个熔断器配置吗？')) {
    try {
      await configApi.deleteCircuitConfig(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete circuit:', error);
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
      await configApi.createCircuitConfig(formData as Omit<CircuitBreakerConfig, 'id'>);
    } else if (editingId.value) {
      await configApi.updateCircuitConfig(editingId.value, formData);
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
