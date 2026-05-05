<template>
  <div>
    <header class="main-header">
      <h1 class="page-title">限流管理</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateModal = true">
          + 新建规则
        </button>
      </div>
    </header>
    <div class="main-body">
      <div class="grid grid-2 mb-4">
        <div class="stat-card">
          <div class="stat-icon success">
            <span style="font-size: 24px;">⚡</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.enabled }}</div>
            <div class="stat-label">激活的规则</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            <span style="font-size: 24px;">🔄</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.adaptive }}</div>
            <div class="stat-label">自适应限流</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-container" v-if="rateLimiters.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>端点</th>
                  <th>方法</th>
                  <th>类型</th>
                  <th>限制</th>
                  <th>自适应</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="limiter in rateLimiters" :key="limiter.id">
                  <td class="font-semibold">{{ limiter.name }}</td>
                  <td class="text-muted">{{ limiter.endpoint }}</td>
                  <td>
                    <span class="badge badge-secondary">{{ limiter.method }}</span>
                  </td>
                  <td>
                    <span class="badge badge-info">{{ getLimitTypeText(limiter.limitType) }}</span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>{{ limiter.currentLimit }}</span>
                      <span v-if="limiter.currentLimit !== limiter.baseLimit" class="text-xs text-muted">
                        (基础: {{ limiter.baseLimit }})
                      </span>
                    </div>
                  </td>
                  <td>
                    <span v-if="limiter.adaptive" class="badge badge-info">
                      已启用
                    </span>
                    <span v-else class="text-muted">未启用</span>
                  </td>
                  <td>
                    <span v-if="limiter.remaining <= 0" class="badge badge-warning">
                      耗尽
                    </span>
                    <span v-else class="badge badge-success">
                      正常
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button 
                        class="btn btn-outline btn-sm"
                        @click="resetLimiter(limiter.id)"
                      >
                        重置
                      </button>
                      <button 
                        class="btn btn-outline btn-sm"
                        @click="editLimiter(limiter)"
                      >
                        编辑
                      </button>
                      <button 
                        class="btn btn-outline btn-sm text-danger"
                        @click="confirmDelete(limiter.id)"
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
            <div class="empty-state-icon">⚡</div>
            <div class="empty-state-text">暂无限流规则</div>
            <button class="btn btn-primary" @click="showCreateModal = true">
              创建第一个规则
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
                {{ showCreateModal ? '新建限流规则' : '编辑限流规则' }}
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
                  placeholder="输入规则名称"
                />
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">端点路径</label>
                  <input 
                    v-model="formData.endpoint" 
                    type="text" 
                    class="form-input"
                    placeholder="/api/*"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">HTTP 方法</label>
                  <select v-model="formData.method" class="form-select">
                    <option value="*">所有方法</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">限流类型</label>
                <select v-model="formData.limitType" class="form-select">
                  <option value="fixed_window">固定窗口</option>
                  <option value="sliding_window">滑动窗口</option>
                  <option value="token_bucket">令牌桶</option>
                  <option value="leaky_bucket">漏桶</option>
                </select>
              </div>
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label">基础限制 (每窗口)</label>
                  <input 
                    v-model.number="formData.limit" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">窗口大小 (ms)</label>
                  <input 
                    v-model.number="formData.windowSize" 
                    type="number" 
                    class="form-input"
                    min="1000"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">突发限制</label>
                <input 
                  v-model.number="formData.burstLimit" 
                  type="number" 
                  class="form-input"
                  min="0"
                />
              </div>
              <div class="divider"></div>
              <div class="form-group">
                <label class="form-checkbox">
                  <input type="checkbox" v-model="formData.adaptive" />
                  <span>启用自适应限流</span>
                </label>
              </div>
              <div v-if="formData.adaptive" class="grid grid-3">
                <div class="form-group">
                  <label class="form-label">最小限制</label>
                  <input 
                    v-model.number="formData.minLimit" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">最大限制</label>
                  <input 
                    v-model.number="formData.maxLimit" 
                    type="number" 
                    class="form-input"
                    min="1"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">目标延迟 (ms)</label>
                  <input 
                    v-model.number="formData.targetLatency" 
                    type="number" 
                    class="form-input"
                    min="10"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="form-checkbox">
                  <input type="checkbox" v-model="formData.enabled" />
                  <span>启用规则</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-outline" @click="closeModal">取消</button>
              <button class="btn btn-primary" @click="submitForm" :disabled="!formData.name || !formData.endpoint">
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
import type { RateLimiterListItem, RateLimitRule } from '@/types';
import { dashboardApi, configApi } from '@/api';

const rateLimiters = ref<RateLimiterListItem[]>([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingId = ref<string | null>(null);

const defaultForm = {
  name: '',
  endpoint: '/api/*',
  method: '*' as const,
  limitType: 'token_bucket' as const,
  limit: 100,
  windowSize: 60000,
  burstLimit: 50,
  adaptive: false,
  minLimit: 20,
  maxLimit: 200,
  targetLatency: 200,
  enabled: true,
};

const formData = reactive({ ...defaultForm });

const stats = computed(() => {
  return {
    enabled: rateLimiters.value.filter(r => r.enabled).length,
    adaptive: rateLimiters.value.filter(r => r.adaptive).length,
  };
});

const getLimitTypeText = (type: string) => {
  const types: Record<string, string> = {
    fixed_window: '固定窗口',
    sliding_window: '滑动窗口',
    token_bucket: '令牌桶',
    leaky_bucket: '漏桶',
  };
  return types[type] || type;
};

const loadData = async () => {
  try {
    rateLimiters.value = await dashboardApi.getRateLimiters();
  } catch (error) {
    console.error('Failed to load rate limiters:', error);
  }
};

const resetLimiter = async (id: string) => {
  try {
    await configApi.resetRateLimiter(id);
    await loadData();
  } catch (error) {
    console.error('Failed to reset limiter:', error);
  }
};

const editLimiter = (limiter: RateLimiterListItem) => {
  editingId.value = limiter.id;
  formData.name = limiter.name;
  formData.endpoint = limiter.endpoint;
  formData.method = limiter.method as any;
  formData.limitType = limiter.limitType as any;
  formData.limit = limiter.baseLimit;
  formData.adaptive = limiter.adaptive;
  showEditModal.value = true;
};

const confirmDelete = async (id: string) => {
  if (confirm('确定要删除这个限流规则吗？')) {
    try {
      await configApi.deleteRateLimitRule(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete limiter:', error);
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
      await configApi.createRateLimitRule(formData as Omit<RateLimitRule, 'id'>);
    } else if (editingId.value) {
      await configApi.updateRateLimitRule(editingId.value, formData);
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
