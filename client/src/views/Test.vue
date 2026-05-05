<template>
  <div>
    <header class="main-header">
      <h1 class="page-title">测试工具</h1>
      <div class="header-actions"></div>
    </header>
    <div class="main-body">
      <div class="grid grid-2">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title">模拟 API 调用</h3>
            <p class="text-muted mb-4">使用此工具测试熔断器和限流功能</p>
            
            <div class="form-group">
              <label class="form-label">熔断器 ID (可选)</label>
              <input 
                v-model="testParams.circuitId" 
                type="text" 
                class="form-input"
                placeholder="留空使用默认熔断器"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">隔离配置 ID (可选)</label>
              <input 
                v-model="testParams.isolationId" 
                type="text" 
                class="form-input"
                placeholder="留空使用默认隔离"
              />
            </div>
            
            <div class="grid grid-2">
              <div class="form-group">
                <label class="form-label">延迟 (ms)</label>
                <input 
                  v-model.number="testParams.delay" 
                  type="number" 
                  class="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="form-group">
                <label class="form-label">并发请求数</label>
                <input 
                  v-model.number="testParams.concurrent" 
                  type="number" 
                  class="form-input"
                  min="1"
                  max="50"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input type="checkbox" v-model="testParams.fail" />
                <span>强制失败 (触发熔断)</span>
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-checkbox">
                <input type="checkbox" v-model="testParams.slow" />
                <span>慢调用模式 (触发慢调用熔断)</span>
              </label>
            </div>
            
            <div class="flex gap-2">
              <button 
                class="btn btn-primary"
                @click="runSingleTest"
                :disabled="isLoading"
              >
                单次测试
              </button>
              <button 
                class="btn btn-outline"
                @click="runConcurrentTest"
                :disabled="isLoading"
              >
                并发测试
              </button>
              <button 
                class="btn btn-outline text-danger"
                @click="clearResults"
              >
                清空
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <h3 class="card-title">批量测试</h3>
            <p class="text-muted mb-4">批量触发失败请求以测试熔断器阈值</p>
            
            <div class="grid grid-2">
              <div class="form-group">
                <label class="form-label">失败请求数</label>
                <input 
                  v-model.number="batchParams.failCount" 
                  type="number" 
                  class="form-input"
                  min="1"
                  max="100"
                />
              </div>
              <div class="form-group">
                <label class="form-label">熔断器 ID</label>
                <input 
                  v-model="batchParams.circuitId" 
                  type="text" 
                  class="form-input"
                  placeholder="留空使用默认"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">间隔时间 (ms)</label>
              <input 
                v-model.number="batchParams.interval" 
                type="number" 
                class="form-input"
                min="10"
                placeholder="100"
              />
            </div>
            
            <button 
              class="btn btn-warning"
              @click="runBatchFailTest"
              :disabled="isLoading"
            >
              {{ isLoading ? '执行中...' : '批量失败测试' }}
            </button>
            
            <div class="divider my-4"></div>
            
            <div class="alert alert-info">
              <div class="alert-title">提示</div>
              <p>使用批量失败测试可以快速触发熔断器的失败率阈值，观察熔断器从 Closed 到 Open 的状态转变。</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body">
          <div class="flex justify-between items-center mb-3">
            <h3 class="card-title">测试结果</h3>
            <div class="flex gap-2">
              <span class="text-muted">
                成功: <span class="text-success font-bold">{{ stats.success }}</span>
              </span>
              <span class="text-muted">
                失败: <span class="text-danger font-bold">{{ stats.failed }}</span>
              </span>
              <span class="text-muted">
                熔断: <span class="text-warning font-bold">{{ stats.rejected }}</span>
              </span>
            </div>
          </div>
          
          <div class="test-results" v-if="testResults.length > 0">
            <div 
              v-for="(result, index) in testResults.slice().reverse()" 
              :key="index"
              class="test-result-item"
              :class="result.type"
            >
              <div class="flex justify-between items-start">
                <div>
                  <span class="result-badge" :class="result.type">
                    {{ result.type === 'success' ? '✓' : result.type === 'error' ? '✗' : '⚡' }}
                  </span>
                  <span class="ml-2 font-medium">{{ result.message }}</span>
                </div>
                <span class="text-xs text-muted">
                  {{ formatTime(result.timestamp) }}
                </span>
              </div>
              <div v-if="result.details" class="mt-1 text-sm text-muted pl-6">
                {{ result.details }}
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-state-icon">🧪</div>
            <div class="empty-state-text">暂无测试结果</div>
            <p class="text-muted">使用上方工具开始测试</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { testApi } from '@/api';

