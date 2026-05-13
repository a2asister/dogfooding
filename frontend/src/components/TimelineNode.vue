<script setup lang="ts">
import type { TripNode } from '../types';

interface Props {
  node: TripNode;
  index: number;
  isActive: boolean;
  isPassed: boolean;
}

defineProps<Props>();
</script>

<template>
  <div class="timeline-node" :class="{ active: isActive, passed: isPassed }" @click="$emit('click')">
    <div class="node-marker" :class="{ bounce: isActive }">
      {{ index + 1 }}
    </div>
    <div class="node-label">
      {{ node.name }}
    </div>
  </div>
</template>

<style scoped>
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.node-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.timeline-node:hover .node-marker {
  transform: scale(1.15);
}

.timeline-node.passed .node-marker {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: white;
}

.timeline-node.active .node-marker {
  background: white;
  color: #667eea;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.node-marker.bounce {
  animation: bounce 1s ease infinite;
}

.node-label {
  margin-top: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.timeline-node:hover .node-label,
.timeline-node.active .node-label {
  opacity: 1;
  transform: translateY(0);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>