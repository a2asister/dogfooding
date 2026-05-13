<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  data: {
    labels?: string[];
    values?: number[];
  };
  config?: Record<string, unknown>;
  animate?: boolean;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const colors = ['#00d4ff', '#00ff88', '#ff9500', '#ff4444', '#9966ff', '#ff6b9d'];

const initChart = () => {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  
  const pieData = (props.data.labels || []).map((label, index) => ({
    value: (props.data.values || [])[index] || 0,
    name: label,
  }));
  
  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#ff9500',
      textStyle: { color: '#fff' },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: 'rgba(255, 255, 255, 0.7)' },
    },
    series: [
      {
        name: '数据',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0a1628',
          borderWidth: 2,
        },
        label: {
          show: true,
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: 12,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: pieData.map((item, index) => ({
          ...item,
          itemStyle: { color: colors[index % colors.length] },
        })),
        animationDuration: props.animate ? 1500 : 0,
        animationEasing: 'elasticOut',
      },
    ],
  };
  
  chartInstance.setOption(option);
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

watch(() => props.data, () => {
  initChart();
}, { deep: true });
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
