<template>
  <div class="reservations-manage">
    <div class="stats-card card">
      <div class="stat-item">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">总预约人数</div>
        </div>
      </div>
    </div>

    <div class="table-card card">
      <el-table :data="reservationsList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="phone" label="手机号码" width="150" />
        <el-table-column prop="platform" label="预约平台" width="120">
          <template #default="{ row }">{{ getPlatformName(row.platform) }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="预约时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="loadReservations"
          @current-change="loadReservations"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reservationApi } from '../../api'
import type { Reservation } from '../../types'

const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalCount = ref(0)
const reservationsList = ref<Reservation[]>([])

const getPlatformName = (platform: string | null): string => {
  const map: Record<string, string> = {
    ios: 'iOS',
    android: 'Android',
    pc: 'PC'
  }
  return map[platform || ''] || '未知'
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const loadReservations = async (): Promise<void> => {
  try {
    const result = await reservationApi.getList({
      page: page.value,
      pageSize: pageSize.value
    })
    reservationsList.value = result.list
    total.value = result.total
  } catch {
    reservationsList.value = []
  }
}

const loadStats = async (): Promise<void> => {
  try {
    const result = await reservationApi.getStats()
    totalCount.value = result.total
  } catch {
    totalCount.value = 0
  }
}

onMounted(() => {
  loadReservations()
  loadStats()
})
</script>

<style scoped lang="scss">
.reservations-manage {
  .stats-card {
    padding: 24px;
    margin-bottom: 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      font-size: 48px;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-dark);
      border-radius: 12px;
    }

    .stat-info {
      .stat-value {
        font-size: 36px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }
  }
}

.table-card {
  padding: 20px;

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

:deep(.el-table) {
  --el-table-bg-color: var(--bg-card);
  --el-table-tr-bg-color: var(--bg-card);
  --el-table-header-bg-color: var(--bg-dark);
  --el-table-text-color: var(--text-primary);
  --el-table-header-text-color: var(--text-secondary);
  --el-table-border-color: var(--border-color);
  --el-table-row-hover-bg-color: var(--bg-dark);
}
</style>
