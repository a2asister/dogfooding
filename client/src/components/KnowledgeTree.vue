<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getKnowledgeTree, setLearnedStatus, flattenTree } from '../api';
import { useTreeLayout } from '../composables/useTreeLayout';
import { usePanZoom } from '../composables/usePanZoom';
import type { KnowledgeNode, PositionedNode } from '../types';
import TreeNode from './TreeNode.vue';
import ConnectionLines from './ConnectionLines.vue';
import NodeTooltip from './NodeTooltip.vue';

const treeData = ref<KnowledgeNode[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const containerRef = ref<HTMLElement | null>(null);
const { scale, offset, getTransform, resetView, zoomIn, zoomOut } = usePanZoom(containerRef);

const { layout, toggleExpand, isExpanded, NODE_RADIUS } = useTreeLayout(treeData);

const hoveredNode = ref<PositionedNode | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });

async function fetchTree() {
  try {
    loading.value = true;
    error.value = null;
    treeData.value = await getKnowledgeTree();
  } catch (err) {
    console.error('Failed to fetch knowledge tree:', err);
    error.value = '加载数据失败，请检查后端服务是否运行。';
  } finally {
    loading.value = false;
  }
}

function nodeHasChildren(node: KnowledgeNode): boolean {
  const flat = flattenTree(treeData.value);
  return flat.some((n) => n.parentId === node.id);
}

function handleNodeClick(node: PositionedNode) {
  console.log('Clicked node:', node.name);
}

function handleNodeHover(node: PositionedNode, event: MouseEvent) {
  hoveredNode.value = node;
  hoverPosition.value = { x: event.clientX, y: event.clientY };
}

function handleNodeLeave() {
  hoveredNode.value = null;
}

async function handleToggleLearned(id: string, learned: boolean) {
  try {
    await setLearnedStatus(id, learned);
    const updateNode = (nodes: KnowledgeNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === id) {
          node.learned = learned;
          return true;
        }
        if (node.children && updateNode(node.children)) {
          return true;
        }
      }
      return false;
    };
    updateNode(treeData.value);
    treeData.value = [...treeData.value];
  } catch (err) {
    console.error('Failed to update learned status:', err);
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'r' || e.key === 'R') {
    resetView();
  }
  if (e.key === '=' || e.key === '+') {
    zoomIn();
  }
  if (e.key === '-') {
    zoomOut();
  }
}

onMounted(async () => {
  await fetchTree();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="tree-container">
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🌳</span>
          <h1 class="app-title">知识树可视化系统</h1>
        </div>
      </div>
      <div class="header-right">
        <div class="legend">
          <span class="legend-item">
            <span class="legend-dot learned"></span>
            已学习
          </span>
          <span class="legend-item">
            <span class="legend-dot unlearned"></span>
            未学习
          </span>
        </div>
        <div class="controls">
          <button class="ctrl-btn" @click="zoomOut" title="缩小 (Ctrl + −)">
            −
          </button>
          <span class="scale-text">{{ Math.round(scale * 100) }}%</span>
          <button class="ctrl-btn" @click="zoomIn" title="放大 (Ctrl + +)">
            +
          </button>
          <button class="ctrl-btn reset-btn" @click="resetView" title="重置视图 (R)">
            ⟲
          </button>
        </div>
      </div>
    </header>

    <main class="canvas-area" ref="containerRef">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>加载知识树中...</p>
      </div>

      <div v-else-if="error" class="error-overlay">
        <div class="error-icon">⚠️</div>
        <p class="error-text">{{ error }}</p>
        <button class="retry-btn" @click="fetchTree">重试</button>
      </div>

      <div
        v-else
        class="canvas-transform"
        :style="{ transform: getTransform() }"
      >
        <ConnectionLines :connections="layout.connections" />

        <div class="nodes-layer">
          <TreeNode
            v-for="node in layout.nodes"
            :key="node.id"
            :node="node"
            :radius="NODE_RADIUS"
            :has-children="nodeHasChildren(node)"
            :is-expanded="isExpanded(node.id)"
            @click="handleNodeClick"
            @toggle="toggleExpand"
            @hover="handleNodeHover"
            @leave="handleNodeLeave"
          />
        </div>
      </div>
    </main>

    <NodeTooltip
      :node="hoveredNode"
      :x="hoverPosition.x"
      :y="hoverPosition.y"
      @toggle-learned="handleToggleLearned"
    />

    <footer class="app-footer">
      <span class="hint">🖱️ 滚轮缩放 · 拖拽平移 · 点击节点展开子节点 · R 键重置视图</span>
    </footer>
  </div>
</template>

<style scoped>
.tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.legend {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #94a3b8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.learned {
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.legend-dot.unlearned {
  background: #64748b;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ctrl-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
}

.ctrl-btn:active {
  transform: translateY(0);
}

.reset-btn {
  font-size: 14px;
}

.scale-text {
  font-size: 12px;
  color: #94a3b8;
  min-width: 44px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
}

.canvas-area:active {
  cursor: grabbing;
}

.canvas-transform {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  transition: transform 0.08s ease-out;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 50;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p,
.error-text {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.error-icon {
  font-size: 48px;
}

.retry-btn {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

.nodes-layer {
  position: absolute;
  top: 0;
  left: 0;
}

.app-footer {
  padding: 10px 24px;
  background: rgba(10, 10, 30, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  text-align: center;
  z-index: 100;
}

.hint {
  font-size: 12px;
  color: #64748b;
  letter-spacing: 0.02em;
}
</style>
