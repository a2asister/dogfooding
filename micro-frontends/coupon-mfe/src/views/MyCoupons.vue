<template>
  <div class="my-coupons">
    <div class="filter-tabs">
      <el-radio-group v-model="filterStatus" size="large" @change="loadMyCoupons">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="unused">待使用</el-radio-button>
        <el-radio-button value="used">已使用</el-radio-button>
        <el-radio-button value="expired">已过期</el-radio-button>
      </el-radio-group>
    </div>

    <div class="coupon-list" v-loading="loading">
      <div 
        v-for="userCoupon in userCoupons" 
        :key="userCoupon.id" 
        class="coupon-item"
        :class="userCoupon.status"
      >
        <div class="coupon-main">
          <div class="coupon-value">
            <div class="amount" v-if="userCoupon.coupon">
              <span class="currency">¥</span>
              <span class="num">{{ userCoupon.coupon.discountType === 'percent' ? (userCoupon.coupon.discountValue * 100).toFixed(0) + '折' : userCoupon.coupon.discountValue }}</span>
            </div>
            <div class="condition" v-if="userCoupon.coupon">
              {{ userCoupon.coupon.minOrderAmount > 0 ? `满${userCoupon.coupon.minOrderAmount}可用` : '无门槛' }}
            </div>
          </div>
          <div class="coupon-info">
            <div class="name">{{ userCoupon.coupon?.name || '优惠券' }}</div>
            <div class="desc">{{ userCoupon.coupon?.description || '' }}</div>
            <div class="date">
              <el-icon><Calendar /></el-icon>
              有效期至 {{ userCoupon.formattedValidUntil || '长期有效' }}
            </div>
          </div>
        </div>
        <div class="coupon-action">
          <el-button 
            v-if="userCoupon.status === 'unused'"
            type="primary" 
            size="small"
            @click="handleUse(userCoupon)"
          >
            立即使用
          </el-button>
          <el-tag v-else-if="userCoupon.status === 'used'" type="info">
            已使用
          </el-tag>
          <el-tag v-else type="danger">
            已过期
          </el-tag>
        </div>
      </div>

      <el-empty v-if="!loading && userCoupons.length === 0" description="暂无优惠券" />
    </div>

    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-value">{{ stats.unused }}</div>
            <div class="stat-label">待使用</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-value">{{ stats.used }}</div>
            <div class="stat-label">已使用</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-value">{{ stats.expired }}</div>
            <div class="stat-label">已过期</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3005/api';
const USER_ID = 'user_001';

const loading = ref(false);
const filterStatus = ref('');
const userCoupons = ref([]);
const allCoupons = ref([]);

const stats = computed(() => ({
  unused: allCoupons.value.filter(c => c.status === 'unused').length,
  used: allCoupons.value.filter(c => c.status === 'used').length,
  expired: allCoupons.value.filter(c => c.status === 'expired').length
}));

const loadMyCoupons = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    const response = await axios.get(`${API_BASE}/user-coupons/${USER_ID}`, { params });
    if (response.data.success) {
      const coupons = response.data.data || [];
      if (!filterStatus.value) {
        allCoupons.value = coupons;
      }
      userCoupons.value = coupons;
    }
  } catch (error) {
    console.error('加载我的优惠券失败:', error);
    ElMessage.error('加载优惠券失败');
  } finally {
    loading.value = false;
  }
};

const handleUse = async (userCoupon) => {
  try {
    await ElMessageBox.confirm(
      `确认使用「${userCoupon.coupon?.name}」优惠券？`,
      '确认使用',
      {
        confirmButtonText: '确认使用',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await axios.post(`${API_BASE}/user-coupons/${userCoupon.id}/use`, {
      orderAmount: userCoupon.coupon?.minOrderAmount || 100,
      orderId: `order_${Date.now()}`
    });

    if (response.data.success) {
      ElMessage.success('使用成功！');
      loadMyCoupons();
    }
  } catch (error) {
    if (error !== 'cancel') {
      if (error.response?.data?.error) {
        ElMessage.error(error.response.data.error);
      } else {
        ElMessage.error('使用失败，请稍后重试');
      }
      console.error(error);
    }
  }
};

onMounted(() => {
  loadMyCoupons();
});
</script>

<style scoped>
.my-coupons {
  padding-bottom: 40px;
}

.filter-tabs {
  margin-bottom: 20px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-item {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.coupon-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.coupon-item.used,
.coupon-item.expired {
  opacity: 0.6;
}

.coupon-main {
  display: flex;
  flex: 1;
}

.coupon-value {
  width: 100px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.coupon-item.used .coupon-value,
.coupon-item.expired .coupon-value {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

.amount {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 14px;
  font-weight: 600;
}

.num {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.condition {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.9;
}

.coupon-info {
  flex: 1;
  padding: 16px 20px;
  border-left: 2px dashed #e0e0e0;
}

.name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.desc {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.date {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coupon-action {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #f0f0f0;
}

.stats-section {
  margin-top: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f093fb;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
}
</style>
