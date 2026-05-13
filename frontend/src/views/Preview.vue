<template>
  <div class="preview">
    <div class="preview-header">
      <button class="btn btn-secondary" @click="goBack">← 返回</button>
      <h2>{{ dashboardName }}</h2>
      <span class="view-count">👁️ 浏览次数: {{ viewCount }}</span>
    </div>
    <div class="preview-content">
      <div 
        v-for="comp in components" 
        :key="comp.id"
        class="preview-component"
        :style="getComponentStyle(comp)"
      >
        <component :is="getComponent(comp.type)" :data="comp.data" :config="comp.config" :animate="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apolloClient } from '@/apollo/client';
import { GET_DASHBOARD, INCREMENT_VIEW_COUNT } from '@/apollo/queries';
import type { DashboardComponent, ComponentType, DashboardConfig } from '@/types';
import BarChart from '@/components/BarChart.vue';
import LineChart from '@/components/LineChart.vue';
import PieChart from '@/components/PieChart.vue';
import NumberCard from '@/components/NumberCard.vue';
import TextCard from '@/components/TextCard.vue';
import TableCard from '@/components/TableCard.vue';
import ProgressCard from '@/components/ProgressCard.vue';

const router = useRouter();
const route = useRoute();
const dashboardName = ref('');
const components = ref<DashboardComponent[]>([]);
const viewCount = ref(0);

const getComponent = (type: string) => {
  const map: Record<string, unknown> = {
    'bar-chart': BarChart,
    'line-chart': LineChart,
    'pie-chart': PieChart,
    'number-card': NumberCard,
    'text-card': TextCard,
    'table-card': TableCard,
    'progress-card': ProgressCard,
  };
  return map[type] as string;
};

const getComponentStyle = (comp: DashboardComponent) => {
  return {
    left: `${comp.x}px`,
    top: `${comp.y}px`,
    width: `${comp.width}px`,
    height: `${comp.height}px`,
  };
};

const goBack = () => {
  router.push('/');
};

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    try {
      const result = await apolloClient.query({
        query: GET_DASHBOARD,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      dashboardName.value = result.data.dashboard.name;
      viewCount.value = result.data.dashboard.viewCount + 1;
      const config = JSON.parse(result.data.dashboard.config) as DashboardConfig;
      components.value = config.components || [];
      
      await apolloClient.mutate({
        mutation: INCREMENT_VIEW_COUNT,
        variables: { id },
      });
    } catch (err) {
      console.error('加载大屏失败:', err);
    }
  }
});
</script>

<style scoped>
.preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%);
}

.preview-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 20px;
}

.preview-header h2 {
  flex: 1;
  color: white;
  font-size: 20px;
}

.view-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-content {
  flex: 1;
  position: relative;
  overflow: auto;
  background: 
    linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px),
    linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

.preview-component {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmerBorder {
  0% {
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.2);
  }
  50% {
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
  }
  100% {
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.2);
  }
}

.preview-component:hover {
  animation: shimmerBorder 2s ease-in-out infinite;
}
</style>
