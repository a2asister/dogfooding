<template>
  <div class="layout">
    <el-header class="header">
      <div class="container flex-between">
        <div class="logo cursor-pointer" @click="$router.push('/')">
          <el-icon size="28" color="#409eff"><Picture /></el-icon>
          <span>图文社区</span>
        </div>
        <div class="nav">
          <template v-if="userStore.isLoggedIn">
            <el-button type="primary" @click="$router.push('/create')">
              <el-icon><Plus /></el-icon>
              发布笔记
            </el-button>
            <el-dropdown @command="handleCommand">
              <div class="user-info cursor-pointer">
                <el-avatar :size="32" :src="userStore.user?.avatar">
                  {{ userStore.user?.nickname?.charAt(0) }}
                </el-avatar>
                <span class="nickname">{{ userStore.user?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="drafts">草稿箱</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.isAdmin" command="admin">后台管理</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>
    <el-main class="main">
      <div class="container">
        <slot />
      </div>
    </el-main>
    <el-footer class="footer">
      <div class="container text-center">
        <p>© 2024 图文社区 - 分享你的精彩瞬间</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Picture, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'drafts':
      router.push('/drafts');
      break;
    case 'admin':
      router.push('/admin');
      break;
    case 'logout':
      userStore.logout();
      ElMessage.success('退出登录成功');
      router.push('/');
      break;
  }
};
</script>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 !important;
  height: 64px !important;
  line-height: 64px;
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
  
  .nav {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.main {
  flex: 1;
  padding: 24px 0 !important;
}

.footer {
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 20px 0 !important;
  color: #999;
  font-size: 12px;
}
</style>
