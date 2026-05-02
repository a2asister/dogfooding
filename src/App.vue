<script setup>
import JsonEditor from './components/JsonEditor.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">JSON 可视化编排编辑器</h1>
        <p class="text-slate-600">支持树形/表格双视图、路径筛选、批量改值、结构折叠</p>
      </header>
      <JsonEditor />
    </div>
  </div>
</template>
