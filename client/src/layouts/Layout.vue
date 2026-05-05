<template>
  <div class="layout-container">
    <aside :class="['sidebar', { collapsed: appStore.sidebarCollapsed }]">
      <div class="logo">
        <el-icon class="logo-icon"><DataAnalysis /></el-icon>
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">开源运营平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        :collapse="appStore.sidebarCollapsed"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/repository">
          <el-icon><Folder /></el-icon>
          <template #title>仓库管理</template>
        </el-menu-item>
        <el-menu-item index="/issues">
          <el-icon><Document /></el-icon>
          <template #title>Issue 管理</template>
        </el-menu-item>
        <el-menu-item index="/pull-requests">
          <el-icon><Share /></el-icon>
          <template #title>PR 管理</template>
        </el-menu-item>
        <el-menu-item index="/contributors">
          <el-icon><User /></el-icon>
          <template #title>贡献者统计</template>
        </el-menu-item>
        <el-menu-item index="/cicd">
          <el-icon><Connection /></el-icon>
          <template #title>CI/CD 流水线</template>
        </el-menu-item>
        <el-menu-item index="/compliance">
          <el-icon><Warning /></el-icon>
          <template #title>合规检测</template>
        </el-menu-item>
        <el-menu-item index="/releases">
          <el-icon><Promotion /></el-icon>
          <template #title>版本发布</template>
        </el-menu-item>
      </el-menu>
    </aside>
    <div class="main-content">
      <header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
            <Expand v-if="appStore.sidebarCollapsed" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-input
            v-model="repoInput"
            placeholder="输入仓库地址，如: facebook/react"
            style="width: 300px"
            clearable
            @keyup.enter="handleRepoChange"
            @clear="handleRepoClear"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleRepoChange" style="margin-left: 8px">
            切换仓库
          </el-button>
        </div>
      </header>
      <main class="content-wrapper">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { Expand, Fold } from '@element-plus/icons-vue';

const route = useRoute();
const appStore = useAppStore();

const repoInput = ref(appStore.fullRepositoryName);

const activeMenu = computed(() => route.path);
const currentTitle = computed(() => route.meta.title as string);

watch(
  () => appStore.fullRepositoryName,
  (newVal) => {
    repoInput.value = newVal;
  },
);

function handleRepoChange() {
  const [owner, name] = repoInput.value.split('/').map((s) => s.trim());
  if (owner && name) {
    appStore.setRepository(owner, name);
  }
}

function handleRepoClear() {
  repoInput.value = appStore.fullRepositoryName;
}
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px;
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
  padding: 0 16px;

  .logo-icon {
    font-size: 28px;
    color: #409eff;
  }

  .logo-text {
    margin-left: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .collapse-btn {
    font-size: 20px;
    cursor: pointer;
    margin-right: 16px;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 24px;
}
</style>
