<script setup lang="ts">
import { computed } from 'vue';
import type { Connection } from '../types';

interface Props {
  connections: Connection[];
}

const props = defineProps<Props>();

function getPathData(conn: Connection): string {
  const midX = (conn.fromX + conn.toX) / 2;
  const midY = (conn.fromY + conn.toY) / 2;
  const dx = conn.toX - conn.fromX;
  const dy = conn.toY - conn.fromY;
  const perpX = -dy * 0.25;
  const perpY = dx * 0.25;
  const cpX = midX + perpX;
  const cpY = midY + perpY;
  return `M ${conn.fromX} ${conn.fromY} Q ${cpX} ${cpY} ${conn.toX} ${conn.toY}`;
}

function getPathLength(d: string): number {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path.getTotalLength();
}

const connectionPaths = computed(() => {
  return props.connections.map((conn) => {
    const d = getPathData(conn);
    const length = getPathLength(d);
    return {
      ...conn,
      pathData: d,
      pathLength: length
    };
  });
});
</script>

<template>
  <svg
    v-if="connectionPaths.length > 0"
    class="connection-svg"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lineGradientConn" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.95" />
      </linearGradient>
      <filter id="lineGlowConn" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g>
      <path
        v-for="conn in connectionPaths"
        :key="'line-' + conn.id"
        :d="conn.pathData"
        class="connection-line"
        :style="{
          '--path-length': conn.pathLength + 'px',
          '--anim-delay': conn.animationDelay + 'ms'
        }"
      />
    </g>
  </svg>
</template>

<style>
.connection-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 6000px;
  height: 6000px;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.connection-line {
  fill: none;
  stroke: url(#lineGradientConn);
  stroke-width: 2.5;
  stroke-linecap: round;
  filter: url(#lineGlowConn);
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
  animation: lineGrowAnim 0.8s cubic-bezier(0.4, 0, 0.2, 1) var(--anim-delay, 0ms) forwards;
  opacity: 0;
}

@keyframes lineGrowAnim {
  0% {
    opacity: 0;
    stroke-dashoffset: var(--path-length);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}
</style>
