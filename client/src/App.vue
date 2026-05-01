<template>
  <div class="app">
    <header class="header">
      <h1>🏪 线下门店数字化运营中台</h1>
      <nav class="nav">
        <router-link to="/dashboard">📊 数据汇总</router-link>
        <router-link to="/stores">🏬 门店管理</router-link>
        <router-link to="/customer-flows">👥 客流统计</router-link>
        <router-link to="/inventories">📦 库存管理</router-link>
        <router-link to="/members">👤 会员管理</router-link>
        <router-link to="/promotions">🎁 营销活动</router-link>
        <router-link to="/attendances">⏰ 员工考勤</router-link>
        <router-link to="/employees">👨‍💼 员工管理</router-link>
      </nav>
    </header>
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
