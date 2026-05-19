<template>
  <div class="login-logs">
    <div class="page-header">
      <h2>登录日志</h2>
      <div class="filter-bar">
        <el-input
          v-model="filterUser"
          placeholder="用户名/手机号"
          style="width: 160px"
          clearable
          @change="fetchLogs"
        />
        <el-select v-model="filterStatus" placeholder="状态" style="width: 140px" @change="fetchLogs">
          <el-option label="全部" value="" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
          @change="fetchLogs"
        />
        <el-button type="primary" @click="fetchLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="log-list">
      <el-table :data="logs" border stripe>
        <el-table-column label="用户" width="140">
          <template #default="{ row }">
            <span v-if="row.user">{{ row.user.nickname }}</span>
            <span v-else>{{ row.username || row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="登录IP" width="140">
          <template #default="{ row }">
            {{ row.ip || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="设备" width="120">
          <template #default="{ row }">
            {{ row.deviceInfo?.device || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="浏览器" width="140">
          <template #default="{ row }">
            {{ row.deviceInfo?.browser || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="登录时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="位置" width="120">
          <template #default="{ row }">
            {{ row.deviceInfo?.location || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getLoginLogs } from '@/api/riskControl';
import type { LoginLog } from '@/types';
import { Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const logs = ref<LoginLog[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterUser = ref('');
const filterStatus = ref('');
const dateRange = ref<[string, string] | null>(null);

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    success: '成功',
    failed: '失败',
  };
  return map[status] || status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    success: 'success',
    failed: 'danger',
  };
  return map[status] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getLoginLogs({
      status: filterStatus.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    logs.value = res.logs;
    total.value = res.total;
  } catch (error) {
    console.error('获取登录日志失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLogs();
});
</script>

<style lang="scss" scoped>
.login-logs {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .filter-bar {
      display: flex;
      gap: 12px;
    }
  }

  .log-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
