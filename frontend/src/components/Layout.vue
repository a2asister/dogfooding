<template>
  <div class="layout">
    <el-header class="header">
      <div class="container flex-between">
        <div class="left-section">
          <div class="logo cursor-pointer" @click="$router.push('/')">
            <el-icon size="28" color="#409eff"><Picture /></el-icon>
            <span>图文社区</span>
          </div>
          <div class="nav-links">
            <router-link to="/" class="nav-link" active-class="active">首页</router-link>
            <router-link to="/topics" class="nav-link" active-class="active">话题广场</router-link>
          </div>
        </div>
        <div class="center-section">
          <div class="search-box" @click="$router.push('/search')">
            <el-icon><Search /></el-icon>
            <input type="text" placeholder="搜索笔记、用户、话题" readonly />
          </div>
        </div>
        <div class="nav">
          <template v-if="userStore.isLoggedIn">
            <router-link to="/notifications" class="notification-icon">
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge">
                <el-icon size="22"><Bell /></el-icon>
              </el-badge>
            </router-link>
            <router-link to="/collections" class="collection-icon">
              <el-icon size="22"><FolderOpened /></el-icon>
            </router-link>
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
                  <el-dropdown-item command="products">商品管理</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="earnings">收益中心</el-dropdown-item>
                  <el-dropdown-item command="promotion">推广中心</el-dropdown-item>
                  <el-dropdown-item command="reports">创作报告</el-dropdown-item>
                  <el-dropdown-item command="collections">我的合集</el-dropdown-item>
                  <el-dropdown-item command="drafts">草稿箱</el-dropdown-item>
                  <el-dropdown-item command="trash">回收站</el-dropdown-item>
                  <el-dropdown-item command="messages">消息中心</el-dropdown-item>
                  <el-dropdown-item command="membership">会员中心</el-dropdown-item>
                  <el-dropdown-item command="communities">社群中心</el-dropdown-item>
                  <el-dropdown-item command="analytics">数据分析</el-dropdown-item>
                  <el-dropdown-item command="creator-center">创作者中心</el-dropdown-item>
                  <el-dropdown-item command="settings">设置</el-dropdown-item>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Picture, Plus, Search, Bell, FolderOpened } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getUnreadCount } from '@/api/notification';

const router = useRouter();
const userStore = useUserStore();

const unreadCount = ref(0);
let timer: any = null;

const fetchUnreadCount = async () => {
  if (!userStore.isLoggedIn) {
    unreadCount.value = 0;
    return;
  }
  try {
    const res = await getUnreadCount();
    unreadCount.value = res.total;
  } catch (error) {
    console.error('获取未读消息数失败:', error);
  }
};

onMounted(() => {
  fetchUnreadCount();
  timer = setInterval(fetchUnreadCount, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'products':
      router.push('/products');
      break;
    case 'orders':
      router.push('/orders');
      break;
    case 'earnings':
      router.push('/earnings');
      break;
    case 'membership':
      router.push('/membership');
      break;
    case 'promotion':
      router.push('/promotion');
      break;
    case 'analytics':
      router.push('/analytics');
      break;
    case 'messages':
      router.push('/messages');
      break;
    case 'communities':
      router.push('/communities');
      break;
    case 'reports':
      router.push('/creator/reports');
      break;
    case 'creator-center':
      router.push('/creator/center');
      break;
    case 'collections':
      router.push('/collections');
      break;
    case 'drafts':
      router.push('/drafts');
      break;
    case 'trash':
      router.push('/trash');
      break;
    case 'settings':
      router.push('/settings');
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
  
  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 32px;
    flex-shrink: 0;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
  
  .nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .nav-link {
      font-size: 15px;
      color: #666;
      text-decoration: none;
      transition: color 0.3s;
      
      &:hover,
      &.active {
        color: #409eff;
      }
    }
  }
  
  .center-section {
    flex: 1;
    max-width: 400px;
    display: flex;
    justify-content: center;
  }
  
  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 36px;
    padding: 0 16px;
    background: #f5f5f5;
    border-radius: 18px;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: #e8e8e8;
    }
    
    .el-icon {
      color: #999;
      font-size: 16px;
    }
    
    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      
      &::placeholder {
        color: #999;
      }
    }
  }
  
  .nav {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }
  
  .notification-icon,
  .collection-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #666;
    transition: all 0.3s;
    
    &:hover {
      background: #f5f5f5;
      color: #409eff;
    }
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
