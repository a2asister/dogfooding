<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
        </div>
      </template>
      
      <el-alert title="角色管理功能示例" type="info" show-icon style="margin-bottom: 20px;">
        <template #default>
          <p>此页面展示角色管理的示例界面。实际项目中可根据需求扩展完整的CRUD功能。</p>
        </template>
      </el-alert>
      
      <el-table :data="roles" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色代码" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="permissions" label="权限">
          <template #default="scope">
            <el-tag 
              v-for="permission in scope.row.permissions" 
              :key="permission" 
              type="primary" 
              size="small" 
              style="margin-right: 4px; margin-bottom: 4px;"
            >
              {{ permission }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
const roles = [
  {
    id: 1,
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: ['system:*', 'data:*', 'content:*'],
    status: 'active'
  },
  {
    id: 2,
    name: '数据分析师',
    code: 'data-analyst',
    description: '仅可访问数据分析子系统',
    permissions: ['data:*'],
    status: 'active'
  },
  {
    id: 3,
    name: '内容编辑',
    code: 'content-editor',
    description: '仅可访问内容管理子系统',
    permissions: ['content:*'],
    status: 'active'
  }
]
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
