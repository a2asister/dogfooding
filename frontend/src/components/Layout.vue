<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeIndex = ref('/dashboard')

const menuItems = [
  {
    index: '/dashboard',
    icon: 'DataAnalysis',
    label: '仪表盘',
  },
  {
    index: '/robots',
    icon: 'Cpu',
    label: '机器人管理',
  },
  {
    index: '/tasks',
    icon: 'List',
    label: '任务管理',
  },
  {
    index: '/path-planning',
    icon: 'Guide',
    label: '路径规划',
  },
  {
    index: '/obstacles',
    icon: 'WarningFilled',
    label: '障碍物管理',
  },
]

onMounted(() => {
  activeIndex.value = route.path
})

const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <el-icon class="logo-icon"><Robot /></el-icon>
      <div>机器人调度系统</div>
    </div>
    <el-menu
      :default-active="activeIndex"
      background-color="transparent"
      text-color="#bfcbd9"
      active-text-color="#ffffff"
      @select="handleSelect"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.index"
        :index="item.index"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.label }}</template>
      </el-menu-item>
    </el-menu>
  </div>
  <div class="main-content">
    <router-view />
  </div>
</template>

<style scoped>
</style>
