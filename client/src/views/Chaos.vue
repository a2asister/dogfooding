<template>
  <div>
    <header class="main-header">
      <h1 class="page-title">故障演练</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          + 新建演练
        </button>
      </div>
    </header>
    <div class="main-body">
      <div class="grid grid-3 mb-4">
        <div class="stat-card">
          <div class="stat-icon primary">
            <span style="font-size: 24px;">⚙️</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">演练总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <span style="font-size: 24px;">🔥</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.running }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <span style="font-size: 24px;">✅</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-container" v-if="chaosExercises.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>故障类型</th>
                  <th>目标端点</th>
                  <th>强度</th>
                  <th>触发概率</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exercise in chaosExercises" :key="exercise.id">
                  <td class="font-semibold">
                    <div class="flex items-center gap-2">
                      <span :class="['status-dot', getStatusColor(exercise.status)]"></span>
                      {{ exercise.name }}
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getChaosTypeBadgeClass(exercise.type)">
                      {{ getChaosTypeText(exercise.type) }}
                    </span>
                  </td>
                  <td class="text-muted">{{ exercise.targetEndpoint }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <div class="progress-bar" style="width: 60px;">
                        <div 
                          class="progress-bar-fill warning"
                          :style="{ width: exercise.intensity + '%' }"
                        ></div>
                      </div>
                      <span>{{ exercise.intensity }}%</span>
                    </div>
                  </td>
                  <td>{{ formatProbability(exercise.probability) }}%</td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(exercise.status)">
                      {{ getStatusText(exercise.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <template v-if="exercise.status === 'idle'">
                        <button 
                          class="btn btn-outline btn-sm"
                          @click="startExercise(exercise.id)"
                        >
                          启动
                        </button>
                      </template>
                      <template v-else-if="exercise.status === 'running'">
                        <button 
                          class="btn btn-outline btn-sm"
                          @click="pauseExercise(exercise.id)"
                        >
                          暂停
                        </button>
                      </template>
                      <template v-else-if="exercise.status === 'paused'">
                        <button 
                          class="btn btn-outline btn-sm"
                          @click="resumeExercise(exercise.id)"
                        >
                          恢复
                        </button>
                      </template>
                      <template v-else-if="exercise.status !== 'running'">
                        <button 
                          class="btn btn-outline btn-sm"
                          @click="startExercise(exercise.id)"
                        >
                          重启
                        </button>
                      </template>
                      <template v-if="exercise.status === 'running'">
                        <button 
                          class="btn btn-outline btn-sm text-danger"
                          @click="stopExercise(exercise.id)"
                        >
                          停止
                        </button>
                      </template>
                      <template v-if="exercise.status === 'idle'">
                        <button 
                          class="btn btn-outline btn-sm text-danger"
                          @click="confirmDelete(exercise.id)"
                        >
                          删除
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <div class="empty-state-icon">🔥</div>
            <div class="empty-state-text">暂无故障演练</div>
            <button class="btn btn-primary" @click="showCreateModal = true">
              创建第一个演练
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div class="modal-overlay" v-if="showCreateModal" @click.self="closeModal">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">新建故障演练</h3>
              <button class="modal-close" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">演练名称</label>
                <input 
                  v-model="formData.name" 
                  type="text" 
                  class="form-input"
                  placeholder="输入演练名称"
                />
              </div>
              <div class="form-group">
                <label class="form-label">故障类型</label>
                <select v-model="formData.type" class="form-select">
                  <option value="latency">延迟注入</option>
                  <option value="exception">异常抛出</option>
                  <option value="abort">请求中断</option>
                  <option value="cpu_stress">CPU 压力</option>
                  <option value="memory_stress">内存压力</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">目标端点</label>
                <input 
                  v-model="formData.targetEndpoint" 
                  type="text" 
                  class="form-input"
                  placeholder="/api/users/*"
                />
              </div>
              <div class="form-group">
                <label class="form-label">目标方法</label>
                <select v-model="formData.targetMethod" class="form-select">
                  <option value="*">所有方法</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">强度 (%)</label>
                  <input 
                    v-model.number="formData.intensity" 
                    type="number" 
                    class="form-input"
                    min="1"
                    max="100"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">触发概率 (%)</label>
                  <input 
                    v-model.number="formData.probability" 
                    type="number" 
                    class="form-input"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">持续时间 (ms)</label>
                <input 
                  v-model.number="formData.duration" 
                  type="number" 
                  class="form-input"
                  min="1000"
                />
              </div>
              <div v-if="formData.type === 'latency'" class="form-group">
                <label class="form-label">延迟时间 (ms)</label>
                <input 
                  v-model.number="formData.delay" 
                  type="number" 
                  class="form-input"
                  min="100"
                />
              </div>
              <div class="form-group">
                <label class="form-label">描述 (可选)</label>
                <textarea 
                  v-model="formData.description" 
                  class="form-input"
                  rows="3"
                  placeholder="描述演练目的..."
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="submitForm" :disabled="!formData.name || !formData.targetEndpoint">
                创建
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
import type { ChaosExerciseListItem, ChaosExperiment, ChaosType } from '@/types';
import { dashboardApi, chaosApi } from '@/api';

const chaosExercises = ref<ChaosExerciseListItem[]>([]);
const showCreateModal = ref(false);

const defaultForm = {
  name: '',
  description: '',
  type: 'latency' as ChaosType,
  targetEndpoint: '/api/*',
  targetMethod: '*',
  intensity: 50,
  duration: 60000,
  probability: 30,
  delay: 1000,
};

const formData = reactive({ ...defaultForm });

const stats = computed(() => {
  return {
    total: chaosExercises.value.length,
    running: chaosExercises.value.filter(e => e.status === 'running').length,
    completed: chaosExercises.value.filter(e => e.status === 'completed').length,
  };
});

const formatProbability = (prob: number) => {
  if (prob <= 1) {
    return Math.round(prob * 100);
  }
  return Math.round(prob);
};

const getChaosTypeText = (type: string) => {
  const types: Record<string, string> = {
    latency: '延迟注入',
    exception: '异常抛出',
    abort: '请求中断',
    cpu_stress: 'CPU压力',
    memory_stress: '内存压力',
  };
  return types[type] || type;
};

const getChaosTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    latency: 'badge-warning',
    exception: 'badge-danger',
    abort: 'badge-warning',
    cpu_stress: 'badge-primary',
    memory_stress: 'badge-info',
  };
  return classes[type] || 'badge-secondary';
};

const getStatusText = (status: string) => {
  const statuses: Record<string, string> = {
    idle: '待运行',
    running: '运行中',
    paused: '已暂停',
    completed: '已完成',
    aborted: '已中止',
  };
  return statuses[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    idle: 'secondary',
    running: 'success',
    paused: 'warning',
    completed: 'info',
    aborted: 'danger',
  };
  return colors[status] || 'secondary';
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    idle: 'badge-secondary',
    running: 'badge-success',
    paused: 'badge-warning',
    completed: 'badge-info',
    aborted: 'badge-danger',
  };
  return classes[status] || 'badge-secondary';
};

const loadData = async () => {
  try {
    chaosExercises.value = await dashboardApi.getChaosExercises();
  } catch (error) {
    console.error('Failed to load chaos exercises:', error);
  }
};

const startExercise = async (id: string) => {
  try {
    await chaosApi.start(id);
    await loadData();
  } catch (error) {
    console.error('Failed to start exercise:', error);
  }
};

const pauseExercise = async (id: string) => {
  try {
    await chaosApi.pause(id);
    await loadData();
  } catch (error) {
    console.error('Failed to pause exercise:', error);
  }
};

const resumeExercise = async (id: string) => {
  try {
    await chaosApi.resume(id);
    await loadData();
  } catch (error) {
    console.error('Failed to resume exercise:', error);
  }
};

const stopExercise = async (id: string) => {
  try {
    await chaosApi.stop(id);
    await loadData();
  } catch (error) {
    console.error('Failed to stop exercise:', error);
  }
};

const confirmDelete = async (id: string) => {
  if (confirm('确定要删除这个故障演练吗？')) {
    try {
      await chaosApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  Object.assign(formData, defaultForm);
};

const submitForm = async () => {
  try {
    const createData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      targetEndpoint: formData.targetEndpoint,
      targetMethod: formData.targetMethod,
      intensity: formData.intensity,
      duration: formData.duration,
      probability: formData.probability / 100,
    };
    await chaosApi.create(createData);
    closeModal();
    await loadData();
  } catch (error) {
    console.error('Failed to create exercise:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>
