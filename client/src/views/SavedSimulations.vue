<template>
  <div class="container" style="padding: 40px 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h1 style="margin-bottom: 8px;">已保存的模拟</h1>
        <p style="color: var(--text-secondary);">管理和加载之前保存的实验配置</p>
      </div>
    </div>

    <div v-if="loading" style="text-align: center; padding: 60px;">
      <div class="loading"></div>
    </div>

    <div v-else-if="simulations.length === 0" class="empty-state">
      <div class="empty-state-icon">📁</div>
      <p class="empty-state-text">暂无保存的模拟</p>
      <p style="font-size: 14px; margin-top: 8px;">在实验页面保存配置后会显示在这里</p>
    </div>

    <div v-else>
      <div
        v-for="sim in simulations"
        :key="sim.id"
        class="list-item"
      >
        <div class="list-item-header">
          <span class="list-item-title">{{ sim.name }}</span>
          <span class="list-item-meta">{{ formatDate(sim.updated_at) }}</span>
        </div>
        <div class="list-item-meta">类型: {{ getTypeName(sim.type) }}</div>
        <div class="list-item-actions">
          <button class="btn btn-primary" @click="loadSimulation(sim)">加载</button>
          <button class="btn btn-secondary" @click="showExperiments(sim)">查看实验</button>
          <button class="btn btn-danger" @click="deleteSim(sim.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">{{ selectedSimulation?.name }} - 实验记录</div>
        <div class="modal-body">
          <div v-if="experiments.length === 0" style="text-align: center; padding: 20px; color: var(--text-secondary);">
            暂无实验记录
          </div>
          <div v-else>
            <div
              v-for="exp in experiments"
              :key="exp.id"
              class="list-item"
              style="margin-bottom: 12px;"
            >
              <div class="list-item-header">
                <span class="list-item-title">{{ exp.name }}</span>
                <span class="list-item-meta">{{ formatDate(exp.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import type { SimulationRecord, ExperimentRecord, ExperimentType } from '@/types';

const router = useRouter();
const loading = ref(true);
const simulations = ref<SimulationRecord[]>([]);
const experiments = ref<ExperimentRecord[]>([]);
const showModal = ref(false);
const selectedSimulation = ref<SimulationRecord | null>(null);

const typeNames: Record<ExperimentType, string> = {
  free_fall: '自由落体运动',
  projectile: '抛体运动',
  collision: '弹性碰撞',
  pendulum: '单摆运动',
  orbital: '天体运动',
};

const loadSimulations = async (): Promise<void> => {
  loading.value = true;
  try {
    const data = await api.getSimulations();
    simulations.value = data;
  } catch (error: unknown) {
    console.error('Failed to load simulations:', error);
  } finally {
    loading.value = false;
  }
};

const getTypeName = (type: string): string => {
  return typeNames[type as ExperimentType] ?? type;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

const loadSimulation = (sim: SimulationRecord): void => {
  router.push({
    path: `/simulate/${sim.type}`,
    query: { config: sim.config, name: sim.name, id: String(sim.id) },
  });
};

const showExperiments = async (sim: SimulationRecord): Promise<void> => {
  selectedSimulation.value = sim;
  try {
    const data = await api.getExperiments(sim.id);
    experiments.value = data;
    showModal.value = true;
  } catch (error: unknown) {
    console.error('Failed to load experiments:', error);
  }
};

const deleteSim = async (id: number): Promise<void> => {
  if (!window.confirm('确定要删除这个模拟吗？')) {
    return;
  }
  try {
    await api.deleteSimulation(id);
    simulations.value = simulations.value.filter((s) => s.id !== id);
  } catch (error: unknown) {
    console.error('Failed to delete simulation:', error);
  }
};

onMounted((): void => {
  void loadSimulations();
});
</script>
