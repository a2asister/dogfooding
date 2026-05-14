<template>
  <div class="animated-text" :style="{ animationDelay: `${delay}s` }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  delay?: number
}>()
</script>

<style scoped>
.animated-text {
  animation: floatIn 1s ease-out forwards, settle 0.5s ease-out 1s forwards;
  opacity: 0;
  transform: translateY(-50px);
}

@keyframes floatIn {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes settle {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
