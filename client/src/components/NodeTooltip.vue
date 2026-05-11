<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue';
import type { PositionedNode } from '../types';

interface Props {
  node: PositionedNode | null;
  x: number;
  y: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toggleLearned: [id: string, learned: boolean];
}>();

const tooltipRef = ref<HTMLElement | null>(null);
const adjustedX = ref(0);
const adjustedY = ref(0);

watch(
  () => [props.node, props.x, props.y],
  async () => {
    if (props.node) {
      await nextTick();
      adjustPosition();
    }
  }
);

function adjustPosition() {
  if (!tooltipRef.value) return;
  const rect = tooltipRef.value.getBoundingClientRect();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const padding = 16;

  let newX = props.x + 20;
  let newY = props.y - rect.height / 2;

  if (newX + rect.width > viewportW - padding) {
    newX = props.x - rect.width - 20;
  }
  if (newY < padding) {
    newY = padding;
  }
  if (newY + rect.height > viewportH - padding) {
    newY = viewportH - padding - rect.height;
  }

  adjustedX.value = newX;
  adjustedY.value = newY;
}

const tooltipStyle = computed(() => ({
  left: `${adjustedX.value}px`,
  top: `${adjustedY.value}px`,
  opacity: props.node ? 1 : 0,
  pointerEvents: props.node ? 'auto' : 'none'
}));
</script>

<template>
  <div
    ref="tooltipRef"
    v-if="node"
    class="tooltip-popup"
    :style="tooltipStyle"
  >
    <div class="tooltip-header">
      <div class="status-dot" :class="{ learned: node.learned }"></div>
      <h3 class="tooltip-title">{{ node.name }}</h3>
    </div>
    <p class="tooltip-desc">{{ node.description }}</p>
    <div class="tooltip-meta">
      <span class="status-text" :class="{ learned: node.learned }">
        {{ node.learned ? '已学习' : '未学习' }}
      </span>
      <button
        class="toggle-btn"
        @click.stop="emit('toggleLearned', node.id, !node.learned)"
      >
        标记为{{ node.learned ? '未学习' : '已学习' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tooltip-popup {
  position: fixed;
  z-index: 1000;
  min-width: 260px;
  max-width: 320px;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: opacity 0.2s ease;
  pointer-events: auto;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.6);
  flex-shrink: 0;
}

.status-dot.learned {
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.tooltip-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #f1f5f9;
  word-break: break-word;
}

.tooltip-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0 0 14px 0;
}

.tooltip-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.status-text.learned {
  color: #4ade80;
}

.toggle-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

.toggle-btn:active {
  transform: translateY(0);
}
</style>
