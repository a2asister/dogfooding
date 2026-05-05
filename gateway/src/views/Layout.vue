<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo-container">
        <div class="logo-icon">
          <el-icon :size="28"><Promotion /></el-icon>
        </div>
        <transition name="fade">
          <span v-show="!isCollapse" class="logo-text">促销系统</span>
        </transition>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
        background-color="#1a1a2e"
        text-color="#eee"
        active-text-color="#ff6b6b"
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-menu-item index="/activity">
          <el-icon><Calendar /></el-icon>
          <template #title>活动配置</template>
        </el-menu-item>
        
        <el-menu-item index="/flash-sale">
          <el-icon><Lightning /></el-icon>
          <template #title>秒杀专场</template>
        </el-menu-item>
        
        <el-menu-item index="/group-buy">
          <el-icon><UserFilled /></el-icon>
          <template #title>拼团活动</template>
        </el-menu-item>
        
        <el-menu-item index="/coupon">
          <el-icon><Ticket /></el-icon>
          <template #title>优惠券</template>
        </el-menu-item>
        
        <el-menu-item index="/lottery">
          <el-icon><Present /></el-icon>
          <template #title>抽奖活动</template>
        </el-menu-item>
        
        <el-menu-item index="/points">
          <el-icon><Coin /></el-icon>
          <template #title>积分中心</template>
        </el-menu-item>
        
        <el-menu-item index="/distribution">
          <el-icon><Share /></el-icon>
          <template #title>分销中心</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle !== '首页'">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-tooltip content="搜索">
            <el-icon class="header-icon"><Search /></el-icon>
          </el-tooltip>
          <el-tooltip content="通知">
            <el-badge :value="3" class="header-badge">
              <el-icon class="header-icon"><Bell /></el-icon>
            </el-badge>
          </el-tooltip>
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="user-name">会员用户</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>我的订单</el-dropdown-item>
                <el-dropdown-item>消息中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="layout-main">
        <router-view v-if="isHome" />
        <div v-else id="micro-app-container" class="micro-app-wrapper"></div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)

const isHome = computed(() => route.path === '/home' || route.path === '/')

const activeMenu = computed(() => {
  if (route.path.startsWith('/activity')) return '/activity'
  if (route.path.startsWith('/flash-sale')) return '/flash-sale'
  if (route.path.startsWith('/group-buy')) return '/group-buy'
  if (route.path.startsWith('/coupon')) return '/coupon'
  if (route.path.startsWith('/lottery')) return '/lottery'
  if (route.path.startsWith('/points')) return '/points'
  if (route.path.startsWith('/distribution')) return '/distribution'
  return '/home'
})

const currentTitle = computed(() => {
  const titles = {
    '/activity': '活动配置',
    '/flash-sale': '秒杀专场',
    '/group-buy': '拼团活动',
    '/coupon': '优惠券',
    '/lottery': '抽奖活动',
    '/points': '积分中心',
    '/distribution': '分销中心',
    '/home': '首页'
  }
  for (const [key, title] of Object.entries(titles)) {
    if (route.path.startsWith(key)) return title
  }
  return '首页'
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f0f2f5;
}

.layout-aside {
  background-color: #1a1a2e;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}

.layout-header {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.collapse-icon:hover {
  background-color: #f0f2f5;
  color: #ff6b6b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 20px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
}

.header-icon:hover {
  color: #ff6b6b;
}

.header-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: #f0f2f5;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.user-name {
  font-size: 14px;
  color: #333;
}

.layout-main {
  padding: 20px;
  overflow-y: auto;
}

.micro-app-wrapper {
  width: 100%;
  min-height: calc(100vh - 100px);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
