<template>
  <div class="transaction-app">
    <div class="page-header d-flex justify-between align-center">
      <div>
        <h2 class="page-title">交易管理</h2>
        <span class="page-description text-muted">管理账户交易记录</span>
      </div>
      <div>
        <router-link v-if="$route.name !== 'TransactionCreate'" to="/transaction/create" class="btn btn-primary">
          新建交易
        </router-link>
        <router-link v-else to="/transaction/list" class="btn">
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
.transaction-app { width: 100%; min-height: 100%; }
.page-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color-light); }
.page-title { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
.page-description { font-size: 14px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.text-muted { color: var(--text-secondary); }
</style>
