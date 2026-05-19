<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px" class="aside">
        <div class="logo">
          <el-icon size="24" color="#409eff"><Setting /></el-icon>
          <span>管理后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          :default-openeds="['review', 'risk', 'operation', 'system']"
        >
          <el-sub-menu index="review">
            <template #title>
              <el-icon><CircleCheck /></el-icon>
              <span>内容审核</span>
            </template>
            <el-menu-item index="/admin/review/tasks">
              <el-icon><Document /></el-icon>
              <span>审核任务</span>
            </el-menu-item>
            <el-menu-item index="/admin/review/logs">
              <el-icon><Notebook /></el-icon>
              <span>审核日志</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="risk">
            <template #title>
              <el-icon><Lock /></el-icon>
              <span>风控中心</span>
            </template>
            <el-menu-item index="/admin/risk/behavior">
              <el-icon><Warning /></el-icon>
              <span>行为风控</span>
            </el-menu-item>
            <el-menu-item index="/admin/risk/account">
              <el-icon><UserFilled /></el-icon>
              <span>账号风控</span>
            </el-menu-item>
            <el-menu-item index="/admin/risk/login-logs">
              <el-icon><Key /></el-icon>
              <span>登录日志</span>
            </el-menu-item>
            <el-menu-item index="/admin/risk/register-logs">
              <el-icon><Avatar /></el-icon>
              <span>注册日志</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="operation">
            <template #title>
              <el-icon><Operation /></el-icon>
              <span>运营管理</span>
            </template>
            <el-menu-item index="/admin/operation/banners">
              <el-icon><Picture /></el-icon>
              <span>Banner管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/operation/hot-ranks">
              <el-icon><Trophy /></el-icon>
              <span>热门榜单</span>
            </el-menu-item>
            <el-menu-item index="/admin/operation/flow-support">
              <el-icon><TrendCharts /></el-icon>
              <span>流量扶持</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="creator">
            <template #title>
              <el-icon><Medal /></el-icon>
              <span>创作者管理</span>
            </template>
            <el-menu-item index="/admin/creator/verifications">
              <el-icon><Postcard /></el-icon>
              <span>达人认证</span>
            </el-menu-item>
            <el-menu-item index="/admin/creator/data">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据中心</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/admin/system/roles">
              <el-icon><Lock /></el-icon>
              <span>角色权限</span>
            </el-menu-item>
            <el-menu-item index="/admin/system/admins">
              <el-icon><User /></el-icon>
              <span>管理员</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/notes">
            <el-icon><Document /></el-icon>
            <span>笔记审核</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Tools /></el-icon>
            <span>系统配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>管理后台</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <span>欢迎，{{ userStore.user?.nickname }}</span>
            <el-button type="text" @click="$router.push('/')">返回前台</el-button>
          </div>
        </el-header>
        
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  Setting,
  Document,
  User,
  Tools,
  CircleCheck,
  Notebook,
  Warning,
  UserFilled,
  Key,
  Avatar,
  Operation,
  Picture,
  Trophy,
  TrendCharts,
  Medal,
  Postcard,
  DataAnalysis,
  Lock,
} from '@element-plus/icons-vue';

const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.user) {
    await userStore.fetchCurrentUser();
  }
});
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
}

.aside {
  background-color: #304156;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #1f2d3d;
  }
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #666;
  }
}

.main {
  background: #f5f7fa;
  padding: 20px;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
