<template>
  <div class="flow-support">
    <div class="page-header">
      <h2>流量扶持</h2>
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="状态" style="width: 140px" @change="fetchSupports">
          <el-option label="全部" value="" />
          <el-option label="进行中" value="active" />
          <el-option label="已结束" value="inactive" />
        </el-select>
        <el-select v-model="filterType" placeholder="扶持类型" style="width: 140px" @change="fetchSupports">
          <el-option label="全部" value="" />
          <el-option label="冷启动" value="cold_start" />
          <el-option label="手动扶持" value="manual" />
          <el-option label="活动扶持" value="event" />
        </el-select>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建扶持
        </el-button>
        <el-button type="default" @click="fetchSupports">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="support-list">
      <el-table :data="supports" border stripe>
        <el-table-column label="笔记标题" min-width="200">
          <template #default="{ row }">
            <span v-if="row.note">{{ row.note.title }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="扶持类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="boostMultiplier" label="扶持流量" width="120" align="center">
          <template #default="{ row }">
            {{ row.boostMultiplier }}x
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ row.startTime ? formatDate(row.startTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="{ row }">
            {{ row.endTime ? formatDate(row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? '进行中' : '已结束' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleCancel(row)"
              :disabled="!row.isActive"
            >
              取消扶持
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
          @size-change="fetchSupports"
          @current-change="fetchSupports"
        />
      </div>
    </div>

    <el-dialog v-model="createDialogVisible" title="创建流量扶持" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="笔记ID" required>
          <el-input v-model="createForm.noteId" placeholder="请输入笔记ID" />
        </el-form-item>
        <el-form-item label="扶持类型" required>
          <el-select v-model="createForm.type" placeholder="请选择扶持类型" style="width: 100%">
            <el-option label="冷启动" value="cold_start" />
            <el-option label="手动扶持" value="manual" />
            <el-option label="活动扶持" value="event" />
          </el-select>
        </el-form-item>
        <el-form-item label="流量倍数" required>
          <el-input-number v-model="createForm.boostMultiplier" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="扶持原因">
          <el-input v-model="createForm.reason" type="textarea" :rows="2" placeholder="请输入扶持原因" />
        </el-form-item>
        <el-form-item label="目标浏览量">
          <el-input-number v-model="createForm.targetViews" :min="0" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="createForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="createForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getFlowSupports, createFlowSupport, cancelFlowSupport } from '@/api/operation';
import type { FlowSupport } from '@/types';
import { Refresh, Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const supports = ref<FlowSupport[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterStatus = ref('');
const filterType = ref('');

const createDialogVisible = ref(false);
const createForm = reactive({
  noteId: '',
  type: 'manual' as 'cold_start' | 'manual' | 'event',
  boostMultiplier: 2,
  reason: '',
  targetViews: undefined as number | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
});

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    cold_start: '冷启动',
    manual: '手动扶持',
    event: '活动扶持',
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    cold_start: 'primary',
    manual: 'success',
    event: 'warning',
  };
  return map[type] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchSupports = async () => {
  loading.value = true;
  try {
    const res = await getFlowSupports({
      status: filterStatus.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    supports.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取流量扶持列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  createForm.noteId = '';
  createForm.type = 'manual';
  createForm.boostMultiplier = 2;
  createForm.reason = '';
  createForm.targetViews = undefined;
  createForm.startTime = undefined;
  createForm.endTime = undefined;
  createDialogVisible.value = true;
};

const confirmCreate = async () => {
  if (!createForm.noteId) {
    ElMessage.warning('请输入笔记ID');
    return;
  }
  try {
    await createFlowSupport({
      noteId: createForm.noteId,
      type: createForm.type,
      boostMultiplier: createForm.boostMultiplier,
      reason: createForm.reason || undefined,
      targetViews: createForm.targetViews,
      startTime: createForm.startTime,
      endTime: createForm.endTime,
    });
    ElMessage.success('创建扶持成功');
    createDialogVisible.value = false;
    fetchSupports();
  } catch (error) {
    console.error('创建扶持失败:', error);
  }
};

const handleCancel = async (support: FlowSupport) => {
  try {
    await ElMessageBox.confirm('确定要取消该流量扶持吗？', '确认', {
      type: 'warning',
    });
    await cancelFlowSupport(support.id);
    ElMessage.success('已取消扶持');
    fetchSupports();
  } catch (error) {
    console.error('取消扶持失败:', error);
  }
};

onMounted(() => {
  fetchSupports();
});
</script>

<style lang="scss" scoped>
.flow-support {
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

  .support-list {
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
