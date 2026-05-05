<template>
  <div class="coupon-home">
    <div class="section" v-if="newUserCoupons.length > 0">
      <div class="section-header">
        <el-icon><StarFilled /></el-icon>
        <span class="section-title">新人专享</span>
        <span class="section-tip">新用户专属优惠券</span>
      </div>
      <div class="coupon-grid">
        <div 
          v-for="coupon in newUserCoupons" 
          :key="coupon.id" 
          class="coupon-card"
          :class="{ claimed: coupon.isClaimed }"
        >
          <div class="coupon-left">
            <div class="coupon-value">
              <span class="currency">¥</span>
              <span class="amount">{{ coupon.discountType === 'percent' ? (coupon.discountValue * 100).toFixed(0) + '折' : coupon.discountValue }}</span>
            </div>
            <div class="coupon-condition">
              {{ coupon.minOrderAmount > 0 ? `满${coupon.minOrderAmount}可用` : '无门槛' }}
            </div>
          </div>
          <div class="coupon-middle">
            <div class="hole top"></div>
            <div class="hole bottom"></div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-desc">{{ coupon.description }}</div>
            <div class="coupon-date">
              <el-icon><Timer /></el-icon>
              {{ coupon.formattedEndTime }}
            </div>
            <div class="coupon-action">
              <el-button 
                :type="coupon.isClaimed ? 'info' : 'primary'" 
                size="small"
                :loading="coupon.claiming"
                @click="handleClaim(coupon)"
              >
                {{ coupon.isClaimed ? '已领取' : '立即领取' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <el-icon><Goods /></el-icon>
        <span class="section-title">热门优惠券</span>
        <span class="section-tip">全场通用</span>
      </div>
      <div class="coupon-grid" v-loading="loading">
        <div 
          v-for="coupon in commonCoupons" 
          :key="coupon.id" 
          class="coupon-card"
          :class="{ claimed: coupon.isClaimed }"
        >
          <div class="coupon-left" :class="`type-${coupon.type}`">
            <div class="coupon-value">
              <span class="currency">¥</span>
              <span class="amount">{{ coupon.discountType === 'percent' ? (coupon.discountValue * 100).toFixed(0) + '折' : coupon.discountValue }}</span>
            </div>
            <div class="coupon-condition">
              {{ coupon.minOrderAmount > 0 ? `满${coupon.minOrderAmount}可用` : '无门槛' }}
            </div>
          </div>
          <div class="coupon-middle">
            <div class="hole top"></div>
            <div class="hole bottom"></div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-desc">{{ coupon.description }}</div>
            <div class="coupon-stats">
              <span class="remaining">剩余 {{ coupon.remainingQuantity }} 张</span>
              <span class="limit">每人限领 {{ coupon.limitPerUser }} 张</span>
            </div>
            <div class="coupon-date">
              <el-icon><Timer /></el-icon>
              {{ coupon.formattedEndTime }}
            </div>
            <div class="coupon-action">
              <el-button 
                :type="coupon.isClaimed ? 'info' : 'primary'" 
                size="small"
                :loading="coupon.claiming"
                @click="handleClaim(coupon)"
              >
                {{ coupon.isClaimed ? '已领取' : '立即领取' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && commonCoupons.length === 0" description="暂无可用优惠券" />
    </div>

    <div class="section">
      <div class="section-header">
        <el-icon><Box /></el-icon>
        <span class="section-title">品类专属</span>
        <span class="section-tip">指定品类可用</span>
      </div>
      <div class="coupon-grid" v-loading="loading">
        <div 
          v-for="coupon in categoryCoupons" 
          :key="coupon.id" 
          class="coupon-card"
          :class="{ claimed: coupon.isClaimed }"
        >
          <div class="coupon-left type-category">
            <div class="coupon-value">
              <span class="currency">¥</span>
              <span class="amount">{{ coupon.discountType === 'percent' ? (coupon.discountValue * 100).toFixed(0) + '折' : coupon.discountValue }}</span>
            </div>
            <div class="coupon-condition">
              {{ coupon.minOrderAmount > 0 ? `满${coupon.minOrderAmount}可用` : '无门槛' }}
            </div>
          </div>
          <div class="coupon-middle">
            <div class="hole top"></div>
            <div class="hole bottom"></div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-desc">{{ coupon.description }}</div>
            <div class="coupon-categories">
              <el-tag v-for="cat in coupon.applicableCategories" :key="cat" size="small" type="info">
                {{ cat }}
              </el-tag>
            </div>
            <div class="coupon-date">
              <el-icon><Timer /></el-icon>
              {{ coupon.formattedEndTime }}
            </div>
            <div class="coupon-action">
              <el-button 
                :type="coupon.isClaimed ? 'info' : 'primary'" 
                size="small"
                :loading="coupon.claiming"
                @click="handleClaim(coupon)"
              >
                {{ coupon.isClaimed ? '已领取' : '立即领取' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && categoryCoupons.length === 0" description="暂无品类优惠券" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { StarFilled, Goods, Box, Timer } from '@element-plus/icons-vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3005/api';
const USER_ID = 'user_001';

const loading = ref(false);
const coupons = ref([]);

const newUserCoupons = computed(() => coupons.value.filter(c => c.isNewUserOnly && c.status === 'active'));
const commonCoupons = computed(() => coupons.value.filter(c => !c.isNewUserOnly && c.type !== 'category' && c.status === 'active'));
const categoryCoupons = computed(() => coupons.value.filter(c => c.type === 'category' && c.status === 'active'));

const loadCoupons = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE}/coupons/available`);
    if (response.data.success) {
      const newUser = response.data.data.newUser || [];
      const common = response.data.data.common || [];
      coupons.value = [...newUser.map(c => ({ ...c, isNewUserOnly: true })), ...common];
    }
  } catch (error) {
    console.error('加载优惠券失败:', error);
    ElMessage.error('加载优惠券失败');
  } finally {
    loading.value = false;
  }
};

const handleClaim = async (coupon) => {
  if (coupon.isClaimed) {
    ElMessage.warning('您已领取过该优惠券');
    return;
  }

  coupon.claiming = true;
  try {
    const response = await axios.post(`${API_BASE}/coupons/${coupon.id}/claim`, {
      userId: USER_ID,
      isNewUser: coupon.isNewUserOnly
    });

    if (response.data.success) {
      coupon.isClaimed = true;
      ElMessage.success('领取成功！');
    }
  } catch (error) {
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error);
    } else {
      ElMessage.error('领取失败，请稍后重试');
    }
    console.error(error);
  } finally {
    coupon.claiming = false;
  }
};

onMounted(() => {
  loadCoupons();
});
</script>

<style scoped>
.coupon-home {
  padding-bottom: 40px;
}

.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-header .el-icon {
  font-size: 22px;
  color: #f093fb;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}

.section-tip {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.coupon-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.coupon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.coupon-card.claimed {
  opacity: 0.7;
}

.coupon-left {
  width: 100px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.coupon-left.type-new_user {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}

.coupon-left.type-common {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.coupon-left.type-category {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.coupon-value {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 16px;
  font-weight: 600;
}

.amount {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.coupon-condition {
  font-size: 12px;
  margin-top: 6px;
  opacity: 0.9;
}

.coupon-middle {
  width: 16px;
  position: relative;
  background: white;
}

.hole {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: #f5f7fa;
  border-radius: 50%;
}

.hole.top {
  top: -8px;
}

.hole.bottom {
  bottom: -8px;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.coupon-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
}

.coupon-categories {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.coupon-date {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coupon-action {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
