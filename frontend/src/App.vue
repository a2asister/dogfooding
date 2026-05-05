<template>
  <div class="app-container">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <el-icon><Ticket /></el-icon>
          <span>优惠券配置器</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/coupons">
            <el-icon><Ticket /></el-icon>
            <span>优惠券管理</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/calculator">
            <el-icon><Calculator /></el-icon>
            <span>价格计算器</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-title">
            <h1>{{ pageTitle }}</h1>
          </div>
          <div class="header-user">
            <el-avatar :size="36" icon="UserFilled" />
            <span class="user-name">管理员</span>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles = {
    '/coupons': '优惠券管理',
    '/products': '商品管理',
    '/calculator': '价格计算器'
  }
  return titles[route.path] || '优惠券配置器'
})
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-container) {
  height: 100%;
  display: flex;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .el-icon {
      font-size: 24px;
    }
  }
  
  .menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
  }
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  
  .header-title {
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #303133;
    }
  }
  
  .header-user {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .user-name {
      color: #606266;
      font-size: 14px;
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  height: 0;
}
</style>
