<template>
  <div class="account-risks">
    <div class="page-header">
      <h2>账号风控</h2>
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="风险状态" style="width: 140px" @change="fetchRisks">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已忽略" value="ignored" />
          <el-option label="已处理" value="processed" />
        </el-select>
        <el-select v-model="filterType" placeholder="风险类型" style="width: 140px" @change="fetchRisks">
          <el-option label="全部" value="" />
          <el-option label="异常登录" value="abnormal_login" />
          <el-option label="批量注册" value="batch_register" />
          <el-option label="账号共享" value="account_sharing" />
          <el-option label="异常设备" value="abnormal_device" />
          <el-option label="异地登录" value="remote_login" />
        </el-select>
        <el-button type="primary" @click="fetchRisks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="success" @click="batchProcess" :disabled="selectedRisks.length === 0">
          <el-icon><Check /></el-icon>
          批量处理
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="risk-list">
      <el-table :data="risks" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="type" label="风险类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">{{ getLevelName(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="用户" width="150">
          <template #default="{ row }">
            <span v-if="row.user">{{ row.user.nickname }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actionTaken" label="已执行动作" width="120">
          <template #default="{ row }">
            <span v-if="row.actionTaken">{{ getActionName(row.actionTaken) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="{ row }">
            {{ (row.confidence * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="detectedAt" label="检测时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.detectedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewRisk(row)">
              查看
            </el-button>
            <el-button type="success" size="small" @click="processRisk(row, true)" :disabled="row.status !== 'pending'">
              确认
            </el-button>
            <el-button type="info" size="small" @click="processRisk(row, false)" :disabled="row.status !== 'pending'">
              忽略
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
          @size-change="fetchRisks"
          @current-change="fetchRisks"
        />
      </div>
    </div>

    <el-dialog v-model="viewDialogVisible" title="风险详情" width="800px">
      <div v-if="currentRisk" class="risk-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="风险类型">
            {{ getTypeName(currentRisk.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="getLevelTagType(currentRisk.level)">
              {{ getLevelName(currentRisk.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            {{ (currentRisk.confidence * 100).toFixed(1) }}%
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentRisk.status)">
              {{ getStatusName(currentRisk.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            <span v-if="currentRisk.user">{{ currentRisk.user.nickname }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="检测时间">
            {{ formatDate(currentRisk.detectedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRisk.actionTaken" label="已执行动作">
            {{ getActionName(currentRisk.actionTaken) }}
          </el-descriptions-item>
        </el-descriptions>

        <template v-if="currentRisk.loginDetails || currentRisk.batchDetails">
          <el-tabs class="detail-tabs">
            <el-tab-pane v-if="currentRisk.loginDetails" label="登录详情" name="login">
              <div class="evidence-box">
                <pre>{{ JSON.stringify(currentRisk.loginDetails, null, 2) }}</pre>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="currentRisk.batchDetails" label="注册详情" name="register">
              <div class="evidence-box">
                <pre>{{ JSON.stringify(currentRisk.batchDetails, null, 2) }}</pre>
              </div>
            </el-tab-pane>
            <el-tab-pane label="证据数据" name="evidence">
              <div class="evidence-box">
                <pre>{{ JSON.stringify(currentRisk.evidence, null, 2) }}</pre>
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>
        <template v-else>
          <div class="evidence-section">
            <h4>证据数据</h4>
            <div class="evidence-box">
              <pre>{{ JSON.stringify(currentRisk.evidence, null, 2) }}</pre>
            </div>
          </div>
        </template>

        <div v-if="currentRisk.status === 'pending'" class="review-actions">
          <el-form :model="processForm" label-width="80px">
            <el-form-item label="处理动作">
              <el-select v-model="processForm.action" placeholder="选择处理动作" style="width: 200px">
                <el-option label="无操作" value="none" />
                <el-option label="强制登出" value="force_logout" />
                <el-option label="限制登录" value="restrict_login" />
                <el-option label="冻结账号" value="freeze_account" />
                <el-option label="封禁账号" value="ban_account" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理备注">
              <el-input
                v-model="processForm.reviewNote"
                type="textarea"
                :rows="3"
                placeholder="请输入处理备注（选填）"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="handleConfirm">确认风险</el-button>
              <el-button type="info" @click="handleIgnore">忽略风险</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="batchDialogVisible" title="批量处理" width="500px">
      <el-form :model="batchForm" label-width="80px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="batchForm.confirmed">
            <el-radio :label="true">确认风险</el-radio>
            <el-radio :label="false">忽略风险</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理动作">
          <el-select v-model="batchForm.action" placeholder="选择处理动作" style="width: 100%">
            <el-option label="无操作" value="none" />
            <el-option label="强制登出" value="force_logout" />
            <el-option label="限制登录" value="restrict_login" />
            <el-option label="冻结账号" value="freeze_account" />
            <el-option label="封禁账号" value="ban_account" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="batchForm.reviewNote"
            type="textarea"
            :rows="3"
            placeholder="请输入处理备注（选填）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleBatchProcess">确认批量处理</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAccountRisks, processAccountRisk, batchProcessAccountRisks } from '@/api/riskControl';
import type { AccountRisk } from '@/types';
import { Refresh, Check } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const risks = ref<AccountRisk[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const filterStatus = ref('');
const filterType = ref('');
const viewDialogVisible = ref(false);
const batchDialogVisible = ref(false);
const currentRisk = ref<AccountRisk | null>(null);
const selectedRisks = ref<AccountRisk[]>([]);

const processForm = reactive({
  action: 'none',
  reviewNote: '',
});

const batchForm = reactive({
  confirmed: true,
  action: 'none',
  reviewNote: '',
});

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    abnormal_login: '异常登录',
    batch_register: '批量注册',
    account_sharing: '账号共享',
    abnormal_device: '异常设备',
    remote_login: '异地登录',
  };
  return map[type] || type;
};

const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    abnormal_login: 'danger',
    batch_register: 'warning',
    account_sharing: 'danger',
    abnormal_device: 'warning',
    remote_login: 'warning',
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
    pending: '待处理',
    confirmed: '已确认',
    ignored: '已忽略',
    processed: '已处理',
  };
  return map[status] || status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    ignored: 'info',
    processed: 'success',
  };
  return map[status] || 'info';
};

const getActionName = (action: string) => {
  const map: Record<string, string> = {
    none: '无操作',
    force_logout: '强制登出',
    restrict_login: '限制登录',
    freeze_account: '冻结账号',
    ban_account: '封禁账号',
  };
  return map[action] || action;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchRisks = async () => {
  loading.value = true;
  try {
    const res = await getAccountRisks({
      status: filterStatus.value || undefined,
      type: filterType.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    });
    risks.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取账号风险列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selection: AccountRisk[]) => {
  selectedRisks.value = selection;
};

const viewRisk = (risk: AccountRisk) => {
  currentRisk.value = risk;
  processForm.action = 'none';
  processForm.reviewNote = '';
  viewDialogVisible.value = true;
};

const processRisk = async (risk: AccountRisk, confirmed: boolean) => {
  try {
    const actionText = confirmed ? '确认' : '忽略';
    await ElMessageBox.confirm(`确定要${actionText}该风险吗？`, '确认', {
      type: confirmed ? 'warning' : 'info',
    });
    await processAccountRisk(risk.id, {
      confirmed,
      action: 'none',
    });
    ElMessage.success(`已${actionText}`);
    fetchRisks();
  } catch (error) {
    console.error('处理风险失败:', error);
  }
};

const handleConfirm = async () => {
  if (!currentRisk.value) return;
  try {
    await processAccountRisk(currentRisk.value.id, {
      confirmed: true,
      action: processForm.action,
      reviewNote: processForm.reviewNote,
    });
    ElMessage.success('已确认风险');
    viewDialogVisible.value = false;
    fetchRisks();
  } catch (error) {
    console.error('确认风险失败:', error);
  }
};

const handleIgnore = async () => {
  if (!currentRisk.value) return;
  try {
    await processAccountRisk(currentRisk.value.id, {
      confirmed: false,
      reviewNote: processForm.reviewNote,
    });
    ElMessage.success('已忽略风险');
    viewDialogVisible.value = false;
    fetchRisks();
  } catch (error) {
    console.error('忽略风险失败:', error);
  }
};

const batchProcess = () => {
  batchForm.confirmed = true;
  batchForm.action = 'none';
  batchForm.reviewNote = '';
  batchDialogVisible.value = true;
};

const handleBatchProcess = async () => {
  try {
    await ElMessageBox.confirm(`确定要批量处理选中的 ${selectedRisks.value.length} 条风险吗？`, '确认', {
      type: 'warning',
    });
    await batchProcessAccountRisks({
      riskIds: selectedRisks.value.map(r => r.id),
      confirmed: batchForm.confirmed,
      action: batchForm.action,
      reviewNote: batchForm.reviewNote,
    });
    ElMessage.success('批量处理成功');
    batchDialogVisible.value = false;
    fetchRisks();
  } catch (error) {
    console.error('批量处理失败:', error);
  }
};

onMounted(() => {
  fetchRisks();
});
</script>

<style lang="scss" scoped>
.account-risks {
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

  .risk-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .risk-detail {
    .detail-tabs {
      margin-top: 20px;
    }

    .evidence-section {
      margin-top: 20px;

      h4 {
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .evidence-box {
      max-height: 300px;
      overflow: auto;
      background: #f5f7fa;
      padding: 12px;
      border-radius: 4px;

      pre {
        margin: 0;
        font-size: 12px;
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
