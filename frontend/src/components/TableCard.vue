<template>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <th v-for="col in (data.columns || [])" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in (data.rows || [])" :key="index" :class="{ 'animate-row': animate }">
          <td v-for="col in (data.columns || [])" :key="col">
            {{ row[col as keyof typeof row] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: {
    columns?: string[];
    rows?: Record<string, unknown>[];
  };
  config?: Record<string, unknown>;
  animate?: boolean;
}>();
</script>

<style scoped>
.table-card {
  width: 100%;
  height: 100%;
  padding: 15px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 255, 136, 0.2) 100%);
}

th {
  padding: 12px;
  text-align: left;
  color: #fff;
  font-weight: 600;
  border-bottom: 2px solid rgba(0, 212, 255, 0.5);
}

td {
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

tbody tr:hover {
  background: rgba(0, 212, 255, 0.1);
}

.animate-row {
  animation: slideIn 0.5s ease-out backwards;
}

tbody tr:nth-child(1) {
  animation-delay: 0.1s;
}

tbody tr:nth-child(2) {
  animation-delay: 0.2s;
}

tbody tr:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
