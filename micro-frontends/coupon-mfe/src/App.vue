<template>
  <div class="coupon-mfe-container">
    <div class="tab-header">
      <div 
        class="tab-item" 
        :class="{ active: isHome }"
        @click="$router.push('/')"
      >
        <el-icon><Ticket /></el-icon>
        <span>领券中心</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: !isHome }"
        @click="$router.push('/my-coupons')"
      >
        <el-icon><Wallet /></el-icon>
        <span>我的优惠券</span>
        <el-badge :value="userCouponCount" v-if="userCouponCount > 0" class="tab-badge" />
      </div>
    </div>
    
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Ticket, Wallet } from '@element-plus/icons-vue';

const route = useRoute();
const userCouponCount = ref(0);

const isHome = computed(() => route.path === '/' || route.path === '');
</script>

<style scoped>
.coupon-mfe-container {
  background: transparent;
}

.tab-header {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tab-item:hover {
  background: #f8f9fa;
}

.tab-item.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.tab-item .el-icon {
  font-size: 18px;
}

.tab-item span {
  font-size: 14px;
  font-weight: 500;
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: 20%;
}
</style>
