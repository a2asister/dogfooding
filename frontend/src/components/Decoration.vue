<template>
  <div class="decoration" :style="styleObject">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'snowflake' | 'star' | 'heart' | 'ribbon'
  x?: number
  y?: number
  delay?: number
}>()

const styleObject = computed(() => ({
  left: `${props.x || 0}px`,
  top: `${props.y || 0}px`,
  animationDelay: `${props.delay || 0}s`
}))
</script>

<style scoped>
.decoration {
  position: absolute;
  animation: float 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}
</style>
