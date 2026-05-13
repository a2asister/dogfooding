<template>
  <div class="editor">
    <div class="editor-header">
      <button class="btn btn-secondary" @click="goBack">← 返回</button>
      <input 
        v-model="dashboardName" 
        class="dashboard-name"
        placeholder="输入大屏名称"
      />
      <div class="header-actions">
        <button class="btn btn-success" @click="saveAsTemplate">保存为模板</button>
        <button class="btn btn-primary" @click="saveDashboard">保存</button>
        <button class="btn btn-info" @click="previewDashboard">预览</button>
      </div>
    </div>

    <div class="editor-content">
      <div class="component-panel">
        <h3>组件库</h3>
        <div class="component-list">
          <div 
            v-for="comp in componentTypes" 
            :key="comp.type"
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, comp.type)"
          >
            <div class="component-icon">{{ comp.icon }}</div>
            <div class="component-name">{{ comp.name }}</div>
          </div>
        </div>
      </div>

      <div 
        class="canvas"
        @drop="onDrop"
        @dragover="onDragOver"
      >
        <div 
          v-for="(comp, index) in components" 
          :key="comp.id"
          class="canvas-component"
          :class="{ selected: selectedComponent === comp.id }"
          :style="getComponentStyle(comp)"
          @click="selectComponent(comp.id)"
          @mousedown="startMove($event, comp, index)"
        >
          <component :is="getComponent(comp.type)" :data="comp.data" :config="comp.config" />
          <div v-if="selectedComponent === comp.id" class="resize-handles">
            <div class="handle handle-nw" @mousedown.stop="startResize($event, comp, index, 'nw')"></div>
            <div class="handle handle-ne" @mousedown.stop="startResize($event, comp, index, 'ne')"></div>
            <div class="handle handle-sw" @mousedown.stop="startResize($event, comp, index, 'sw')"></div>
            <div class="handle handle-se" @mousedown.stop="startResize($event, comp, index, 'se')"></div>
          </div>
        </div>
        <div v-if="components.length === 0" class="empty-canvas">
          拖拽组件到此处开始编辑
        </div>
      </div>

      <div class="property-panel">
        <h3>属性面板</h3>
        <div v-if="selectedComponentData" class="property-content">
          <div class="property-group">
            <label>宽度</label>
            <input type="number" v-model.number="selectedComponentData.width" />
          </div>
          <div class="property-group">
            <label>高度</label>
            <input type="number" v-model.number="selectedComponentData.height" />
          </div>
          <button class="btn btn-danger btn-delete" @click="deleteSelectedComponent">
            删除组件
          </button>
        </div>
        <div v-else class="empty-property">
          选择一个组件编辑属性
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apolloClient } from '@/apollo/client';
import { GET_DASHBOARD, CREATE_DASHBOARD, UPDATE_DASHBOARD } from '@/apollo/queries';
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
const dashboardId = ref<string | null>(null);
const dashboardName = ref('新建大屏');
const components = ref<DashboardComponent[]>([]);
const selectedComponent = ref<string | null>(null);

const componentTypes = [
  { type: 'bar-chart' as ComponentType, name: '柱状图', icon: '📊' },
  { type: 'line-chart' as ComponentType, name: '折线图', icon: '📈' },
  { type: 'pie-chart' as ComponentType, name: '饼图', icon: '🥧' },
  { type: 'number-card' as ComponentType, name: '数字卡片', icon: '🔢' },
  { type: 'text-card' as ComponentType, name: '文本卡片', icon: '📝' },
  { type: 'table-card' as ComponentType, name: '数据表格', icon: '📋' },
  { type: 'progress-card' as ComponentType, name: '进度条', icon: '📏' },
];

const selectedComponentData = computed(() => {
  return components.value.find(c => c.id === selectedComponent.value);
});

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

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getRandomData = (type: ComponentType) => {
  const labels = ['一月', '二月', '三月', '四月', '五月', '六月'];
  switch (type) {
    case 'number-card':
      return { value: Math.floor(Math.random() * 10000) };
    case 'text-card':
      return { value: '这是一段示例文本内容' };
    case 'table-card':
      return {
        columns: ['名称', '数值', '状态'],
        rows: [
          { name: '项目A', value: 123, status: '完成' },
          { name: '项目B', value: 456, status: '进行中' },
          { name: '项目C', value: 789, status: '待开始' },
        ],
      };
    case 'progress-card':
      return { value: Math.floor(Math.random() * 100) };
    default:
      return {
        labels,
        series: [{
          name: '数据',
          data: labels.map(() => Math.floor(Math.random() * 100)),
        }],
      };
  }
};

let draggedType: ComponentType | null = null;

const onDragStart = (e: DragEvent, type: ComponentType) => {
  draggedType = type;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy';
  }
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  if (!draggedType) return;
  
  const canvas = e.currentTarget as HTMLElement;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) - 100;
  const y = (e.clientY - rect.top) - 75;
  
  const newComponent: DashboardComponent = {
    id: generateId(),
    type: draggedType,
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: 300,
    height: 200,
    title: componentTypes.find(c => c.type === draggedType)?.name || '组件',
    config: {},
    data: getRandomData(draggedType),
  };
  
  components.value.push(newComponent);
  selectedComponent.value = newComponent.id;
  draggedType = null;
};

const selectComponent = (id: string) => {
  selectedComponent.value = id;
};

let isMoving = false;
let isResizing = false;
let moveStartX = 0;
let moveStartY = 0;
let initialX = 0;
let initialY = 0;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeCompIndex = -1;
let initialWidth = 0;
let initialHeight = 0;
let resizeDirection = '';

