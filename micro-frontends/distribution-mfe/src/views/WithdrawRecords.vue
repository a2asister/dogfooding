<template>
  <div class="withdraw-records">
    <div class="action-section">
      <el-button type="primary" size="large" @click="handleWithdraw">
        <el-icon><Money /></el-icon>
        申请提现
      </el-button>
      <div class="balance-info">
        <span class="label">可提现余额:</span>
        <span class="value">¥{{ balance?.withdrawableCommission || 0 }}</span>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">状态:</span>
        <el-select v-model="filterStatus" placeholder="全部" clearable @change="loadWithdraws">
          <el-option label="全部" value="" />
          <el-option label="处理中" value="pending" />
          <el-option label="已完成" value="completed" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
    </div>

    <div class="withdraws-list" v-loading="loading">
      <div 
        v-for="withdraw in withdraws" 
        :key="withdraw.id" 
        class="withdraw-item"
      >
        <div class="withdraw-icon" :class="withdraw.status">
          <el-icon :size="24">{{ getWithdrawIcon(withdraw.status) }}</el-icon>
        </div>
        <div class="withdraw-info">
          <div class="withdraw-header">
            <span class="withdraw-no">{{ withdraw.withdrawalNo }}</span>
            <span class="withdraw-status">
              <el-tag :type="getWithdrawTagType(withdraw.status)" size="small">
                {{ getWithdrawStatusName(withdraw.status) }}
              </el-tag>
            </span>
          </div>
          <div class="withdraw-detail">
            <span class="detail-item">
              <el-icon><Money /></el-icon>
              提现金额: ¥{{ withdraw.amount }}
            </span>
            <span class="detail-item">
              <el-icon><Wallet /></el-icon>
              提现方式: {{ getWithdrawTypeName(withdraw.withdrawType) }}
            </span>
            <span class="detail-item" v-if="withdraw.account">
              <el-icon><User /></el-icon>
              账户: {{ withdraw.accountName }} ({{ maskAccount(withdraw.account) }})
            </span>
          </div>
          <div class="withdraw-time">
            <span class="apply-time">
              <el-icon><Calendar /></el-icon>
              申请时间: {{ withdraw.formattedApplyTime }}
            </span>
            <span class="process-time" v-if="withdraw.formattedProcessTime">
              <el-icon><Timer /></el-icon>
              处理时间: {{ withdraw.formattedProcessTime }}
            </span>
          </div>
          <div class="withdraw-remark" v-if="withdraw.remark">
            <el-icon><Document /></el-icon>
            备注: {{ withdraw.remark }}
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && withdraws.length === 0" description="暂无提现记录" />
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog 
      v-model="withdrawVisible" 
      title="申请提现" 
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="withdrawForm" label-width="80px">
        <el-form-item label="可提现">
          <span class="highlight">¥{{ balance?.withdrawableCommission || 0 }}</span>
        </el-form-item>
        <el-form-item label="提现金额" required>
          <el-input-number 
            v-model="withdrawForm.amount" 
            :min="100" 
            :max="balance?.withdrawableCommission || 0"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="提现方式">
          <el-select v-model="withdrawForm.withdrawType" placeholder="选择提现方式" style="width: 100%">
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信钱包" value="wechat" />
            <el-option label="银行卡" value="bank" />
          </el-select>
        </el-form-item>
        <el-form-item label="账户" required>
          <el-input v-model="withdrawForm.account" placeholder="请输入提现账户" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="withdrawForm.accountName" placeholder="请输入真实姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="withdrawVisible = false">取消</el-button>
        <el-button type="primary" :loading="withdrawing" @click="submitWithdraw">
          确认提现
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Money, Wallet, User, Calendar, Timer, Document } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3008/api';
const DISTRIBUTOR_ID = 'distributor_001';

const loading = ref(false);
const withdrawing = ref(false);
const filterStatus = ref('');
const withdraws = ref([]);
const balance = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const withdrawVisible = ref(false);
const withdrawForm = ref({
  amount: 100,
  withdrawType: 'alipay',
  account: '',
  accountName: ''
});

const getWithdrawIcon = (status) => {
  const icons = {
    pending: 'Clock',
    completed: 'Check',
    rejected: 'Close'
  };
  return icons[status] || 'Document';
};

