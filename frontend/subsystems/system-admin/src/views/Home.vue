<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>系统管理 - 首页</span>
        </div>
      </template>
      
      <div class="welcome-content">
        <h2>欢迎使用系统管理模块</h2>
        <p>当前用户：{{ userStore.user?.name || '未登录' }}</p>
        <p>当前角色：{{ userStore.user?.roles?.join(', ') || '无' }}</p>
        
        <el-divider></el-divider>
        
        <h3>功能导航</h3>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="8">
            <el-card 
              class="nav-card" 
              shadow="hover"
              v-if="userStore.hasPermission('system:user:read')"
            >
              <router-link to="/user-management">
                <div class="nav-card-content">
                  <el-icon :size="48" color="#409EFF"><User /></el-icon>
                  <p>用户管理</p>
                </div>
              </router-link>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card 
              class="nav-card" 
              shadow="hover"
              v-if="userStore.hasPermission('system:role:read')"
            >
              <router-link to="/role-management">
                <div class="nav-card-content">
                  <el-icon :size="48" color="#67C23A"><UserFilled /></el-icon>
                  <p>角色管理</p>
                </div>
              </router-link>
            </el-card>
          </el-col>
        </el-row>
        
        <el-divider></el-divider>
        
        <h3>权限信息</h3>
        <div class="permissions-info">
          <el-tag v-for="permission in userStore.user?.permissions" :key="permission" color="primary" style="margin: 4px;">
            {{ permission }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore'
import { User, UserFilled } from '@element-plus/icons-vue'

const userStore = useUserStore()
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.welcome-content {
  text-align: center;
}

.welcome-content h2 {
  color: #333;
  margin-bottom: 10px;
}

.welcome-content p {
  color: #666;
  margin: 5px 0;
}

.welcome-content h3 {
  color: #333;
  margin-top: 20px;
}

.nav-card {
  cursor: pointer;
  transition: all 0.3s;
}

.nav-card:hover {
  transform: translateY(-5px);
}

.nav-card a {
  text-decoration: none;
  color: inherit;
}

.nav-card-content {
  text-align: center;
  padding: 20px 0;
}

.nav-card-content p {
  margin-top: 15px;
  font-weight: bold;
  color: #333;
}

.permissions-info {
  margin-top: 10px;
}
</style>
