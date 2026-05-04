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
        index="/dashboard" 
        v-if="userStore.hasPermission('data:dashboard:read')"
      >
        <el-icon><DataAnalysis /></el-icon>
        <span>数据看板</span>
      </el-menu-item>
      <el-menu-item 
        index="/report-center" 
        v-if="userStore.hasPermission('data:report:read')"
      >
        <el-icon><Document /></el-icon>
        <span>报表中心</span>
      </el-menu-item>
    </el-menu>
    
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, DataAnalysis, Document } from '@element-plus/icons-vue'
import { useUserStore } from './store/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  return route.path
})
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
