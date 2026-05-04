<template>
  <div class="account-app">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">账户管理</h2>
        <span class="page-description">管理银行账户信息</span>
      </div>
      <div class="header-right">
        <router-link v-if="$route.name !== 'AccountCreate'" 
                     to="/account/create" 
                     class="btn btn-primary">
          新开账户
        </router-link>
        <router-link v-else 
                     to="/account/list" 
                     class="btn">
          返回列表
        </router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.account-app {
  width: 100%;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color-light);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-description {
  font-size: 14px;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  gap: 12px;
}
</style>
