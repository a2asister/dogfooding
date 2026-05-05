<template>
  <div class="distribution-home">
    <div class="distributor-card" v-loading="loading">
      <div class="distributor-header">
        <div class="distributor-info">
          <el-avatar :size="56" class="distributor-avatar">
            <el-icon :size="28"><User /></el-icon>
          </el-avatar>
          <div class="distributor-detail">
            <div class="distributor-name">{{ distributor?.userName || '分销商' }}</div>
            <div class="distributor-level">
              <el-tag :type="getLevelType(distributor?.level)" size="small">
                {{ distributor?.levelName || '初级分销商' }}
              </el-tag>
              <span class="commission-rate">佣金比例 {{ getCommissionRate(distributor?.level) }}%</span>
            </div>
          </div>
        </div>
        <div class="referral-code">
          <div class="code-label">我的邀请码</div>
          <div class="code-value">{{ distributor?.referralCode || 'REF000000' }}</div>
          <el-button type="primary" size="small" @click="handleCopyCode">
            复制邀请码
          </el-button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-item" @click="$router.push('/commissions')">
          <div class="stat-value">¥{{ distributor?.withdrawableCommission || 0 }}</div>
          <div class="stat-label">可提现佣金</div>
          <el-button type="primary" size="small" class="withdraw-btn" @click.stop="handleWithdraw">
            提现
          </el-button>
        </div>
        <div class="stat-item">
          <div class="stat-value">¥{{ distributor?.totalCommission || 0 }}</div>
          <div class="stat-label">累计佣金</div>
        </div>
        <div class="stat-item" @click="$router.push('/team')">
          <div class="stat-value">{{ distributor?.teamCount || 0 }}</div>
          <div class="stat-label">团队成员</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">¥{{ distributor?.totalSales || 0 }}</div>
          <div class="stat-label">累计销售</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-card" @click="handleShare">
        <div class="action-icon share">
          <el-icon :size="28"><Share /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">分享链接</span>
          <span class="action-desc">邀请好友</span>
        </div>
      </div>
      <div class="action-card" @click="$router.push('/commissions')">
        <div class="action-icon commission">
          <el-icon :size="28"><Wallet /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">佣金明细</span>
          <span class="action-desc">查看记录</span>
        </div>
      </div>
      <div class="action-card" @click="$router.push('/team')">
        <div class="action-icon team">
          <el-icon :size="28"><UserFilled /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">我的团队</span>
          <span class="action-desc">团队管理</span>
        </div>
      </div>
      <div class="action-card" @click="$router.push('/withdraws')">
        <div class="action-icon withdraw">
          <el-icon :size="28"><Money /></el-icon>
        </div>
        <div class="action-text">
          <span class="action-title">提现记录</span>
          <span class="action-desc">历史记录</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          近期佣金
        </h3>
        <el-button type="primary" link @click="$router.push('/commissions')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="commissions-list" v-loading="loading">
        <div 
          v-for="commission in recentCommissions" 
          :key="commission.id" 
          class="commission-item"
        >
          <div class="commission-icon" :class="commission.status">
            <el-icon :size="22">{{ getCommissionIcon(commission.status) }}</el-icon>
          </div>
          <div class="commission-info">
            <div class="commission-desc">{{ commission.description }}</div>
            <div class="commission-detail">
              <span class="detail-item">订单金额: ¥{{ commission.orderAmount }}</span>
              <span class="detail-item">佣金比例: {{ (commission.commissionRate * 100).toFixed(0) }}%</span>
            </div>
            <div class="commission-time">
              <el-icon><Timer /></el-icon>
              {{ commission.formattedCreatedAt }}
            </div>
          </div>
          <div class="commission-amount" :class="commission.status">
            +¥{{ commission.commissionAmount }}
            <div class="commission-status">
              <el-tag :type="getCommissionTagType(commission.status)" size="small">
                {{ getCommissionStatusName(commission.status) }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && recentCommissions.length === 0" description="暂无佣金记录" />
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><UserFilled /></el-icon>
          我的团队
        </h3>
        <el-button type="primary" link @click="$router.push('/team')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="team-stats">
        <div class="team-stat-item">
          <div class="team-stat-value">{{ statistics?.firstLevelCount || 0 }}</div>
          <div class="team-stat-label">一级成员</div>
        </div>
        <div class="team-stat-item">
          <div class="team-stat-value">{{ statistics?.secondLevelCount || 0 }}</div>
          <div class="team-stat-label">二级成员</div>
        </div>
        <div class="team-stat-item">
          <div class="team-stat-value">¥{{ statistics?.totalSales || 0 }}</div>
          <div class="team-stat-label">团队销售</div>
        </div>
        <div class="team-stat-item">
          <div class="team-stat-value">{{ statistics?.totalOrders || 0 }}</div>
          <div class="team-stat-label">团队订单</div>
        </div>
      </div>
    </div>

    <el-dialog 
      v-model="withdrawVisible" 
      title="申请提现" 
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="withdrawForm" label-width="80px">
        <el-form-item label="可提现">
          <span class="highlight">¥{{ distributor?.withdrawableCommission || 0 }}</span>
        </el-form-item>
        <el-form-item label="提现金额" required>
          <el-input-number 
            v-model="withdrawForm.amount" 
            :min="100" 
            :max="distributor?.withdrawableCommission || 0"
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  User, Share, Wallet, UserFilled, Money,
  TrendCharts, ArrowRight, Timer, Check, Clock
} from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3008/api';
const USER_ID = 'user_001';

