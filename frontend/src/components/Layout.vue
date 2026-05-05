<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="layout-aside">
      <div class="logo">
        <el-icon :size="32" color="#409eff"><OfficeBuilding /></el-icon>
        <span class="logo-text">保险核保理赔系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="layout-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/insurance-products">
          <el-icon><Ticket /></el-icon>
          <span>保险产品</span>
        </el-menu-item>
        <el-menu-item index="/insured-persons">
          <el-icon><User /></el-icon>
          <span>投保人管理</span>
        </el-menu-item>
        <el-menu-item index="/insurance-applications">
          <el-icon><Document /></el-icon>
          <span>投保管理</span>
        </el-menu-item>
        <el-menu-item index="/underwriting">
          <el-icon><Stamp /></el-icon>
          <span>核保管理</span>
        </el-menu-item>
        <el-menu-item index="/policies">
          <el-icon><Postcard /></el-icon>
          <span>保单管理</span>
        </el-menu-item>
        <el-menu-item index="/claims">
          <el-icon><Money /></el-icon>
          <span>理赔管理</span>
        </el-menu-item>
        <el-menu-item index="/anti-fraud">
          <el-icon><Warning /></el-icon>
          <span>反欺诈</span>
        </el-menu-item>
        <el-menu-item index="/actuarial">
          <el-icon><TrendCharts /></el-icon>
          <span>精算分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="user-name">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  DataLine,
  Ticket,
  User,
  Document,
  Stamp,
  Postcard,
  Money,
  Warning,
  TrendCharts,
  OfficeBuilding,
  UserFilled
} from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  return route.meta.title as string || '首页'
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #263445;
  border-bottom: 1px solid #3a4a5c;
}

.logo-text {
  margin-left: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.layout-menu {
  border-right: none;
}

.layout-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin-left: 10px;
  color: #606266;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
