<template>
  <div class="growth-curve">
    <div v-if="records.length === 0" class="empty-curve">
      <div class="empty-icon">📈</div>
      <p>添加成长记录后，这里会显示可爱的成长曲线！</p>
    </div>
    
    <div v-else class="curve-container">
      <svg ref="svgRef" :viewBox="`0 0 ${width} ${height}`" class="curve-svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#667eea" />
            <stop offset="100%" stop-color="#764ba2" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#667eea" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#667eea" stop-opacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path :d="areaPath" fill="url(#areaGradient)" class="area-path" />
        <path :d="linePath" fill="none" stroke="url(#lineGradient)" stroke-width="3" stroke-linecap="round" class="line-path" />
        
        <g v-for="(point, index) in points" :key="index">
          <circle 
            :cx="point.x" 
            :cy="point.y" 
            r="8" 
            fill="white"
            stroke="url(#lineGradient)"
            stroke-width="3"
            class="data-point"
            :style="{ animationDelay: `${index * 0.1}s` }"
          />
          <circle 
            v-if="point.hasMilestone"
            :cx="point.x" 
            :cy="point.y" 
            r="15" 
            fill="none"
            stroke="#fcb69f"
            stroke-width="2"
            class="milestone-ring"
            :style="{ animationDelay: `${index * 0.1}s` }"
          />
        </g>
      </svg>
      
      <div class="stats-overlay">
        <div class="stat-item">
          <span class="stat-label">起始体重</span>
          <span class="stat-value">{{ firstWeight }}kg</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">当前体重</span>
          <span class="stat-value">{{ lastWeight }}kg</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">增长</span>
          <span class="stat-value growth">{{ growthPercent }}%</span>
        </div>
      </div>
    </div>
    
    <div class="milestones">
      <h3>🌟 成长里程碑</h3>
      <div class="milestone-list">
        <div 
          v-for="record in milestoneRecords" 
          :key="record.id"
          class="milestone-item"
        >
          <span class="milestone-date">{{ record.date }}</span>
          <span class="milestone-text">{{ record.milestone }}</span>
          <div class="particle-spark"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { GrowthRecord } from '../types'

interface Props {
  records: GrowthRecord[]
}

const props = defineProps<Props>()

const width = 800
const height = 300
const padding = 40

const svgRef = ref<SVGSVGElement | null>(null)

const weightRecords = computed(() => 
  props.records.filter(r => r.weight != null).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
)

const points = computed(() => {
  if (weightRecords.value.length === 0) return []
  
  const weights = weightRecords.value.map(r => r.weight!)
  const minWeight = Math.min(...weights) - 0.5
  const maxWeight = Math.max(...weights) + 0.5
  const weightRange = maxWeight - minWeight || 1
  
  return weightRecords.value.map((record, index) => ({
    x: padding + (index / Math.max(weightRecords.value.length - 1, 1)) * (width - 2 * padding),
    y: height - padding - ((record.weight! - minWeight) / weightRange) * (height - 2 * padding),
    weight: record.weight,
    date: record.date,
    hasMilestone: !!record.milestone,
  }))
})

const linePath = computed(() => {
  if (points.value.length < 2) return ''
  
  let path = `M ${points.value[0].x} ${points.value[0].y}`
  
  for (let i = 1; i < points.value.length; i++) {
    const prev = points.value[i - 1]
    const curr = points.value[i]
    const cpx = (prev.x + curr.x) / 2
    path += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`
  }
  
  path += ` L ${points.value[points.value.length - 1].x} ${points.value[points.value.length - 1].y}`
  return path
})

const areaPath = computed(() => {
  if (points.value.length < 2) return ''
  return `${linePath.value} L ${points.value[points.value.length - 1].x} ${height - padding} L ${points.value[0].x} ${height - padding} Z`
})

const firstWeight = computed(() => weightRecords.value[0]?.weight?.toFixed(1) || '0')
const lastWeight = computed(() => weightRecords.value[weightRecords.value.length - 1]?.weight?.toFixed(1) || '0')
const growthPercent = computed(() => {
  const first = weightRecords.value[0]?.weight || 0
  const last = weightRecords.value[weightRecords.value.length - 1]?.weight || 0
  if (first === 0) return '0'
  return ((last - first) / first * 100).toFixed(1)
})

const milestoneRecords = computed(() => 
  props.records.filter(r => r.milestone).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
)

onMounted(() => {
  const line = document.querySelector('.line-path')
  if (line) {
    const length = (line as SVGPathElement).getTotalLength()
    line.style.strokeDasharray = `${length}px`
    line.style.strokeDashoffset = `${length}px`
    line.style.animation = 'drawLine 1.5s ease-out forwards'
  }
})
</script>

<style scoped>
.growth-curve {
  position: relative;
}

.empty-curve {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.curve-container {
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
}

.curve-svg {
  width: 100%;
  height: auto;
  display: block;
}

.line-path {
  filter: url(#glow);
}

.data-point {
  animation: popIn 0.5s ease-out backwards;
}

.milestone-ring {
  animation: pulse 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.4;
  }
}

.stats-overlay {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  background: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stat-value.growth {
  color: #4caf50;
}

.milestones h3 {
  color: #333;
  margin-bottom: 15px;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.milestone-date {
  font-weight: 600;
  color: #d46a2f;
  font-size: 14px;
}

.milestone-text {
  color: #8b4513;
  flex: 1;
}

.particle-spark {
  position: absolute;
  right: 15px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #ffd700 0%, transparent 70%);
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
