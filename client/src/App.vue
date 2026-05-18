<template>
  <div>
    <nav class="navbar">
      <div class="container navbar-content">
        <router-link to="/" class="navbar-brand">⚛️ 物理模拟实验室</router-link>
        <div class="navbar-links">
          <router-link to="/" class="navbar-link">首页</router-link>
          <router-link to="/experiments" class="navbar-link">实验中心</router-link>
          <router-link to="/saved" class="navbar-link">已保存</router-link>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>
