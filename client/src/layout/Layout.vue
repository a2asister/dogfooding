<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">R</div>
        <span v-if="!isCollapse" class="sidebar-logo-text">RPA 平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#fff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/workflows">
          <el-icon><Share /></el-icon>
          <template #title>流程编排</template>
        </el-menu-item>
        <el-menu-item index="/recording">
          <el-icon><VideoCamera /></el-icon>
          <template #title>可视化录制</template>
        </el-menu-item>
        <el-menu-item index="/scripts">
          <el-icon><Document /></el-icon>
          <template #title>自定义脚本</template>
        </el-menu-item>
        <el-menu-item index="/schedules">
          <el-icon><Timer /></el-icon>
          <template #title>定时任务</template>
        </el-menu-item>
        <el-menu-item index="/apis">
          <el-icon><Connection /></el-icon>
          <template #title>接口自动化</template>
        </el-menu-item>
        <el-menu-item index="/robots">
          <el-icon><Cpu /></el-icon>
          <template #title>机器人集群</template>
        </el-menu-item>
        <el-menu-item index="/executions">
          <el-icon><List /></el-icon>
          <template #title>执行记录</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header-container">
        <div class="header-left">
          <el-icon
            :size="20"
            style="cursor: pointer; color: #606266"
            @click="toggleCollapse"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName && currentRouteName !== 'Dashboard'">
              {{ currentRouteName }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="通知" placement="bottom">
            <el-badge :value="3" :hidden="false">
              <el-icon :size="20" style="cursor: pointer; color: #606266">
                <Bell />
              </el-icon>
            </el-badge>
          </el-tooltip>
          <el-tooltip content="设置" placement="bottom">
            <el-icon :size="20" style="cursor: pointer; color: #606266">
              <Setting />
            </el-icon>
          </el-tooltip>
          <el-dropdown>
            <div class="user-info">
              <div class="user-avatar">A</div>
              <div class="user-name">管理员</div>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)
const currentRouteName = computed(() => route.meta?.title)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>
