<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useTripStore } from '../stores/trip';
import TimelineNode from './TimelineNode.vue';
import TripCard from './TripCard.vue';

const store = useTripStore();

const progress = computed(() => {
  const total = store.sortedNodes.length;
  if (total <= 1) return 0;
  return (store.selectedNodeIndex / (total - 1)) * 100;
});

let playInterval: ReturnType<typeof setInterval> | null = null;

const startPlay = (): void => {
  if (playInterval) return;
  playInterval = setInterval(() => {
    if (store.selectedNodeIndex < store.sortedNodes.length - 1) {
      store.nextNode();
    } else {
      stopPlay();
      store.togglePlay();
    }
  }, 2000);
};

const stopPlay = (): void => {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
};

watch(
  () => store.isPlaying,
  (playing) => {
    if (playing) {
      startPlay();
    } else {
      stopPlay();
    }
  }
);

onMounted(() => {
  if (store.isPlaying) {
    startPlay();
  }
});

onUnmounted(() => {
  stopPlay();
});
</script>

<template>
  <div class="timeline-container">
    <div class="controls">
      <button class="control-btn" @click="store.prevNode()" :disabled="store.selectedNodeIndex === 0">
        ◀
      </button>
      <button class="control-btn play-btn" @click="store.togglePlay()">
        {{ store.isPlaying ? '⏸' : '▶' }}
      </button>
      <button class="control-btn" @click="store.nextNode()" :disabled="store.selectedNodeIndex === store.sortedNodes.length - 1">
        ▶
      </button>
    </div>

    <div class="timeline">
      <div class="timeline-track">
        <div class="timeline-progress" :style="{ width: `${progress}%` }"></div>
        <div class="timeline-nodes">
          <TimelineNode v-for="(node, index) in store.sortedNodes" :key="node.id" :node="node" :index="index" :is-active="index === store.selectedNodeIndex" :is-passed="index < store.selectedNodeIndex" @click="store.selectNode(index)" />
        </div>
      </div>
    </div>

    <div class="card-container">
      <Transition name="slide" mode="out-in">
        <TripCard v-if="store.currentNode" :node="store.currentNode" :key="store.currentNode.id" />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.timeline-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.timeline {
  position: relative;
  padding: 20px 0;
  margin-bottom: 40px;
}

.timeline-track {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.timeline-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.5s ease;
  background-size: 200% 200%;
  animation: flowLight 3s ease infinite;
}

.timeline-nodes {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
}

.card-container {
  min-height: 200px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}
</style>