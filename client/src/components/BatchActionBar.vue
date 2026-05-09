<template>
  <div class="batch-action-bar">
    <div class="bar-left">
      <span class="selected-count">{{ count }} 个已选中</span>
    </div>
    <div class="bar-right">
      <button class="action-btn complete" @click="$emit('complete-all')">
        ✓ 全部完成
      </button>
      <button class="action-btn delete" @click="$emit('delete-all')">
        🗑️ 删除
      </button>
      <button class="action-btn cancel" @click="$emit('clear')">
        取消选择
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BatchActionBar',
  props: {
    count: {
      type: Number,
      default: 0
    }
  },
  emits: ['complete-all', 'delete-all', 'clear']
}
</script>

<style scoped>
.batch-action-bar {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: slideIn var(--transition-normal);
  min-width: 400px;
}

.bar-left {
  display: flex;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.action-btn.complete {
  background: var(--primary-light);
  color: var(--primary-color);
}

.action-btn.complete:hover {
  background: var(--primary-color);
  color: white;
}

.action-btn.delete {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.action-btn.delete:hover {
  background: #f43f5e;
  color: white;
}

.action-btn.cancel {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.action-btn.cancel:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .batch-action-bar {
    min-width: auto;
    width: calc(100% - 32px);
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .bar-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
