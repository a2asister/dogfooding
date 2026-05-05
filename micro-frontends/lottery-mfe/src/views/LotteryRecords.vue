<template>
  <div class="lottery-records">
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon :size="28"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总抽奖次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon win">
              <el-icon :size="28"><StarFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.win }}</div>
              <div class="stat-label">中奖次数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon rate">
              <el-icon :size="28"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.winRate }}%</div>
              <div class="stat-label">中奖率</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon today">
              <el-icon :size="28"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.today }}</div>
              <div class="stat-label">今日抽奖</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">奖品类型:</span>
        <el-select v-model="filterType" placeholder="全部" clearable @change="loadRecords">
          <el-option label="全部" value="" />
          <el-option label="实物奖品" value="product" />
          <el-option label="优惠券" value="coupon" />
          <el-option label="积分" value="points" />
          <el-option label="未中奖" value="none" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-button type="primary" link @click="$router.push('/')">
          <el-icon><Promotion /></el-icon>
          去抽奖
        </el-button>
      </div>
    </div>

    <div class="records-list" v-loading="loading">
      <div v-for="record in records" :key="record.id" class="record-item">
        <div class="record-icon" :class="record.prizeType">
          <el-icon :size="28">{{ getPrizeIcon(record.prizeType) }}</el-icon>
        </div>
        <div class="record-info">
          <div class="record-prize">
            <span class="prize-name">{{ record.prizeName }}</span>
            <el-tag :type="getTagType(record.prizeType)" size="small" v-if="record.prizeType !== 'none'">
              已中奖
            </el-tag>
            <el-tag v-else type="info" size="small">
              未中奖
            </el-tag>
          </div>
          <div class="record-detail">
            <span class="detail-item">
              抽奖活动: {{ record.lotteryName }}
            </span>
            <span class="detail-item">
              奖品类型: {{ getPrizeTypeName(record.prizeType) }}
            </span>
          </div>
          <div class="record-time">
            <el-icon><Timer /></el-icon>
            {{ record.formattedCreatedAt }}
          </div>
        </div>
        <div class="record-claimed" v-if="record.prizeType !== 'none'">
          <el-tag :type="record.status === 'claimed' ? 'success' : 'warning'">
            {{ record.status === 'claimed' ? '已领取' : '待领取' }}
          </el-tag>
        </div>
      </div>

      <el-empty v-if="!loading && records.length === 0" description="暂无抽奖记录" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Trophy, StarFilled, TrendCharts, Calendar, Promotion, Timer, Ticket, Coin, CircleClose } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3006/api';
const USER_ID = 'user_001';

const loading = ref(false);
const filterType = ref('');
const records = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const allRecords = ref([]);

const stats = computed(() => {
  const totalCount = allRecords.value.length;
  const winCount = allRecords.value.filter(r => r.prizeType !== 'none').length;
  const todayCount = allRecords.value.filter(r => {
    const created = new Date(r.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  return {
    total: totalCount,
    win: winCount,
    winRate: totalCount > 0 ? ((winCount / totalCount) * 100).toFixed(1) : 0,
    today: todayCount
  };
});

const getPrizeIcon = (type) => {
  switch (type) {
    case 'product':
      return 'Trophy';
    case 'coupon':
      return 'Ticket';
    case 'points':
      return 'Coin';
    case 'extra_draw':
      return 'Promotion';
    default:
      return 'CircleClose';
  }
};

const getPrizeTypeName = (type) => {
  const names = {
    product: '实物奖品',
    coupon: '优惠券',
    points: '积分',
    extra_draw: '额外次数',
    none: '未中奖'
  };
  return names[type] || type;
};

const getTagType = (type) => {
  switch (type) {
    case 'product':
      return 'success';
    case 'coupon':
      return 'primary';
    case 'points':
      return 'warning';
    default:
      return 'info';
  }
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (filterType.value) {
      params.prizeType = filterType.value;
    }

    const response = await axios.get(`${API_BASE}/lottery-records/user/${USER_ID}`, { params });
    if (response.data.success) {
      const data = response.data.data || [];
      records.value = data.map(r => ({
        ...r,
        formattedCreatedAt: r.createdAt ? new Date(r.createdAt).toLocaleString('zh-CN') : ''
      }));
      
      if (currentPage.value === 1) {
        allRecords.value = records.value;
      }
      
      total.value = response.data.pagination?.total || records.value.length;
    }
  } catch (error) {
    console.error('加载抽奖记录失败:', error);
    ElMessage.error('加载抽奖记录失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadRecords();
};

const handleCurrentChange = () => {
  loadRecords();
};

onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.lottery-records {
  padding-bottom: 40px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.win {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.rate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.today {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
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

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.record-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.record-icon.product {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.record-icon.coupon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.record-icon.points {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9a3d 100%);
}

.record-icon.extra_draw {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.record-icon.none {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

.record-info {
  flex: 1;
}

.record-prize {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.prize-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.record-detail {
  display: flex;
  gap: 24px;
  margin-bottom: 6px;
}

.detail-item {
  font-size: 13px;
  color: #6c757d;
}

.record-time {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.record-claimed {
  margin-left: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
