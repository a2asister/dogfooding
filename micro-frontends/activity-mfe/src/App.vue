<template>
  <div class="activity-mfe-container">
    <el-row :gutter="20" class="header-row">
      <el-col :span="24">
        <div class="page-header">
          <h2><el-icon :size="28"><Calendar /></el-icon> 活动配置管理</h2>
          <p class="sub-title">管理平台各类促销活动的创建、编辑和发布</p>
        </div>
      </el-col>
    </el-row>
    
    <router-view />
  </div>
</template>

<script setup>
import { Calendar } from '@element-plus/icons-vue';
</script>

<style scoped>
.activity-mfe-container {
  padding: 0;
  background: transparent;
}

.header-row {
  margin-bottom: 20px;
}

.page-header {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header .sub-title {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}
</style>
