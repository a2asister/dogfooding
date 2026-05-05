<template>
  <div class="team-manage">
    <div class="summary-section">
      <div class="summary-item">
        <div class="summary-icon total">
          <el-icon :size="24"><UserFilled /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">{{ statistics?.totalMembers || 0 }}</div>
          <div class="summary-label">团队总人数</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon first">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">{{ statistics?.firstLevelCount || 0 }}</div>
          <div class="summary-label">一级成员</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon sales">
          <el-icon :size="24"><ShoppingCart /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">¥{{ statistics?.totalSales || 0 }}</div>
          <div class="summary-label">团队销售</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-icon orders">
          <el-icon :size="24"><Document /></el-icon>
        </div>
        <div class="summary-info">
          <div class="summary-value">{{ statistics?.totalOrders || 0 }}</div>
          <div class="summary-label">团队订单</div>
        </div>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">层级:</span>
        <el-radio-group v-model="filterLevel" size="large" @change="loadTeam">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="1">一级</el-radio-button>
          <el-radio-button value="2">二级</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="team-list" v-loading="loading">
      <div 
        v-for="member in team" 
        :key="member.id" 
        class="team-item"
      >
        <div class="member-avatar">
          <el-avatar :size="48">
            <el-icon :size="24"><User /></el-icon>
          </el-avatar>
        </div>
        <div class="member-info">
          <div class="member-header">
            <span class="member-name">{{ member.userName || `会员${member.userId.slice(-6)}` }}</span>
            <span class="member-level">
              <el-tag :type="member.level === 1 ? 'primary' : 'success'" size="small">
                {{ member.level === 1 ? '一级' : '二级' }}
              </el-tag>
            </span>
          </div>
          <div class="member-detail">
            <span class="detail-item">
              <el-icon><Calendar /></el-icon>
              绑定时间: {{ member.formattedBindTime }}
            </span>
            <span class="detail-item">
              <el-icon><ShoppingCart /></el-icon>
              订单数: {{ member.totalOrders }}
            </span>
            <span class="detail-item">
              <el-icon><Money /></el-icon>
              消费金额: ¥{{ member.totalAmount }}
            </span>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && team.length === 0" description="暂无团队成员" />
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
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UserFilled, User, ShoppingCart, Document, Calendar, Money } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3008/api';
const DISTRIBUTOR_ID = 'distributor_001';

const loading = ref(false);
const filterLevel = ref('');
const team = ref([]);
const statistics = ref({});
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const loadTeam = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    };

    if (filterLevel.value) {
      params.level = filterLevel.value;
    }

    const response = await axios.get(`${API_BASE}/team/${DISTRIBUTOR_ID}`, { params });
    if (response.data.success) {
      team.value = response.data.data.map(t => ({
        ...t,
        formattedBindTime: t.formattedBindTime || new Date(t.bindTime).toLocaleString('zh-CN')
      }));
      statistics.value = response.data.statistics || {};
      total.value = response.data.pagination?.total || team.value.length;
    }
  } catch (error) {
    console.error('加载团队成员失败:', error);
    ElMessage.error('加载团队成员失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = () => {
  currentPage.value = 1;
  loadTeam();
};

const handleCurrentChange = () => {
  loadTeam();
};

onMounted(() => {
  loadTeam();
});
</script>

<style scoped>
.team-manage {
  padding-bottom: 40px;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.summary-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-icon.first {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.summary-icon.sales {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.summary-icon.orders {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 13px;
  color: #6c757d;
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

.team-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  margin-right: 16px;
  flex-shrink: 0;
}

.member-avatar .el-avatar {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #667eea;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.member-detail {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 900px) {
  .summary-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-section {
    grid-template-columns: 1fr;
  }
  
  .team-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .member-avatar {
    margin-right: 0;
  }
}
</style>
