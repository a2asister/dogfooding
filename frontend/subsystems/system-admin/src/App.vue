<template>
  <div class="app-container">
    <el-menu
      :default-active="activeMenu"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      style="margin-bottom: 20px;"
    >
      <el-menu-item index="/">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item 
        index="/user-management" 
        v-if="userStore.hasPermission('system:user:read')"
      >
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item 
        index="/role-management" 
        v-if="userStore.hasPermission('system:role:read')"
      >
        <el-icon><UserFilled /></el-icon>
        <span>角色管理</span>
      </el-menu-item>
    </el-menu>
    
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, User, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from './store/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  return route.path
})

const handleMenuSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100%;
}

:deep(.el-menu) {
  border-radius: 4px;
}
</style>
