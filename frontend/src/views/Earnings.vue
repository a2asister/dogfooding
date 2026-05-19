<template>
  <Layout>
    <div class="earning-page">
      <div class="page-header">
        <h1>收益中心</h1>
        <p>查看您的创作收益和提现记录</p>
      </div>

      <div class="stats-overview">
        <div class="stat-card main">
          <div class="stat-label">累计收益</div>
          <div class="stat-value">¥{{ summary?.totalEarnings || 0 }}</div>
          <div class="stat-sub">
            <span>今日收益: ¥{{ summary?.todayEarnings || 0 }}</span>
            <span>本周: ¥{{ summary?.weekEarnings || 0 }}</span>
            <span>本月: ¥{{ summary?.monthEarnings || 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon available">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">可提现</div>
            <div class="stat-value small">¥{{ summary?.availableBalance || 0 }}</div>
          </div>
          <el-button type="primary" size="small" @click="showWithdrawDialog = true">提现</el-button>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">待结算</div>
            <div class="stat-value small">¥{{ summary?.pendingBalance || 0 }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon settled">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">已提现</div>
            <div class="stat-value small">¥{{ summary?.settledBalance || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="earning-by-type">
        <h3>收益构成</h3>
        <div class="type-list">
          <div
            v-for="(amount, type) in summary?.earningsByType || {}"
            :key="type"
            class="type-item"
          >
            <div class="type-icon" :class="type">
              <el-icon>
                <component :is="getTypeIcon(type)" />
              </el-icon>
            </div>
            <div class="type-info">
              <span class="type-name">{{ getTypeName(type) }}</span>
              <span class="type-amount">¥{{ amount }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-tabs">
          <el-tabs v-model="activeTab" @tab-change="fetchData">
            <el-tab-pane label="收益明细" name="earnings" />
            <el-tab-pane label="提现记录" name="withdrawals" />
          </el-tabs>
        </div>

        <div v-if="activeTab === 'earnings'" v-loading="loading" class="earning-list">
          <div class="filter-bar">
            <el-select v-model="filterType" placeholder="收益类型" clearable style="width: 140px">
              <el-option label="商品佣金" value="commission" />
              <el-option label="用户打赏" value="tip" />
              <el-option label="会员订阅" value="subscription" />
              <el-option label="广告收入" value="ad_revenue" />
              <el-option label="平台奖励" value="platform_reward" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="收益状态" clearable style="width: 140px">
              <el-option label="待结算" value="pending" />
              <el-option label="可提现" value="available" />
              <el-option label="已结算" value="settled" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 280px"
            />
            <el-button type="primary" @click="fetchEarnings">
              <el-icon><Search /></el-icon>
              筛选
            </el-button>
          </div>

          <el-table :data="earnings" border stripe>
            <el-table-column label="收益类型" width="120">
              <template #default="{ row }">
                <div class="type-cell">
                  <el-icon :class="row.type">
                    <component :is="getTypeIcon(row.type)" />
                  </el-icon>
                  {{ getTypeName(row.type) }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
            <el-table-column label="金额" width="120">
              <template #default="{ row }">
                <span class="amount-positive">+¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getEarningStatusType(row.status)" size="small">
                  {{ getEarningStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="160">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="结算时间" width="160">
              <template #default="{ row }">
                {{ row.settlementDate ? formatTime(row.settlementDate) : '-' }}
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!loading && earnings.length === 0" class="empty">
            <el-empty description="暂无收益记录" />
          </div>

          <div class="pagination">
            <el-pagination
              v-model:current-page="earningPagination.page"
              v-model:page-size="earningPagination.pageSize"
              :total="earningPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchEarnings"
              @current-change="fetchEarnings"
            />
          </div>
        </div>

        <div v-if="activeTab === 'withdrawals'" v-loading="loading" class="withdrawal-list">
          <el-table :data="withdrawals" border stripe>
            <el-table-column prop="id" label="提现单号" width="200" />
            <el-table-column label="提现金额" width="120">
              <template #default="{ row }">
                <span class="amount-negative">-¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="手续费" width="100">
              <template #default="{ row }">¥{{ row.fee }}</template>
            </el-table-column>
            <el-table-column label="实付金额" width="120">
              <template #default="{ row }">¥{{ row.netAmount }}</template>
            </el-table-column>
            <el-table-column prop="method" label="提现方式" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getMethodText(row.method) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getWithdrawalStatusType(row.status)" size="small">
                  {{ getWithdrawalStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="申请时间" width="160">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="备注" width="150">
              <template #default="{ row }">
                {{ row.rejectReason || '-' }}
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!loading && withdrawals.length === 0" class="empty">
            <el-empty description="暂无提现记录" />
          </div>

          <div class="pagination">
            <el-pagination
              v-model:current-page="withdrawalPagination.page"
              v-model:page-size="withdrawalPagination.pageSize"
              :total="withdrawalPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="fetchWithdrawals"
              @current-change="fetchWithdrawals"
            />
          </div>
        </div>
      </div>

      <el-dialog v-model="showWithdrawDialog" title="申请提现" width="500px">
        <el-form :model="withdrawForm" :rules="withdrawRules" label-width="100px">
          <el-form-item label="可提现金额">
            <span style="color: #67c23a; font-weight: 600; font-size: 18px">
              ¥{{ summary?.availableBalance || 0 }}
            </span>
          </el-form-item>
          <el-form-item label="提现金额" prop="amount">
            <el-input-number
              v-model="withdrawForm.amount"
              :min="1"
              :max="summary?.availableBalance || 0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="提现方式" prop="method">
            <el-radio-group v-model="withdrawForm.method">
              <el-radio value="alipay">支付宝</el-radio>
              <el-radio value="wechat">微信</el-radio>
              <el-radio value="bank">银行卡</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="账户信息" prop="account">
            <el-input v-model="withdrawForm.account" placeholder="请输入账户账号" />
          </el-form-item>
          <el-form-item label="账户姓名">
            <el-input v-model="withdrawForm.name" placeholder="请输入真实姓名" />
          </el-form-item>
          <div class="fee-info">
            <el-alert
              title="手续费说明"
              type="info"
              :closable="false"
              size="small"
            >
              提现手续费2元/笔，单笔最低提现1元
            </el-alert>
          </div>
        </el-form>
        <template #footer>
          <el-button @click="showWithdrawDialog = false">取消</el-button>
          <el-button type="primary" @click="handleWithdraw">确认提现</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Wallet,
  Clock,
  CircleCheck,
  Search,
  Goods,
  Coin,
  User,
  Advertisement,
  Medal,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { getEarningSummary, getEarningList, getWithdrawalList, createWithdrawal } from '@/api/earning';
import type { Earning, EarningSummary, Withdrawal } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const activeTab = ref('earnings');
const summary = ref<EarningSummary | null>(null);
const earnings = ref<Earning[]>([]);
const withdrawals = ref<Withdrawal[]>([]);
const showWithdrawDialog = ref(false);

const filterType = ref('');
const filterStatus = ref('');
const dateRange = ref<[Date, Date] | null>(null);

const earningPagination = ref({ page: 1, pageSize: 10, total: 0 });
const withdrawalPagination = ref({ page: 1, pageSize: 10, total: 0 });

const withdrawForm = ref({
  amount: 0,
  method: 'alipay' as 'alipay' | 'wechat' | 'bank',
  account: '',
  name: '',
});

const withdrawRules = {
  amount: [{ required: true, message: '请输入提现金额', trigger: 'blur' }],
  method: [{ required: true, message: '请选择提现方式', trigger: 'change' }],
  account: [{ required: true, message: '请输入账户账号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
};

const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss');

const getTypeIcon = (type: string) => {
  const map: Record<string, any> = {
    commission: Goods,
    tip: Coin,
    subscription: User,
    ad_revenue: Advertisement,
    platform_reward: Medal,
  };
  return map[type] || Coin;
};

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    commission: '商品佣金',
    tip: '用户打赏',
    subscription: '会员订阅',
    ad_revenue: '广告收入',
    platform_reward: '平台奖励',
  };
  return map[type] || type;
};

const getEarningStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    available: 'primary',
    settled: 'success',
    cancelled: 'info',
  };
  return map[status] || '';
};

const getEarningStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待结算',
    available: '可提现',
    settled: '已结算',
    cancelled: '已取消',
  };
  return map[status] || status;
};

const getMethodText = (method: string) => {
  const map: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信',
    bank: '银行卡',
  };
  return map[method] || method;
};

const getWithdrawalStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger',
  };
  return map[status] || '';
};

const getWithdrawalStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝',
  };
  return map[status] || status;
};

const fetchSummary = async () => {
  try {
    const res = await getEarningSummary();
    summary.value = res.summary;
  } catch (error) {
    console.error('获取收益汇总失败:', error);
  }
};

const fetchEarnings = async () => {
  loading.value = true;
  try {
    const res = await getEarningList({
      page: earningPagination.value.page,
      pageSize: earningPagination.value.pageSize,
      type: filterType.value,
      status: filterStatus.value,
      startDate: dateRange.value?.[0] ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined,
      endDate: dateRange.value?.[1] ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined,
    });
    earnings.value = res?.list || [];
    earningPagination.value.total = res?.total || 0;
  } catch (error) {
    console.error('获取收益明细失败:', error);
    ElMessage.error('获取收益明细失败');
  } finally {
    loading.value = false;
  }
};

const fetchWithdrawals = async () => {
  loading.value = true;
  try {
    const res = await getWithdrawalList({
      page: withdrawalPagination.value.page,
      pageSize: withdrawalPagination.value.pageSize,
    });
    withdrawals.value = res?.list || [];
    withdrawalPagination.value.total = res?.total || 0;
  } catch (error) {
    console.error('获取提现记录失败:', error);
    ElMessage.error('获取提现记录失败');
  } finally {
    loading.value = false;
  }
};

const fetchData = () => {
  if (activeTab.value === 'earnings') {
    fetchEarnings();
  } else {
    fetchWithdrawals();
  }
};

const handleWithdraw = async () => {
  try {
    await createWithdrawal({
      amount: withdrawForm.value.amount,
      method: withdrawForm.value.method,
      accountInfo: {
        account: withdrawForm.value.account,
        name: withdrawForm.value.name,
      },
    });
    ElMessage.success('提现申请已提交');
    showWithdrawDialog.value = false;
    fetchSummary();
    fetchWithdrawals();
  } catch (error) {
    console.error('提现申请失败:', error);
    ElMessage.error('提现申请失败');
  }
};

onMounted(() => {
  fetchSummary();
  fetchEarnings();
});
</script>

<style lang="scss" scoped>
.earning-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;

    &.main {
      flex-direction: column;
      align-items: flex-start;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }

      .stat-value {
        font-size: 36px;
        font-weight: 700;
        margin: 8px 0;
      }

      .stat-sub {
        display: flex;
        gap: 16px;
        font-size: 12px;
        opacity: 0.85;
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;

      &.available {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
      &.pending {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
      &.settled {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    .stat-info {
      flex: 1;

      .stat-label {
        font-size: 13px;
        color: #999;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: #333;

        &.small {
          font-size: 20px;
        }
      }
    }
  }
}

.earning-by-type {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .type-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;

    .type-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;

      .type-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #fff;

        &.commission {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        &.tip {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        &.subscription {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        &.ad_revenue {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        &.platform_reward {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }

      .type-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .type-name {
          font-size: 13px;
          color: #666;
        }

        .type-amount {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }
    }
  }
}

.content-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.type-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-icon {
    font-size: 16px;

    &.commission {
      color: #667eea;
    }
    &.tip {
      color: #f093fb;
    }
    &.subscription {
      color: #4facfe;
    }
    &.ad_revenue {
      color: #43e97b;
    }
    &.platform_reward {
      color: #fa709a;
    }
  }
}

.amount-positive {
  color: #67c23a;
  font-weight: 600;
}

.amount-negative {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty {
  padding: 40px 0;
}

.fee-info {
  margin-top: 16px;
}
</style>
