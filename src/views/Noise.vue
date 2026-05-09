<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { WhiteNoise } from '@/types'

const noises: WhiteNoise[] = [
  { id: 'rain', name: '雨声', icon: 'rain', color: '#60a5fa' },
  { id: 'forest', name: '森林', icon: 'tree', color: '#4ade80' },
  { id: 'ocean', name: '海浪', icon: 'waves', color: '#38bdf8' },
  { id: 'fire', name: '篝火', icon: 'flame', color: '#f97316' },
  { id: 'wind', name: '风声', icon: 'wind', color: '#a78bfa' },
  { id: 'thunder', name: '雷雨', icon: 'cloud-lightning', color: '#6366f1' },
  { id: 'stream', name: '溪流', icon: 'water', color: '#22d3ee' },
  { id: 'night', name: '夜间', icon: 'moon', color: '#818cf8' }
]

const activeNoise = ref<string | null>(null)
const volume = ref(50)
const isPlaying = ref(false)
const timer = ref(0)
const timerOptions = [0, 15, 30, 45, 60]

let audioContext: AudioContext | null = null
let oscillator: OscillatorNode | null = null
let gainNode: GainNode | null = null
let timerInterval: number | null = null

const formattedTime = computed(() => {
  if (timer.value === 0) return '∞'
  const m = Math.floor(timer.value / 60)
  const s = timer.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

function selectNoise(id: string) {
  if (activeNoise.value === id) {
    stopNoise()
  } else {
    startNoise(id)
  }
}

function startNoise(id: string) {
  stopNoise()
  activeNoise.value = id
  isPlaying.value = true
  
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  const bufferSize = 2 * audioContext.sampleRate
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const output = noiseBuffer.getChannelData(0)
  
  let noiseType: string
  switch (id) {
    case 'rain': noiseType = 'rain'; break
    case 'ocean': noiseType = 'ocean'; break
    case 'wind': noiseType = 'wind'; break
    default: noiseType = 'pink'
  }
  
  for (let i = 0; i < bufferSize; i++) {
    let white = Math.random() * 2 - 1
    if (noiseType === 'pink') {
      output[i] = white * 0.3
    } else if (noiseType === 'rain') {
      output[i] = Math.random() * 2 - 1
    } else if (noiseType === 'ocean') {
      output[i] = Math.sin(i * 0.0001) * 0.5 + (Math.random() * 2 - 1) * 0.2
    } else if (noiseType === 'wind') {
      output[i] = (Math.random() * 2 - 1) * 0.5
    } else {
      output[i] = white * 0.4
    }
  }
  
  const whiteNoise = audioContext.createBufferSource()
  whiteNoise.buffer = noiseBuffer
  whiteNoise.loop = true
  
  gainNode = audioContext.createGain()
  gainNode.gain.value = volume.value / 100 * 0.5
  
  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1000
  
  whiteNoise.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  whiteNoise.start()
  oscillator = whiteNoise as unknown as OscillatorNode
}

function stopNoise() {
  if (oscillator) {
    try {
      oscillator.stop()
    } catch (e) {}
    oscillator = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  activeNoise.value = null
  isPlaying.value = false
  gainNode = null
}

function updateVolume() {
  if (gainNode) {
    gainNode.gain.value = volume.value / 100 * 0.5
  }
}

function setTimer(minutes: number) {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  
  if (minutes === 0) {
    timer.value = 0
    return
  }
  
  timer.value = minutes * 60
  timerInterval = window.setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      stopNoise()
    }
  }, 1000)
}

onUnmounted(() => {
  stopNoise()
})
</script>

