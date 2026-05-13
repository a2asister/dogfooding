<template>
  <div class="text-card">
    <div class="text-content" :class="{ 'animate-text': animate }">
      {{ data.value || '暂无文本' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: {
    value?: string;
  };
  config?: Record<string, unknown>;
  animate?: boolean;
}>();
</script>

<style scoped>
.text-card {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(153, 102, 255, 0.1) 0%, rgba(102, 51, 204, 0.05) 100%);
  border-radius: 8px;
}

.text-content {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 1.6;
}

.animate-text {
  animation: fadeIn 1s ease-out, glow 3s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(153, 102, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(153, 102, 255, 0.8);
  }
}
</style>
