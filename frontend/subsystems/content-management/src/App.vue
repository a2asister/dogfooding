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
        index="/article-management" 
        v-if="userStore.hasPermission('content:article:read')"
      >
        <el-icon><Document /></el-icon>
        <span>文章管理</span>
      </el-menu-item>
      <el-menu-item 
        index="/category-management" 
        v-if="userStore.hasPermission('content:category:read')"
      >
        <el-icon><Folder /></el-icon>
        <span>分类管理</span>
      </el-menu-item>
      <el-menu-item 
        index="/content-audit" 
        v-if="userStore.hasPermission('content:audit:read')"
      >
        <el-icon><CircleCheck /></el-icon>
        <span>内容审核</span>
      </el-menu-item>
    </el-menu>
    
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, Document, Folder, CircleCheck } from '@element-plus/icons-vue'
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