const loading = ref(false);
const withdrawing = ref(false);
const distributor = ref(null);
const recentCommissions = ref([]);
const statistics = ref({});

const withdrawVisible = ref(false);
const withdrawForm = ref({
  amount: 100,
  withdrawType: 'alipay',
  account: '',
  accountName: ''
});

const getLevelType = (level) => {
  const types = {
    1: 'info',
    2: 'success',
    3: 'warning'
  };
  return types[level] || 'info';
};

const getCommissionRate = (level) => {
  const rates = {
    1: 10,
    2: 15,
    3: 20
  };
  return rates[level] || 10;
};

const getCommissionIcon = (status) => {
  const icons = {
    pending: 'Clock',
    settled: 'Check',
    cancelled: 'Close'
  };
  return icons[status] || 'Wallet';
};

const getCommissionStatusName = (status) => {
  const names = {
    pending: '待结算',
    settled: '已结算',
    cancelled: '已取消'
  };
  return names[status] || status;
};

const getCommissionTagType = (status) => {
  const types = {
    pending: 'warning',
    settled: 'success',
    cancelled: 'danger'
  };
  return types[status] || 'info';
};

const loadDistributor = async () => {
  try {
    const response = await axios.get(`${API_BASE}/distributors/${USER_ID}`);
    if (response.data.success) {
      distributor.value = response.data.data;
    }
  } catch (error) {
    console.error('加载分销商信息失败:', error);
  }
};

const loadCommissions = async () => {
  try {
    const response = await axios.get(`${API_BASE}/commissions/${distributor.value?.id}`, {
      params: { limit: 5 }
    });
    if (response.data.success) {
      recentCommissions.value = response.data.data.map(c => ({
        ...c,
        formattedCreatedAt: c.formattedCreatedAt || new Date(c.createdAt).toLocaleString('zh-CN')
      }));
      statistics.value = response.data.statistics || {};
    }
  } catch (error) {
    console.error('加载佣金明细失败:', error);
  }
};

const handleCopyCode = async () => {
  try {
    await navigator.clipboard.writeText(distributor.value?.referralCode || '');
    ElMessage.success('邀请码已复制');
  } catch (error) {
    ElMessage.error('复制失败，请手动复制');
  }
};

const handleShare = () => {
  ElMessage.info('分享功能开发中...');
};

const handleWithdraw = () => {
  if (!distributor.value?.withdrawableCommission || distributor.value.withdrawableCommission < 100) {
    ElMessage.warning('可提现佣金不足 100 元');
    return;
  }
  withdrawForm.value.amount = Math.min(100, distributor.value.withdrawableCommission);
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
      distributorId: distributor.value?.id,
      ...withdrawForm.value
    });

    if (response.data.success) {
      ElMessage.success('提现申请提交成功！');
      withdrawVisible.value = false;
      loadDistributor();
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

onMounted(() => {
  loading.value = true;
  loadDistributor().then(() => {
    loadCommissions();
  }).finally(() => {
    loading.value = false;
  });
});
</script>

<style scoped>
.distribution-home {
  padding-bottom: 40px;
}

.distributor-card {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #ffecd2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(168, 237, 234, 0.3);
}

.distributor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.distributor-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.distributor-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.distributor-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distributor-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.distributor-level {
  display: flex;
  align-items: center;
  gap: 12px;
}

.commission-rate {
  font-size: 13px;
  color: #667eea;
  font-weight: 600;
}

.referral-code {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.code-label {
  font-size: 12px;
  color: #6c757d;
}

.code-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
}

.withdraw-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-icon.share {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.commission {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.action-icon.team {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-icon.withdraw {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.action-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.action-desc {
  font-size: 12px;
  color: #999;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-title .el-icon {
  color: #a8edea;
}

.commissions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.commission-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.commission-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.commission-icon.settled {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.commission-icon.pending {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9a3d 100%);
  color: white;
}

.commission-info {
  flex: 1;
  min-width: 0;
}

.commission-desc {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.commission-detail {
  display: flex;
  gap: 16px;
  margin-bottom: 6px;
}

.detail-item {
  font-size: 12px;
  color: #6c757d;
}

.commission-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.commission-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  margin-left: 16px;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 700;
}

.commission-amount.settled {
  color: #11998e;
}

.commission-amount.pending {
  color: #ff9a3d;
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.team-stat-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.team-stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.team-stat-label {
  font-size: 13px;
  color: #6c757d;
}

.highlight {
  font-size: 18px;
  font-weight: 700;
  color: #11998e;
}

@media (max-width: 768px) {
  .distributor-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .team-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .commission-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .commission-amount {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-left: 0;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
