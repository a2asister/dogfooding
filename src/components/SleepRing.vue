<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  score: number
  deepSleep?: number
  lightSleep?: number
  remSleep?: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  deepSleep: 1.5,
  lightSleep: 4,
  remSleep: 1.5,
  size: 220
})

const circumference = computed(() => {
  const radius = (props.size - 40) / 2
  return 2 * Math.PI * radius
})

const scoreOffset = computed(() => {
  return circumference.value - (props.score / 100) * circumference.value
})

const total = computed(() => props.deepSleep + props.lightSleep + props.remSleep)

const deepPercent = computed(() => (props.deepSleep / total.value) * 100)
const lightPercent = computed(() => (props.lightSleep / total.value) * 100)
const remPercent = computed(() => (props.remSleep / total.value) * 100)

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  }
}

function describeArc(x: number, y: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, r, endAngle)
  const end = polarToCartesian(x, y, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ')
}

const center = computed(() => props.size / 2)
const outerRadius = computed(() => (props.size - 24) / 2)
const innerRadius = computed(() => (props.size - 40) / 2)

const deepArc = computed(() => describeArc(center.value, center.value, outerRadius.value, 0, deepPercent.value * 3.6))
const remArc = computed(() => describeArc(center.value, center.value, outerRadius.value, deepPercent.value * 3.6, (deepPercent.value + remPercent.value) * 3.6))
const lightArc = computed(() => describeArc(center.value, center.value, outerRadius.value, (deepPercent.value + remPercent.value) * 3.6, 360))

const qualityText = computed(() => {
  if (props.score >= 90) return '优秀'
  if (props.score >= 75) return '良好'
  if (props.score >= 60) return '一般'
  return '较差'
})

const qualityColor = computed(() => {
  if (props.score >= 90) return '#86efac'
  if (props.score >= 75) return '#a5b4fc'
  if (props.score >= 60) return '#fbbf24'
  return '#f87171'
})
</script>

<template>
  <div class="sleep-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <defs>
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#818cf8"/>
          <stop offset="50%" stop-color="#a78bfa"/>
          <stop offset="100%" stop-color="#c4b5fd"/>
        </linearGradient>
        <linearGradient id="deepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#312e81"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4338ca"/>
          <stop offset="100%" stop-color="#818cf8"/>
        </linearGradient>
        <linearGradient id="remGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <path
        v-if="deepPercent > 0"
        :d="deepArc"
        fill="none"
        stroke="url(#deepGradient)"
        stroke-width="10"
        stroke-linecap="round"
        opacity="0.9"
      />
      <path
        v-if="remPercent > 0"
        :d="remArc"
        fill="none"
        stroke="url(#remGradient)"
        stroke-width="10"
        stroke-linecap="round"
        opacity="0.9"
      />
      <path
        v-if="lightPercent > 0"
        :d="lightArc"
        fill="none"
        stroke="url(#lightGradient)"
        stroke-width="10"
        stroke-linecap="round"
        opacity="0.9"
      />

      <circle
        :cx="center"
        :cy="center"
        :r="innerRadius"
        fill="none"
        stroke="rgba(100, 116, 139, 0.2)"
        stroke-width="6"
      />

      <circle
        :cx="center"
        :cy="center"
        :r="innerRadius"
        fill="none"
        stroke="url(#scoreGradient)"
        stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="scoreOffset"
        transform="rotate(-90, center, center)"
        filter="url(#glow)"
      />

      <g>
        <circle
          :cx="center"
          :cy="center"
          :r="innerRadius - 12"
          fill="rgba(30, 41, 59, 0.6)"
        />
      </g>
    </svg>
    <div class="score-content">
      <div class="score-value">{{ score }}</div>
      <div class="score-label" :style="{ color: qualityColor }">{{ qualityText }}</div>
    </div>
  </div>
</template>

<style scoped>
.sleep-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
}

.score-value {
  font-size: 48px;
  font-weight: 300;
  background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -2px;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  margin-top: 4px;
  font-weight: 500;
}
</style>