const startMove = (e: MouseEvent, comp: DashboardComponent, index: number) => {
  selectComponent(comp.id);
  isMoving = true;
  moveStartX = e.clientX;
  moveStartY = e.clientY;
  initialX = comp.x;
  initialY = comp.y;
  resizeCompIndex = index;
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isMoving) return;
    const deltaX = moveEvent.clientX - moveStartX;
    const deltaY = moveEvent.clientY - moveStartY;
    components.value[resizeCompIndex].x = Math.max(0, initialX + deltaX);
    components.value[resizeCompIndex].y = Math.max(0, initialY + deltaY);
  };
  
  const onMouseUp = () => {
    isMoving = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const startResize = (e: MouseEvent, comp: DashboardComponent, index: number, direction: string) => {
  e.stopPropagation();
  
  isResizing = true;
  resizeDirection = direction;
  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeCompIndex = index;
  initialWidth = comp.width;
  initialHeight = comp.height;
  initialX = comp.x;
  initialY = comp.y;
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isResizing) return;
    const deltaX = moveEvent.clientX - resizeStartX;
    const deltaY = moveEvent.clientY - resizeStartY;
    
    const component = components.value[resizeCompIndex];
    
    if (direction.includes('e')) {
      component.width = Math.max(100, initialWidth + deltaX);
    }
    if (direction.includes('w')) {
      const newWidth = Math.max(100, initialWidth - deltaX);
      component.x = initialX + initialWidth - newWidth;
      component.width = newWidth;
    }
    if (direction.includes('s')) {
      component.height = Math.max(80, initialHeight + deltaY);
    }
    if (direction.includes('n')) {
      const newHeight = Math.max(80, initialHeight - deltaY);
      component.y = initialY + initialHeight - newHeight;
      component.height = newHeight;
    }
  };
  
  const onMouseUp = () => {
    isResizing = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const deleteSelectedComponent = () => {
  if (!selectedComponent.value) return;
  components.value = components.value.filter(c => c.id !== selectedComponent.value);
  selectedComponent.value = null;
};

const goBack = () => {
  router.push('/');
};

const saveDashboard = async () => {
  const config: DashboardConfig = {
    name: dashboardName.value,
    components: components.value,
  };
  
  try {
    if (dashboardId.value) {
      await apolloClient.mutate({
        mutation: UPDATE_DASHBOARD,
        variables: {
          input: {
            id: dashboardId.value,
            name: dashboardName.value,
            config: JSON.stringify(config),
          },
        },
      });
    } else {
      const result = await apolloClient.mutate({
        mutation: CREATE_DASHBOARD,
        variables: {
          input: {
            name: dashboardName.value,
            config: JSON.stringify(config),
            isTemplate: false,
          },
        },
      });
      dashboardId.value = result.data.createDashboard.id;
    }
    alert('保存成功！');
  } catch (err) {
    console.error('保存失败:', err);
    alert('保存失败');
  }
};

const saveAsTemplate = async () => {
  const config: DashboardConfig = {
    name: dashboardName.value,
    components: components.value,
  };
  
  try {
    await apolloClient.mutate({
      mutation: CREATE_DASHBOARD,
      variables: {
        input: {
          name: dashboardName.value + ' (模板)',
          config: JSON.stringify(config),
          isTemplate: true,
        },
      },
    });
    alert('模板保存成功！');
  } catch (err) {
    console.error('保存模板失败:', err);
    alert('保存模板失败');
  }
};

const previewDashboard = async () => {
  if (!dashboardId.value) {
    await saveDashboard();
  }
  if (dashboardId.value) {
    router.push(`/preview/${dashboardId.value}`);
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  if (id) {
    try {
      dashboardId.value = id;
      const result = await apolloClient.query({
        query: GET_DASHBOARD,
        variables: { id },
        fetchPolicy: 'no-cache',
      });
      dashboardName.value = result.data.dashboard.name;
      const config = JSON.parse(result.data.dashboard.config) as DashboardConfig;
      components.value = config.components || [];
    } catch (err) {
      console.error('加载大屏失败:', err);
    }
  }
});
</script>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a1628;
}

.editor-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 15px;
}

.dashboard-name {
  flex: 1;
  max-width: 300px;
  padding: 10px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 16px;
}

.dashboard-name::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.header-actions {
  display: flex;
  gap: 10px;
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

.btn-primary {
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #ff9500, #ff6b00);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
}

.btn-delete {
  width: 100%;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.component-panel {
  width: 180px;
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  overflow-y: auto;
}

.component-panel h3 {
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
}

.component-item:hover {
  border-color: rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.1);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  font-size: 20px;
}

.component-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.canvas {
  flex: 1;
  position: relative;
  overflow: auto;
  background: 
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-component {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: move;
  transition: border-color 0.2s ease;
}

.canvas-component:hover {
  border-color: rgba(0, 212, 255, 0.3);
}

.canvas-component.selected {
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #00d4ff;
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: auto;
  cursor: nwse-resize;
}

.handle-nw { top: -5px; left: -5px; cursor: nwse-resize; }
.handle-ne { top: -5px; right: -5px; cursor: nesw-resize; }
.handle-sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
.handle-se { bottom: -5px; right: -5px; cursor: nwse-resize; }

.empty-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
}

.property-panel {
  width: 240px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  overflow-y: auto;
}

.property-panel h3 {
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.property-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-group label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.property-group input {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 14px;
}

.empty-property {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}
</style>
