<template>
  <div class="points-mfe-container">
    <div class="tab-header">
      <div 
        class="tab-item" 
        :class="{ active: isHome }"
        @click="$router.push('/')"
      >
        <el-icon><Coin /></el-icon>
        <span>积分中心</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: isMall }"
        @click="$router.push('/mall')"
      >
        <el-icon><Shop /></el-icon>
        <span>积分商城</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: isTransactions }"
        @click="$router.push('/transactions')"
      >
        <el-icon><Document /></el-icon>
        <span>积分明细</span>
      </div>
    </div>
    
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Coin, Shop, Document } from '@element-plus/icons-vue';

const route = useRoute();

const isHome = computed(() => route.path === '/' || route.path === '');
const isMall = computed(() => route.path === '/mall');
const isTransactions = computed(() => route.path === '/transactions');
</script>

<style scoped>
.points-mfe-container {
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
}

.tab-item:hover {
  background: #f8f9fa;
}

.tab-item.active {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.tab-item .el-icon {
  font-size: 18px;
}

.tab-item span {
  font-size: 14px;
  font-weight: 500;
}
</style>