<template>
  <div class="noise-view">
    <header class="noise-header">
      <h1 class="noise-title">白噪音</h1>
      <p class="noise-sub">轻柔助眠，伴你入眠</p>
    </header>

    <div class="noise-grid">
      <button
        v-for="noise in noises"
        :key="noise.id"
        class="noise-item"
        :class="{ active: activeNoise === noise.id }"
        @click="selectNoise(noise.id)"
      >
        <div class="noise-icon" :style="{ background: `linear-gradient(135deg, ${noise.color}33, ${noise.color}11)` }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <template v-if="noise.icon === 'rain'">
              <path d="M16 13v8M12 15v8M8 13v8"/>
              <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
            </template>
            <template v-else-if="noise.icon === 'tree'">
              <path d="M12 22v-7l-3 3V8l6 3V3l3 8-3-3v7"/>
              <path d="M12 15l-3 3M12 8l3 3"/>
            </template>
            <template v-else-if="noise.icon === 'waves'">
              <path d="M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>
              <path d="M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>
              <path d="M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>
            </template>
            <template v-else-if="noise.icon === 'flame'">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </template>
            <template v-else-if="noise.icon === 'wind'">
              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
              <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
              <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
            </template>
            <template v-else-if="noise.icon === 'cloud-lightning'">
              <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/>
              <path d="m13 12-3 5h4l-3 5"/>
            </template>
            <template v-else-if="noise.icon === 'water'">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </template>
            <template v-else-if="noise.icon === 'moon'">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </template>
          </svg>
          <span class="playing-indicator" v-if="activeNoise === noise.id">
            <span class="wave"></span>
            <span class="wave"></span>
            <span class="wave"></span>
          </span>
        </div>
        <span class="noise-name" :style="{ color: activeNoise === noise.id ? noise.color : '#94a3b8' }">{{ noise.name }}</span>
      </button>
    </div>

    <div class="control-panel" v-if="isPlaying">
      <div class="volume-section">
        <span class="control-label">音量</span>
        <div class="volume-control">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          </svg>
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model="volume" 
            @input="updateVolume"
            class="volume-slider"
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </div>
        <span class="volume-value">{{ volume }}%</span>
      </div>

      <div class="timer-section">
        <span class="control-label">定时关闭</span>
        <div class="timer-options">
          <button
            v-for="t in timerOptions"
            :key="t"
            class="timer-btn"
            :class="{ active: (t === 0 && timer.value === 0) || (t > 0 && Math.ceil(timer.value / 60) === t) }"
            @click="setTimer(t)"
          >
            {{ t === 0 ? '∞' : t + '分' }}
          </button>
        </div>
      </div>
    </div>

    <div class="status-bar" v-if="isPlaying">
      <span class="status-text">正在播放 · {{ activeNoise ? noises.find(n => n.id === activeNoise)?.name : '' }}</span>
      <span class="status-timer">{{ formattedTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.noise-view {
  height: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  animation: fadeIn 0.4s ease;
}

.noise-header {
  margin-bottom: 24px;
}

.noise-title {
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.noise-sub {
  font-size: 13px;
  color: #64748b;
}

.noise-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.noise-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.noise-item:active {
  transform: scale(0.96);
}

.noise-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.noise-item.active .noise-icon {
  color: inherit;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.noise-icon svg {
  width: 28px;
  height: 28px;
}

.playing-indicator {
  position: absolute;
  bottom: 6px;
  right: 6px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.wave {
  width: 3px;
  background: #a5b4fc;
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

.wave:nth-child(1) { height: 4px; animation-delay: 0s; }
.wave:nth-child(2) { height: 8px; animation-delay: 0.2s; }
.wave:nth-child(3) { height: 6px; animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.5); }
}

.noise-name {
  font-size: 12px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.control-panel {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.control-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
  display: block;
}

.volume-section {
  margin-bottom: 20px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-control svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
  flex-shrink: 0;
}

.volume-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 3px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #818cf8, #a78bfa);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.volume-value {
  font-size: 13px;
  color: #a5b4fc;
  font-weight: 500;
  min-width: 36px;
  text-align: right;
}

.timer-options {
  display: flex;
  gap: 8px;
}

.timer-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid rgba(100, 116, 139, 0.2);
  background: rgba(30, 41, 59, 0.4);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timer-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: #c7d2fe;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border-radius: 14px;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.status-text {
  font-size: 13px;
  color: #c7d2fe;
}

.status-timer {
  font-size: 13px;
  color: #a5b4fc;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
