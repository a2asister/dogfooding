<template>
  <div class="review-logs">
    <div class="page-header">
      <h2>审核日志</h2>
      <div class="filter-bar">
        <el-input
          v-model="filterReviewer"
          placeholder="审核人"
          style="width: 140px"
          clearable
          @change="fetchLogs"
        />
        <el-select v-model="filterResult" placeholder="审核结果" style="width: 140px" @change="fetchLogs">
          <el-option label="全部" value="" />
          <el-option label="通过" value="approved" />
          <el-option label="驳回" value="rejected" />
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
        <el-table-column prop="content" label="审核内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核人" width="120">
          <template #default="{ row }">
            <span v-if="row.reviewer">{{ row.reviewer.nickname }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewedAt" label="审核时间" width="180">
          <template #default="{ row }">
            {{ row.reviewedAt ? formatDate(row.reviewedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewNote" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.reviewNote || '-' }}
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
import { getReviewLogs } from '@/api/contentReview';
import type { ReviewTask } from '@/types';
import { Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const logs = ref<ReviewTask[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterReviewer = ref('');
const filterResult = ref('');
const dateRange = ref<[string, string] | null>(null);

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    note: '笔记',
    comment: '评论',
    user: '用户',
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    note: 'primary',
    comment: 'success',
    user: 'warning',
  };
  return map[type] || 'info';
};

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    approved: '通过',
    rejected: '驳回',
  };
  return map[status] || status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    approved: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getReviewLogs({
      page: page.value,
      pageSize: pageSize.value,
    });
    logs.value = res.logs;
    total.value = res.total;
  } catch (error) {
    console.error('获取审核日志失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLogs();
});
</script>

<style lang="scss" scoped>
.review-logs {
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