const isLoading = ref(false);

const testParams = reactive({
  circuitId: '',
  isolationId: '',
  delay: 0,
  concurrent: 5,
  fail: false,
  slow: false,
});

const batchParams = reactive({
  failCount: 10,
  circuitId: '',
  interval: 100,
});

interface TestResult {
  type: 'success' | 'error' | 'rejected';
  message: string;
  details?: string;
  timestamp: Date;
}

const testResults = ref<TestResult[]>([]);

const stats = computed(() => {
  return {
    success: testResults.value.filter(r => r.type === 'success').length,
    failed: testResults.value.filter(r => r.type === 'error').length,
    rejected: testResults.value.filter(r => r.type === 'rejected').length,
  };
});

const addResult = (type: 'success' | 'error' | 'rejected', message: string, details?: string) => {
  testResults.value.push({
    type,
    message,
    details,
    timestamp: new Date(),
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { hour12: false });
};

const clearResults = () => {
  testResults.value = [];
};

const runSingleTest = async () => {
  isLoading.value = true;
  try {
    const response = await testApi.apiCall({
      circuitId: testParams.circuitId || undefined,
      isolationId: testParams.isolationId || undefined,
      fail: testParams.fail,
      slow: testParams.slow,
      delay: testParams.delay > 0 ? testParams.delay : undefined,
    });
    addResult('success', `请求成功`, `耗时: ${response.duration}ms, 状态: ${response.status}`);
  } catch (error: any) {
    const isRejected = error.message?.includes('circuit') || error.message?.includes('open');
    const msg = isRejected ? '请求被熔断/拒绝' : '请求失败';
    addResult(
      isRejected ? 'rejected' : 'error',
      msg,
      error.message || '未知错误'
    );
  } finally {
    isLoading.value = false;
  }
};

const runConcurrentTest = async () => {
  isLoading.value = true;
  addResult('success', `开始并发测试: ${testParams.concurrent} 个请求`);
  
  const promises = [];
  for (let i = 0; i < testParams.concurrent; i++) {
    promises.push(
      testApi.apiCall({
        circuitId: testParams.circuitId || undefined,
        isolationId: testParams.isolationId || undefined,
        fail: testParams.fail,
        slow: testParams.slow,
        delay: testParams.delay > 0 ? testParams.delay : undefined,
      })
    );
  }
  
  const results = await Promise.allSettled(promises);
  
  let successCount = 0;
  let errorCount = 0;
  let rejectedCount = 0;
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successCount++;
    } else {
      const isRejected = result.reason.message?.includes('circuit') || result.reason.message?.includes('open');
      if (isRejected) {
        rejectedCount++;
      } else {
        errorCount++;
      }
    }
  });
  
  addResult(
    successCount === testParams.concurrent ? 'success' : 'error',
    `并发测试完成`,
    `成功: ${successCount}, 失败: ${errorCount}, 熔断: ${rejectedCount}`
  );
  
  isLoading.value = false;
};

const runBatchFailTest = async () => {
  isLoading.value = true;
  addResult('rejected', `开始批量失败测试: ${batchParams.failCount} 个请求`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batchParams.failCount; i++) {
    try {
      await testApi.apiCall({
        circuitId: batchParams.circuitId || undefined,
        fail: true,
      });
      successCount++;
    } catch (error: any) {
      errorCount++;
    }
    
    if (i < batchParams.failCount - 1) {
      await new Promise(resolve => setTimeout(resolve, batchParams.interval));
    }
  }
  
  addResult(
    'rejected',
    `批量失败测试完成`,
    `触发失败: ${errorCount} 个请求`
  );
  
  isLoading.value = false;
};
</script>

<style scoped>
.test-results {
  max-height: 400px;
  overflow-y: auto;
}

.test-result-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  font-size: 13px;
}

.test-result-item.success {
  background-color: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
}

.test-result-item.error {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}

.test-result-item.rejected {
  background-color: rgba(251, 191, 36, 0.1);
  border-left: 3px solid #fbbf24;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.result-badge.success {
  background-color: #22c55e;
  color: #fff;
}

.result-badge.error {
  background-color: #ef4444;
  color: #fff;
}

.result-badge.rejected {
  background-color: #fbbf24;
  color: #1e293b;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

.pl-6 {
  padding-left: 24px;
}

.ml-2 {
  margin-left: 8px;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 12px;
}
</style>
