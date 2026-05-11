<script setup lang="ts">
import { computed } from 'vue';
import type { PositionedNode } from '../types';

interface Props {
  node: PositionedNode;
  radius: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [node: PositionedNode];
  toggle: [nodeId: string];
  hover: [node: PositionedNode, event: MouseEvent];
  leave: [];
}>();

const nodeStyle = computed(() => ({
  left: `${props.node.x}px`,
  top: `${props.node.y}px`,
  width: `${props.radius * 2}px`,
  height: `${props.radius * 2}px`,
  animationDelay: `${props.node.animationDelay}ms`,
  transform: `translate(-50%, -50%)`
}));

const nodeClasses = computed(() => [
  'knowledge-node',
  {
    'node-learned': props.node.learned,
    'node-unlearned': !props.node.learned,
    'node-expandable': props.hasChildren,
    'node-expanded': props.isExpanded
  }
]);

function handleClick(e: MouseEvent) {
  e.stopPropagation();
  emit('click', props.node);
  if (props.hasChildren) {
    emit('toggle', props.node.id);
  }
}

function handleMouseEnter(e: MouseEvent) {
  emit('hover', props.node, e);
}

function handleMouseLeave() {
  emit('leave');
}
</script>

<template>
  <div
    :class="nodeClasses"
    :style="nodeStyle"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="node-glow"></div>
    <div class="node-inner">
      <div class="node-name">
        {{ node.name }}
      </div>
      <div v-if="hasChildren" class="expand-indicator">
        {{ isExpanded ? '−' : '+' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-node {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: nodeAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s ease;
  z-index: 10;
  user-select: none;
}

@keyframes nodeAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.node-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.node-learned .node-glow {
  background: radial-gradient(
    circle,
    rgba(74, 222, 128, 0.6) 0%,
    rgba(74, 222, 128, 0) 70%
  );
}

.node-unlearned .node-glow {
  background: radial-gradient(
    circle,
    rgba(148, 163, 184, 0.4) 0%,
    rgba(148, 163, 184, 0) 70%
  );
}

.knowledge-node:hover .node-glow {
  opacity: 1;
}

.node-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.node-learned .node-inner {
  background: linear-gradient(145deg, rgba(34, 197, 94, 0.25), rgba(22, 163, 74, 0.15));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 20px rgba(34, 197, 94, 0.3);
}

.node-unlearned .node-inner {
  background: linear-gradient(145deg, rgba(71, 85, 105, 0.4), rgba(51, 65, 85, 0.3));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 15px rgba(0, 0, 0, 0.3);
}

.knowledge-node:hover {
  transform: translate(-50%, -50%) scale(1.15);
  z-index: 20;
}

.knowledge-node:hover .node-inner {
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.node-name {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
  max-height: 3.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.node-expandable::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  animation: pulse 3s ease-in-out infinite;
  pointer-events: none;
}

.node-expanded::after {
  border-style: solid;
  animation: none;
  border-color: rgba(255, 255, 255, 0.25);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.expand-indicator {
  position: absolute;
  bottom: 14px;
  right: 14px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(79, 70, 229, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  line-height: 1;
  box-shadow:
    0 2px 8px rgba(139, 92, 246, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 5;
}
</style>
