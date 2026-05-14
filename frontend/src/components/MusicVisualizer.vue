<template>
  <div class="music-visualizer">
    <div class="bar" v-for="i in 20" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.music-visualizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 30px;
}

.bar {
  width: 4px;
  height: 10px;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 2px;
  animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    height: 10px;
  }
  50% {
    height: 30px;
  }
}
</style>
