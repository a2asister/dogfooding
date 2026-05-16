<script setup lang="ts">
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in userStore.toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #52c41a;
}

.toast-error {
  background: #ff4d4f;
}

.toast-warning {
  background: #fa8c16;
}

.toast-info {
  background: #1890ff;
}

.toast-enter-active {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-active {
  opacity: 0;
  transform: translateX(100px);
  transition: all 0.3s ease;
}

.toast-enter-to {
  opacity: 1;
  transform: translateX(0);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