const getWithdrawStatusName = (status) => {
  const names = {
    pending: '处理中',
    completed: '已完成',
    rejected: '已拒绝'
  };
  return names[status] || status;
};

const getWithdrawTagType = (status) => {
  const types = {
    pending: 'warning',
    completed: 'success',
    rejected: 'danger'
  };
  return types[status] || 'info';
};

const getWithdrawTypeName = (type) => {
  const names = {
    alipay: '支付宝',
    wechat: '微信钱包',
    bank: '银行卡'
  };
  return names[type] || type;
};

const maskAccount = (account) => {
  if (!account) return '';
  if (account.length <= 8) return account;
  return account.slice(0, 4) + '****' + account.slice(-4);
};

const loadBalance = async () => {
  try {
    const response = await axios.get(`${API_BASE}/distributors/${DISTRIBUTOR_ID}`);
    if (response.data.success) {
      balance.value = response.data.data;
    }
  } catch (error) {
    console.error('加载分销商信息失败:', error);
  }
};

const loadWithdraws = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (filterStatus.value) {
      params.status = filterStatus.value;
    }

    const response = await axios.get(`${API_BASE}/withdrawals/${DISTRIBUTOR_ID}`, { params });
    if (response.data.success) {
      withdraws.value = response.data.data.map(w => ({
        ...w,
        formattedApplyTime: w.formattedApplyTime || new Date(w.applyTime).toLocaleString('zh-CN'),
        formattedProcessTime: w.formattedProcessTime || (w.processTime ? new Date(w.processTime).toLocaleString('zh-CN') : null)
      }));
      total.value = response.data.pagination?.total || withdraws.value.length;
    }
  } catch (error) {
    console.error('加载提现记录失败:', error);
    ElMessage.error('加载提现记录失败');
  } finally {
    loading.value = false;
  }
};

const handleWithdraw = () => {
  if (!balance.value?.withdrawableCommission || balance.value.withdrawableCommission < 100) {
    ElMessage.warning('可提现余额不足 100 元');
    return;
  }
  withdrawForm.value.amount = Math.min(100, balance.value.withdrawableCommission);
  withdrawVisible.value = true;
};

const submitWithdraw = async () => {
  if (!withdrawForm.value.amount) {
    ElMessage.warning('请输入提现金额');
    return;
  }
  if (!withdrawForm.value.account) {
    ElMessage.warning('请输入提现账户');
    return;
  }
  if (!withdrawForm.value.accountName) {
    ElMessage.warning('请输入真实姓名');
    return;
  }

  try {
    withdrawing.value = true;
    const response = await axios.post(`${API_BASE}/withdrawals/apply`, {
      distributorId: DISTRIBUTOR_ID,
      ...withdrawForm.value
    });

    if (response.data.success) {
      ElMessage.success('提现申请提交成功！');
      withdrawVisible.value = false;
      loadBalance();
      loadWithdraws();
    }
  } catch (error) {
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error);
    } else {
      ElMessage.error('提现失败，请稍后重试');
    }
    console.error(error);
  } finally {
    withdrawing.value = false;
  }
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadWithdraws();
};

const handleCurrentChange = () => {
  loadWithdraws();
};

onMounted(() => {
  loadBalance();
  loadWithdraws();
});
</script>

<style scoped>
.withdraw-records {
  padding-bottom: 40px;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-info .label {
  font-size: 14px;
  color: #6c757d;
}

.balance-info .value {
  font-size: 22px;
  font-weight: 700;
  color: #11998e;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #6c757d;
}

.withdraws-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.withdraw-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.withdraw-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.withdraw-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  float: left;
}

.withdraw-icon.completed {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.withdraw-icon.pending {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9a3d 100%);
  color: white;
}

.withdraw-icon.rejected {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.withdraw-info {
  overflow: hidden;
}

.withdraw-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.withdraw-no {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.withdraw-detail {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.withdraw-time {
  display: flex;
  gap: 20px;
  margin-bottom: 4px;
}

.apply-time,
.process-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.withdraw-remark {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
}

.highlight {
  font-size: 18px;
  font-weight: 700;
  color: #11998e;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .action-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .withdraw-item {
    padding: 12px;
  }
  
  .withdraw-icon {
    float: none;
    margin-bottom: 12px;
  }
  
  .withdraw-detail {
    flex-direction: column;
    gap: 8px;
  }
  
  .withdraw-time {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
