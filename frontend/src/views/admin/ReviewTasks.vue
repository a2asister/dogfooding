<template>
  <div class="review-tasks">
    <div class="page-header">
      <h2>审核任务</h2>
      <div class="filter-bar">
        <el-select v-model="filterType" placeholder="内容类型" style="width: 140px" @change="fetchTasks">
          <el-option label="全部" value="" />
          <el-option label="笔记" value="note" />
          <el-option label="评论" value="comment" />
          <el-option label="用户" value="user" />
        </el-select>
        <el-button type="primary" @click="fetchTasks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="task-list">
      <el-table :data="tasks" border stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="level" label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">{{ getLevelName(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetUser" label="发布用户" width="150">
          <template #default="{ row }">
            <span v-if="row.targetUser">{{ row.targetUser.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewTask(row)">
              查看
            </el-button>
            <el-button type="success" size="small" @click="approveTask(row)" :disabled="row.status !== 'pending'">
              通过
            </el-button>
            <el-button type="danger" size="small" @click="rejectTask(row)" :disabled="row.status !== 'pending'">
              驳回
            </el-button>
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
          @size-change="fetchTasks"
          @current-change="fetchTasks"
        />
      </div>
    </div>

    <el-dialog v-model="viewDialogVisible" title="审核详情" width="700px">
      <div v-if="currentTask" class="task-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务类型">
            {{ getTypeName(currentTask.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getLevelTagType(currentTask.level)">
              {{ getLevelName(currentTask.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentTask.status)">
              {{ getStatusName(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentTask.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="content-text">{{ currentTask.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.aiResult" label="AI检测结果" :span="2">
            <div class="ai-result">
              <p>风险评分：{{ currentTask.aiResult.score }}</p>
              <p>风险类别：{{ currentTask.aiResult.categories.join(', ') }}</p>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentTask.status === 'pending'" class="review-actions">
          <el-form :model="reviewForm" label-width="80px">
            <el-form-item label="审核意见">
              <el-input
                v-model="reviewForm.reason"
                type="textarea"
                :rows="3"
                placeholder="请输入审核意见（选填）"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="handleApprove">审核通过</el-button>
              <el-button type="danger" @click="handleReject">审核驳回</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPendingReviewTasks, reviewTask } from '@/api/contentReview';
import type { ReviewTask } from '@/types';
import { Refresh } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const tasks = ref<ReviewTask[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterType = ref('');
const viewDialogVisible = ref(false);
const currentTask = ref<ReviewTask | null>(null);

const reviewForm = reactive({
  reason: '',
});

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

const getLevelName = (level: string) => {
  const map: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return map[level] || level;
};

const getLevelTagType = (level: string) => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  };
  return map[level] || 'info';
};

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    reviewing: '审核中',
    approved: '已通过',
    rejected: '已驳回',
  };
  return map[status] || status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    reviewing: 'primary',
    approved: 'success',
    rejected: 'danger',
  };
  return map[status] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchTasks = async () => {
  loading.value = true;
  try {
    const res = await getPendingReviewTasks({
      type: filterType.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    tasks.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取审核任务失败:', error);
  } finally {
    loading.value = false;
  }
};

const viewTask = (task: ReviewTask) => {
  currentTask.value = task;
  reviewForm.reason = '';
  viewDialogVisible.value = true;
};

const approveTask = async (task: ReviewTask) => {
  try {
    await ElMessageBox.confirm('确定要通过该审核吗？', '确认', {
      type: 'success',
    });
    await reviewTask(task.id, { passed: true });
    ElMessage.success('审核通过');
    fetchTasks();
  } catch (error) {
    console.error('审核失败:', error);
  }
};

const rejectTask = async (task: ReviewTask) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因', '驳回审核', {
      inputPlaceholder: '请输入驳回原因',
      confirmButtonText: '确认驳回',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await reviewTask(task.id, { passed: false, reason });
    ElMessage.success('已驳回');
    fetchTasks();
  } catch (error) {
    console.error('驳回失败:', error);
  }
};

const handleApprove = async () => {
  if (!currentTask.value) return;
  try {
    await reviewTask(currentTask.value.id, { passed: true, reason: reviewForm.reason });
    ElMessage.success('审核通过');
    viewDialogVisible.value = false;
    fetchTasks();
  } catch (error) {
    console.error('审核失败:', error);
  }
};

const handleReject = async () => {
  if (!currentTask.value) return;
  try {
    await reviewTask(currentTask.value.id, { passed: false, reason: reviewForm.reason });
    ElMessage.success('已驳回');
    viewDialogVisible.value = false;
    fetchTasks();
  } catch (error) {
    console.error('驳回失败:', error);
  }
};

onMounted(() => {
  fetchTasks();
});
</script>

<style lang="scss" scoped>
.review-tasks {
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

  .task-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .task-detail {
    .content-text {
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      line-height: 1.6;
    }

    .ai-result {
      padding: 12px;
      background: #fef0f0;
      border-radius: 4px;
      color: #f56c6c;

      p {
        margin: 4px 0;
      }
    }

    .review-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>
