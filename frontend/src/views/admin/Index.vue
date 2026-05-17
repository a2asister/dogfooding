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
        >
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
import { Setting, Document, User, Tools } from '@element-plus/icons-vue';

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
