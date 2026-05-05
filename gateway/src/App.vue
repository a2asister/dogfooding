<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f0f2f5;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.el-menu {
  border-right: none !important;
}

.el-menu-item {
  height: 50px !important;
  line-height: 50px !important;
}

.el-menu-item.is-active {
  background-color: rgba(255, 107, 107, 0.15) !important;
}
</style>
