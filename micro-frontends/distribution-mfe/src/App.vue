<template>
  <div class="distribution-mfe-container">
    <div class="tab-header">
      <div 
        class="tab-item" 
        :class="{ active: isHome }"
        @click="$router.push('/')"
      >
        <el-icon><Share /></el-icon>
        <span>分销中心</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: isCommissions }"
        @click="$router.push('/commissions')"
      >
        <el-icon><Wallet /></el-icon>
        <span>佣金明细</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: isTeam }"
        @click="$router.push('/team')"
      >
        <el-icon><UserFilled /></el-icon>
        <span>我的团队</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: isWithdraws }"
        @click="$router.push('/withdraws')"
      >
        <el-icon><Money /></el-icon>
        <span>提现记录</span>
      </div>
    </div>
    
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Share, Wallet, UserFilled, Money } from '@element-plus/icons-vue';

const route = useRoute();

const isHome = computed(() => route.path === '/' || route.path === '');
const isCommissions = computed(() => route.path === '/commissions');
const isTeam = computed(() => route.path === '/team');
const isWithdraws = computed(() => route.path === '/withdraws');
</script>

<style scoped>
.distribution-mfe-container {
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
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tab-item:hover {
  background: #f8f9fa;
}

.tab-item.active {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #1a1a2e;
}

.tab-item .el-icon {
  font-size: 18px;
}

.tab-item span {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .tab-item span {
    display: none;
  }
}
</style>
