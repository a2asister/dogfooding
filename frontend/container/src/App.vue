<template>
  <el-config-provider :locale="zhCn">
    <el-container class="app-container">
      <el-aside width="220px" class="app-aside">
        <div class="logo">
          <span>电商商家后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="app-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/refunds">
            <el-icon><Money /></el-icon>
            <span>退款管理</span>
          </el-menu-item>
          <el-menu-item index="/aftersales">
            <el-icon><Service /></el-icon>
            <span>售后管理</span>
          </el-menu-item>
          <el-menu-item index="/marketing">
            <el-icon><Promotion /></el-icon>
            <span>营销管理</span>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-menu-item index="/finance">
            <el-icon><Wallet /></el-icon>
            <span>财务管理</span>
          </el-menu-item>
          <el-menu-item index="/logistics">
            <el-icon><Van /></el-icon>
            <span>物流管理</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>店铺设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="app-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span class="username">管理员</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="app-main">
          <router-view />
          <div id="micro-app-container"></div>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {
  Goods, List, Money, Service, Promotion,
  User, Wallet, Van, Setting
} from '@element-plus/icons-vue'
import { registerMicroApps, start } from 'qiankun'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const titles = {
    '/products': '商品管理',
    '/orders': '订单管理',
    '/refunds': '退款管理',
    '/aftersales': '售后管理',
    '/marketing': '营销管理',
    '/members': '会员管理',
    '/finance': '财务管理',
    '/logistics': '物流管理',
    '/settings': '店铺设置'
  }
  return titles[route.path] || '首页'
})

onMounted(() => {
  registerMicroApps([
    {
      name: 'products',
      entry: '//localhost:8081',
      container: '#micro-app-container',
      activeRule: '/products'
    },
    {
      name: 'orders',
      entry: '//localhost:8082',
      container: '#micro-app-container',
      activeRule: '/orders'
    },
    {
      name: 'refunds',
      entry: '//localhost:8083',
      container: '#micro-app-container',
      activeRule: '/refunds'
    },
    {
      name: 'aftersales',
      entry: '//localhost:8084',
      container: '#micro-app-container',
      activeRule: '/aftersales'
    },
    {
      name: 'marketing',
      entry: '//localhost:8085',
      container: '#micro-app-container',
      activeRule: '/marketing'
    },
    {
      name: 'members',
      entry: '//localhost:8086',
      container: '#micro-app-container',
      activeRule: '/members'
    },
    {
      name: 'finance',
      entry: '//localhost:8087',
      container: '#micro-app-container',
      activeRule: '/finance'
    },
    {
      name: 'logistics',
      entry: '//localhost:8088',
      container: '#micro-app-container',
      activeRule: '/logistics'
    },
    {
      name: 'settings',
      entry: '//localhost:8089',
      container: '#micro-app-container',
      activeRule: '/settings'
    }
  ], {
    beforeLoad: app => {
      console.log('before load', app.name)
    },
    beforeMount: app => {
      console.log('before mount', app.name)
    },
    afterMount: app => {
      console.log('after mount', app.name)
    },
    afterUnmount: app => {
      console.log('after unmount', app.name)
    }
  })

  start({
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true
    }
  })
})
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
}

.app-aside {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4a;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #3a4a5a;
}

.app-menu {
  border-right: none;
}

.app-header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;

  .username {
    margin-left: 8px;
    color: #606266;
  }
}

.app-main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

#micro-app-container {
  width: 100%;
  height: 100%;
}
</style>
