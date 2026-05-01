<template>
  <el-container class="main-layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="28"><Document /></el-icon>
        <span class="logo-text">合同管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/contracts">
          <el-icon><Document /></el-icon>
          <span>合同管理</span>
        </el-menu-item>
        <el-menu-item index="/approvals">
          <el-icon><Stamp /></el-icon>
          <span>审批管理</span>
        </el-menu-item>
        <el-menu-item index="/signatures">
          <el-icon><EditPen /></el-icon>
          <span>线上签章</span>
        </el-menu-item>
        <el-menu-item index="/performance">
          <el-icon><List /></el-icon>
          <span>履约跟进</span>
        </el-menu-item>
        <el-menu-item index="/warnings">
          <el-icon><Warning /></el-icon>
          <span>到期预警</span>
        </el-menu-item>
        <el-menu-item index="/archives">
          <el-icon><FolderOpened /></el-icon>
          <span>归档检索</span>
        </el-menu-item>
        <el-menu-item index="/ai-review">
          <el-icon><Cpu /></el-icon>
          <span>AI法务初审</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon size="20"><UserFilled /></el-icon>
              <span class="user-name">{{ userStore.currentUser.name }}</span>
              <el-tag size="small" effect="plain">{{ userStore.roleLabels[userStore.currentUser.role] }}</el-tag>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="switch" divided>切换用户</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
    <el-dialog
      v-model="switchUserVisible"
      title="切换用户"
      width="400px"
    >
      <el-select v-model="selectedUserId" placeholder="请选择用户" style="width: 100%">
        <el-option
          v-for="user in userStore.users"
          :key="user.id"
          :label="`${user.name} (${userStore.roleLabels[user.role]})`"
          :value="user.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="switchUserVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSwitchUser">确认</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const selectedUserId = ref(userStore.currentUser.id)
const switchUserVisible = ref(false)

const currentPageTitle = computed(() => {
  const matched = route.matched[route.matched.length - 1]
  return matched.meta?.title as string || '首页'
})

const handleCommand = (command: string) => {
  if (command === 'switch') {
    selectedUserId.value = userStore.currentUser.id
    switchUserVisible.value = true
  }
}

const confirmSwitchUser = () => {
  const user = userStore.users.find(u => u.id === selectedUserId.value)
  if (user) {
    userStore.setUser(user)
    switchUserVisible.value = false
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  height: 100vh;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #3a4a5f;
}

.logo-text {
  white-space: nowrap;
}

.sidebar .el-menu {
  border-right: none;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  margin-right: 5px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
