<template>
  <div
    class="custom-node"
    :style="{ borderColor: data.color || '#dcdfe6' }"
    :class="{ 'is-selected': selected }"
  >
    <div class="custom-node-content">
      <span class="custom-node-icon">{{ data.icon }}</span>
      <span class="custom-node-label">{{ data.label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  selected: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.custom-node {
  padding: 12px 16px;
  border-radius: 8px;
  background: #fff;
  border: 2px solid #dcdfe6;
  min-width: 140px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.custom-node.is-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.custom-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-node-icon {
  font-size: 18px;
}

.custom-node-label {
  font-weight: 500;
  color: #303133;
}
</style>
